import { FITCORE_VISUAL_COLORS } from "@/lib/marketing/visual-identity"

export type BrandMascot = {
  name: string
  type: string
  personality: string[]
  visualStyle: string
  character: string
  appearanceRules: string[]
  colors: string[]
  voiceTone: string[]
  role: string
}

export const FITCORE_COACH_MASCOT: BrandMascot = {
  name: "Zyntix Coach",
  type: "AI Business & Fitness Mentor",
  personality: ["Confident", "Motivational", "Professional", "High-performance"],
  visualStyle: "Clean modern look",
  character:
    "Athletic male coach in black premium sportswear with subtle blue AI glow",
  appearanceRules: ["No tattoos", "No celebrity resemblance"],
  colors: ["Black", "White", "Electric Blue"],
  voiceTone: ["Confident", "Motivational", "Professional"],
  role: "Helps coaches save time, get clients and grow",
}

export const DEFAULT_BRAND_NAME = FITCORE_COACH_MASCOT.name

export const MASCOT_THEME_COLORS = {
  black: FITCORE_VISUAL_COLORS.deepBlack,
  white: FITCORE_VISUAL_COLORS.white,
  electricBlue: FITCORE_VISUAL_COLORS.electricBlue,
  neonBlue: FITCORE_VISUAL_COLORS.electricBlue,
  neonBlueGlow: FITCORE_VISUAL_COLORS.electricBlueGlow,
} as const

export function getMascotDescription(
  mascot: BrandMascot = FITCORE_COACH_MASCOT,
): string {
  const rules =
    mascot.appearanceRules.length > 0
      ? `. ${mascot.appearanceRules.join(". ")}`
      : ""

  return `${mascot.character}. ${mascot.visualStyle}${rules}`
}

export function getMascotStyle(
  mascot: BrandMascot = FITCORE_COACH_MASCOT,
): string {
  return `${mascot.visualStyle}. Colors: ${mascot.colors.join(", ")}`
}

export type MascotFieldOverrides = {
  name?: string
  description?: string
  style?: string
  voiceTone?: string
}

export function buildMascotPromptBlock(
  mascot: BrandMascot = FITCORE_COACH_MASCOT,
  overrides?: MascotFieldOverrides,
): string {
  const name = overrides?.name?.trim() || mascot.name
  const description = overrides?.description?.trim() || getMascotDescription(mascot)
  const style = overrides?.style?.trim() || getMascotStyle(mascot)
  const voiceTone =
    overrides?.voiceTone?.trim() || mascot.voiceTone.join(", ")

  return [
    `Mascot name: ${name}`,
    `Mascot description: ${description}`,
    `Mascot style: ${style}`,
    `Type: ${mascot.type}`,
    `Role: ${mascot.role}`,
    `Personality: ${mascot.personality.join(", ")}`,
    `Appearance rules: ${mascot.appearanceRules.join(", ")}`,
    `Voice tone: ${voiceTone}`,
    "Write the script in this mascot's voice. Use first-person coach perspective where natural.",
    "Focus messaging on helping fitness coaches save time, attract clients, and grow their business.",
  ].join("\n")
}
