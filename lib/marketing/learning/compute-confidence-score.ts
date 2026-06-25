import type { LearningProfileView } from "@/lib/marketing/learning/fetch-learning-run-client"
import { LEARNING_MIN_POSTS } from "@/lib/marketing/learning/types"

export type ConfidenceTier = "low" | "medium" | "high"

export function computeLearningConfidenceScore(
  profile: LearningProfileView,
): number {
  let score = 42

  const postsBeyondMin = Math.max(0, profile.post_count - LEARNING_MIN_POSTS)
  score += Math.min(postsBeyondMin * 6 + 10, 28)

  if (profile.best_hook_patterns.length > 0) score += 10
  if (profile.best_cta_patterns.length > 0) score += 8
  if (profile.best_platform) score += 5
  if (profile.best_content_type) score += 5
  if (profile.total_views >= 1_000) score += 6
  else if (profile.total_views > 0) score += 3
  if (profile.repeated_weak_patterns.length > 0) score += 4
  if (profile.best_posting_time !== "Not enough data") score += 4

  return Math.max(40, Math.min(98, Math.round(score)))
}

export function getConfidenceTier(score: number): ConfidenceTier {
  if (score >= 85) return "high"
  if (score >= 70) return "medium"
  return "low"
}

export function confidenceTierLabel(tier: ConfidenceTier): string {
  if (tier === "high") return "High confidence"
  if (tier === "medium") return "Medium confidence"
  return "Building confidence"
}
