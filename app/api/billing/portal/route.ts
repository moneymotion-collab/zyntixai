import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getAppUrlOrThrow } from "@/lib/stripe-config"
import { getStripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

const NO_CUSTOMER_MESSAGE =
  "No Stripe customer found. Please subscribe first."

function getPortalErrorResponse(error: unknown): NextResponse {
  if (error instanceof Error && error.message === "STRIPE_SECRET_KEY is not set.") {
    return NextResponse.json(
      { error: "Billing is not configured. STRIPE_SECRET_KEY is missing." },
      { status: 503 },
    )
  }

  if (error instanceof Stripe.errors.StripeError) {
    const message = error.message.toLowerCase()

    if (
      message.includes("billing portal") &&
      (message.includes("configuration") || message.includes("configured"))
    ) {
      return NextResponse.json(
        {
          error:
            "Stripe billing portal is not configured. Enable it in your Stripe Dashboard.",
        },
        { status: 503 },
      )
    }

    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: error.message || "Stripe billing portal request failed." },
      { status: 502 },
    )
  }

  const message =
    error instanceof Error
      ? error.message
      : "Could not open billing portal."

  return NextResponse.json({ error: message }, { status: 500 })
}

export async function POST() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    const stripeCustomerId = profile?.stripe_customer_id?.trim()

    if (!stripeCustomerId) {
      return NextResponse.json({ error: NO_CUSTOMER_MESSAGE }, { status: 400 })
    }

    const stripe = getStripe()
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${getAppUrlOrThrow()}/settings`,
    })

    if (!session.url) {
      return NextResponse.json(
        { error: "Billing portal session URL missing." },
        { status: 500 },
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (error instanceof Error && error.message.includes("APP_URL")) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }

    return getPortalErrorResponse(error)
  }
}
