import {
  findBestPost,
  findWorstPost,
  getAnalyticsTitle,
} from "@/lib/marketing/aggregate-content-performance"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import { LEARNING_MIN_POSTS } from "@/lib/marketing/learning/types"

export const RECOMMENDATION_MIN_POSTS = LEARNING_MIN_POSTS

export type RecommendationDataTier = "none" | "best-post" | "compare" | "full"

export type RecommendationPostRef = {
  title: string
  engagementRate: number
}

export type RecommendationDataSnapshot = {
  rowCount: number
  totalViews: number
  totalEngagement: number
  hasEnoughData: boolean
  tier: RecommendationDataTier
  bestPost: RecommendationPostRef | null
  worstPost: RecommendationPostRef | null
}

export function getRowEngagement(row: AnalyticsRowWithPost): number {
  return row.likes + row.comments + row.shares + row.saves
}

export function getRecommendationDataTier(
  rowCount: number,
  hasEnoughData: boolean,
): RecommendationDataTier {
  if (!hasEnoughData) return "none"
  if (rowCount >= 3) return "full"
  if (rowCount >= 2) return "compare"
  return "best-post"
}

export function buildRecommendationDataSnapshot(
  rows: AnalyticsRowWithPost[],
): RecommendationDataSnapshot {
  const rowCount = rows.length
  const totalViews = rows.reduce((sum, row) => sum + row.views, 0)
  const totalEngagement = rows.reduce(
    (sum, row) => sum + getRowEngagement(row),
    0,
  )
  const hasEnoughData =
    rowCount >= RECOMMENDATION_MIN_POSTS && totalViews > 0
  const tier = getRecommendationDataTier(rowCount, hasEnoughData)

  const bestRow = findBestPost(hasEnoughData ? rows : [])
  const worstRow =
    tier === "compare" || tier === "full" ? findWorstPost(rows) : null

  return {
    rowCount,
    totalViews,
    totalEngagement,
    hasEnoughData,
    tier,
    bestPost: bestRow
      ? {
          title: getAnalyticsTitle(bestRow),
          engagementRate: bestRow.engagement_rate,
        }
      : null,
    worstPost: worstRow
      ? {
          title: getAnalyticsTitle(worstRow),
          engagementRate: worstRow.engagement_rate,
        }
      : null,
  }
}

export function logRecommendationDataMetrics(
  source: string,
  snapshot: RecommendationDataSnapshot,
): void {
  if (process.env.NODE_ENV === "production") return

  console.log(`[marketing-recommendations:${source}]`, {
    analyticsRowCount: snapshot.rowCount,
    totalViews: snapshot.totalViews,
    totalEngagement: snapshot.totalEngagement,
    bestPost: snapshot.bestPost,
    worstPost: snapshot.worstPost,
  })
}
