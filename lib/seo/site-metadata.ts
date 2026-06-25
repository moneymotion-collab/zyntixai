import type { Metadata } from "next"
import { FITCORE_AI_BRAND_NAME } from "@/lib/brand/fitcore-ai"

export const SITE_OG_IMAGE = {
  url: "/app-showcase/dashboard.png",
  width: 1200,
  height: 630,
  alt: `${FITCORE_AI_BRAND_NAME} — coach dashboard`,
} as const

/** Public marketing and legal routes included in sitemap.xml. */
export const PUBLIC_SITEMAP_PATHS = [
  "/",
  "/pricing",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
] as const

/** Crawlable public routes for robots.txt allow rules. */
export const PUBLIC_ROBOTS_ALLOW_PATHS = [
  "/",
  "/pricing",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
] as const

/** Authenticated app routes blocked from crawlers. */
export const ROBOTS_DISALLOW_PATHS = [
  "/dashboard",
  "/members",
  "/workouts",
  "/nutrition",
  "/progress",
  "/sessions",
  "/coach-workspace",
  "/marketing",
] as const

function isLocalhostSiteUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname.endsWith(".localhost")
    )
  } catch {
    return false
  }
}

/** True when running a deployed production build (not local `next build`). */
function isDeployedProduction(): boolean {
  if (process.env.NODE_ENV !== "production") return false
  if (process.env.VERCEL_ENV === "production") return true
  if (process.env.REQUIRE_PUBLIC_URL === "1") return true
  return false
}

function assertProductionSiteUrl(url: string): void {
  if (!isDeployedProduction()) return

  if (isLocalhostSiteUrl(url)) {
    throw new Error(
      "NEXT_PUBLIC_URL must not point to localhost in production (SEO metadata).",
    )
  }
}

export function getSiteBaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_URL?.trim()
  if (!url) return null

  const normalized = url.replace(/\/$/, "")
  assertProductionSiteUrl(normalized)
  return normalized
}

export function requireSiteBaseUrl(): string {
  const base = getSiteBaseUrl()
  if (base) return base

  if (isDeployedProduction()) {
    throw new Error(
      "NEXT_PUBLIC_URL is required in production for SEO metadata, sitemap, and robots.",
    )
  }

  return "http://localhost:3000"
}

export function getMetadataBase(): URL | undefined {
  const base = getSiteBaseUrl()
  if (!base) {
    if (isDeployedProduction()) {
      throw new Error(
        "NEXT_PUBLIC_URL is required in production for SEO metadata, sitemap, and robots.",
      )
    }
    return undefined
  }
  return new URL(`${base}/`)
}

export function absoluteSiteUrl(path: string): string | null {
  const base = getSiteBaseUrl()
  if (!base) return null
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${base}${normalized}`
}

function resolveOgImage() {
  const absoluteUrl = absoluteSiteUrl(SITE_OG_IMAGE.url)
  return absoluteUrl ? { ...SITE_OG_IMAGE, url: absoluteUrl } : SITE_OG_IMAGE
}

type BuildPageMetadataInput = {
  title: string
  description: string
  path: string
  openGraphTitle?: string
  openGraphDescription?: string
  twitterTitle?: string
  twitterDescription?: string
}

/** Per-page metadata with OG, Twitter, and canonical URL when NEXT_PUBLIC_URL is set. */
export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const openGraphTitle = input.openGraphTitle ?? input.title
  const openGraphDescription = input.openGraphDescription ?? input.description
  const twitterTitle = input.twitterTitle ?? openGraphTitle
  const twitterDescription = input.twitterDescription ?? openGraphDescription
  const canonical = absoluteSiteUrl(input.path)
  const ogImage = resolveOgImage()

  return {
    title: input.title,
    description: input.description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title: openGraphTitle,
      description: openGraphDescription,
      type: "website",
      ...(canonical ? { url: canonical } : {}),
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      images: [ogImage.url],
    },
  }
}

export const HOME_SEO = {
  title: "Start Your 7-Day Free Trial",
  description:
    "FitCore AI is an all-in-one coaching platform for personal trainers, online coaches, and gyms — workout programming, progress tracking, Marketing AI, and Instagram publishing. No credit card required.",
  openGraphTitle: "FitCore AI — Coaching Platform for Trainers & Online Coaches",
  openGraphDescription:
    "Manage clients, build workouts, track progress, and grow with Marketing AI and Instagram publishing. Start your 7-day free trial.",
} as const

export const PRICING_SEO = {
  title: "Pricing",
  description:
    "FitCore AI plans from €29/month — workout programming, progress tracking, Marketing AI, and Instagram publishing. Starter, Pro, and Agency plans with a 7-day free trial.",
  openGraphTitle: "FitCore AI Pricing — Plans for Growing Coaches",
} as const

export const PRIVACY_SEO = {
  title: "Privacy Policy",
  description:
    "How FitCore AI collects, uses, and protects your data — cookies, analytics, account information, and your GDPR rights.",
} as const

export const TERMS_SEO = {
  title: "Terms of Service",
  description:
    "FitCore AI terms — acceptable use, subscriptions, billing, 7-day free trial, cancellation, and limitation of liability.",
} as const

export const ABOUT_SEO = {
  title: "About",
  description:
    "FitCore AI helps personal trainers, online coaches, and gyms run client delivery, workout programming, progress tracking, and marketing from one platform.",
  openGraphTitle: "About FitCore AI — Built for Modern Coaches",
} as const

export const CONTACT_SEO = {
  title: "Contact",
  description:
    "Contact FitCore AI for support, beta access, and product questions. We typically respond within 1–2 business days.",
} as const
