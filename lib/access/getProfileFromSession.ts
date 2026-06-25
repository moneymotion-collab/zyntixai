import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { canAccess, type AccessProfile } from "@/lib/access/canAccess"
import {
  needsTrialRepair,
  repairProfileAccess,
} from "@/lib/auth/repair-profile-access"

export type ProfileSession = {
  user: { id: string; email: string | null } | null
  profile: AccessProfile | null
  response: NextResponse
  supabase: MiddlewareSupabase
}

type MiddlewareSupabase = ReturnType<typeof createServerClient>

type SessionUser = { id: string; email: string | null }

async function getUserFromClaims(
  supabase: MiddlewareSupabase,
): Promise<SessionUser | null> {
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims?.sub) {
    return null
  }

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

export async function refreshSessionFromRequest(
  request: NextRequest,
): Promise<Pick<ProfileSession, "user" | "response">> {
  const { supabase, getResponse } = createMiddlewareSupabase(request)

  try {
    const user = await getUserFromClaims(supabase)
    return { user, response: getResponse() }
  } catch {
    return { user: null, response: getResponse() }
  }
}

export async function getProfileFromSession(
  request: NextRequest,
): Promise<ProfileSession> {
  const { supabase, getResponse } = createMiddlewareSupabase(request)

  let user: SessionUser | null = null

  try {
    user = await getUserFromClaims(supabase)
  } catch {
    return { user: null, profile: null, response: getResponse(), supabase }
  }

  if (!user) {
    return { user: null, profile: null, response: getResponse(), supabase }
  }

  let profile = await fetchProfile(supabase, user.id)

  if (profile && !canAccess(profile) && needsTrialRepair(profile)) {
    await supabase.rpc("ensure_profile", {
      p_email: user.email ?? null,
      p_role: profile.role ?? "member",
    })
    profile = await fetchProfile(supabase, user.id)
    profile = await repairProfileAccess(supabase, user.id, profile)
  }

  return { user, profile, response: getResponse(), supabase }
}
