import type { Database } from "@/lib/database.types"
import { getDisplaySubscriptionStatus } from "@/lib/subscription-access"
import { SUBSCRIPTION_STATUS } from "@/lib/subscription"

export type ManageBillingProfile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  | "subscription_status"
  | "trial_ends_at"
  | "role"
  | "coach_status"
  | "stripe_customer_id"
  | "billing_plan"
>

const PORTAL_STATUSES = new Set([
  SUBSCRIPTION_STATUS.active,
  SUBSCRIPTION_STATUS.past_due,
  SUBSCRIPTION_STATUS.cancelled,
])

export function hasStripeCustomer(
  profile: Pick<ManageBillingProfile, "stripe_customer_id"> | null | undefined,
): boolean {
  return Boolean(profile?.stripe_customer_id?.trim())
}

export function shouldShowManageBilling(
  profile: ManageBillingProfile | null | undefined,
): boolean {
  if (!hasStripeCustomer(profile)) {
    return false
  }

  const displayStatus = getDisplaySubscriptionStatus(
    profile
      ? {
          role: profile.role,
          coach_status: profile.coach_status,
          subscription_status: profile.subscription_status,
          trial_ends_at: profile.trial_ends_at,
        }
      : null,
  )
  if (!displayStatus) {
    return false
  }

  return PORTAL_STATUSES.has(displayStatus)
}

export function shouldShowPaywallPortal(
  profile: ManageBillingProfile | null | undefined,
): boolean {
  return hasStripeCustomer(profile)
}
