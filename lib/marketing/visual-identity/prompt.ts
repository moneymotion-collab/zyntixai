import {
  FITCORE_DEFAULT_LAYOUT_STYLE,
  FITCORE_VISUAL_CAMERA_DEFAULTS,
  FITCORE_VISUAL_COLORS,
  FITCORE_VISUAL_ENVIRONMENTS,
  FITCORE_VISUAL_IDENTITY,
  getFitCoreBrandSignature,
} from "@/lib/marketing/visual-identity/tokens"
import type {
  FitCoreBrandVisualContext,
  FitCoreVisualIdentityMode,
} from "@/lib/marketing/visual-identity/types"

const BRAND_SIGNATURE = getFitCoreBrandSignature()

function modeLabel(mode: FitCoreVisualIdentityMode): string {
  switch (mode) {
    case "motion":
      return "motion scene for Remotion animation"
    case "commercial":
      return "premium commercial video ad frame"
    case "thumbnail":
      return "scroll-stopping video cover thumbnail"
    default:
      return "AI image generation still frame"
  }
}

function buildMascotLine(context: FitCoreBrandVisualContext): string | null {
  if (context.includeMascot === false) return null

  if (context.mascotName?.trim() || context.mascotDescription?.trim()) {
    const parts = [
      context.mascotName?.trim()
        ? `Feature ${context.mascotName.trim()}`
        : "",
      context.mascotDescription?.trim() ?? "",
      context.mascotStyle?.trim()
        ? `Style: ${context.mascotStyle.trim()}.`
        : "",
    ].filter(Boolean)
    return parts.join(" ")
  }

  return "Original brand-safe athletic coach character — black premium sportswear, subtle electric blue AI glow, confident and professional."
}

export function buildFitCoreBrandSuffix(
  mode: FitCoreVisualIdentityMode = "image",
): string {
  const camera =
    FITCORE_VISUAL_CAMERA_DEFAULTS[mode] ??
    FITCORE_VISUAL_CAMERA_DEFAULTS.image

  return [
    FITCORE_VISUAL_IDENTITY.paletteDescription + ".",
    FITCORE_VISUAL_IDENTITY.lightingDescription + ".",
    camera + ".",
    "Vertical 9:16 composition.",
    FITCORE_VISUAL_IDENTITY.negativeConstraints + ".",
    `Must feel like ${FITCORE_VISUAL_IDENTITY.brandName} — same brand every scene.`,
  ].join(" ")
}

export function applyFitCoreBrandVisualIdentity(
  prompt: string,
  context: FitCoreBrandVisualContext = {},
): string {
  const trimmed = prompt.trim()
  if (!trimmed) return buildFitCoreBrandedScenePrompt({ sceneDirection: "" }, context)

  const lower = trimmed.toLowerCase()
  if (lower.includes("fitcore") && lower.includes("electric blue")) {
    return trimmed
  }

  const mode = context.mode ?? "image"
  const mascotLine = buildMascotLine(context)

  return [
    trimmed.endsWith(".") ? trimmed : `${trimmed}.`,
    mascotLine,
    buildFitCoreBrandSuffix(mode),
  ]
    .filter(Boolean)
    .join(" ")
}

export function buildFitCoreBrandedScenePrompt(
  input: {
    sceneDirection: string
    onScreenText?: string
    storyBeat?: string
    cameraMotion?: string
    characterAction?: string
  },
  context: FitCoreBrandVisualContext = {},
): string {
  const mode = context.mode ?? "image"
  const sceneDirection =
    input.sceneDirection.trim() ||
    "Premium fitness coaching commercial scene in a modern workspace."

  const lines = [
    `${modeLabel(mode)} for ${FITCORE_VISUAL_IDENTITY.brandName}.`,
    buildMascotLine(context),
    `Scene direction: ${sceneDirection}.`,
  ].filter(Boolean) as string[]

  if (input.storyBeat?.trim()) {
    lines.push(`Story beat: ${input.storyBeat.trim()}.`)
  }
  if (input.onScreenText?.trim()) {
    lines.push(`On-screen message context: "${input.onScreenText.trim()}".`)
  }
  if (input.characterAction?.trim()) {
    lines.push(`Character action: ${input.characterAction.trim()}.`)
  }

  lines.push(
    input.cameraMotion?.trim()
      ? `Camera: ${input.cameraMotion.trim()}.`
      : `Camera: ${FITCORE_VISUAL_CAMERA_DEFAULTS[mode]}.`,
  )

  lines.push(
    `Premium SaaS feel: ${FITCORE_VISUAL_IDENTITY.environmentDescription}.`,
  )
  lines.push(
    `Modern technology: ${FITCORE_VISUAL_IDENTITY.technologyDescription}.`,
  )
  lines.push(
    `Fitness industry: ${FITCORE_VISUAL_IDENTITY.fitnessDescription}.`,
  )
  lines.push(buildFitCoreBrandSuffix(mode))

  return lines.join(" ")
}

