import { NextResponse } from "next/server"
import type Stripe from "stripe"
import type { BillingPlan } from "@/lib/stripe-config"
import { parseBillingPlan } from "@/lib/stripe-config"
import { mapStripeSubscriptionStatus } from "@/lib/subscription"
import { createAdminClient } from "@/lib/supabase/admin"
import { getStripe } from "@/lib/stripe"
import {
  isStripeWebhookEventProcessed,
  markStripeWebhookEventProcessed,
} from "@/lib/stripe/webhook-idempotency"

function stripeResourceId(
  value: string | { id: string } | null | undefined,
): string | null {
  if (!value) return null
  return typeof value === "string" ? value : value.id
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const parentSubscription = invoice.parent?.subscription_details?.subscription
  if (parentSubscription) {
    return stripeResourceId(parentSubscription)
  }

  const legacySubscription = (
    invoice as Stripe.Invoice & { subscription?: string | { id: string } | null }
  ).subscription

  return stripeResourceId(legacySubscription)
}

function parseBillingPlanFromMetadata(
  value: string | null | undefined,
): BillingPlan | null {
  return parseBillingPlan(value)
}

async function resolveUserId(
  supabase: ReturnType<typeof createAdminClient>,
  options: {
    userId?: string | null
    stripeCustomerId?: string | null
  },
): Promise<string | null> {
  const metadataUserId = options.userId?.trim()
  if (metadataUserId) {
    return metadataUserId
  }

  const customerId = stripeResourceId(options.stripeCustomerId)
  if (!customerId) {
    return null
  }

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  return data?.id ?? null
}

async function updateProfileSubscription(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  subscriptionStatus: string,
  extras?: {
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    billingPlan?: BillingPlan | null
  },
) {
  const { error } = await supabase.rpc("set_profile_billing", {
    p_user_id: userId,
    p_subscription_status: subscriptionStatus,
    p_stripe_customer_id: extras?.stripeCustomerId || null,
    p_stripe_subscription_id: extras?.stripeSubscriptionId || null,
    p_billing_plan: extras?.billingPlan || null,
  })

  if (error) {
    throw new Error(error.message)
  }
}

async function activateBrandSubscription(session: Stripe.Checkout.Session) {
  const brandId = session.metadata?.brand_id
  if (!brandId) return

  const supabase = createAdminClient()

  await supabase
    .from("brand_profiles")
    .update({
      plan: "pro",
      stripe_customer_id: stripeResourceId(session.customer),
      stripe_subscription_id: stripeResourceId(session.subscription),
      ai_credits: 2000,
    })
    .eq("id", brandId)
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not set." },
      { status: 500 },
    )
  }

  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature." }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook signature verification failed."
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    if (await isStripeWebhookEventProcessed(supabase, event.id)) {
      return NextResponse.json({ received: true, duplicate: true })
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook idempotency check failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = await resolveUserId(supabase, {
      userId: session.metadata?.user_id,
      stripeCustomerId: stripeResourceId(session.customer),
    })

    if (userId) {
      const billingPlan = parseBillingPlanFromMetadata(session.metadata?.plan)

      await updateProfileSubscription(supabase, userId, "active", {
        stripeCustomerId: stripeResourceId(session.customer),
        stripeSubscriptionId: stripeResourceId(session.subscription),
        billingPlan,
      })
    }

    await activateBrandSubscription(session)
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription
    const userId = await resolveUserId(supabase, {
      userId: subscription.metadata?.user_id,
      stripeCustomerId: stripeResourceId(subscription.customer),
    })

    if (userId) {
      const status =
        event.type === "customer.subscription.deleted"
          ? "cancelled"
          : mapStripeSubscriptionStatus(subscription.status)

      const billingPlan = parseBillingPlanFromMetadata(subscription.metadata?.plan)

      await updateProfileSubscription(supabase, userId, status, {
        stripeCustomerId: stripeResourceId(subscription.customer),
        stripeSubscriptionId: subscription.id,
        billingPlan,
      })
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice
    const subscriptionId = getInvoiceSubscriptionId(invoice)

    if (subscriptionId) {
      const stripe = getStripe()
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const userId = await resolveUserId(supabase, {
        userId: subscription.metadata?.user_id,
        stripeCustomerId: stripeResourceId(subscription.customer),
      })

      if (userId) {
        const billingPlan = parseBillingPlanFromMetadata(subscription.metadata?.plan)

        await updateProfileSubscription(supabase, userId, "past_due", {
          stripeCustomerId: stripeResourceId(subscription.customer),
          stripeSubscriptionId: subscription.id,
          billingPlan,
        })
      }
    }
  }

  try {
    await markStripeWebhookEventProcessed(supabase, event)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to record webhook event."
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
