import { canAccessWithSubscription } from "@/lib/subscription/resolve"
import { COACH_STATUS } from "@/lib/coach-status"

export type AccessProfile = {
  role: string
  coach_status: string | null
  subscription_status: string | null
  trial_ends_at: string | null
}

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
