import type { SupabaseClient } from "@supabase/supabase-js"
import {
  canAccess,
  type AccessProfile,
} from "@/lib/access/canAccess"
import { isTrialEnded } from "@/lib/coach-trial"
import type { Database } from "@/lib/database.types"
import { COACH_STATUS } from "@/lib/coach-status"
import { SUBSCRIPTION_STATUS } from "@/lib/subscription/types"

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

const PRESERVED_STATUSES: ReadonlySet<string> = new Set([
  SUBSCRIPTION_STATUS.active,
  SUBSCRIPTION_STATUS.past_due,
  SUBSCRIPTION_STATUS.cancelled,
])

/**
 * Status-only repairs for corrupted profiles. Never changes `trial_ends_at` and
 * never grants a new trial after natural expiry.
 */
function getCorruptedProfileRepair(profile: AccessProfile): ProfileUpdate | null {
  const status = profile.subscription_status

  if (status && PRESERVED_STATUSES.has(status)) {
    return null
  }

  const trialEndsAt = profile.trial_ends_at

  if (
    trialEndsAt &&
    !isTrialEnded(trialEndsAt) &&
    (status === SUBSCRIPTION_STATUS.expired || !status)
  ) {
    return { subscription_status: SUBSCRIPTION_STATUS.trial }
  }

  if (
    trialEndsAt &&
    isTrialEnded(trialEndsAt) &&
    (status === SUBSCRIPTION_STATUS.trial || !status)
  ) {
    return { subscription_status: SUBSCRIPTION_STATUS.expired }
  }

  if (!trialEndsAt && status === SUBSCRIPTION_STATUS.trial) {
    return { subscription_status: SUBSCRIPTION_STATUS.expired }
  }

  return null
}

function needsSubscriptionTrialRepair(profile: AccessProfile): boolean {
  return getCorruptedProfileRepair(profile) !== null
}

export function needsTrialRepair(
  profile: AccessProfile | null | undefined,
): boolean {
  if (!profile) return false
  if (profile.role === "admin") return false
  if (
    profile.subscription_status &&
    PRESERVED_STATUSES.has(profile.subscription_status)
  ) {
    return false
  }

  if (profile.role === "coach") {
    if (profile.coach_status === COACH_STATUS.rejected) return false
    return needsSubscriptionTrialRepair(profile)
  }

  if (profile.role === "member") {
    return needsSubscriptionTrialRepair(profile)
  }

  return false
}

export async function directRepairProfileTrial(
  supabase: SupabaseClient<Database>,
  _userId: string,
  profile: AccessProfile,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!getCorruptedProfileRepair(profile)) {
    return { ok: true }
  }

  const { error } = await supabase.rpc("repair_profile_subscription_status")

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

export async function repairProfileAccess(
  supabase: SupabaseClient<Database>,
  userId: string,
  profile: AccessProfile | null,
): Promise<AccessProfile | null> {
  if (!profile || canAccess(profile) || !needsTrialRepair(profile)) {
    return profile
  }

  let repaired = await directRepairProfileTrial(supabase, userId, profile)
  if (!repaired.ok) {
    const { error: rpcError } = await supabase.rpc("ensure_profile", {
      p_email: null,
      p_role: profile.role ?? "member",
    })
    if (!rpcError) {
      const { data: refreshed } = await supabase
        .from("profiles")
        .select("role, coach_status, subscription_status, trial_ends_at")
        .eq("id", userId)
        .maybeSingle()

      if (refreshed && needsTrialRepair(refreshed)) {
        repaired = await directRepairProfileTrial(supabase, userId, refreshed)
      }
    }
    if (!repaired.ok) {
      return profile
    }
  }

  const { data } = await supabase
    .from("profiles")
    .select("role, coach_status, subscription_status, trial_ends_at")
    .eq("id", userId)
    .maybeSingle()

  return data
}
