import type { SubscriptionStatus } from "@/lib/subscription/types"

/** Map Stripe subscription.status → canonical `profiles.subscription_status`. */
export function mapStripeSubscriptionStatus(
  stripeStatus: string,
): SubscriptionStatus {
  switch (stripeStatus) {
    case "trialing":
      return "trial"
    case "active":
      return "active"
    case "past_due":
    case "unpaid":
      return "past_due"
    case "canceled":
      return "cancelled"
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return "expired"
    default:
      return "expired"
  }
}
