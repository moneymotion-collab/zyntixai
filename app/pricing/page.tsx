import type { Metadata } from "next"
import PricingPage from "@/components/landing/PricingPage"
import { buildPageMetadata, PRICING_SEO } from "@/lib/seo/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: PRICING_SEO.title,
  description: PRICING_SEO.description,
  path: "/pricing",
  openGraphTitle: PRICING_SEO.openGraphTitle,
})

export default function Pricing() {
  return <PricingPage />
}
