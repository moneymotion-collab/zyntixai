import type { MarketingAnalytics } from "@/lib/marketing/mock-analytics"

export type AnalyticsSummaryItem = {
  id: string
  label: string
  value: string
  detail: string | null
}

function formatCount(value: number): string {
  return value.toLocaleString()
}

export function getAnalyticsSummary(
  analytics: MarketingAnalytics,
): AnalyticsSummaryItem[] {
  const items: AnalyticsSummaryItem[] = [
    {
      id: "total-views",
      label: "Total views",
      value: formatCount(analytics.totalViews),
      detail: null,
    },
    {
      id: "total-likes",
      label: "Total likes",
      value: formatCount(analytics.totalLikes),
      detail: null,
    },
    {
      id: "total-comments",
      label: "Total comments",
      value: formatCount(analytics.totalComments),
      detail: null,
    },
    {
      id: "total-shares",
      label: "Total shares",
      value: formatCount(analytics.totalShares),
      detail: null,
    },
    {
      id: "total-saves",
      label: "Total saves",
      value: formatCount(analytics.totalSaves),
      detail: null,
    },
    {
      id: "engagement-rate",
      label: "Engagement rate",
      value: `${analytics.engagementRate}%`,
      detail: null,
    },
    {
      id: "best-post",
      label: "Best post",
      value: analytics.bestPost?.title ?? "—",
      detail: analytics.bestPost
        ? `${analytics.bestPost.engagement_rate}% engagement · ${analytics.bestPost.platform}`
        : null,
    },
    {
      id: "worst-post",
      label: "Worst post",
      value: analytics.worstPost?.title ?? "—",
      detail: analytics.worstPost
        ? `${analytics.worstPost.engagement_rate}% engagement · ${analytics.worstPost.platform}`
        : null,
    },
    {
      id: "best-platform",
      label: "Best platform",
      value: analytics.bestPlatform ?? "—",
      detail: analytics.bestPlatform
        ? "Highest average engagement"
        : null,
    },
  ]

  return items
}

/** @deprecated Use getAnalyticsSummary */
export type AnalyticsHighlight = AnalyticsSummaryItem

/** @deprecated Use getAnalyticsSummary */
export function getAnalyticsHighlights(
  analytics: MarketingAnalytics,
): AnalyticsSummaryItem[] {
  return getAnalyticsSummary(analytics)
}
