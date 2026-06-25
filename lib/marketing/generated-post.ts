import { clampViralScore } from "@/lib/marketing/viral-score"

export const GENERATED_PLAN_POST_ANGLES = [
  "viral",
  "education",
  "authority",
  "sales",
] as const

export type GeneratedPlanPostAngle =
  (typeof GENERATED_PLAN_POST_ANGLES)[number]

export type GeneratedPlanPost = {
  title: string
  content: string
  hooks: string
  cta: string
  hashtags: string[]
  angle: GeneratedPlanPostAngle
}

const PLAN_POST_ANGLE_ALIASES: Record<string, GeneratedPlanPostAngle> = {
  viral: "viral",
  education: "education",
  educational: "education",
  authority: "authority",
  engagement: "authority",
  sales: "sales",
}

export function formatPlanPostHashtags(hashtags: string[]): string {
  return hashtags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .join(" ")
}

export function buildPlanPostCaption(post: GeneratedPlanPost): string {
  const parts = [post.content.trim(), post.cta.trim()].filter(Boolean)
  return parts.join("\n\n")
}

export function parseGeneratedPlanPostResponse(
  raw: string,
): GeneratedPlanPost | null {
  const trimmed = raw.trim()

  try {
    const parsed = JSON.parse(trimmed) as unknown
    return normalizeGeneratedPlanPost(parsed)
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    try {
      const parsed = JSON.parse(jsonMatch[0]) as unknown
      return normalizeGeneratedPlanPost(parsed)
    } catch {
      return null
    }
  }
}

function normalizeHashtags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((tag): tag is string => typeof tag === "string")
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  if (typeof value === "string") {
    return value
      .split(/[\s,]+/)
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  return []
}

function normalizePlanPostAngle(value: unknown): GeneratedPlanPostAngle | null {
  if (typeof value !== "string") return null
  return PLAN_POST_ANGLE_ALIASES[value.trim().toLowerCase()] ?? null
}

function normalizeGeneratedPlanPost(value: unknown): GeneratedPlanPost | null {
  if (typeof value !== "object" || value === null) return null

  const record = value as Record<string, unknown>
  const title = typeof record.title === "string" ? record.title.trim() : ""
  const content =
    typeof record.content === "string"
      ? record.content.trim()
      : typeof record.caption === "string"
        ? record.caption.trim()
        : ""
  const hooks =
    typeof record.hooks === "string"
      ? record.hooks.trim()
      : typeof record.hook === "string"
        ? record.hook.trim()
        : ""
  const cta = typeof record.cta === "string" ? record.cta.trim() : ""
  const hashtags = normalizeHashtags(record.hashtags)
  const angle = normalizePlanPostAngle(
    record.angle ?? record.content_type ?? record.type,
  )

  if (!title || !content || !hooks || !cta || hashtags.length === 0 || !angle) {
    return null
  }

  return {
    title,
    content,
    hooks,
    cta,
    hashtags,
    angle,
  }
}

export type GeneratedPost = {
  title: string
  content: string
  hashtags: string
  viral_score: number | null
  viral_reason: string
}

export function parseGeneratedPostResponse(raw: string): GeneratedPost | null {
  const trimmed = raw.trim()

  try {
    const parsed = JSON.parse(trimmed) as unknown
    return normalizeGeneratedPost(parsed)
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    try {
      const parsed = JSON.parse(jsonMatch[0]) as unknown
      return normalizeGeneratedPost(parsed)
    } catch {
      return null
    }
  }
}

function normalizeGeneratedPost(value: unknown): GeneratedPost | null {
  if (typeof value !== "object" || value === null) return null

  const record = value as Record<string, unknown>
  const title = typeof record.title === "string" ? record.title.trim() : ""
  const content =
    typeof record.content === "string"
      ? record.content.trim()
      : typeof record.caption === "string"
        ? record.caption.trim()
        : ""

  if (!title || !content) return null

  return {
    title,
    content,
    hashtags:
      typeof record.hashtags === "string" ? record.hashtags.trim() : "",
    viral_score: clampViralScore(record.viral_score ?? record.viralScore),
    viral_reason:
      typeof record.viral_reason === "string"
        ? record.viral_reason.trim()
        : typeof record.viral_score_reason === "string"
          ? record.viral_score_reason.trim()
          : "",
  }
}
