import type { Metadata } from "next"
import TermsPage from "@/components/landing/TermsPage"
import { buildPageMetadata, TERMS_SEO } from "@/lib/seo/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: TERMS_SEO.title,
  description: TERMS_SEO.description,
  path: "/terms",
})

export default function Terms() {
  return <TermsPage />
}
