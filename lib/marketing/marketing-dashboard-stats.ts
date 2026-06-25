import { aggregateContentPerformance } from "@/lib/marketing/aggregate-content-performance"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"
import type { PerformanceInsights } from "@/lib/marketing/performance-insights-types"

export type MarketingDashboardStats = {
  totalPosts: number
  generatedPosts: number
  publishedPosts: number
  avgViralScore: number | null
  engagementRate: number
}

export function computeMarketingDashboardStats(
  posts: MarketingPost[],
  analyticsRows: AnalyticsRowWithPost[],
): MarketingDashboardStats {
  const scored = posts.filter((post) => post.viral_score != null)
  const publishedPosts = posts.filter((post) => post.status === "published").length

  const avgViralScore =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, post) => sum + (post.viral_score ?? 0), 0) /
            scored.length,
        )
      : null

  const engagementRate =
    analyticsRows.length > 0
      ? aggregateContentPerformance(analyticsRows).engagementRate
      : 0

  return {
    totalPosts: posts.length,
    generatedPosts: posts.length,
    publishedPosts,
    avgViralScore,
    engagementRate,
  }
}

export function getRecentPosts(
  posts: MarketingPost[],
  limit = 5,
): MarketingPost[] {
  return [...posts]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    .slice(0, limit)
}

export function getScheduledPosts(
  posts: MarketingPost[],
  limit = 5,
): MarketingPost[] {
  return [...posts]
    .filter((post) => post.status === "scheduled")
    .sort((a, b) => {
      const aTime = a.scheduled_at ? new Date(a.scheduled_at).getTime() : 0
      const bTime = b.scheduled_at ? new Date(b.scheduled_at).getTime() : 0
      return aTime - bTime
    })
    .slice(0, limit)
}

export function getTopHooks(
  posts: MarketingPost[],
  insights: PerformanceInsights,
): string[] {
  if (insights.best_hooks.length > 0) {
    return insights.best_hooks
  }

  return [...posts]
    .filter((post) => post.title?.trim())
    .sort((a, b) => (b.viral_score ?? 0) - (a.viral_score ?? 0))
    .slice(0, 3)
    .map((post) => {
      const title = post.title.trim()
      return title.endsWith("...") ? title : `${title}...`
    })
}

export function getTopContentTypes(
  posts: MarketingPost[],
  analyticsRows: AnalyticsRowWithPost[],
  insights: PerformanceInsights,
): string[] {
  if (analyticsRows.length > 0) {
    const categories = aggregateContentPerformance(analyticsRows).categoryEngagement

    return categories.slice(0, 3).map((item, index) => {
      if (index === 0 && insights.content_type_lift_pct) {
        return `${item.category} (${insights.content_type_lift_pct}% higher engagement)`
      }

      return `${item.category} (${item.engagementRate}% engagement)`
    })
  }

  const types = new Set<string>()

  if (insights.best_content_type) {
    types.add(
      insights.content_type_lift_pct
        ? `${insights.best_content_type} (${insights.content_type_lift_pct}% higher engagement)`
        : insights.best_content_type,
    )
  }

  if (
    insights.worst_content_type &&
    insights.worst_content_type !== insights.best_content_type
  ) {
    types.add(insights.worst_content_type)
  }

  if (types.size > 0) {
    return [...types]
  }

  const categoryCounts = new Map<string, number>()

  for (const post of posts) {
    const category = post.category?.trim()
    if (!category) continue
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
  }

  return [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category)
}
