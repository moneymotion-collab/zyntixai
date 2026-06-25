import { normalizeRole } from "@/lib/auth/roles"
import {
  canAccess,
  type AccessProfile,
} from "@/lib/access/canAccess"
import { COACH_STATUS, type CoachStatus } from "@/lib/coach-status"

export { COACH_STATUS, type CoachStatus }

/** @deprecated Use COACH_STATUS */
export const COACH_PROFILE_STATUS = COACH_STATUS

/** @deprecated Use CoachStatus */
export type CoachProfileStatus = CoachStatus

export type AppAccessProfile = AccessProfile

export { canAccess }

export function canAccessApp(profile: AppAccessProfile | null): boolean {
  return canAccess(profile)
}

export function isCoachPendingApproval(
  profile: Pick<AppAccessProfile, "role" | "coach_status"> | null,
): boolean {
  if (!profile) return false
  if (normalizeRole(profile.role) !== "coach") return false
  return (
    profile.coach_status === COACH_STATUS.pending ||
    profile.coach_status === null ||
    (profile.coach_status !== COACH_STATUS.approved &&
      profile.coach_status !== COACH_STATUS.rejected)
  )
}

export function isCoachApprovalRejected(
  profile: Pick<AppAccessProfile, "role" | "coach_status"> | null,
): boolean {
  if (!profile) return false
  if (normalizeRole(profile.role) !== "coach") return false
  return profile.coach_status === COACH_STATUS.rejected
}
