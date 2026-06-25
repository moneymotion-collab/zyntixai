import { NextResponse } from "next/server"
import { createBrandCheckoutSession } from "@/lib/create-brand-checkout-session"
import { createClient } from "@/lib/supabase/server"

type CheckoutBody = {
  price_id?: unknown
}

function parsePriceId(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null
  }

  return value.trim()
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body: CheckoutBody

    try {
      body = (await req.json()) as CheckoutBody
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
    }

    const priceId = parsePriceId(body.price_id)

    if (!priceId) {
      return NextResponse.json({ error: "price_id is required." }, { status: 400 })
    }

    const { data: brand, error: brandError } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle()

    if (brandError) {
      return NextResponse.json({ error: brandError.message }, { status: 500 })
    }

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    const session = await createBrandCheckoutSession(
      brand,
      user.id,
      user.email,
      priceId,
    )

    if (!session.url) {
      return NextResponse.json(
        { error: "Checkout session URL missing." },
        { status: 500 },
      )
    }

    return NextResponse.json({
      url: session.url,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create checkout session."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
