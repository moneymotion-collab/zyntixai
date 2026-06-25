import { BILLING_PLAN_DETAILS, type BillingPlan } from "@/lib/stripe-config"

/** Feature bullets shown on public pricing cards (aligned to product pillars). */
export const PRICING_PLAN_FEATURES: Record<BillingPlan, readonly string[]> = {
  basic: ["Members", "Workouts", "Nutrition", "Progress"],
  pro: ["Members", "Workouts", "Nutrition", "Progress", "Marketing AI"],
  business: [
    "Everything in Pro",
    "Multiple Coaches",
    "Team Management",
    "Priority Support",
  ],
}

export const RECOMMENDED_BILLING_PLAN: BillingPlan = "pro"

export type PublicPricingPlan = {
  id: BillingPlan
  name: string
  price: number
  description: string
  features: readonly string[]
  highlighted?: boolean
  badge?: string
}

export const PUBLIC_PRICING_PLANS: readonly PublicPricingPlan[] = [
  {
    id: "basic",
    ...BILLING_PLAN_DETAILS.basic,
    features: PRICING_PLAN_FEATURES.basic,
  },
  {
    id: "pro",
    ...BILLING_PLAN_DETAILS.pro,
    features: PRICING_PLAN_FEATURES.pro,
    highlighted: true,
    badge: "Recommended",
  },
  {
    id: "business",
    ...BILLING_PLAN_DETAILS.business,
    features: PRICING_PLAN_FEATURES.business,
  },
] as const
