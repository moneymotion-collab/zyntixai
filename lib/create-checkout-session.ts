import type Stripe from "stripe"
import type { BillingPlan } from "@/lib/stripe-config"
import { getAppUrlOrThrow, requireStripePriceId } from "@/lib/stripe-config"
import { getStripe } from "@/lib/stripe"

export type CreateCheckoutSessionParams = {
  userId: string
  plan: BillingPlan
  stripeCustomerId?: string | null
  customerEmail?: string | null
}

export async function createCheckoutSession({
  userId,
  plan,
  stripeCustomerId,
  customerEmail,
}: CreateCheckoutSessionParams) {
  const stripe = getStripe()
  const appUrl = getAppUrlOrThrow()
  const priceId = requireStripePriceId(plan)

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        user_id: userId,
        plan,
      },
    },
    metadata: {
      user_id: userId,
      plan,
    },
    success_url: `${appUrl}/dashboard`,
    cancel_url: `${appUrl}/pricing`,
  }

  const existingCustomerId = stripeCustomerId?.trim()
  if (existingCustomerId) {
    sessionParams.customer = existingCustomerId
  } else if (customerEmail) {
    sessionParams.customer_email = customerEmail
  }

  return stripe.checkout.sessions.create(sessionParams)
}
