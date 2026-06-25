import type {
  LearningHookPattern,
  LearningCtaPattern,
  LearningInsight,
  LearningNextAction,
  LearningPostSummary,
  LearningRecommendation,
  LearningWeakPattern,
  AiLearningProfileSummary,
} from "@/lib/marketing/learning/types"

export type LearningProfileView = {
  id: string | null
  run_id: string
  post_count: number
  average_engagement_rate: number
  best_platform: string | null
  best_content_type: string | null
  best_posting_time: string
  best_performing_posts: LearningPostSummary[]
  worst_performing_posts: LearningPostSummary[]
  best_hook_patterns: LearningHookPattern[]
  best_cta_patterns: LearningCtaPattern[]
  repeated_weak_patterns: LearningWeakPattern[]
  total_views: number
  total_engagement: number
  ai_summary: AiLearningProfileSummary
  created_at: string | null
}

export type LearningRunApiResponse = {
  message?: string
  learning_profile: LearningProfileView | null
  insights: LearningInsight[]
  recommendations: LearningRecommendation[]
  next_actions: LearningNextAction[]
}

export async function runLearningEngineClient(): Promise<LearningRunApiResponse> {
  const res = await fetch("/api/marketing/learning/run", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  })

  const data = (await res.json()) as LearningRunApiResponse | { error?: string }

  if (!res.ok) {
    const message =
      "error" in data && typeof data.error === "string"
        ? data.error
        : "Could not run the learning engine."
    throw new Error(message)
  }

  return data as LearningRunApiResponse
}
