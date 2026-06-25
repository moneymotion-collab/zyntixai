import {
  aggregateContentPerformance,
  withEngagementRate,
} from "@/lib/marketing/aggregate-content-performance"
import {
  educationalOutperformsPromotional,
  educationalSharedMoreOften,
} from "@/lib/marketing/content-performance-insights"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import type { PerformanceInsightsPayload } from "@/lib/marketing/performance-insights-types"

function padHour(hour: number): string {
  return hour.toString().padStart(2, "0")
}

export function formatBestTimeShort(bestTime: string): string {
  if (!bestTime || bestTime === "Not enough data") return bestTime

  const match = bestTime.match(/^(\d{2}:\d{2})/)
  return match ? match[1] : bestTime
}

function extractBestHooks(rows: AnalyticsRowWithPost[]): string[] {
  const topPosts = [...rows]
    .map(withEngagementRate)
    .filter((row) => row.views > 0)
    .sort((a, b) => b.engagement_rate - a.engagement_rate)
    .slice(0, 3)

  return topPosts
    .map((row) => {
      const title = row.content_posts?.title?.trim() ?? ""
      if (!title) return ""
      return title.endsWith("...") ? title : `${title}...`
    })
    .filter(Boolean)
}

function computeContentTypeLiftPct(
  categories: ReturnType<
    typeof aggregateContentPerformance
  >["categoryEngagement"],
): number | null {
  if (categories.length < 2) return null

  const best = categories[0].engagementRate
  const worst = categories[categories.length - 1].engagementRate

  if (worst <= 0 || best <= worst) return null

  return Math.round(((best - worst) / worst) * 100)
}

export function findBestPostingTime(
  rows: AnalyticsRowWithPost[],
): string {
  if (rows.length === 0) return "Not enough data"

  const hourBuckets = new Map<number, { engagementSum: number; count: number }>()

  for (const row of rows.map(withEngagementRate)) {
    const hour = new Date(row.created_at).getHours()
    const current = hourBuckets.get(hour) ?? { engagementSum: 0, count: 0 }
    hourBuckets.set(hour, {
      engagementSum: current.engagementSum + row.engagement_rate,
      count: current.count + 1,
    })
  }

  let bestStart = 0
  let bestAvg = -1

  for (let start = 0; start < 24; start += 1) {
    let engagementSum = 0
    let count = 0

    for (let offset = 0; offset < 2; offset += 1) {
      const hour = (start + offset) % 24
      const bucket = hourBuckets.get(hour)
      if (!bucket) continue
      engagementSum += bucket.engagementSum
      count += bucket.count
    }

    if (count === 0) continue

    const avg = engagementSum / count
    if (avg > bestAvg) {
      bestAvg = avg
      bestStart = start
    }
  }

  if (bestAvg < 0) return "Not enough data"

  const endHour = (bestStart + 2) % 24
  return `${padHour(bestStart)}:00–${padHour(endHour)}:00`
}

function buildEngagementSummary(
  rows: AnalyticsRowWithPost[],
): string {
  const analytics = aggregateContentPerformance(rows)
  const parts: string[] = []

  if (analytics.totalViews > 0) {
    parts.push(
      `Overall engagement rate is ${analytics.engagementRate}% across ${rows.length} posts and ${analytics.totalViews.toLocaleString()} views.`,
    )
  }

  if (analytics.bestPlatform) {
    parts.push(
      `${analytics.bestPlatform} leads on engagement${analytics.highestReachPlatform && analytics.highestReachPlatform !== analytics.bestPlatform ? `, while ${analytics.highestReachPlatform} drives the most reach` : ""}.`,
    )
  }

  const saveRate =
    analytics.totalViews > 0
      ? Math.round((analytics.totalSaves / analytics.totalViews) * 1000) / 10
      : 0

  if (analytics.totalSaves > 0) {
    parts.push(`Save rate is ${saveRate}% (${analytics.totalSaves} saves).`)
  }

  if (analytics.totalShares > analytics.totalComments) {
    parts.push("Shares outpace comments, indicating strong shareability.")
  } else if (analytics.totalComments > analytics.totalShares) {
    parts.push("Comments outpace shares, indicating conversation-heavy content.")
  }

  return parts.join(" ") || "Insufficient performance data to identify clear patterns yet."
}

function buildRecommendations(
  rows: AnalyticsRowWithPost[],
): string[] {
  const analytics = aggregateContentPerformance(rows)
  const recommendations: string[] = []
  const categories = analytics.categoryEngagement

  if (categories.length >= 1) {
    recommendations.push(
      `Double down on ${categories[0].category} content — it averages ${categories[0].engagementRate}% engagement.`,
    )
  }

  if (categories.length >= 2) {
    const worst = categories[categories.length - 1]
    recommendations.push(
      `Reduce or rework ${worst.category} posts (${worst.engagementRate}% engagement) — test stronger hooks or clearer CTAs.`,
    )
  }

  if (analytics.bestPlatform) {
    recommendations.push(
      `Prioritize ${analytics.bestPlatform} in your next content batch.`,
    )
  }

  const bestTime = findBestPostingTime(rows)
  if (bestTime !== "Not enough data") {
    recommendations.push(`Schedule high-value posts between ${bestTime}.`)
  }

  if (educationalOutperformsPromotional(rows)) {
    recommendations.push(
      "Educational content is outperforming promotional content — lean into value-first posts.",
    )
  }

  if (educationalSharedMoreOften(rows)) {
    recommendations.push(
      "Educational posts earn more shares — package tips in saveable, shareable formats.",
    )
  }

  if (analytics.avgEngagement > 0 && analytics.avgEngagement <= 10) {
    recommendations.push(
      "Engagement is below target — test shorter hooks, stronger visuals, and clearer CTAs.",
    )
  }

  if (analytics.totalSaves < analytics.totalLikes * 0.1 && analytics.totalLikes > 0) {
    recommendations.push(
      "Save rate is low relative to likes — create more reference-style or checklist content.",
    )
  }

  return recommendations.slice(0, 6)
}

export function analyzePerformanceInsights(
  rows: AnalyticsRowWithPost[],
): PerformanceInsightsPayload {
  const analytics = aggregateContentPerformance(rows)
  const categories = analytics.categoryEngagement

  return {
    insights: {
      best_content_type: categories[0]?.category ?? "",
      worst_content_type:
        categories.length >= 2
          ? categories[categories.length - 1].category
          : categories[0]?.category ?? "",
      best_time: findBestPostingTime(rows),
      summary: buildEngagementSummary(rows),
      recommendations: buildRecommendations(rows),
      best_hooks: extractBestHooks(rows),
      content_type_lift_pct: computeContentTypeLiftPct(categories),
    },
  }
}
