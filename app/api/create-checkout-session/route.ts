import { NextResponse } from "next/server"
import { createCheckoutSession } from "@/lib/create-checkout-session"
import {
  assertStripeSecretKeyConfigured,
  getAppUrlOrThrow,
  INVALID_BILLING_PLAN_MESSAGE,
  parseBillingPlan,
  requireStripePriceId,
} from "@/lib/stripe-config"
import { createClient } from "@/lib/supabase/server"

type CheckoutBody = {
  plan?: unknown
}

function getCheckoutConfigError(error: unknown): NextResponse | null {
  if (!(error instanceof Error)) {
    return null
  }

  if (error.message.includes("STRIPE_SECRET_KEY is missing")) {
    return NextResponse.json({ error: error.message }, { status: 503 })
  }

  if (error.message.includes("NEXT_PUBLIC_URL") || error.message.includes("APP_URL")) {
    return NextResponse.json({ error: error.message }, { status: 503 })
  }

  if (error.message.startsWith("Missing STRIPE_PRICE_")) {
    return NextResponse.json({ error: error.message }, { status: 503 })
  }

  return null
}

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      return NextResponse.json(
        { error: "Billing is not configured. STRIPE_SECRET_KEY is missing." },
        { status: 503 },
      )
    }

    getAppUrlOrThrow()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }

    let body: CheckoutBody

    try {
      body = (await request.json()) as CheckoutBody
    } catch {
      return NextResponse.json({ error: INVALID_BILLING_PLAN_MESSAGE }, { status: 400 })
    }

    const plan = parseBillingPlan(body.plan)
    if (!plan) {
      return NextResponse.json({ error: INVALID_BILLING_PLAN_MESSAGE }, { status: 400 })
    }

    assertStripeSecretKeyConfigured()
    requireStripePriceId(plan)

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    const session = await createCheckoutSession({
      userId: user.id,
      plan,
      stripeCustomerId: profile?.stripe_customer_id,
      customerEmail: user.email,
    })

    if (!session.url) {
      return NextResponse.json(
        { error: "Checkout session URL missing." },
        { status: 500 },
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const configError = getCheckoutConfigError(error)
    if (configError) {
      return configError
    }

    const message =
      error instanceof Error ? error.message : "Failed to create checkout session."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
