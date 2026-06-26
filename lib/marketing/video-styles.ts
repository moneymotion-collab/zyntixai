export const VIDEO_STYLES = [
  "viral_caption",
  "meme_kinetic",
  "problem_solution",
  "premium_ad",
  "saas_demo",
  "app_showcase",
  "mascot_story",
] as const

export const GENERATOR_VIDEO_STYLES = [
  "viral_caption",
  "problem_solution",
  "premium_ad",
  "saas_demo",
  "app_showcase",
  "mascot_story",
] as const

export type VideoStyle = (typeof VIDEO_STYLES)[number]
export type GeneratorVideoStyle = (typeof GENERATOR_VIDEO_STYLES)[number]

export const VIDEO_STYLE_LABELS: Record<VideoStyle, string> = {
  viral_caption: "Viral Caption",
  meme_kinetic: "Meme Kinetic",
  problem_solution: "Problem → Solution",
  premium_ad: "Premium Ad",
  saas_demo: "SaaS Demo",
  app_showcase: "SaaS App Showcase",
  mascot_story: "Mascot Story",
}

export const GENERATOR_VIDEO_STYLE_LABELS: Record<GeneratorVideoStyle, string> = {
  viral_caption: VIDEO_STYLE_LABELS.viral_caption,
  problem_solution: VIDEO_STYLE_LABELS.problem_solution,
  premium_ad: VIDEO_STYLE_LABELS.premium_ad,
  saas_demo: VIDEO_STYLE_LABELS.saas_demo,
  app_showcase: VIDEO_STYLE_LABELS.app_showcase,
  mascot_story: VIDEO_STYLE_LABELS.mascot_story,
}

export const VIDEO_STYLE_DESCRIPTIONS: Record<VideoStyle, string> = {
  viral_caption:
    "Bold animated captions, hook-first, scroll-stopping text overlays with kinetic camera moves",
  meme_kinetic:
    "Fast meme cuts, kinetic typography, emoji-friendly, high energy",
  problem_solution:
    "Problem → agitate → solution arc with contrasting cinematic story beats",
  premium_ad:
    "Polished cinematic ad, shallow depth of field, luxury brand tone, slow camera work",
  saas_demo:
    "Product demo flow with dashboard UI callouts, screen push-ins, and workflow framing",
  app_showcase:
    "Full Zyntix Coach SaaS demo — 7-scene module walkthrough: Dashboard, Members, Workouts, Nutrition, Sessions, Marketing AI, Analytics",
  mascot_story:
    "Character-driven story beats with brand mascot voice and tracking camera work",
}

export const VIDEO_STYLE_GOAL_HINTS: Record<GeneratorVideoStyle, string> = {
  viral_caption:
    "Quick tips, hot takes, educational hooks, trend-style caption-led reels",
  problem_solution:
    "Clear pain point, frustration, or before/after transformation arc",
  premium_ad:
    "High-end brand lift, trust, aspiration, cinematic luxury tone",
  saas_demo:
    "B2B SaaS walkthrough, dashboards, automations, coach business tools, ROI",
  app_showcase:
    "SaaS platform demo for coaches — dashboard, members, workouts, nutrition, sessions, marketing AI, analytics workflow",
  mascot_story:
    "Brand character or coach persona leading a story with personality",
}

export function isVideoStyle(value: string): value is VideoStyle {
  return VIDEO_STYLES.includes(value as VideoStyle)
}

export function isGeneratorVideoStyle(
  value: string,
): value is GeneratorVideoStyle {
  return GENERATOR_VIDEO_STYLES.includes(value as GeneratorVideoStyle)
}

export function normalizeVideoStyle(
  value: string | null | undefined,
  fallback: VideoStyle = "viral_caption",
): VideoStyle {
  const trimmed = value?.trim() ?? ""
  return isVideoStyle(trimmed) ? trimmed : fallback
}

export function normalizeGeneratorVideoStyle(
  value: string | null | undefined,
  fallback: GeneratorVideoStyle = "viral_caption",
): GeneratorVideoStyle {
  const trimmed = value?.trim() ?? ""
  if (isGeneratorVideoStyle(trimmed)) {
    return trimmed
  }

  const slug = trimmed.toLowerCase().replace(/[\s-]+/g, "_")
  if (isGeneratorVideoStyle(slug)) {
    return slug
  }

  if (slug.includes("app") && slug.includes("showcase")) {
    return "app_showcase"
  }

  if (slug.includes("saas") && slug.includes("demo")) {
    return "saas_demo"
  }

  if (trimmed === "meme_kinetic" || slug === "meme_kinetic") {
    return "viral_caption"
  }

  return fallback
}

export function buildVideoStylePromptList(): string {
  return VIDEO_STYLES.map(
    (style) => `${style} (${VIDEO_STYLE_DESCRIPTIONS[style]})`,
  ).join(", ")
}

export function buildGeneratorVideoStylePromptList(): string {
  return GENERATOR_VIDEO_STYLES.map(
    (style) =>
      `- ${style}: ${VIDEO_STYLE_DESCRIPTIONS[style]}. Best when: ${VIDEO_STYLE_GOAL_HINTS[style]}`,
  ).join("\n")
}

export const APP_SHOWCASE_STYLE = "app_showcase" as const

export function isAppShowcaseStyle(style: string | null | undefined): boolean {
  return style?.trim() === APP_SHOWCASE_STYLE
}

export function buildVideoStyleAutoSelectInstructions(): string {
  return `Automatically choose exactly ONE style from this allowed list based on the user's goal, platform, brand niche, and target audience:
${buildGeneratorVideoStylePromptList()}

Selection guide:
- viral_caption → education, tips, bold hooks, scroll-stopping text overlays
- problem_solution → pain point, frustration, objection, or before/after outcome
- premium_ad → luxury, trust, aspiration, cinematic brand ad
- saas_demo → software demo, dashboard, automation, coach business tool, ROI
- app_showcase → Zyntix Coach SaaS demo, platform features, coach business ROI, B2B marketing
- mascot_story → character-led story with the brand mascot as guide

Write the chosen style slug into the JSON "style" field.`
}
