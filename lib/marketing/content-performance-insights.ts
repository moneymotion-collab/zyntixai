import { withEngagementRate } from "@/lib/marketing/aggregate-content-performance"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import type { ContentCategory } from "@/lib/marketing/content-categories"
import type { CategoryEngagement } from "@/lib/marketing/mock-analytics"

export type CategoryInsights = {
  bestCategory: ContentCategory
  worstCategory: ContentCategory
  recommendation: string
}

export function getCategoryInsights(
  categoryEngagement: CategoryEngagement[],
): CategoryInsights | null {
  if (categoryEngagement.length < 2) return null

  const bestCategory = categoryEngagement[0].category
  const worstCategory =
    categoryEngagement[categoryEngagement.length - 1].category

  if (bestCategory === worstCategory) return null

  return {
    bestCategory,
    worstCategory,
    recommendation: `Increase ${bestCategory.toLowerCase()} content.`,
  }
}

function averageEngagementByCategory(
  rows: AnalyticsRowWithPost[],
  category: ContentCategory,
): number | null {
  const typedRows = rows
    .filter((row) => row.content_posts?.category === category)
    .map(withEngagementRate)

  if (typedRows.length === 0) return null

  return (
    typedRows.reduce((sum, row) => sum + row.engagement_rate, 0) /
    typedRows.length
  )
}

function averageSharesByCategory(
  rows: AnalyticsRowWithPost[],
  category: ContentCategory,
): number | null {
  const typedRows = rows.filter(
    (row) => row.content_posts?.category === category,
  )

  if (typedRows.length === 0) return null

  return (
    typedRows.reduce((sum, row) => sum + row.shares, 0) / typedRows.length
  )
}

export function educationalOutperformsPromotional(
  rows: AnalyticsRowWithPost[],
): boolean {
  const educationalAvg = averageEngagementByCategory(rows, "Educational")
  const promotionalAvg = averageEngagementByCategory(rows, "Promotion")

  if (educationalAvg === null || promotionalAvg === null) return false

  return educationalAvg > promotionalAvg
}

export function educationalSharedMoreOften(
  rows: AnalyticsRowWithPost[],
): boolean {
  const educationalAvg = averageSharesByCategory(rows, "Educational")
  const promotionalAvg = averageSharesByCategory(rows, "Promotion")

  if (educationalAvg === null || promotionalAvg === null) return false

  return educationalAvg > promotionalAvg
}

export function suggestsEveningPostingWindow(
  rows: AnalyticsRowWithPost[],
): boolean {
  const ratedRows = rows.map(withEngagementRate)
  if (ratedRows.length === 0) return false

  const topPosts = [...ratedRows]
    .sort((a, b) => b.engagement_rate - a.engagement_rate)
    .slice(0, Math.min(2, ratedRows.length))

  return topPosts.every((row) => {
    const hour = new Date(row.created_at).getHours()
    return hour >= 18 && hour <= 20
  })
}
