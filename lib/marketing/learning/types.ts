import type { Database } from "@/lib/database.types"
import type { ContentPerformanceRow } from "@/lib/marketing/content-performance/types"

export const LEARNING_MIN_POSTS = 5

export type LearningContentPostEmbed = Pick<
  Database["public"]["Tables"]["content_posts"]["Row"],
  | "title"
  | "caption"
  | "content_type"
  | "topic"
  | "category"
  | "platform"
  | "published_at"
  | "scheduled_at"
  | "viral_score"
>

export type LearningScheduledPostEmbed = Pick<
  Database["public"]["Tables"]["scheduled_posts"]["Row"],
  "id" | "hook" | "content" | "scheduled_date" | "published_at" | "platform"
>

export type LearningPerformanceRow = ContentPerformanceRow & {
  content_posts: LearningContentPostEmbed | null
  scheduled_post: LearningScheduledPostEmbed | null
}

export type LearningPostSummary = {
  postId: string | null
  title: string
  hook: string
  platform: string
  contentType: string
  views: number
  engagement: number
  engagementRate: number
}

export type LearningHookPattern = {
  hook: string
  avgEngagementRate: number
  postCount: number
}

export type LearningCtaPattern = {
  pattern: string
  avgEngagementRate: number
  postCount: number
}

export type LearningWeakPattern = {
  pattern: string
  category: "hook" | "cta" | "content_type" | "platform"
  occurrences: number
  avgEngagementRate: number
}

export type AiLearningProfileSummary = {
  bestContentType: string
  bestHookStyle: string
  bestCta: string
  bestPostingTime: string
  recommendation: string
}

export type LearningProfile = {
  runId: string
  postCount: number
  averageEngagementRate: number
  bestPlatform: string | null
  bestContentType: string | null
  bestPostingTime: string
  bestPerformingPosts: LearningPostSummary[]
  worstPerformingPosts: LearningPostSummary[]
  bestHookPatterns: LearningHookPattern[]
  bestCtaPatterns: LearningCtaPattern[]
  repeatedWeakPatterns: LearningWeakPattern[]
  totalViews: number
  totalEngagement: number
  aiSummary: AiLearningProfileSummary
}

export type LearningInsight = {
  insight_key: string
  category: string
  title: string
  message: string
  priority: number
  metrics: Record<string, string | number | null>
  patterns: Record<string, string | number | null>
}

export type LearningRecommendation = {
  key: string
  title: string
  message: string
  insight: string
  whyItMatters: string
  action: string
  triggerPostId?: string | null
  triggerPostTitle?: string | null
  category: string
  priority: number
}

export type LearningNextAction = {
  action: string
  priority: number
  category: string
}

export type LearningRunResult = {
  learning_profile: LearningProfile | null
  insights: LearningInsight[]
  recommendations: LearningRecommendation[]
  next_actions: LearningNextAction[]
  message?: string
}

export type StoredLearningProfile =
  Database["public"]["Tables"]["marketing_learning_profiles"]["Row"]

export type StoredLearningInsight =
  Database["public"]["Tables"]["marketing_learning_insights"]["Row"]
