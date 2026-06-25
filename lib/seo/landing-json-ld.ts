import { COACH_TRIAL_DAYS } from "@/lib/coach-trial"
import {
  FITCORE_AI_BRAND_NAME,
  FITCORE_AI_METADATA_DESCRIPTION,
} from "@/lib/brand/fitcore-ai"
import { BILLING_PLAN_DETAILS, BILLING_PLANS } from "@/lib/stripe-config"
import { absoluteSiteUrl, getSiteBaseUrl } from "@/lib/seo/site-metadata"

export function buildLandingSoftwareApplicationJsonLd(): Record<string, unknown> {
  const siteUrl = getSiteBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: FITCORE_AI_BRAND_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: FITCORE_AI_METADATA_DESCRIPTION,
    ...(siteUrl ? { url: siteUrl } : {}),
    audience: {
      "@type": "PeopleAudience",
      audienceType: "Personal trainers, online coaches, and gyms",
    },
    featureList: [
      "Client and member management",
      "Workout programming and exercise library",
      "Nutrition planning",
      "Progress tracking and check-ins",
      "Coach dashboard",
      "Marketing AI",
      "Instagram publishing",
      "Video content generator",
    ],
    offers: [
      {
        "@type": "Offer",
        name: `${COACH_TRIAL_DAYS}-day free trial`,
        price: "0",
        priceCurrency: "EUR",
        description: `Full platform access for ${COACH_TRIAL_DAYS} days. No credit card required to start.`,
        ...(siteUrl ? { url: absoluteSiteUrl("/register") ?? undefined } : {}),
      },
      ...BILLING_PLANS.map((planId) => {
        const plan = BILLING_PLAN_DETAILS[planId]
        return {
          "@type": "Offer",
          name: plan.name,
          price: String(plan.price),
          priceCurrency: "EUR",
          description: plan.description,
          ...(siteUrl ? { url: absoluteSiteUrl("/pricing") ?? undefined } : {}),
        }
      }),
    ],
  }
}
