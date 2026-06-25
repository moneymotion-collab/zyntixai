import { canAccessWithSubscription } from "@/lib/subscription"
import type { Database } from "@/lib/database.types"
import { COACH_STATUS } from "@/lib/coach-status"

export type AccessProfile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "role" | "coach_status" | "subscription_status" | "trial_ends_at"
>

export function canAccess(profile: AccessProfile | null | undefined): boolean {
  return canAccessWithSubscription(profile)
}

export function isCoachRejected(
  profile: Pick<AccessProfile, "role" | "coach_status"> | null | undefined,
): boolean {
  if (!profile) return false
  if (profile.role !== "coach") return false
  return profile.coach_status === COACH_STATUS.rejected
}
