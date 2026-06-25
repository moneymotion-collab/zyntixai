import type { ViralScoreResultProps } from "@/components/marketing/ViralScoreResult"
import { buildViralScoreBreakdown } from "@/lib/marketing/viral-score-breakdown"
import { parseViralFeedback } from "@/lib/marketing/viral-score"

const DEMO_DIMENSION_DEFAULTS = {
  hookStrength: 88,
  retention: 76,
  engagement: 84,
  ctaClarity: 81,
} as const

function findDimensionScore(
  dimensions: ReturnType<typeof buildViralScoreBreakdown>["dimensions"],
  key: "hook" | "retention" | "engagement" | "cta",
  fallback: number,
): number {
  return dimensions.find((dimension) => dimension.key === key)?.score ?? fallback
}

export type ViralScoreSource = {
  score: number
  viral_reason?: string | null
  viral_feedback?: string | null
  title?: string
  caption?: string
}

export function mapViralScoreToResultProps(
  input: ViralScoreSource,
): ViralScoreResultProps & { feedback: string[] } {
  const clampedScore = Math.min(100, Math.max(0, Math.round(input.score)))
  const breakdown = buildViralScoreBreakdown({
    score: clampedScore,
    reason: input.viral_reason,
    viral_feedback: input.viral_feedback,
    title: input.title,
    caption: input.caption,
  })

  const feedback = parseViralFeedback(input.viral_feedback)
  const feedbackTips =
    feedback.length > 0 ? feedback : breakdown.improvements

  return {
    score: clampedScore,
    reason: input.viral_reason?.trim() || undefined,
    recommendation: breakdown.recommendation,
    hookStrength: findDimensionScore(
      breakdown.dimensions,
      "hook",
      DEMO_DIMENSION_DEFAULTS.hookStrength,
    ),
    retention: findDimensionScore(
      breakdown.dimensions,
      "retention",
      DEMO_DIMENSION_DEFAULTS.retention,
    ),
    engagement: findDimensionScore(
      breakdown.dimensions,
      "engagement",
      DEMO_DIMENSION_DEFAULTS.engagement,
    ),
    ctaClarity: findDimensionScore(
      breakdown.dimensions,
      "cta",
      DEMO_DIMENSION_DEFAULTS.ctaClarity,
    ),
    feedback: feedbackTips,
  }
}
