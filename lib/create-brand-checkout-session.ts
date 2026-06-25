import type Stripe from "stripe"
import { getAppUrl, getStripe } from "@/lib/stripe"
import type { Database } from "@/lib/database.types"

type BrandProfile = Database["public"]["Tables"]["brand_profiles"]["Row"]

export async function createBrandCheckoutSession(
  brand: BrandProfile,
  userId: string,
  userEmail: string | undefined,
  priceId: string,
) {
  const stripe = getStripe()
  const appUrl = getAppUrl()

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/dashboard?success=true`,
    cancel_url: `${appUrl}/pricing`,
    metadata: {
      user_id: userId,
      brand_id: brand.id,
    },
    subscription_data: {
      metadata: {
        user_id: userId,
        brand_id: brand.id,
      },
    },
  }

  if (brand.stripe_customer_id) {
    sessionParams.customer = brand.stripe_customer_id
  } else if (userEmail) {
    sessionParams.customer_email = userEmail
  }

  return stripe.checkout.sessions.create(sessionParams)
}
