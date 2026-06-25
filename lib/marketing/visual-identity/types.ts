export const FITCORE_VISUAL_PILLARS = [
  "Premium SaaS feel",
  "Modern technology",
  "Fitness industry",
  "Clean cinematic visuals",
] as const

export type FitCoreVisualPillar = (typeof FITCORE_VISUAL_PILLARS)[number]

export type FitCoreVisualIdentityMode = "image" | "motion" | "commercial" | "thumbnail"

export type FitCoreBrandVisualContext = {
  brandName?: string
  mode?: FitCoreVisualIdentityMode
  includeMascot?: boolean
  mascotName?: string
  mascotDescription?: string
  mascotStyle?: string
}

export type FitCoreVisualColorTokens = {
  deepBlack: string
  offBlack: string
  white: string
  electricBlue: string
  electricBlueGlow: string
  gradientStart: string
  gradientEnd: string
}

export type FitCoreVisualIdentity = {
  brandName: string
  productName: string
  tagline: string
  pillars: readonly FitCoreVisualPillar[]
  colors: FitCoreVisualColorTokens
  paletteDescription: string
  lightingDescription: string
  environmentDescription: string
  cinematographyDescription: string
  technologyDescription: string
  fitnessDescription: string
  negativeConstraints: string
}
