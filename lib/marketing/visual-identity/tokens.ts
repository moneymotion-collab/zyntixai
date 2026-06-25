import type { FitCoreVisualIdentity } from "@/lib/marketing/visual-identity/types"

export const FITCORE_BRAND_NAME = "FitCore AI"
export const FITCORE_PRODUCT_NAME = "FitCore Coach"

export const FITCORE_VISUAL_COLORS = {
  deepBlack: "#050505",
  offBlack: "#0a1628",
  white: "#ffffff",
  electricBlue: "#00d4ff",
  electricBlueGlow: "rgba(0, 212, 255, 0.45)",
  gradientStart: "#050505",
  gradientEnd: "#0a1628",
} as const

export const FITCORE_VISUAL_IDENTITY: FitCoreVisualIdentity = {
  brandName: FITCORE_BRAND_NAME,
  productName: FITCORE_PRODUCT_NAME,
  tagline: "The coaching business platform — premium, intelligent, cinematic.",
  pillars: [
    "Premium SaaS feel",
    "Modern technology",
    "Fitness industry",
    "Clean cinematic visuals",
  ],
  colors: FITCORE_VISUAL_COLORS,
  paletteDescription:
    "Deep black and off-black backgrounds, crisp white highlights, electric blue (#00d4ff) accent glow on technology and key subjects",
  lightingDescription:
    "Clean cinematic lighting — soft rim light with electric blue edge glow, controlled shadows, shallow depth of field, premium commercial color grade",
  environmentDescription:
    "Modern boutique gyms, professional coaching offices, dark tech-forward workspaces, wellness studios — always polished, never cluttered",
  cinematographyDescription:
    "Slow cinematic camera moves, shallow depth of field, intentional negative space, vertical 9:16 framing, scroll-stopping commercial composition",
  technologyDescription:
    "Abstract holographic UI glow, intelligent dashboards as light sources, modern AI atmosphere — metaphorical tech, never flat app screenshots",
  fitnessDescription:
    "Athletic coaches and clients in premium sportswear, credible fitness business context, transformation energy without gym-bro clichés",
  negativeConstraints:
    "No flat app screenshots, no readable UI text, no watermarks, no logos, no celebrity likeness, no copyrighted characters, no noisy clutter, no cheap consumer gym aesthetic",
}

export const FITCORE_DEFAULT_LAYOUT_STYLE = "dark_commercial" as const

export const FITCORE_VISUAL_ENVIRONMENTS = [
  "Dark modern coaching office with electric blue screen glow",
  "Boutique gym interior with premium overhead lighting",
  "Wellness studio with clean lines and soft rim light",
  "Standing desk command center in fitness business HQ",
  "Late-night gym office with cinematic desk lamp warmth",
] as const

export const FITCORE_VISUAL_CAMERA_DEFAULTS = {
  image: "cinematic framing, shallow depth of field, premium commercial lens",
  motion: "slow cinematic push-in with subtle parallax, controlled commercial pacing",
  commercial: "hero framing with rim light and electric blue accent glow",
  thumbnail: "scroll-stopping cover composition with clean negative space for text overlay",
} as const

export function getFitCorePaletteLine(): string {
  return FITCORE_VISUAL_IDENTITY.paletteDescription
}

export function getFitCoreBrandSignature(): string {
  return `${FITCORE_BRAND_NAME} visual identity — premium SaaS, modern technology, fitness industry, clean cinematic visuals`
}
