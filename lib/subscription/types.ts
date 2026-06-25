/** Canonical subscription statuses stored on `profiles.subscription_status`. */
export const SUBSCRIPTION_STATUSES = [
  "trial",
  "active",
  "past_due",
  "cancelled",
  "expired",
] as const

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

/** Status string constants for comparisons and DB writes. */
export const SUBSCRIPTION_STATUS = Object.fromEntries(
  SUBSCRIPTION_STATUSES.map((status) => [status, status]),
) as Record<SubscriptionStatus, SubscriptionStatus>

export type SubscriptionProfile = {
  role: string
  coach_status: string | null
  subscription_status: string | null
  trial_ends_at: string | null
}
