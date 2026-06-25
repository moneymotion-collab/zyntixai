import {
  estimateContentPerformanceReach,
  getContentPerformanceEngagementRate,
  getRowEngagementTotal,
  withEngagementRate,
} from "@/lib/marketing/content-performance/engagement"
import type {
  ContentPerformanceKpis,
  ContentPerformanceRow,
  ContentPerformanceWithRate,
  WorstPostAdvice,
} from "@/lib/marketing/content-performance/types"

export function buildContentPerformanceKpis(
  rows: ContentPerformanceRow[],
): ContentPerformanceKpis {
  const rated = rows.map(withEngagementRate)

  const totalViews = rows.reduce((sum, row) => sum + row.views, 0)
  const totalReach = rows.reduce(
    (sum, row) => sum + estimateContentPerformanceReach(row),
    0,
  )
  const totalLikes = rows.reduce((sum, row) => sum + row.likes, 0)
  const totalComments = rows.reduce((sum, row) => sum + row.comments, 0)
  const totalShares = rows.reduce((sum, row) => sum + row.shares, 0)
  const totalSaves = rows.reduce((sum, row) => sum + (row.saves ?? 0), 0)
  const followersGained = rows.reduce(
    (sum, row) => sum + (row.followers_gained ?? 0),
    0,
  )

  const averageEngagementRate =
    rated.length > 0
      ? Math.round(
          (rated.reduce((sum, row) => sum + row.engagement_rate, 0) /
            rated.length) *
            10,
        ) / 10
      : 0

  return {
    totalReach,
    totalViews,
    totalLikes,
    totalComments,
    totalShares,
    totalSaves,
    followersGained,
    averageEngagementRate,
    totalPostsTracked: rows.length,
  }
}

export function findBestPerformingPost(
  rows: ContentPerformanceRow[],
): ContentPerformanceWithRate | null {
  if (rows.length === 0) return null

  return [...rows]
    .map(withEngagementRate)
    .sort((a, b) => b.engagement_rate - a.engagement_rate)[0]
}

export function findWorstPerformingPost(
  rows: ContentPerformanceRow[],
): ContentPerformanceWithRate | null {
  if (rows.length === 0) return null

  return [...rows]
    .map(withEngagementRate)
    .sort((a, b) => a.engagement_rate - b.engagement_rate)[0]
}

export function buildWorstPostAdvice(
  post: ContentPerformanceWithRate,
): WorstPostAdvice {
  const rate = post.engagement_rate

  if (rate < 3) {
    return {
      headline: "This post needs a stronger opening and clearer value.",
      tips: [
        "Rewrite the first line as a bold hook that calls out a specific problem.",
        "Add on-screen text or a carousel slide that states the payoff in 5 words.",
        "End with one direct CTA — save, comment, or DM — instead of multiple asks.",
      ],
    }
  }

  if (rate < 7) {
    return {
      headline: "Solid baseline — small tweaks can lift engagement.",
      tips: [
        "Test a question in the caption to drive more comments.",
        "Move the strongest visual to the first 2 seconds or first slide.",
        "Mirror the structure of your top-performing post on the same platform.",
      ],
    }
  }

  return {
    headline: "Still your lowest performer — refine format, not topic.",
    tips: [
      "Republish the idea in your best content format this week.",
      "Compare hooks side-by-side with your top post and adopt the stronger pattern.",
      "Post at peak hours for this platform to give the content a fair test.",
    ],
  }
}

export function getUniquePlatforms(rows: ContentPerformanceRow[]): string[] {
  return [
    ...new Set(
      rows
        .map((row) => row.platform.trim())
        .filter((platform) => platform.length > 0),
    ),
  ]
}

export function buildPlatformPerformance(
  rows: ContentPerformanceRow[],
): Array<{
  platform: string
  views: number
  engagement: number
  avgEngagementRate: number
  postCount: number
}> {
  const stats = new Map<
    string,
    { views: number; engagement: number; rateSum: number; count: number }
  >()

  for (const row of rows) {
    const platform = row.platform.trim() || "Unknown"
    const current = stats.get(platform) ?? {
      views: 0,
      engagement: 0,
      rateSum: 0,
      count: 0,
    }

    stats.set(platform, {
      views: current.views + row.views,
      engagement: current.engagement + getRowEngagementTotal(row),
      rateSum: current.rateSum + getContentPerformanceEngagementRate(row),
      count: current.count + 1,
    })
  }

  return [...stats.entries()]
    .map(([platform, data]) => ({
      platform,
      views: data.views,
      engagement: data.engagement,
      avgEngagementRate:
        Math.round((data.rateSum / data.count) * 10) / 10,
      postCount: data.count,
    }))
    .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)
}

export function getBestContentType(rows: ContentPerformanceRow[]): string | null {
  const stats = new Map<string, { rateSum: number; count: number }>()

  for (const row of rows) {
    const type = row.content_type?.trim() || "General"
    const current = stats.get(type) ?? { rateSum: 0, count: 0 }
    stats.set(type, {
      rateSum: current.rateSum + getContentPerformanceEngagementRate(row),
      count: current.count + 1,
    })
  }

  let best: string | null = null
  let bestAvg = -1

  for (const [type, data] of stats) {
    const avg = data.rateSum / data.count
    if (avg > bestAvg) {
      bestAvg = avg
      best = type
    }
  }

  return best
}

export function formatAnalyticsCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 10_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return value.toLocaleString()
}
