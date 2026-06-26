import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

type AccessProfile = {
  role: string
  coach_status: string | null
  subscription_status: string | null
  trial_ends_at: string | null
}

type SessionUser = { id: string; email: string | null }

type MiddlewareSupabase = ReturnType<typeof createServerClient>

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

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!url || !key) return null
  return { url, key }
}

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

  const role = profile.role ?? ""
  if (role === "admin") return true
  if (role === "coach" && profile.coach_status === "rejected") return false

  const raw = profile.subscription_status?.trim().toLowerCase() ?? ""
  const trialActive = Boolean(
    profile.trial_ends_at &&
      new Date(profile.trial_ends_at).getTime() > Date.now(),
  )

  if (raw === "active" || raw === "past_due") return true
  if (raw === "trial" || raw === "trialing") return trialActive
  if (!raw && trialActive) return true

  return false
}

function isApiPath(pathname: string) {
  return pathname === "/api" || pathname.startsWith("/api/")
}

function createMiddlewareSupabase(request: NextRequest) {
  const env = getSupabaseEnv()
  if (!env) return null

  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.url, env.key, {
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
  })

  return { supabase, getResponse: () => response }
}

async function getSessionUser(
  supabase: MiddlewareSupabase,
): Promise<SessionUser | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  return { id: user.id, email: user.email ?? null }
}

async function fetchProfile(
  supabase: MiddlewareSupabase,
  userId: string,
): Promise<AccessProfile | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, coach_status, subscription_status, trial_ends_at")
    .eq("id", userId)
    .maybeSingle()

  return profile
}

async function hasCompletedCoachOnboarding(
  supabase: MiddlewareSupabase,
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

async function refreshSessionFromRequest(request: NextRequest) {
  const client = createMiddlewareSupabase(request)
  if (!client) {
    return { user: null, response: NextResponse.next({ request }) }
  }

  const { supabase, getResponse } = client

  try {
    const user = await getSessionUser(supabase)
    return { user, response: getResponse() }
  } catch {
    return { user: null, response: getResponse() }
  }
}

async function getProfileFromSession(request: NextRequest) {
  const client = createMiddlewareSupabase(request)
  if (!client) {
    return {
      user: null,
      profile: null,
      response: NextResponse.next({ request }),
      supabase: null,
    }
  }

  const { supabase, getResponse } = client

  try {
    const user = await getSessionUser(supabase)
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

async function runMiddleware(req: NextRequest) {
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
      supabase &&
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
    supabase &&
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

export async function middleware(req: NextRequest) {
  try {
    return await runMiddleware(req)
  } catch {
    return NextResponse.next({ request: req })
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
