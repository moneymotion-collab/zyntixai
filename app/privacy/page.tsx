import type { Metadata } from "next"
import PrivacyPage from "@/components/landing/PrivacyPage"
import { buildPageMetadata, PRIVACY_SEO } from "@/lib/seo/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: PRIVACY_SEO.title,
  description: PRIVACY_SEO.description,
  path: "/privacy",
})

export default function Privacy() {
  return <PrivacyPage />
}