export function buildFitCoreVisualIdentityDirectorBlock(): string {
  const environmentList = FITCORE_VISUAL_ENVIRONMENTS.map((env) => `- ${env}`).join(
    "\n",
  )

  return `FITCORE AI VISUAL IDENTITY (apply to EVERY scene, thumbnail, and image_prompt):

Brand: ${FITCORE_VISUAL_IDENTITY.brandName} (${FITCORE_VISUAL_IDENTITY.productName})
Signature: ${BRAND_SIGNATURE}

Visual pillars (all four must read in every frame):
1. Premium SaaS feel — polished B2B fitness business, never cheap or cluttered
2. Modern technology — intelligent glow, holographic UI light, future-forward coaching tools
3. Fitness industry — credible coaches, gyms, clients, athletic premium sportswear
4. Clean cinematic visuals — shallow depth of field, rim light, intentional negative space

Color system:
- Deep black ${FITCORE_VISUAL_COLORS.deepBlack}, off-black ${FITCORE_VISUAL_COLORS.offBlack}
- White highlights ${FITCORE_VISUAL_COLORS.white}
- Electric blue accent ${FITCORE_VISUAL_COLORS.electricBlue} on technology and hero subjects

Lighting: ${FITCORE_VISUAL_IDENTITY.lightingDescription}
Cinematography: ${FITCORE_VISUAL_IDENTITY.cinematographyDescription}
Technology treatment: ${FITCORE_VISUAL_IDENTITY.technologyDescription}
Fitness treatment: ${FITCORE_VISUAL_IDENTITY.fitnessDescription}
Default layout style: ${FITCORE_DEFAULT_LAYOUT_STYLE}

Approved environments:
${environmentList}

Brand consistency rules:
- Every generated video must feel like the same ${FITCORE_VISUAL_IDENTITY.brandName} brand
- Match palette, lighting, and cinematic tone across all scenes — no style drift between cuts
- visual and image_prompt must describe the same branded moment
- image_prompt must be standalone for AI generation and end with vertical 9:16
- ${FITCORE_VISUAL_IDENTITY.negativeConstraints}`
}

export function buildFitCoreThumbnailPrompt(
  thumbnailVisual: string,
  thumbnailTitle: string,
  thumbnailText: string,
  context: FitCoreBrandVisualContext = {},
): string {
  return buildFitCoreBrandedScenePrompt(
    {
      sceneDirection: `Cover frame: ${thumbnailVisual}. Designed for headline "${thumbnailTitle}" and subline "${thumbnailText}".`,
      cameraMotion: FITCORE_VISUAL_CAMERA_DEFAULTS.thumbnail,
    },
    { ...context, mode: "thumbnail", includeMascot: context.includeMascot ?? true },
  )
}

export function buildFitCoreMascotPortraitPrompt(
  mascotDescription: string,
  mascotStyle: string,
  mascotName: string,
): string {
  return applyFitCoreBrandVisualIdentity(
    [
      `Premium ${FITCORE_VISUAL_IDENTITY.productName} brand mascot portrait.`,
      mascotDescription,
      `Visual style: ${mascotStyle}.`,
      `Character name: ${mascotName}.`,
      "Confident expression, studio-quality commercial portrait, original character only.",
    ].join(" "),
    { mode: "image", includeMascot: true, mascotName, mascotDescription, mascotStyle },
  )
}
