import { buildPerformanceSummary } from "@/lib/marketing/analytics/build-performance-summary"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import {
  buildRecommendationDataSnapshot,
  logRecommendationDataMetrics,
  type RecommendationDataTier,
} from "@/lib/marketing/recommendations/recommendation-data-thresholds"

export type CoachTopPost = {
  rank: number
  title: string
  hook: string
  platform: string
  contentType: string | null
  views: number
  engagement: number
  engagementRate: number
}

export type CoachAnalyticsSummary = {
  totalViews: number
  totalEngagement: number
  engagementRate: number
  bestPost: {
    title: string
    hook: string
    platform: string
    engagementRate: number
  } | null
  worstPost: {
    title: string
    hook: string
    platform: string
    engagementRate: number
  } | null
  bestPlatform: string | null
  bestContentType: string | null
  topPosts: CoachTopPost[]
  postCount: number
  hasData: boolean
  dataTier: RecommendationDataTier
}

function toCoachPostSnapshot(
  post: ReturnType<typeof buildPerformanceSummary>["bestPost"],
): CoachAnalyticsSummary["bestPost"] {
  if (!post) return null

  return {
    title: post.title,
    hook: post.hook,
    platform: post.platform,
    engagementRate: post.engagementRate,
  }
}

function toCoachTopPosts(
  posts: ReturnType<typeof buildPerformanceSummary>["topPosts"],
): CoachTopPost[] {
  return posts.map((post, index) => ({
    rank: index + 1,
    title: post.title,
    hook: post.hook,
    platform: post.platform,
    contentType: post.contentType,
    views: post.views,
    engagement: post.engagement,
    engagementRate: post.engagementRate,
  }))
}

export function buildCoachAnalyticsSummary(
  rows: AnalyticsRowWithPost[],
): CoachAnalyticsSummary {
  const snapshot = buildRecommendationDataSnapshot(rows)
  logRecommendationDataMetrics("coach-analytics-summary", snapshot)

  const summary = buildPerformanceSummary(rows, {
    topCount:
      snapshot.tier === "full" ? 3 : snapshot.tier === "compare" ? 2 : 1,
    weakCount: snapshot.tier === "full" ? 3 : 0,
  })

  const engagementRate =
    summary.totalViews > 0
      ? Math.round((summary.totalEngagement / summary.totalViews) * 1000) / 10
      : 0

  const includeWorstPost =
    snapshot.tier === "compare" || snapshot.tier === "full"

  return {
    totalViews: summary.totalViews,
    totalEngagement: summary.totalEngagement,
    engagementRate,
    bestPost: toCoachPostSnapshot(
      snapshot.hasEnoughData ? summary.bestPost : null,
    ),
    worstPost: includeWorstPost
      ? toCoachPostSnapshot(summary.worstPost)
      : null,
    bestPlatform: snapshot.hasEnoughData ? summary.bestPlatform : null,
    bestContentType: snapshot.hasEnoughData ? summary.bestContentType : null,
    topPosts: toCoachTopPosts(summary.topPosts),
    postCount: snapshot.rowCount,
    hasData: snapshot.hasEnoughData,
    dataTier: snapshot.tier,
  }
}

export function formatCoachAnalyticsSummaryBlock(
  summary: CoachAnalyticsSummary,
): string {
  if (!summary.hasData) {
    return "ANALYTICS STATUS: No performance data available yet. (No analytics rows or zero total views.)"
  }

  const bestPostLine = summary.bestPost
    ? `"${summary.bestPost.title}" (hook: "${summary.bestPost.hook}") — ${summary.bestPost.platform}, ${summary.bestPost.engagementRate}% engagement`
    : "Unavailable"

  const lines = [
    "ANALYTICS SUMMARY:",
    `- Data tier: ${summary.dataTier}`,
    `- Total views: ${summary.totalViews.toLocaleString()}`,
    `- Total engagement: ${summary.totalEngagement.toLocaleString()}`,
    `- Engagement rate: ${summary.engagementRate}%`,
    `- Posts tracked: ${summary.postCount}`,
    `- Best post: ${bestPostLine}`,
  ]

  if (summary.dataTier === "compare" || summary.dataTier === "full") {
    const worstPostLine = summary.worstPost
      ? `"${summary.worstPost.title}" (hook: "${summary.worstPost.hook}") — ${summary.worstPost.platform}, ${summary.worstPost.engagementRate}% engagement`
      : "Unavailable"
    lines.push(`- Worst post: ${worstPostLine}`)
  }

  if (summary.dataTier === "full") {
    lines.push(
      `- Best platform: ${summary.bestPlatform ?? "Unavailable"}`,
      `- Best content type: ${summary.bestContentType ?? "Unavailable"}`,
    )

    const topPostsBlock =
      summary.topPosts.length > 0
        ? summary.topPosts
            .map(
              (post) =>
                `${post.rank}. "${post.title}" (hook: "${post.hook}") — ${post.platform}, ${post.views.toLocaleString()} views, ${post.engagement.toLocaleString()} engagement, ${post.engagementRate}% rate${post.contentType ? `, type: ${post.contentType}` : ""}`,
            )
            .join("\n")
        : "No ranked posts available."

    lines.push("", "TOP 3 POSTS:", topPostsBlock)
  } else if (summary.dataTier === "compare" && summary.topPosts.length > 0) {
    const compareBlock = summary.topPosts
      .map(
        (post) =>
          `${post.rank}. "${post.title}" — ${post.platform}, ${post.engagementRate}% engagement`,
      )
      .join("\n")
    lines.push("", "TOP POSTS:", compareBlock)
  }

  return lines.join("\n")
}
