import { withEngagementRate } from "@/lib/marketing/aggregate-content-performance"
import {
  buildPerformanceSummary,
  type PerformanceSummary,
} from "@/lib/marketing/analytics/build-performance-summary"
import { findBestPostingTime } from "@/lib/marketing/analyze-performance-insights"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import type { RecommendationDataTier } from "@/lib/marketing/recommendations/recommendation-data-thresholds"

export const RECOMMENDATION_MIN = 5
export const RECOMMENDATION_MAX = 7

export type RecommendationType =
  | "best_hook"
  | "best_cta"
  | "best_platform"
  | "content_type"
  | "posting_time"
  | "improve_weak_post"
  | "next_content_idea"
  | "engagement_trend"

export type MetricSnapshot = Record<string, string | number | null>

export type ActionableRecommendation = {
  recommendation_key: string
  recommendation_type: RecommendationType
  category: string
  title: string
  insight: string
  why_it_matters: string
  action: string
  message: string
  priority: number
  confidence_score: number
  metric_snapshot: MetricSnapshot
  trigger_post_id: string | null
  trigger_post_title: string | null
}

type PlatformViewStat = {
  platform: string
  views: number
  postCount: number
  avgEngagementRate: number
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function formatMultiplier(ratio: number): string {
  if (ratio >= 10) return `${Math.round(ratio)}x`
  return `${round1(ratio)}x`
}

function formatCount(value: number): string {
  return value.toLocaleString()
}

function clampConfidence(score: number): number {
  return Math.max(40, Math.min(98, Math.round(score)))
}

function buildRecommendation(
  partial: Omit<ActionableRecommendation, "message" | "why_it_matters"> & {
    message?: string
    why_it_matters?: string
  },
): ActionableRecommendation {
  return {
    ...partial,
    why_it_matters: partial.why_it_matters ?? partial.insight,
    message: partial.message ?? partial.action,
  }
}

function getRowTitle(row: AnalyticsRowWithPost): string {
  return row.content_posts?.title?.trim() || row.platform?.trim() || "Untitled post"
}

function getPlatformViewStats(rows: AnalyticsRowWithPost[]): PlatformViewStat[] {
  const stats = new Map<
    string,
    { views: number; postCount: number; engagementSum: number }
  >()

  for (const row of rows.map(withEngagementRate)) {
    const platform = row.platform.trim()
    if (!platform) continue

    const current = stats.get(platform) ?? {
      views: 0,
      postCount: 0,
      engagementSum: 0,
    }
    stats.set(platform, {
      views: current.views + row.views,
      postCount: current.postCount + 1,
      engagementSum: current.engagementSum + row.engagement_rate,
    })
  }

  return [...stats.entries()]
    .map(([platform, bucket]) => ({
      platform,
      views: bucket.views,
      postCount: bucket.postCount,
      avgEngagementRate: round1(bucket.engagementSum / bucket.postCount),
    }))
    .sort((a, b) => b.views - a.views)
}

function detectBestTopic(rows: AnalyticsRowWithPost[]): string | null {
  const topicStats = new Map<string, { engagementSum: number; count: number }>()

  for (const row of rows.map(withEngagementRate)) {
    const topic = row.content_posts?.topic?.trim()
    if (!topic) continue

    const current = topicStats.get(topic) ?? { engagementSum: 0, count: 0 }
    topicStats.set(topic, {
      engagementSum: current.engagementSum + row.engagement_rate,
      count: current.count + 1,
    })
  }

  let bestTopic: string | null = null
  let bestAvg = -1

  for (const [topic, bucket] of topicStats) {
    const avg = bucket.engagementSum / bucket.count
    if (avg > bestAvg) {
      bestAvg = avg
      bestTopic = topic
    }
  }

  return bestTopic
}

function getContentTypeLift(
  summary: PerformanceSummary,
  rows: AnalyticsRowWithPost[],
): number | null {
  if (!summary.bestContentType) return null

  const typeRows = rows
    .map(withEngagementRate)
    .filter(
      (row) =>
        row.content_posts?.content_type?.trim() === summary.bestContentType,
    )

  if (typeRows.length === 0) return null

  const typeAvg =
    typeRows.reduce((sum, row) => sum + row.engagement_rate, 0) /
    typeRows.length
  const otherRows = rows
    .map(withEngagementRate)
    .filter(
      (row) =>
        row.content_posts?.content_type?.trim() !== summary.bestContentType,
    )

  if (otherRows.length === 0 || summary.averageEngagementRate <= 0) return null

  const otherAvg =
    otherRows.reduce((sum, row) => sum + row.engagement_rate, 0) /
    otherRows.length

  if (otherAvg <= 0 || typeAvg <= otherAvg) return null

  return round1(typeAvg / otherAvg)
}

function buildBestHookRecommendation(
  summary: PerformanceSummary,
): ActionableRecommendation | null {
  const topHook = summary.hookPatterns[0]
  if (!topHook) return null

  const runnerUp = summary.hookPatterns[1]
  const engagementGap = runnerUp
    ? round1(topHook.avgEngagementRate - runnerUp.avgEngagementRate)
    : null

  return buildRecommendation({
    recommendation_key: "best-hook",
    recommendation_type: "best_hook",
    category: "best_hook",
    title: "Reuse your highest-performing hook",
    insight: `Hooks like "${topHook.hook}" averaged ${topHook.avgEngagementRate}% engagement across ${topHook.postCount} post${topHook.postCount === 1 ? "" : "s"}${engagementGap ? `, beating your next-best hook by ${engagementGap} pts` : ""}.`,
    why_it_matters:
      "Opening lines drive scroll-stop rate. Reusing proven hooks compounds reach without guessing.",
    action: `Open your content calendar and schedule 2 posts this week that open with a hook in the same style as "${topHook.hook}".`,
    priority: 96,
    confidence_score: clampConfidence(
      58 + topHook.postCount * 12 + topHook.avgEngagementRate,
    ),
    metric_snapshot: {
      hook: topHook.hook,
      avg_engagement_rate: topHook.avgEngagementRate,
      supporting_posts: topHook.postCount,
    },
    trigger_post_id: summary.bestPost?.postId ?? null,
    trigger_post_title: summary.bestPost?.title ?? topHook.hook,
  })
}

function buildBestCtaRecommendation(
  summary: PerformanceSummary,
): ActionableRecommendation | null {
  const topCta = summary.ctaPatterns[0]
  if (!topCta) return null

  return buildRecommendation({
    recommendation_key: "best-cta",
    recommendation_type: "best_cta",
    category: "best_cta",
    title: "Mirror your winning CTA ending",
    insight: `Captions ending with "${topCta.pattern}" averaged ${topCta.avgEngagementRate}% engagement across ${topCta.postCount} post${topCta.postCount === 1 ? "" : "s"}.`,
    why_it_matters:
      "A consistent CTA trains your audience to take one clear action instead of scrolling past.",
    action: `Rewrite the closing line on your next 3 drafts to follow this CTA pattern: "${topCta.pattern}".`,
    priority: 90,
    confidence_score: clampConfidence(
      55 + topCta.postCount * 10 + topCta.avgEngagementRate * 0.8,
    ),
    metric_snapshot: {
      cta_pattern: topCta.pattern,
      avg_engagement_rate: topCta.avgEngagementRate,
      supporting_posts: topCta.postCount,
    },
    trigger_post_id: summary.bestPost?.postId ?? null,
    trigger_post_title: summary.bestPost?.title ?? topCta.pattern,
  })
}

function buildBestPlatformRecommendation(
  rows: AnalyticsRowWithPost[],
): ActionableRecommendation | null {
  const platformStats = getPlatformViewStats(rows)
  if (platformStats.length < 2) return null

  const leader = platformStats[0]
  const runnerUp = platformStats[1]
  if (leader.views <= 0 || runnerUp.views <= 0) return null

  const viewMultiplier = leader.views / runnerUp.views
  const engagementLead =
    leader.avgEngagementRate - runnerUp.avgEngagementRate

  return buildRecommendation({
    recommendation_key: "best-platform",
    recommendation_type: "best_platform",
    category: "best_platform",
    title: `Shift volume toward ${leader.platform}`,
    insight: `Your ${leader.platform} posts generated ${formatMultiplier(viewMultiplier)} more views than ${runnerUp.platform} (${formatCount(leader.views)} vs ${formatCount(runnerUp.views)} total views)${engagementLead > 0 ? ` and ${round1(engagementLead)} pts higher engagement` : ""}.`,
    why_it_matters:
      "Publishing where your audience already engages reduces wasted effort on underperforming channels.",
    action: `Prioritize short problem-solution ${leader.platform} posts next week and reduce ${runnerUp.platform} volume until ${leader.platform} cadence is consistent.`,
    priority: 98,
    confidence_score: clampConfidence(
      62 + Math.min(viewMultiplier, 4) * 8 + leader.postCount * 5,
    ),
    metric_snapshot: {
      leading_platform: leader.platform,
      leading_views: leader.views,
      trailing_platform: runnerUp.platform,
      trailing_views: runnerUp.views,
      view_multiplier: round1(viewMultiplier),
      leading_engagement_rate: leader.avgEngagementRate,
    },
    trigger_post_id: null,
    trigger_post_title: `${leader.platform} (${leader.postCount} posts)`,
  })
}

function buildContentTypeRecommendation(
  summary: PerformanceSummary,
  rows: AnalyticsRowWithPost[],
): ActionableRecommendation | null {
  if (!summary.bestContentType) return null

  const lift = getContentTypeLift(summary, rows)
  const supportingPosts = rows.filter(
    (row) =>
      row.content_posts?.content_type?.trim() === summary.bestContentType,
  ).length

  if (supportingPosts === 0) return null

  return buildRecommendation({
    recommendation_key: "content-type",
    recommendation_type: "content_type",
    category: "content_type",
    title: `Double down on ${summary.bestContentType} content`,
    insight: `${summary.bestContentType} posts are your strongest format${lift ? `, delivering ${formatMultiplier(lift)} higher engagement than your other formats` : ""} across ${supportingPosts} tracked post${supportingPosts === 1 ? "" : "s"}.`,
    why_it_matters:
      "Doubling down on a winning format improves production efficiency and audience expectations.",
    action: `Plan 3 ${summary.bestContentType.toLowerCase()} posts for next week and retire your lowest-performing format until ${summary.bestContentType} makes up at least half of your calendar.`,
    priority: 92,
    confidence_score: clampConfidence(
      60 + supportingPosts * 8 + (lift ?? 1) * 10,
    ),
    metric_snapshot: {
      content_type: summary.bestContentType,
      supporting_posts: supportingPosts,
      engagement_lift: lift,
      average_engagement_rate: summary.averageEngagementRate,
    },
    trigger_post_id: summary.bestPost?.postId ?? null,
    trigger_post_title:
      summary.bestPost?.title ?? `${summary.bestContentType} posts`,
  })
}

function buildPostingTimeRecommendation(
  rows: AnalyticsRowWithPost[],
): ActionableRecommendation | null {
  if (rows.length < 3) return null

  const bestTime = findBestPostingTime(rows)
  if (!bestTime || bestTime === "Not enough data") return null

  const hourBuckets = new Map<number, number>()
  for (const row of rows.map(withEngagementRate)) {
    const hour = new Date(row.created_at).getHours()
    hourBuckets.set(hour, (hourBuckets.get(hour) ?? 0) + row.engagement_rate)
  }

  const topHour = [...hourBuckets.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0]

  return buildRecommendation({
    recommendation_key: "posting-time",
    recommendation_type: "posting_time",
    category: "posting_time",
    title: "Schedule around your best posting window",
    insight: `Posts published around ${bestTime} show the strongest engagement pattern across your ${rows.length} tracked posts${topHour !== undefined ? `, with hour ${topHour}:00 as the peak slot` : ""}.`,
    why_it_matters:
      "Publishing when your audience is active increases early engagement signals that boost reach.",
    action: `Move your next 3 posts into the ${bestTime} window and keep publish times consistent for two weeks to validate the trend.`,
    priority: 84,
    confidence_score: clampConfidence(58 + rows.length * 5),
    metric_snapshot: {
      best_posting_window: bestTime,
      posts_analyzed: rows.length,
      peak_hour: topHour ?? null,
    },
    trigger_post_id: null,
    trigger_post_title: `Peak window: ${bestTime}`,
  })
}

function buildImproveWeakPostRecommendation(
  summary: PerformanceSummary,
): ActionableRecommendation | null {
  const weakPost = summary.weakPosts[0]
  const bestPost = summary.bestPost
  if (!weakPost || !bestPost) return null
  if (weakPost.postId && weakPost.postId === bestPost.postId) return null

  const engagementGap = round1(
    bestPost.engagementRate - weakPost.engagementRate,
  )
  const viewGap =
    bestPost.views > 0 && weakPost.views > 0
      ? round1(bestPost.views / weakPost.views)
      : null

  return buildRecommendation({
    recommendation_key: "improve-weak-post",
    recommendation_type: "improve_weak_post",
    category: "improve_weak_post",
    title: `Fix what held back "${weakPost.title}"`,
    insight: `"${weakPost.title}" on ${weakPost.platform} reached ${formatCount(weakPost.views)} views at ${weakPost.engagementRate}% engagement — ${engagementGap} pts below your top post "${bestPost.title}"${viewGap ? ` and ${formatMultiplier(viewGap)} fewer views` : ""}.`,
    why_it_matters:
      "Low performers reveal hook, format, or CTA gaps you can fix on the next publish instead of abandoning the topic.",
    action: `Republish the idea behind "${weakPost.title}" with ${bestPost.platform === weakPost.platform ? "the hook from" : `a ${bestPost.platform}-style hook like`} "${bestPost.hook}" and a direct CTA in the final line.`,
    priority: 88,
    confidence_score: clampConfidence(64 + engagementGap * 2),
    metric_snapshot: {
      weak_post_title: weakPost.title,
      weak_post_views: weakPost.views,
      weak_post_engagement_rate: weakPost.engagementRate,
      best_post_title: bestPost.title,
      best_post_engagement_rate: bestPost.engagementRate,
      engagement_gap: engagementGap,
    },
    trigger_post_id: weakPost.postId,
    trigger_post_title: weakPost.title,
  })
}

function buildNextContentIdeaRecommendation(
  summary: PerformanceSummary,
  rows: AnalyticsRowWithPost[],
): ActionableRecommendation | null {
  const platform =
    summary.bestPost?.platform ?? summary.bestPlatform ?? "your top platform"
  const contentType =
    summary.bestContentType ?? summary.bestPost?.contentType ?? "video"
  const hook = summary.hookPatterns[0]?.hook ?? summary.bestPost?.hook
  const topic = detectBestTopic(rows)

  if (!hook && !summary.bestPost) return null

  const hookLine = hook ? `a hook like "${hook}"` : "your best-performing hook angle"
  const topicLine = topic ? ` about ${topic}` : ""

  return buildRecommendation({
    recommendation_key: "next-content-idea",
    recommendation_type: "next_content_idea",
    category: "next_content_idea",
    title: "Your highest-probability next post",
    insight: `Your winning pattern combines ${contentType} content on ${platform}${topic ? ` focused on ${topic}` : ""}${summary.bestPost ? `, led by "${summary.bestPost.title}" at ${summary.bestPost.engagementRate}% engagement` : ""}.`,
    why_it_matters:
      "Stacking proven platform, format, and hook patterns raises the odds your next post lands above your average.",
    action: `Draft one ${contentType} post for ${platform} using ${hookLine}${topicLine}, then film and schedule it within 48 hours.`,
    priority: 86,
    confidence_score: clampConfidence(
      52 +
        (summary.hookPatterns[0]?.postCount ?? 1) * 6 +
        (topic ? 8 : 0) +
        (summary.bestContentType ? 6 : 0),
    ),
    metric_snapshot: {
      platform,
      content_type: contentType,
      hook: hook ?? null,
      topic: topic ?? null,
      best_post_engagement_rate: summary.bestPost?.engagementRate ?? null,
    },
    trigger_post_id: summary.bestPost?.postId ?? null,
    trigger_post_title: summary.bestPost?.title ?? null,
  })
}

function buildEngagementTrendRecommendation(
  rows: AnalyticsRowWithPost[],
): ActionableRecommendation | null {
  if (rows.length < RECOMMENDATION_MIN) return null

  const rated = [...rows]
    .map(withEngagementRate)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )

  const midpoint = Math.floor(rated.length / 2)
  const older = rated.slice(0, midpoint)
  const recent = rated.slice(midpoint)

  if (older.length === 0 || recent.length === 0) return null

  const avgOlder =
    older.reduce((sum, row) => sum + row.engagement_rate, 0) / older.length
  const avgRecent =
    recent.reduce((sum, row) => sum + row.engagement_rate, 0) / recent.length
  const delta = round1(avgRecent - avgOlder)

  if (Math.abs(delta) < 0.5) return null

  const trendingUp = delta > 0
  const triggerPost = trendingUp
    ? [...recent].sort((a, b) => b.engagement_rate - a.engagement_rate)[0]
    : [...recent].sort((a, b) => a.engagement_rate - b.engagement_rate)[0]

  return buildRecommendation({
    recommendation_key: "engagement-trend",
    recommendation_type: "engagement_trend",
    category: "engagement_trend",
    title: trendingUp
      ? "Engagement is trending up"
      : "Engagement is slipping — tighten your hooks",
    insight: `Your recent posts average ${round1(avgRecent)}% engagement vs ${round1(avgOlder)}% on earlier posts (${trendingUp ? "+" : ""}${delta} pts).`,
    why_it_matters: trendingUp
      ? "Rising engagement means your recent format and hook choices are resonating — keep the momentum."
      : "A downward trend often means hooks or CTAs are getting weaker before reach drops.",
    action: trendingUp
      ? `Repeat the hook and format from "${getRowTitle(triggerPost)}" on your next 2 posts while engagement is climbing.`
      : `Audit "${getRowTitle(triggerPost)}" and your last 3 captions — shorten hooks and add one explicit CTA per post.`,
    priority: trendingUp ? 87 : 93,
    confidence_score: clampConfidence(55 + rows.length * 4 + Math.abs(delta) * 3),
    metric_snapshot: {
      recent_avg_engagement_rate: round1(avgRecent),
      earlier_avg_engagement_rate: round1(avgOlder),
      engagement_delta: delta,
      posts_analyzed: rows.length,
    },
    trigger_post_id: triggerPost.post_id,
    trigger_post_title: getRowTitle(triggerPost),
  })
}

