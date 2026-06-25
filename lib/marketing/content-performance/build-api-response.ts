import {
  buildContentPerformanceKpis,
  buildWorstPostAdvice,
  findBestPerformingPost,
  findWorstPerformingPost,
} from "@/lib/marketing/content-performance/analytics-engine"
import {
  buildEngagementOverTimeData,
  buildPlatformChartData,
  buildViewsOverTimeData,
} from "@/lib/marketing/content-performance/chart-data"
import { withEngagementRate } from "@/lib/marketing/content-performance/engagement"
import { buildContentPerformanceRecommendations } from "@/lib/marketing/content-performance/recommendations"
import { buildRuleBasedInsights } from "@/lib/marketing/content-performance/rule-insights"
import type {
  ContentPerformanceRecommendations,
  ContentPerformanceRow,
  ContentPerformanceTimePoint,
  ContentPerformanceWithRate,
  PlatformPerformancePoint,
  RuleBasedInsight,
  WorstPostAdvice,
} from "@/lib/marketing/content-performance/types"

export const EMPTY_ANALYTICS_MESSAGE =
  "No analytics yet. Publish content and sync Instagram metrics to start learning."

export type MarketingAnalyticsTotals = {
  totalReach: number
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  totalSaves: number
  followersGained: number
  totalPostsTracked: number
}

export type MarketingAnalyticsAverages = {
  engagementRate: number
  viewsPerPost: number
  likesPerPost: number
  commentsPerPost: number
  sharesPerPost: number
  savesPerPost: number
  followersPerPost: number
}

export type MarketingAnalyticsCharts = {
  engagementOverTime: ContentPerformanceTimePoint[]
  viewsOverTime: ContentPerformanceTimePoint[]
  platformPerformance: PlatformPerformancePoint[]
}

export type MarketingAnalyticsApiResponse = {
  success: true
  empty: boolean
  message: string | null
  rows: ContentPerformanceWithRate[]
  totals: MarketingAnalyticsTotals
  averages: MarketingAnalyticsAverages
  bestPost: ContentPerformanceWithRate | null
  worstPost: ContentPerformanceWithRate | null
  worstPostAdvice: WorstPostAdvice | null
  charts: MarketingAnalyticsCharts
  insights: RuleBasedInsight[]
  recommendations: ContentPerformanceRecommendations | null
}

function roundAverage(total: number, count: number): number {
  if (count <= 0) return 0
  return Math.round((total / count) * 10) / 10
}

function buildEmptyTotals(): MarketingAnalyticsTotals {
  return {
    totalReach: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    totalSaves: 0,
    followersGained: 0,
    totalPostsTracked: 0,
  }
}

function buildEmptyAverages(): MarketingAnalyticsAverages {
  return {
    engagementRate: 0,
    viewsPerPost: 0,
    likesPerPost: 0,
    commentsPerPost: 0,
    sharesPerPost: 0,
    savesPerPost: 0,
    followersPerPost: 0,
  }
}

function buildEmptyCharts(): MarketingAnalyticsCharts {
  return {
    engagementOverTime: [],
    viewsOverTime: [],
    platformPerformance: [],
  }
}

export function buildMarketingAnalyticsApiResponse(
  rows: ContentPerformanceRow[],
): MarketingAnalyticsApiResponse {
  if (rows.length === 0) {
    return {
      success: true,
      empty: true,
      message: EMPTY_ANALYTICS_MESSAGE,
      rows: [],
      totals: buildEmptyTotals(),
      averages: buildEmptyAverages(),
      bestPost: null,
      worstPost: null,
      worstPostAdvice: null,
      charts: buildEmptyCharts(),
      insights: [],
      recommendations: null,
    }
  }

  const ratedRows = rows.map(withEngagementRate)
  const kpis = buildContentPerformanceKpis(rows)
  const count = rows.length
  const bestPost = findBestPerformingPost(rows)
  const worstPost = findWorstPerformingPost(rows)

  return {
    success: true,
    empty: false,
    message: null,
    rows: ratedRows,
    totals: {
      totalReach: kpis.totalReach,
      totalViews: kpis.totalViews,
      totalLikes: kpis.totalLikes,
      totalComments: kpis.totalComments,
      totalShares: kpis.totalShares,
      totalSaves: kpis.totalSaves,
      followersGained: kpis.followersGained,
      totalPostsTracked: kpis.totalPostsTracked,
    },
    averages: {
      engagementRate: kpis.averageEngagementRate,
      viewsPerPost: roundAverage(kpis.totalViews, count),
      likesPerPost: roundAverage(kpis.totalLikes, count),
      commentsPerPost: roundAverage(kpis.totalComments, count),
      sharesPerPost: roundAverage(kpis.totalShares, count),
      savesPerPost: roundAverage(kpis.totalSaves, count),
      followersPerPost: roundAverage(kpis.followersGained, count),
    },
    bestPost,
    worstPost,
    worstPostAdvice: worstPost ? buildWorstPostAdvice(worstPost) : null,
    charts: {
      engagementOverTime: buildEngagementOverTimeData(rows),
      viewsOverTime: buildViewsOverTimeData(rows),
      platformPerformance: buildPlatformChartData(rows),
    },
    insights: buildRuleBasedInsights(rows),
    recommendations: buildContentPerformanceRecommendations(rows),
  }
}
