import { LEARNING_MIN_POSTS } from "@/lib/marketing/learning/types"

export type RecommendationReadinessState =
  | "not_enough_data"
  | "learning"
  | "ready"

export type RecommendationReadiness = {
  state: RecommendationReadinessState
  postCount: number
  minPosts: number
  totalViews: number
  hasRecommendations: boolean
  message: string
  progressPercent: number
}

export function resolveRecommendationReadiness(input: {
  postCount: number
  totalViews: number
  hasRecommendations?: boolean
}): RecommendationReadiness {
  const { postCount, totalViews, hasRecommendations = false } = input
  const minPosts = LEARNING_MIN_POSTS
  const progressPercent = Math.min(
    100,
    Math.round((postCount / minPosts) * 100),
  )

  if (postCount === 0) {
    return {
      state: "not_enough_data",
      postCount,
      minPosts,
      totalViews,
      hasRecommendations,
      progressPercent: 0,
      message:
        "Publish your first post and sync analytics to start building recommendations.",
    }
  }

  if (totalViews <= 0) {
    return {
      state: "not_enough_data",
      postCount,
      minPosts,
      totalViews,
      hasRecommendations,
      progressPercent,
      message:
        "Performance rows exist but have no views yet. Sync Instagram analytics after publishing.",
    }
  }

  if (postCount < minPosts) {
    const remaining = minPosts - postCount
    return {
      state: "learning",
      postCount,
      minPosts,
      totalViews,
      hasRecommendations,
      progressPercent,
      message: `Learning from your posts (${postCount}/${minPosts}). ${remaining} more tracked post${remaining === 1 ? "" : "s"} unlock personalized recommendations.`,
    }
  }

  return {
    state: "ready",
    postCount,
    minPosts,
    totalViews,
    hasRecommendations,
    progressPercent: 100,
    message: hasRecommendations
      ? "Recommendations are ready based on your latest content performance."
      : "Enough data collected. Generate recommendations to see your next actions.",
  }
}
