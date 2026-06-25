export const COACH_STATUSES = ["pending", "approved", "rejected"] as const

export type CoachStatus = (typeof COACH_STATUSES)[number]

export const COACH_STATUS = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
} as const satisfies Record<CoachStatus, CoachStatus>

export function isCoachStatus(value: string): value is CoachStatus {
  return COACH_STATUSES.includes(value as CoachStatus)
}

export function parseCoachStatus(value: unknown): CoachStatus | null {
  return typeof value === "string" && isCoachStatus(value) ? value : null
}
