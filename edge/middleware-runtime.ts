import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

type AccessProfile = {
  role: string
  coach_status: string | null
  subscription_status: string | null
  trial_ends_at: string | null
}

type SessionUser = { id: string; email: string | null }

const PUBLIC_EXACT_PATHS = ["/"]
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/auth",
  "/onboarding",
  "/pricing",
  "/privacy",
  "/terms",
  "/about",
  "/contact",
  "/workspace",
  "/trial-ended",
]

const COACH_ONBOARDING_EXEMPT_PAGE_PREFIXES = [
  "/onboarding",
  "/settings",
  "/trial-ended",
  "/pricing",
]

const COACH_ONBOARDING_EXEMPT_API_PREFIXES = [
  "/api/onboarding",
  "/api/access",
  "/api/workspace/enter-demo",
  "/api/workspace/enter-live",
  "/api/billing",
  "/api/stripe",
  "/api/create-checkout-session",
  "/api/gym-settings",
]

function isPublicAppPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.includes(pathname)) return true
  return PUBLIC_PREFIXES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function isCoachOnboardingExemptPath(pathname: string): boolean {
  if (
    COACH_ONBOARDING_EXEMPT_PAGE_PREFIXES.some((prefix) =>
      matchesPrefix(pathname, prefix),
    )
  ) {
    return true
  }

  if (!pathname.startsWith("/api/")) return false

  return COACH_ONBOARDING_EXEMPT_API_PREFIXES.some((prefix) =>
    matchesPrefix(pathname, prefix),
  )
}

function normalizeRole(role: string | null | undefined) {
  if (!role) return null
  const map: Record<string, "admin" | "coach" | "member"> = {
    admin: "admin",
    coach: "coach",
    member: "member",
    trainer: "coach",
    client: "member",
  }
  return map[role] ?? null
}

function canAccess(profile: AccessProfile | null | undefined): boolean {
  if (!profile) return false
  if (profile.role === "admin") return true
  if (profile.role === "coach" && profile.coach_status === "rejected") {
    return false
  }

  const status = profile.subscription_status?.trim().toLowerCase() ?? ""
  if (status === "active" || status === "past_due" || status === "trial") {
    if (status === "trial" && profile.trial_ends_at) {
      return new Date(profile.trial_ends_at).getTime() > Date.now()
    }
    return status !== "trial"
  }

  if (profile.trial_ends_at) {
    return new Date(profile.trial_ends_at).getTime() > Date.now()
  }

  return false
}

function isApiPath(pathname: string) {
  return pathname === "/api" || pathname.startsWith("/api/")
}

async function hasCompletedCoachOnboarding(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<boolean> {
  const [gymSettingsResult, gymsResult] = await Promise.all([
    supabase
      .from("gym_settings")
      .select("gym_name, is_demo_workspace")
      .eq("owner_id", userId)
      .maybeSingle(),
    supabase
      .from("gyms")
      .select("name")
      .eq("owner_id", userId)
      .maybeSingle(),
  ])

  const gymSettings = gymSettingsResult.data
  const gymName =
    gymSettings?.gym_name?.trim() || gymsResult.data?.name?.trim() || ""
  const isDemoWorkspace = Boolean(gymSettings?.is_demo_workspace)

  return isDemoWorkspace || Boolean(gymName)
}

async function getUserFromClaims(
  supabase: ReturnType<typeof createServerClient>,
): Promise<SessionUser | null> {
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims?.sub) return null

  const email =
    typeof data.claims.email === "string" ? data.claims.email : null

  return { id: data.claims.sub, email }
}

function createMiddlewareSupabase(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          )
        },
      },
    },
  )

  return { supabase, getResponse: () => response }
}

async function fetchProfile(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<AccessProfile | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, coach_status, subscription_status, trial_ends_at")
    .eq("id", userId)
    .maybeSingle()

  return profile
}

async function getProfileFromSession(request: NextRequest) {
  const { supabase, getResponse } = createMiddlewareSupabase(request)

  try {
    const user = await getUserFromClaims(supabase)
    if (!user) {
      return {
        user: null,
        profile: null,
        response: getResponse(),
        supabase,
      }
    }

    const profile = await fetchProfile(supabase, user.id)
    return { user, profile, response: getResponse(), supabase }
  } catch {
    return {
      user: null,
      profile: null,
      response: getResponse(),
      supabase,
    }
  }
}

async function refreshSessionFromRequest(request: NextRequest) {
  const { supabase, getResponse } = createMiddlewareSupabase(request)

  try {
    const user = await getUserFromClaims(supabase)
    return { user, response: getResponse() }
  } catch {
    return { user: null, response: getResponse() }
  }
}

export async function handleMiddleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  if (isPublicAppPath(path)) {
    const { response } = await refreshSessionFromRequest(req)
    return response
  }

  if (isApiPath(path)) {
    const { user, profile, response, supabase } =
      await getProfileFromSession(req)

    if (
      user &&
      profile &&
      canAccess(profile) &&
      normalizeRole(profile.role) === "coach" &&
      !isCoachOnboardingExemptPath(path) &&
      !(await hasCompletedCoachOnboarding(supabase, user.id))
    ) {
      return NextResponse.json(
        { error: "Coach onboarding incomplete.", redirect: "/onboarding" },
        { status: 403, headers: response.headers },
      )
    }

    return response
  }

  const { user, profile, response, supabase } = await getProfileFromSession(req)

  if (!user) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (!profile) return response

  if (!canAccess(profile)) {
    const url = req.nextUrl.clone()
    url.pathname = "/trial-ended"
    return NextResponse.redirect(url)
  }

  const normalizedRole = normalizeRole(profile.role)

  if (
    normalizedRole === "coach" &&
    !isCoachOnboardingExemptPath(path) &&
    !(await hasCompletedCoachOnboarding(supabase, user.id))
  ) {
    const url = req.nextUrl.clone()
    url.pathname = "/onboarding"
    return NextResponse.redirect(url)
  }

  return response
}
