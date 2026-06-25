export const COACH_REQUEST_STATUS = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
} as const

export type CoachRequestStatus =
  (typeof COACH_REQUEST_STATUS)[keyof typeof COACH_REQUEST_STATUS]

/** True when a coach_requests row is approved for this member–coach pair. */
export function hasCoachAccess(status: string | null | undefined): boolean {
  return status === COACH_REQUEST_STATUS.approved
}

export function isCoachAccessPending(status: string | null | undefined): boolean {
  return status === COACH_REQUEST_STATUS.pending
}

export function isCoachAccessRejected(status: string | null | undefined): boolean {
  return status === COACH_REQUEST_STATUS.rejected
}

/** Member is linked to a coach via members.coach_id (e.g. after approval). */
export function hasAssignedCoach(
  memberCoachId: string | null | undefined,
  coachId: string | null | undefined,
): boolean {
  if (!memberCoachId || !coachId) return false
  return memberCoachId === coachId
}

export const COACH_ACCESS_DENIED_MESSAGE =
  "No access: coach not approved yet"

/** Throws when the member has no approved access to the coach. */
export function assertCoachAccess(
  status: string | null | undefined,
  memberCoachId?: string | null,
  coachId?: string | null,
): void {
  if (hasCoachAccess(status) || hasAssignedCoach(memberCoachId, coachId)) {
    return
  }

  throw new Error(COACH_ACCESS_DENIED_MESSAGE)
}

export function assertCoachRequestApproved(
  request: { status: string } | null | undefined,
  memberCoachId?: string | null,
  coachId?: string | null,
): void {
  assertCoachAccess(request?.status ?? null, memberCoachId, coachId)
}
