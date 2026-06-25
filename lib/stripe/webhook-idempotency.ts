import type { SupabaseClient } from "@supabase/supabase-js"
import type Stripe from "stripe"
import type { Database, Json } from "@/lib/database.types"

const STRIPE_PROVIDER = "stripe"

type AdminClient = SupabaseClient<Database>

export async function isStripeWebhookEventProcessed(
  supabase: AdminClient,
  eventId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("event_id", eventId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to check webhook idempotency: ${error.message}`)
  }

  return data !== null
}

export async function markStripeWebhookEventProcessed(
  supabase: AdminClient,
  event: Stripe.Event,
): Promise<void> {
  const { error } = await supabase.from("webhook_events").insert({
    provider: STRIPE_PROVIDER,
    event_id: event.id,
    event_type: event.type,
    payload: event as unknown as Json,
  })

  if (error?.code === "23505") {
    return
  }

  if (error) {
    throw new Error(`Failed to record webhook event: ${error.message}`)
  }
}