function finalizeRecommendation(
  recommendation: ActionableRecommendation,
): ActionableRecommendation {
  return recommendation
}

function isTypeAllowed(
  type: RecommendationType,
  tier: RecommendationDataTier,
): boolean {
  if (tier === "best-post") {
    return type === "best_hook" || type === "next_content_idea"
  }

  if (tier === "compare") {
    return type !== "posting_time" && type !== "content_type"
  }

  if (tier === "full") {
    return true
  }

  return type !== "posting_time" && type !== "engagement_trend"
}

export function buildActionableRecommendations(
  rows: AnalyticsRowWithPost[],
  tier: RecommendationDataTier,
  hasEnoughData: boolean,
): ActionableRecommendation[] {
  if (!hasEnoughData) {
    return []
  }

  const summary = buildPerformanceSummary(rows, {
    topCount: 3,
    weakCount: 3,
    patternCount: 3,
  })

  const candidates: ActionableRecommendation[] = []

  const builders: Array<() => ActionableRecommendation | null> = [
    () => buildBestPlatformRecommendation(rows),
    () => buildBestHookRecommendation(summary),
    () => buildContentTypeRecommendation(summary, rows),
    () => buildImproveWeakPostRecommendation(summary),
    () => buildEngagementTrendRecommendation(rows),
    () => buildBestCtaRecommendation(summary),
    () => buildPostingTimeRecommendation(rows),
    () => buildNextContentIdeaRecommendation(summary, rows),
  ]

  for (const build of builders) {
    const recommendation = build()
    if (!recommendation) continue
    if (!isTypeAllowed(recommendation.recommendation_type, tier)) continue
    candidates.push(finalizeRecommendation(recommendation))
  }

  if (candidates.length === 0) {
    const fallback = [
      buildBestHookRecommendation(summary),
      buildNextContentIdeaRecommendation(summary, rows),
      summary.bestPost
        ? buildImproveWeakPostRecommendation(summary)
        : null,
    ].filter((item): item is ActionableRecommendation => item !== null)

    if (fallback.length > 0) {
      return fallback.map(finalizeRecommendation)
    }

    return []
  }

  const seen = new Set<string>()
  const ranked = candidates
    .sort((a, b) => b.priority - a.priority || b.confidence_score - a.confidence_score)
    .filter((candidate) => {
      if (seen.has(candidate.recommendation_type)) return false
      seen.add(candidate.recommendation_type)
      return true
    })

  const targetCount =
    tier === "full"
      ? Math.min(RECOMMENDATION_MAX, Math.max(RECOMMENDATION_MIN, ranked.length))
      : ranked.length

  return ranked.slice(0, targetCount)
}
