import type { SubscriptionStatus } from "@/lib/subscription/types"

const LEGACY_STATUS_MAP: Record<string, SubscriptionStatus> = {
  trial: "trial",
  trialing: "trial",
  active: "active",
  past_due: "past_due",
  cancelled: "cancelled",
  canceled: "cancelled",
  expired: "expired",
  inactive: "expired",
}

export function isSubscriptionStatus(value: string): value is SubscriptionStatus {
  return (
    value === "trial" ||
    value === "active" ||
    value === "past_due" ||
    value === "cancelled" ||
    value === "expired"
  )
}

/** Map legacy / Stripe spellings to canonical status. */
export function normalizeSubscriptionStatus(
  value: unknown,
): SubscriptionStatus | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return null

  if (isSubscriptionStatus(trimmed)) return trimmed

  return LEGACY_STATUS_MAP[trimmed] ?? null
}
