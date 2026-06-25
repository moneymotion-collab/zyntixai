import type { MetadataRoute } from "next"

import {
  absoluteSiteUrl,
  PUBLIC_SITEMAP_PATHS,
  requireSiteBaseUrl,
} from "@/lib/seo/site-metadata"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = requireSiteBaseUrl()

  return PUBLIC_SITEMAP_PATHS.map((path) => ({
    url: absoluteSiteUrl(path) ?? `${baseUrl}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  }))
}
