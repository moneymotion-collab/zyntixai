import { safeParse } from "@/lib/safe-parse-json"

export type ViralScoreTier = "high" | "good" | "weak"

export const VIRAL_SCORE_MARKDOWN_FORMAT = `For every post idea, ALWAYS include:

🔥 VIRAL SCORE: [0-100]

📈 VIRAL REASON:
One short sentence explaining the score.

You must never skip the viral score.
Every response must contain a viral score.`

export const VIRAL_SCORE_JSON_RULES = `${VIRAL_SCORE_MARKDOWN_FORMAT}

In JSON responses, map these to required fields on every idea:
- viral_score: integer 0–100 (required, never omit)
- viral_reason: one short sentence (required, never omit)

Scoring rubric (be strict):
- 90+ = highly viral potential
- 70–89 = good
- below 70 = weak`

export function hasRequiredViralScore(idea: {
  viral_score: number | null
  viral_reason: string
}): boolean {
  return idea.viral_score != null && idea.viral_reason.trim().length > 0
}

export function filterIdeasWithViralScore<
  T extends { viral_score: number | null; viral_reason: string },
>(ideas: T[]): T[] {
  return ideas.filter(hasRequiredViralScore)
}

export function formatViralScoreBlock(
  score: number,
  reason: string,
): string {
  return `🔥 VIRAL SCORE: ${score}\n\n📈 VIRAL REASON:\n${reason}`
}

export function getViralScoreTier(score: number): ViralScoreTier {
  if (score >= 80) return "high"
  if (score >= 60) return "good"
  return "weak"
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "🚀 High Potential"
  if (score >= 60) return "📈 Medium Potential"
  return "⚠️ Needs Improvement"
}

export function getViralScoreLabel(tier: ViralScoreTier): string {
  switch (tier) {
    case "high":
      return "High Potential"
    case "good":
      return "Medium Potential"
    case "weak":
      return "Needs Improvement"
  }
}

export function getViralScoreStyles(tier: ViralScoreTier): {
  badge: string
  text: string
} {
  switch (tier) {
    case "high":
      return {
        badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
        text: "text-emerald-700",
      }
    case "good":
      return {
        badge: "border-amber-200 bg-amber-50 text-amber-800",
        text: "text-amber-700",
      }
    case "weak":
      return {
        badge: "border-rose-200 bg-rose-50 text-rose-800",
        text: "text-rose-700",
      }
  }
}

export function parseViralFeedback(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return []

  const parsed = safeParse(raw)
  if (!Array.isArray(parsed)) return []

  return parsed
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
}

export function serializeViralFeedback(feedback: string[]): string {
  return JSON.stringify(
    feedback.map((item) => item.trim()).filter(Boolean),
  )
}

export function calculateScoreImprovement(
  predictedScore: number,
  currentScore: number | null | undefined,
): number {
  return predictedScore - (currentScore ?? 0)
}

export function clampViralScore(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    if (typeof value === "string" && value.trim()) {
      const parsed = Number.parseInt(value, 10)
      if (!Number.isNaN(parsed)) {
        return Math.min(100, Math.max(0, parsed))
      }
    }
    return null
  }

  return Math.min(100, Math.max(0, Math.round(value)))
}
