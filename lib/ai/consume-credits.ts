import { createClient } from "@/lib/supabase/server"

export class BrandNotFoundError extends Error {
  constructor() {
    super("Brand not found")
    this.name = "BrandNotFoundError"
  }
}

export class InsufficientCreditsError extends Error {
  constructor() {
    super("Not enough AI credits")
    this.name = "InsufficientCreditsError"
  }
}

export class UpgradeRequiredError extends Error {
  constructor() {
    super("Upgrade required")
    this.name = "UpgradeRequiredError"
  }
}

const FREE_PLAN_CREDIT_LIMIT = 50

export async function consumeCredits(
  brandId: string,
  amount: number,
  endpoint: string,
) {
  if (amount <= 0) {
    throw new Error("Credit amount must be positive")
  }

  const supabase = await createClient()

  const { data: brand, error: brandError } = await supabase
    .from("brand_profiles")
    .select("plan, credits_used, ai_credits")
    .eq("id", brandId)
    .single()

  if (brandError || !brand) {
    throw new BrandNotFoundError()
  }

  if (brand.plan === "free" && brand.credits_used > FREE_PLAN_CREDIT_LIMIT) {
    throw new UpgradeRequiredError()
  }

  const { data, error } = await supabase.rpc("consume_brand_credits", {
    p_brand_id: brandId,
    p_amount: amount,
    p_endpoint: endpoint,
  })

  if (error) {
    if (error.message.includes("Not enough AI credits")) {
      throw new InsufficientCreditsError()
    }

    if (error.message.includes("Brand not found")) {
      throw new BrandNotFoundError()
    }

    throw new Error(error.message)
  }

  if (!data) {
    throw new Error("Failed to consume credits")
  }

  return true
}
