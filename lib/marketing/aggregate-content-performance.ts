import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import {
  normalizeContentCategory,
  type ContentCategory,
} from "@/lib/marketing/content-categories"
import {
  HIGH_ENGAGEMENT_THRESHOLD,
  type CategoryEngagement,
  type MarketingAnalytics,
} from "@/lib/marketing/mock-analytics"

/** @deprecated Legacy alias — Marketing AI reads content_performance. */
export type AnalyticsRow = AnalyticsRowWithPost

/** @deprecated Use AnalyticsRow */
export type ContentPerformanceRow = AnalyticsRowWithPost

export type AnalyticsWithRate = AnalyticsRowWithPost & {
  engagement_rate: number
  title: string
}

/** @deprecated Use AnalyticsWithRate */
export type ContentPerformanceWithRate = AnalyticsWithRate

export type { CategoryEngagement } from "@/lib/marketing/mock-analytics"

export function getAnalyticsTitle(row: AnalyticsRowWithPost): string {
  const title = row.content_posts?.title?.trim()
  if (title) return title
  if (row.platform.trim()) return row.platform
  return "Untitled post"
}

export function getRowEngagementRate(row: AnalyticsRowWithPost): number {
  if (row.views <= 0) return 0
  return Math.round(((row.likes + row.comments) / row.views) * 1000) / 10
}

export function withEngagementRate(
  row: AnalyticsRowWithPost,
): AnalyticsWithRate {
  return {
    ...row,
    title: getAnalyticsTitle(row),
    engagement_rate: getRowEngagementRate(row),
  }
}

export function findBestPost(
  data: AnalyticsRowWithPost[] | null | undefined,
): AnalyticsWithRate | null {
  if (!data?.length) return null

  const bestPost = [...data]
    .map(withEngagementRate)
    .sort((a, b) => b.engagement_rate - a.engagement_rate)[0]

  return bestPost ?? null
}

export function findWorstPost(
  data: AnalyticsRowWithPost[] | null | undefined,
): AnalyticsWithRate | null {
  if (!data?.length) return null

  const worstPost = [...data]
    .map(withEngagementRate)
    .sort((a, b) => a.engagement_rate - b.engagement_rate)[0]

  return worstPost ?? null
}

export function findBestPlatform(
  data: AnalyticsRowWithPost[] | null | undefined,
): string | null {
  if (!data?.length) return null

  const platformStats = new Map<string, { engagementSum: number; count: number }>()

  for (const row of data.map(withEngagementRate)) {
    const platform = row.platform.trim()
    if (!platform) continue

    const current = platformStats.get(platform) ?? {
      engagementSum: 0,
      count: 0,
    }

    platformStats.set(platform, {
      engagementSum: current.engagementSum + row.engagement_rate,
      count: current.count + 1,
    })
  }

  let bestPlatform: string | null = null
  let bestAvg = -1

  for (const [platform, stats] of platformStats) {
    const avg = stats.engagementSum / stats.count
    if (avg > bestAvg) {
      bestAvg = avg
      bestPlatform = platform
    }
  }

  return bestPlatform
}

export function findHighestReachPlatform(
  data: AnalyticsRowWithPost[] | null | undefined,
): string | null {
  if (!data?.length) return null

  const platformViews = new Map<string, number>()

  for (const row of data) {
    const platform = row.platform.trim()
    if (!platform) continue

    platformViews.set(platform, (platformViews.get(platform) ?? 0) + row.views)
  }

  let highestReachPlatform: string | null = null
  let highestViews = -1

  for (const [platform, views] of platformViews) {
    if (views > highestViews) {
      highestViews = views
      highestReachPlatform = platform
    }
  }

  return highestReachPlatform
}

export function aggregateEngagementByCategory(
  data: AnalyticsRowWithPost[] | null | undefined,
): CategoryEngagement[] {
  if (!data?.length) return []

  const categoryStats = new Map<
    ContentCategory,
    { engagementSum: number; count: number }
  >()

  for (const row of data.map(withEngagementRate)) {
    const rawCategory = row.content_posts?.category
    const category = rawCategory
      ? normalizeContentCategory(rawCategory)
      : null
    if (!category) continue

    const current = categoryStats.get(category) ?? {
      engagementSum: 0,
      count: 0,
    }

    categoryStats.set(category, {
      engagementSum: current.engagementSum + row.engagement_rate,
      count: current.count + 1,
    })
  }

  return [...categoryStats.entries()]
    .map(([category, stats]) => ({
      category,
      engagementRate:
        Math.round((stats.engagementSum / stats.count) * 10) / 10,
      postCount: stats.count,
    }))
    .sort((a, b) => b.engagementRate - a.engagementRate)
}

export function aggregateContentPerformance(
  data: AnalyticsRowWithPost[] | null | undefined,
): MarketingAnalytics {
  const totalViews =
    data?.reduce((sum, row) => sum + row.views, 0) ?? 0

  const totalLikes =
    data?.reduce((sum, row) => sum + row.likes, 0) ?? 0

  const totalComments =
    data?.reduce((sum, row) => sum + row.comments, 0) ?? 0

  const totalShares =
    data?.reduce((sum, row) => sum + row.shares, 0) ?? 0

  const totalSaves =
    data?.reduce((sum, row) => sum + row.saves, 0) ?? 0

  const engagementRate =
    totalViews > 0
      ? Math.round(((totalLikes + totalComments) / totalViews) * 1000) / 10
      : 0

  const ratedRows = data?.map(withEngagementRate) ?? []
  const avgEngagement =
    ratedRows.length > 0
      ? Math.round(
          (ratedRows.reduce((sum, row) => sum + row.engagement_rate, 0) /
            ratedRows.length) *
            10,
        ) / 10
      : 0

  return {
    totalViews,
    totalLikes,
    totalComments,
    totalShares,
    totalSaves,
    engagementRate,
    avgEngagement,
    bestPlatform: findBestPlatform(data),
    highestReachPlatform: findHighestReachPlatform(data),
    bestPost: findBestPost(data),
    worstPost: findWorstPost(data),
    categoryEngagement: aggregateEngagementByCategory(data),
  }
}

export function isHighEngagement(avgEngagement: number): boolean {
  return avgEngagement > HIGH_ENGAGEMENT_THRESHOLD
}

export function isLowEngagement(avgEngagement: number): boolean {
  return avgEngagement > 0 && avgEngagement <= HIGH_ENGAGEMENT_THRESHOLD
}

export function hasMoreSharesThanComments(
  shares: number,
  comments: number,
): boolean {
  return shares > comments
}
