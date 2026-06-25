export const BILLING_PLANS = ["basic", "pro", "business"] as const

export type BillingPlan = (typeof BILLING_PLANS)[number]

const PLAN_PRICE_ENV: Record<BillingPlan, string> = {
  basic: "STRIPE_PRICE_BASIC",
  pro: "STRIPE_PRICE_PRO",
  business: "STRIPE_PRICE_BUSINESS",
}

export const BILLING_PLAN_DETAILS: Record<
  BillingPlan,
  { name: string; price: number; description: string }
> = {
  basic: {
    name: "Starter",
    price: 29,
    description: "Everything you need to coach clients day to day.",
  },
  pro: {
    name: "Pro",
    price: 79,
    description: "Grow your brand with AI-powered marketing tools.",
  },
  business: {
    name: "Agency",
    price: 149,
    description: "Run a multi-coach fitness business at scale.",
  },
}

export function parseBillingPlan(value: unknown): BillingPlan | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase()
  return BILLING_PLANS.includes(normalized as BillingPlan)
    ? (normalized as BillingPlan)
    : null
}

export function getStripePriceId(plan: BillingPlan): string | null {
  const envKey = PLAN_PRICE_ENV[plan]
  const value = process.env[envKey]?.trim()
  return value || null
}

export function requireStripePriceId(plan: BillingPlan): string {
  const priceId = getStripePriceId(plan)
  if (!priceId) {
    throw new Error(
      `Missing ${PLAN_PRICE_ENV[plan]} for the "${plan}" plan.`,
    )
  }
  return priceId
}

export function isStripeSecretKeyConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim())
}

export function assertStripeSecretKeyConfigured(): void {
  if (!isStripeSecretKeyConfigured()) {
    throw new Error("Billing is not configured. STRIPE_SECRET_KEY is missing.")
  }
}

export function getAppUrlOrThrow(): string {
  const url = process.env.NEXT_PUBLIC_URL?.trim()
  if (!url) {
    throw new Error(
      "APP_URL is not configured. Set NEXT_PUBLIC_URL for Stripe redirect URLs.",
    )
  }
  return url
}

export function getBillingPlanLabel(
  plan: BillingPlan | string | null | undefined,
): string | null {
  const parsed = typeof plan === "string" ? parseBillingPlan(plan) : plan
  if (!parsed) {
    return null
  }

  return BILLING_PLAN_DETAILS[parsed].name
}

export const INVALID_BILLING_PLAN_MESSAGE =
  'Invalid plan. Expected "basic", "pro", or "business".'
