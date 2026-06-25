import type { Database } from "@/lib/database.types"

export type ContentPerformanceRow =
  Database["public"]["Tables"]["content_performance"]["Row"]

export type ContentPerformanceWithRate = ContentPerformanceRow & {
  engagement_rate: number
  reach: number
  caption?: string | null
}

export type ContentPerformanceKpis = {
  totalReach: number
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  totalSaves: number
  followersGained: number
  averageEngagementRate: number
  totalPostsTracked: number
}

export type ContentPerformanceTimePoint = {
  label: string
  views: number
  engagement: number
}

export type PlatformPerformancePoint = {
  platform: string
  views: number
  engagement: number
  avgEngagementRate: number
  postCount: number
}

export type ContentPerformanceRecommendations = {
  bestContentType: string
  bestPlatform: string
  suggestedNextPost: string
  suggestedCta: string
  weeklyFocus: string
}

export type RuleBasedInsight = {
  id: string
  title: string
  message: string
  tone: "success" | "warning" | "danger"
}

export type WorstPostAdvice = {
  headline: string
  tips: string[]
}
