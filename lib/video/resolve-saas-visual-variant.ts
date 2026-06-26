import {
  inferSceneModuleFromText,
  moduleToVisualVariant,
  normalizeSceneModule,
  resolveSceneModule,
} from "@/lib/video/resolve-scene-module"

export type SaasVisualVariant =
  | "problem"
  | "platform_overview"
  | "dashboard"
  | "members"
  | "workouts"
  | "nutrition"
  | "progress"
  | "sessions"
  | "marketing_ai"
  | "content_ideas"
  | "calendar"
  | "analytics"
  | "publishing"
  | "ai_coach"

const MARKETING_SUB_VARIANTS: Record<string, SaasVisualVariant> = {
  content_ideas: "content_ideas",
  calendar: "calendar",
  publishing: "publishing",
}

export function resolveSaasVisualVariant(input: {
  text?: string
  visual_description?: string
  sceneIndex?: number
  module?: string
  variant?: string
}): SaasVisualVariant {
  if (input.variant && isKnownVariant(input.variant)) {
    return input.variant
  }

  const module = resolveSceneModule(input)
  const baseVariant = moduleToVisualVariant(module)

  if (module === "marketing" && input.variant) {
    const sub = MARKETING_SUB_VARIANTS[input.variant]
    if (sub) return sub
  }

  const haystack = [input.text, input.visual_description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  if (module === "marketing") {
    if (/\b(calendar|scheduled|schedule)\b/.test(haystack)) return "calendar"
    if (/\b(publish|published|post live)\b/.test(haystack)) return "publishing"
    if (/\b(content ideas|brainstorm)\b/.test(haystack)) return "content_ideas"
  }

  return baseVariant
}

function isKnownVariant(value: string): value is SaasVisualVariant {
  return [
    "problem",
    "platform_overview",
    "dashboard",
    "members",
    "workouts",
    "nutrition",
    "progress",
    "sessions",
    "marketing_ai",
    "content_ideas",
    "calendar",
    "analytics",
    "publishing",
    "ai_coach",
  ].includes(value as SaasVisualVariant)
}

export const SAAS_VARIANT_LABELS: Record<SaasVisualVariant, string> = {
  problem: "The Problem",
  platform_overview: "Platform Overview",
  dashboard: "Dashboard",
  members: "Members",
  workouts: "Workouts",
  nutrition: "Nutrition",
  progress: "Progress Tracking",
  sessions: "Sessions",
  marketing_ai: "Marketing AI",
  content_ideas: "Content Ideas",
  calendar: "Content Calendar",
  analytics: "Analytics",
  publishing: "Publishing",
  ai_coach: "AI Coach",
}

export const SAAS_VARIANT_PATHS: Record<SaasVisualVariant, string> = {
  problem: "zyntixai.com",
  platform_overview: "app.zyntixai.com/dashboard",
  dashboard: "app.zyntixai.com/dashboard",
  members: "app.zyntixai.com/members",
  workouts: "app.zyntixai.com/workouts",
  nutrition: "app.zyntixai.com/nutrition",
  progress: "app.zyntixai.com/progress",
  sessions: "app.zyntixai.com/sessions",
  marketing_ai: "app.zyntixai.com/marketing",
  content_ideas: "app.zyntixai.com/marketing/content-ideas",
  calendar: "app.zyntixai.com/marketing/calendar",
  analytics: "app.zyntixai.com/analytics",
  publishing: "app.zyntixai.com/marketing/published",
  ai_coach: "app.zyntixai.com/ai-coach",
}

export {
  inferSceneModuleFromText,
  normalizeSceneModule,
  resolveSceneModule,
}
