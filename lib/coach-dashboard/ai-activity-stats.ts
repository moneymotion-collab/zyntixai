export type AiActivityStats = {
  contentIdeas: number
  campaigns: number
  videos: number
  publishedPosts: number
}

export type RawAiActivityCounts = {
  contentIdeas: number
  campaigns: number
  videos: number
  publishedPosts: number
}

export const AI_ACTIVITY_FALLBACK: AiActivityStats = {
  contentIdeas: 24,
  campaigns: 5,
  videos: 3,
  publishedPosts: 8,
}

export function resolveAiActivityMetric(count: number, fallback: number): number {
  return count > 0 ? count : fallback
}

export function resolveAiActivityStats(counts: RawAiActivityCounts): AiActivityStats {
  return {
    contentIdeas: resolveAiActivityMetric(
      counts.contentIdeas,
      AI_ACTIVITY_FALLBACK.contentIdeas,
    ),
    campaigns: resolveAiActivityMetric(counts.campaigns, AI_ACTIVITY_FALLBACK.campaigns),
    videos: resolveAiActivityMetric(counts.videos, AI_ACTIVITY_FALLBACK.videos),
    publishedPosts: resolveAiActivityMetric(
      counts.publishedPosts,
      AI_ACTIVITY_FALLBACK.publishedPosts,
    ),
  }
}

export function defaultAiActivityStats(): AiActivityStats {
  return { ...AI_ACTIVITY_FALLBACK }
}
