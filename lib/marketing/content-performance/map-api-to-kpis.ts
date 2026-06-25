import type {
  MarketingAnalyticsAverages,
  MarketingAnalyticsTotals,
} from "@/lib/marketing/content-performance/build-api-response"
import type { ContentPerformanceKpis } from "@/lib/marketing/content-performance/types"

export function mapTotalsToKpis(
  totals: MarketingAnalyticsTotals,
  averages: MarketingAnalyticsAverages,
): ContentPerformanceKpis {
  return {
    totalReach: totals.totalReach,
    totalViews: totals.totalViews,
    totalLikes: totals.totalLikes,
    totalComments: totals.totalComments,
    totalShares: totals.totalShares,
    totalSaves: totals.totalSaves,
    followersGained: totals.followersGained,
    averageEngagementRate: averages.engagementRate,
    totalPostsTracked: totals.totalPostsTracked,
  }
}
