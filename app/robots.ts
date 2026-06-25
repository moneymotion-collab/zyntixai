import type { MetadataRoute } from "next"

import {
  PUBLIC_ROBOTS_ALLOW_PATHS,
  requireSiteBaseUrl,
  ROBOTS_DISALLOW_PATHS,
} from "@/lib/seo/site-metadata"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = requireSiteBaseUrl()

  return {
    rules: {
      userAgent: "*",
      allow: [...PUBLIC_ROBOTS_ALLOW_PATHS],
      disallow: [...ROBOTS_DISALLOW_PATHS],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
