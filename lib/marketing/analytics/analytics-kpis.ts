import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import { withEngagementRate } from "@/lib/marketing/aggregate-content-performance"
import { mockAnalyticsRows } from "@/lib/marketing/mock-analytics"

export type AnalyticsKpiTrend = {
  label: string
  positive: boolean
}

export type AnalyticsKpis = {
  totalReach: number
  totalViews: number
  totalLikes: number
  engagementRate: number
  followerGrowth: number
  followerGrowthLabel: string
  reachTrend: AnalyticsKpiTrend
  viewsTrend: AnalyticsKpiTrend
  likesTrend: AnalyticsKpiTrend
  engagementTrend: AnalyticsKpiTrend
  followerTrend: AnalyticsKpiTrend
}

/** Unique-reach estimate when only views/shares/saves are stored per post. */
export function estimateRowReach(row: AnalyticsRowWithPost): number {
  const amplified = row.shares * 2.8 + row.saves * 1.6
  return Math.round(row.views * 0.78 + amplified)
}

function buildNeutralTrend(): AnalyticsKpiTrend {
  return { label: "—", positive: true }
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

export function buildAnalyticsKpis(rows: AnalyticsRowWithPost[]): AnalyticsKpis {
  const totalReach = rows.reduce((sum, row) => sum + estimateRowReach(row), 0)
  const totalViews = rows.reduce((sum, row) => sum + row.views, 0)
  const totalLikes = rows.reduce((sum, row) => sum + row.likes, 0)
  const totalComments = rows.reduce((sum, row) => sum + row.comments, 0)
  const totalShares = rows.reduce((sum, row) => sum + row.shares, 0)
  const totalSaves = rows.reduce((sum, row) => sum + row.saves, 0)

  const engagementRate =
    totalViews > 0
      ? Math.round(((totalLikes + totalComments) / totalViews) * 1000) / 10
      : 0

  const followerGrowth = Math.max(
    Math.round(totalShares * 0.42 + totalSaves * 0.28 + totalComments * 0.15),
    0,
  )

  const hasData = rows.length > 0
  const neutralTrend = buildNeutralTrend()

  return {
    totalReach,
    totalViews,
    totalLikes,
    engagementRate,
    followerGrowth,
    followerGrowthLabel: hasData
      ? "Estimated from shares, saves, and comments"
      : "No synced metrics yet",
    reachTrend: neutralTrend,
    viewsTrend: neutralTrend,
    likesTrend: neutralTrend,
    engagementTrend: neutralTrend,
    followerTrend: neutralTrend,
  }
}

export function getDemoAnalyticsKpis(): AnalyticsKpis {
  return buildAnalyticsKpis(mockAnalyticsRows)
}

export type { TimeSeriesChartPoint as EngagementChartPoint } from "@/lib/marketing/analytics/analytics-chart-data"
export {
  buildEngagementChartSeries,
  buildTimeSeriesChartData,
} from "@/lib/marketing/analytics/analytics-chart-data"
