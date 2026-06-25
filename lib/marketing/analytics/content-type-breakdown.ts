import { withEngagementRate } from "@/lib/marketing/aggregate-content-performance"
import { estimateRowReach } from "@/lib/marketing/analytics/analytics-kpis"
import { shouldUseAnalyticsDemo } from "@/lib/marketing/analytics/resolve-analytics-display"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import { mockAnalyticsRows } from "@/lib/marketing/mock-analytics"
import { getRowEngagement } from "@/lib/marketing/recommendations/recommendation-data-thresholds"

export const BREAKDOWN_CONTENT_TYPES = [
  "Reels",
  "Carousels",
  "Stories",
  "Testimonials",
  "Transformations",
] as const

export type BreakdownContentType = (typeof BREAKDOWN_CONTENT_TYPES)[number]

export type ContentTypeBreakdownStat = {
  type: BreakdownContentType
  label: string
  postCount: number
  totalViews: number
  totalReach: number
  totalEngagement: number
  avgEngagementRate: number
  performanceScore: number
}

export type ContentTypeBreakdown = {
  stats: ContentTypeBreakdownStat[]
  bestType: BreakdownContentType | null
  bestTypeInsight: string
}

const BREAKDOWN_LABELS: Record<BreakdownContentType, string> = {
  Reels: "Reels",
  Carousels: "Carousels",
  Stories: "Stories",
  Testimonials: "Testimonials",
  Transformations: "Transformations",
}

function emptyBucket(type: BreakdownContentType): ContentTypeBreakdownStat & {
  engagementRateSum: number
} {
  return {
    type,
    label: BREAKDOWN_LABELS[type],
    postCount: 0,
    totalViews: 0,
    totalReach: 0,
    totalEngagement: 0,
    avgEngagementRate: 0,
    performanceScore: 0,
    engagementRateSum: 0,
  }
}

export function resolveBreakdownContentType(
  row: AnalyticsRowWithPost,
): BreakdownContentType {
  const category = row.content_posts?.category?.trim().toLowerCase() ?? ""
  const contentType = row.content_posts?.content_type?.trim().toLowerCase() ?? ""

  if (category.includes("transformation")) {
    return "Transformations"
  }

  if (
    category.includes("member story") ||
    category.includes("testimonial") ||
    contentType.includes("testimonial")
  ) {
    return "Testimonials"
  }

  if (contentType.includes("carousel")) {
    return "Carousels"
  }

  if (contentType === "story" || contentType.includes("story")) {
    return "Stories"
  }

  if (
    contentType.includes("reel") ||
    contentType === "video" ||
    contentType === "post" ||
    contentType.length === 0
  ) {
    return "Reels"
  }

  return "Reels"
}

function getPerformanceScore(
  avgEngagementRate: number,
  totalViews: number,
  totalEngagement: number,
): number {
  const viewWeight = Math.log10(Math.max(totalViews, 1)) * 14
  return Math.round(avgEngagementRate * 12 + viewWeight + totalEngagement * 0.02)
}

function finalizeBucket(
  bucket: ContentTypeBreakdownStat & { engagementRateSum: number },
): ContentTypeBreakdownStat {
  const avgEngagementRate =
    bucket.postCount > 0
      ? Math.round((bucket.engagementRateSum / bucket.postCount) * 10) / 10
      : 0

  const { engagementRateSum: _engagementRateSum, ...stat } = bucket

  return {
    ...stat,
    avgEngagementRate,
    performanceScore: getPerformanceScore(
      avgEngagementRate,
      stat.totalViews,
      stat.totalEngagement,
    ),
  }
}

function buildInsight(best: ContentTypeBreakdownStat, runnerUp: ContentTypeBreakdownStat | null): string {
  if (best.postCount === 0) {
    return "Publish content across formats to unlock format-level insights."
  }

  if (!runnerUp || runnerUp.postCount === 0 || runnerUp.performanceScore <= 0) {
    return `${best.label} lead your content mix with ${best.avgEngagementRate}% average engagement across ${best.postCount} tracked ${best.postCount === 1 ? "post" : "posts"}.`
  }

  const lead =
    Math.round(
      ((best.performanceScore - runnerUp.performanceScore) / runnerUp.performanceScore) *
        100,
    ) || 0

  return `${best.label} outperform ${runnerUp.label} by ${lead}% on engagement and reach — prioritize this format in your next content batch.`
}

export function getDemoContentTypeBreakdown(): ContentTypeBreakdown {
  return buildContentTypeBreakdown(mockAnalyticsRows, true)
}

export function buildContentTypeBreakdown(
  rows: AnalyticsRowWithPost[],
  usingFallback = false,
): ContentTypeBreakdown {
  const sourceRows = shouldUseAnalyticsDemo(rows, usingFallback)
    ? mockAnalyticsRows
    : rows

  const buckets = new Map<
    BreakdownContentType,
    ContentTypeBreakdownStat & { engagementRateSum: number }
  >(BREAKDOWN_CONTENT_TYPES.map((type) => [type, emptyBucket(type)]))

  for (const row of sourceRows) {
    const type = resolveBreakdownContentType(row)
    const bucket = buckets.get(type) ?? emptyBucket(type)
    const engagement = getRowEngagement(row)
    const engagementRate = withEngagementRate(row).engagement_rate

    buckets.set(type, {
      ...bucket,
      postCount: bucket.postCount + 1,
      totalViews: bucket.totalViews + row.views,
      totalReach: bucket.totalReach + estimateRowReach(row),
      totalEngagement: bucket.totalEngagement + engagement,
      engagementRateSum: bucket.engagementRateSum + engagementRate,
    })
  }

  const stats = BREAKDOWN_CONTENT_TYPES.map((type) =>
    finalizeBucket(buckets.get(type) ?? emptyBucket(type)),
  )

  const ranked = [...stats]
    .filter((stat) => stat.postCount > 0)
    .sort((a, b) => b.performanceScore - a.performanceScore)

  if (ranked.length < 2) {
    return getDemoContentTypeBreakdown()
  }

  const best = ranked[0]
  const runnerUp = ranked[1] ?? null

  return {
    stats,
    bestType: best.type,
    bestTypeInsight: buildInsight(best, runnerUp),
  }
}
