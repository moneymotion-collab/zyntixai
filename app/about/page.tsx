import type { Metadata } from "next"
import AboutPage from "@/components/landing/AboutPage"
import { ABOUT_SEO, buildPageMetadata } from "@/lib/seo/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: ABOUT_SEO.title,
  description: ABOUT_SEO.description,
  path: "/about",
  openGraphTitle: ABOUT_SEO.openGraphTitle,
})

export default function About() {
  return <AboutPage />
}
