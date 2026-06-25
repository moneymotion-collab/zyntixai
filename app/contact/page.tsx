import type { Metadata } from "next"
import ContactPage from "@/components/landing/ContactPage"
import { buildPageMetadata, CONTACT_SEO } from "@/lib/seo/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: CONTACT_SEO.title,
  description: CONTACT_SEO.description,
  path: "/contact",
})

export default function Contact() {
  return <ContactPage />
}
