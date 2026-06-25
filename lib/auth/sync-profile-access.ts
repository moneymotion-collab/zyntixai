import type { SupabaseClient } from "@supabase/supabase-js"
import { canAccess, type AccessProfile } from "@/lib/access/canAccess"
import { hasCompletedCoachOnboarding } from "@/lib/auth/coach-onboarding"
import { ensureUserProfile, type EnsureProfileParams } from "@/lib/auth/ensure-profile"
import { repairProfileAccess } from "@/lib/auth/repair-profile-access"
import type { Database } from "@/lib/database.types"
import { buildNewProfileFields } from "@/lib/profile-defaults"
import { resolveLinkedMemberId } from "@/lib/member-link"

const PROFILE_ACCESS_FIELDS =
  "role, coach_status, subscription_status, trial_ends_at" as const

export type SyncedAccessProfile = AccessProfile

async function fetchAccessProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AccessProfile | null> {
  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_ACCESS_FIELDS)
    .eq("id", userId)
    .maybeSingle()

  return data
}

export async function syncProfileAccess(
  supabase: SupabaseClient<Database>,
  params: EnsureProfileParams = {},
): Promise<SyncedAccessProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const existing = await fetchAccessProfile(supabase, user.id)

  const metadataRole = user.user_metadata?.role
  const role =
    params.role ??
    existing?.role ??
    (typeof metadataRole === "string" && metadataRole.length > 0
      ? metadataRole
      : "member")

  const ensured = await ensureUserProfile(supabase, {
    email: params.email ?? user.email,
    role,
  })

  let profile = await fetchAccessProfile(supabase, user.id)

  if (!profile && (role === "member" || role === "coach")) {
    await supabase.from("profiles").insert({
      id: user.id,
      email: params.email ?? user.email ?? null,
      ...buildNewProfileFields(role),
    })
    profile = await fetchAccessProfile(supabase, user.id)
  }

  profile = await repairProfileAccess(supabase, user.id, profile)

  if (role === "member") {
    await resolveLinkedMemberId(supabase).catch(() => null)
  }

  return profile
}

export async function resolveRouteAfterAccessSync(
  supabase: SupabaseClient<Database>,
  profile: SyncedAccessProfile | null,
): Promise<string> {
  if (!profile) {
    return "/login"
  }

  if (!canAccess(profile)) {
    return "/trial-ended"
  }

  const normalizedRole = profile.role
  if (normalizedRole === "member") return "/my-workouts"

  if (normalizedRole === "coach") {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user && !(await hasCompletedCoachOnboarding(supabase, user.id))) {
      return "/onboarding"
    }

    return "/dashboard"
  }

  if (normalizedRole === "admin") return "/dashboard"

  return "/dashboard"
}
