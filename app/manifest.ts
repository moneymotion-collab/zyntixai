import type { MetadataRoute } from "next"

import { FITCORE_AI_BRAND_NAME, FITCORE_AI_TAGLINE } from "@/lib/brand/fitcore-ai"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${FITCORE_AI_BRAND_NAME} — ${FITCORE_AI_TAGLINE}`,
    short_name: FITCORE_AI_BRAND_NAME,
    description:
      "All-in-one AI business operating system for personal trainers, online coaches, and gyms.",
    start_url: "/",
    display: "standalone",
    background_color: "#06080f",
    theme_color: "#06080f",
    icons: [
      {
        src: "/brand/zyntixai-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/zyntixai-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
