import { COACH_STATUS } from "@/lib/coach-status"
import { normalizeSubscriptionStatus } from "@/lib/subscription/normalize"
import type {
  SubscriptionProfile,
  SubscriptionStatus,
} from "@/lib/subscription/types"

export type ResolvedSubscription = {
  status: SubscriptionStatus
  rawStatus: string | null
  hasAccess: boolean
  isPaying: boolean
  needsUpgrade: boolean
  trialActive: boolean
}

const PAYING_STATUSES: SubscriptionStatus[] = ["active", "past_due"]
const ACCESS_STATUSES: SubscriptionStatus[] = ["trial", "active", "past_due"]

function isTrialActive(
  trialEndsAt: string | null | undefined,
  now: number,
): boolean {
  if (!trialEndsAt) return false
  return new Date(trialEndsAt).getTime() > now
}

export function resolveSubscription(
  profile: SubscriptionProfile | null | undefined,
  now = Date.now(),
): ResolvedSubscription {
  const rawStatus = profile?.subscription_status ?? null
  const normalized = normalizeSubscriptionStatus(rawStatus)
  const trialActive = isTrialActive(profile?.trial_ends_at, now)

  let status: SubscriptionStatus

  if (
    normalized === "active" ||
    normalized === "past_due" ||
    normalized === "cancelled" ||
    normalized === "expired"
  ) {
    status = normalized
  } else if (normalized === "trial") {
    status = trialActive ? "trial" : "expired"
  } else {
    status = trialActive ? "trial" : "expired"
  }

  const role = profile?.role ?? ""
  const coachBlocked =
    role === "coach" && profile?.coach_status === COACH_STATUS.rejected

  let hasAccess = false
  if (role === "admin") {
    hasAccess = true
  } else if (!coachBlocked) {
    hasAccess = ACCESS_STATUSES.includes(status)
  }

  const isPaying = PAYING_STATUSES.includes(status)
  const needsUpgrade =
    role !== "admin" &&
    !coachBlocked &&
    status !== "active" &&
    status !== "past_due"

  return {
    status,
    rawStatus,
    hasAccess,
    isPaying,
    needsUpgrade,
    trialActive: status === "trial" && trialActive,
  }
}

export function canAccessWithSubscription(
  profile: SubscriptionProfile | null | undefined,
): boolean {
  return resolveSubscription(profile).hasAccess
}
