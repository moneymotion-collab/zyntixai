import {
  getRowEngagementTotal,
  withEngagementRate,
} from "@/lib/marketing/content-performance/engagement"
import type {
  LearningCtaPattern,
  LearningHookPattern,
  LearningInsight,
  LearningNextAction,
  LearningPerformanceRow,
  LearningPostSummary,
  LearningProfile,
  LearningRecommendation,
  LearningRunResult,
  LearningWeakPattern,
} from "@/lib/marketing/learning/types"
import { LEARNING_MIN_POSTS } from "@/lib/marketing/learning/types"
import {
  buildAiLearningProfileSummary,
  findBestPostingDayTime,
} from "@/lib/marketing/learning/build-ai-learning-profile-summary"

const CTA_PREFIXES = [
  "follow",
  "comment",
  "save",
  "share",
  "dm",
  "link",
  "tap",
  "swipe",
  "click",
  "try",
  "start",
  "join",
  "get",
  "book",
  "sign up",
  "learn more",
]

type RatedRow = LearningPerformanceRow & { engagement_rate: number }

function padHour(hour: number): string {
  return hour.toString().padStart(2, "0")
}

function findBestPostingTime(rows: RatedRow[]): string {
  const dayTimeRows = rows
    .map((row) => ({
      timestamp: getPostingTimestamp(row) ?? row.created_at,
      engagementRate: row.engagement_rate,
    }))
    .filter((row) => row.timestamp)

  const dayTime = findBestPostingDayTime(dayTimeRows)
  if (dayTime !== "Not enough data") return dayTime

  if (rows.length === 0) return "Not enough data"

  const hourBuckets = new Map<number, { engagementSum: number; count: number }>()

  for (const row of rows) {
    const timestamp = getPostingTimestamp(row) ?? row.created_at
    const hour = new Date(timestamp).getHours()
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

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function getRowTitle(row: LearningPerformanceRow): string {
  return (
    row.content_posts?.title?.trim() ||
    row.scheduled_post?.hook?.trim() ||
    row.title?.trim() ||
    "Untitled post"
  )
}

function getRowHook(row: LearningPerformanceRow): string {
  return (
    row.scheduled_post?.hook?.trim() ||
    row.content_posts?.title?.trim() ||
    row.title?.trim() ||
    ""
  )
}

function getRowContentType(row: LearningPerformanceRow): string {
  return (
    row.content_posts?.content_type?.trim() ||
    row.content_type?.trim() ||
    "General"
  )
}

function getRowCaption(row: LearningPerformanceRow): string {
  return (
    row.content_posts?.caption?.trim() ||
    row.scheduled_post?.content?.trim() ||
    ""
  )
}

function extractCtaPattern(caption: string): string | null {
  const trimmed = caption.trim()
  if (!trimmed) return null

  const paragraphs = trimmed
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)

  const candidate = paragraphs[paragraphs.length - 1] ?? trimmed
  const firstSentence = candidate.split(/[.!?]/)[0]?.trim() ?? candidate
  const normalized = firstSentence.toLowerCase()

  for (const prefix of CTA_PREFIXES) {
    if (normalized.startsWith(prefix)) {
      return firstSentence
    }
  }

  if (firstSentence.length <= 120) {
    return firstSentence
  }

  return null
}

function getPostingTimestamp(row: LearningPerformanceRow): string | null {
  return (
    row.content_posts?.published_at ||
    row.scheduled_post?.published_at ||
    row.scheduled_post?.scheduled_date ||
    row.created_at ||
    null
  )
}

function toPostSummary(row: RatedRow): LearningPostSummary {
  return {
    postId: row.post_id,
    title: getRowTitle(row),
    hook: getRowHook(row),
    platform: row.platform?.trim() || "Unknown",
    contentType: getRowContentType(row),
    views: row.views,
    engagement: getRowEngagementTotal(row),
    engagementRate: row.engagement_rate,
  }
}

function rankPosts(
  rows: RatedRow[],
  direction: "desc" | "asc",
  count: number,
): LearningPostSummary[] {
  const sorted = [...rows].sort((a, b) => {
    const scoreA = a.engagement_rate * 100 + Math.log10(Math.max(a.views, 1)) * 12
    const scoreB = b.engagement_rate * 100 + Math.log10(Math.max(b.views, 1)) * 12
    return direction === "desc" ? scoreB - scoreA : scoreA - scoreB
  })

  return sorted.slice(0, count).map(toPostSummary)
}

function findBestPlatform(rows: RatedRow[]): string | null {
  const stats = new Map<string, { rateSum: number; count: number }>()

  for (const row of rows) {
    const platform = row.platform?.trim()
    if (!platform) continue

    const current = stats.get(platform) ?? { rateSum: 0, count: 0 }
    stats.set(platform, {
      rateSum: current.rateSum + row.engagement_rate,
      count: current.count + 1,
    })
  }

  let best: string | null = null
  let bestAvg = -1

  for (const [platform, bucket] of stats) {
    const avg = bucket.rateSum / bucket.count
    if (avg > bestAvg) {
      bestAvg = avg
      best = platform
    }
  }

  return best
}

function findBestContentType(rows: RatedRow[]): string | null {
  const stats = new Map<string, { rateSum: number; count: number }>()

  for (const row of rows) {
    const type = getRowContentType(row)
    const current = stats.get(type) ?? { rateSum: 0, count: 0 }
    stats.set(type, {
      rateSum: current.rateSum + row.engagement_rate,
      count: current.count + 1,
    })
  }

  let best: string | null = null
  let bestAvg = -1

  for (const [type, bucket] of stats) {
    const avg = bucket.rateSum / bucket.count
    if (avg > bestAvg) {
      bestAvg = avg
      best = type
    }
  }

  return best
}

function detectHookPatterns(
  rows: RatedRow[],
  patternCount: number,
): LearningHookPattern[] {
  const ratedRows = rows
    .filter((row) => row.views > 0 || getRowHook(row).length > 0)
    .sort((a, b) => b.engagement_rate - a.engagement_rate)

  if (ratedRows.length === 0) return []

  const topCount = Math.max(1, Math.ceil(ratedRows.length * 0.25))
  const hookScores = new Map<
    string,
    { hook: string; score: number; count: number }
  >()

  for (const row of ratedRows.slice(0, topCount)) {
    const hook = getRowHook(row)
    if (!hook) continue

    const key = hook.toLowerCase()
    const current = hookScores.get(key) ?? { hook, score: 0, count: 0 }
    hookScores.set(key, {
      hook,
      score: current.score + row.engagement_rate,
      count: current.count + 1,
    })
  }

  return [...hookScores.values()]
    .sort((a, b) => b.score / b.count - a.score / a.count)
    .slice(0, patternCount)
    .map((entry) => ({
      hook: entry.hook,
      avgEngagementRate: round1(entry.score / entry.count),
      postCount: entry.count,
    }))
}

function detectCtaPatterns(
  rows: RatedRow[],
  patternCount: number,
): LearningCtaPattern[] {
  const patternScores = new Map<
    string,
    { pattern: string; score: number; count: number }
  >()

  for (const row of rows) {
    const pattern = extractCtaPattern(getRowCaption(row))
    if (!pattern) continue

    const key = pattern.toLowerCase()
    const current = patternScores.get(key) ?? { pattern, score: 0, count: 0 }
    patternScores.set(key, {
      pattern,
      score: current.score + row.engagement_rate,
      count: current.count + 1,
    })
  }

  return [...patternScores.values()]
    .sort((a, b) => b.score / b.count - a.score / a.count)
    .slice(0, patternCount)
    .map((entry) => ({
      pattern: entry.pattern,
      avgEngagementRate: round1(entry.score / entry.count),
      postCount: entry.count,
    }))
}

function detectRepeatedWeakPatterns(rows: RatedRow[]): LearningWeakPattern[] {
  if (rows.length < 2) return []

  const weakCount = Math.max(2, Math.ceil(rows.length * 0.3))
  const weakRated = [...rows]
    .sort((a, b) => a.engagement_rate - b.engagement_rate)
    .slice(0, weakCount)
  const patterns: LearningWeakPattern[] = []

  const countByKey = (
    items: Array<{ key: string; label: string; rate: number }>,
    category: LearningWeakPattern["category"],
  ) => {
    const buckets = new Map<
      string,
      { label: string; count: number; rateSum: number }
    >()

    for (const item of items) {
      if (!item.key) continue
      const current = buckets.get(item.key) ?? {
        label: item.label,
        count: 0,
        rateSum: 0,
      }
      buckets.set(item.key, {
        label: item.label,
        count: current.count + 1,
        rateSum: current.rateSum + item.rate,
      })
    }

    for (const bucket of buckets.values()) {
      if (bucket.count < 2) continue
      patterns.push({
        pattern: bucket.label,
        category,
        occurrences: bucket.count,
        avgEngagementRate: round1(bucket.rateSum / bucket.count),
      })
    }
  }

  countByKey(
    weakRated.map((row) => ({
      key: getRowHook(row).toLowerCase(),
      label: getRowHook(row) || getRowTitle(row),
      rate: row.engagement_rate,
    })),
    "hook",
  )

  countByKey(
    weakRated.map((row) => {
      const cta = extractCtaPattern(getRowCaption(row))
      return {
        key: cta?.toLowerCase() ?? "",
        label: cta ?? "",
        rate: row.engagement_rate,
      }
    }),
    "cta",
  )

  countByKey(
    weakRated.map((row) => ({
      key: getRowContentType(row).toLowerCase(),
      label: getRowContentType(row),
      rate: row.engagement_rate,
    })),
    "content_type",
  )

  countByKey(
    weakRated.map((row) => ({
      key: (row.platform?.trim() || "unknown").toLowerCase(),
      label: row.platform?.trim() || "Unknown",
      rate: row.engagement_rate,
    })),
    "platform",
  )

  return patterns
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 5)
}

function buildLearningProfile(
  runId: string,
  rows: LearningPerformanceRow[],
): LearningProfile {
  const rated = rows.map(withEngagementRate)
  const totalViews = rows.reduce((sum, row) => sum + (row.views ?? 0), 0)
  const totalEngagement = rows.reduce(
    (sum, row) => sum + getRowEngagementTotal(row),
    0,
  )
  const averageEngagementRate =
    rated.length > 0
      ? round1(
          rated.reduce((sum, row) => sum + row.engagement_rate, 0) /
            rated.length,
        )
      : 0

  const postingTimeRows = rated

  const baseProfile = {
    runId,
    postCount: rows.length,
    averageEngagementRate,
    bestPlatform: findBestPlatform(rated),
    bestContentType: findBestContentType(rated),
    bestPostingTime: findBestPostingTime(postingTimeRows),
    bestPerformingPosts: rankPosts(rated, "desc", 5),
    worstPerformingPosts: rankPosts(rated, "asc", 3),
    bestHookPatterns: detectHookPatterns(rated, 3),
    bestCtaPatterns: detectCtaPatterns(rated, 3),
    repeatedWeakPatterns: detectRepeatedWeakPatterns(rated),
    totalViews,
    totalEngagement,
  }

  return {
    ...baseProfile,
    aiSummary: buildAiLearningProfileSummary(baseProfile),
  }
}

function buildInsights(profile: LearningProfile): LearningInsight[] {
  const insights: LearningInsight[] = []

  insights.push({
    insight_key: "engagement-baseline",
    category: "engagement",
    title: "Average engagement rate",
    message: `Your content averages ${profile.averageEngagementRate}% engagement across ${profile.postCount} tracked posts.`,
    priority: 100,
    metrics: {
      average_engagement_rate: profile.averageEngagementRate,
      post_count: profile.postCount,
      total_views: profile.totalViews,
    },
    patterns: {},
  })

  if (profile.bestPlatform) {
    insights.push({
      insight_key: "best-platform",
      category: "platform",
      title: "Best platform",
      message: `${profile.bestPlatform} is your strongest platform by average engagement.`,
      priority: 95,
      metrics: { platform: profile.bestPlatform },
      patterns: {},
    })
  }

  if (profile.bestContentType) {
    insights.push({
      insight_key: "best-content-type",
      category: "content_type",
      title: "Best content type",
      message: `${profile.bestContentType} content performs best for your audience.`,
      priority: 90,
      metrics: { content_type: profile.bestContentType },
      patterns: {},
    })
  }

  if (profile.bestPostingTime !== "Not enough data") {
    insights.push({
      insight_key: "best-posting-time",
      category: "posting_time",
      title: "Best posting window",
      message: `Posts published around ${profile.bestPostingTime} tend to perform best.`,
      priority: 85,
      metrics: { posting_time: profile.bestPostingTime },
      patterns: {},
    })
  }

  for (const [index, hook] of profile.bestHookPatterns.entries()) {
    insights.push({
      insight_key: `best-hook-${index + 1}`,
      category: "hook",
      title: "High-performing hook",
      message: `"${hook.hook}" averaged ${hook.avgEngagementRate}% engagement.`,
      priority: 80 - index,
      metrics: {
        avg_engagement_rate: hook.avgEngagementRate,
        post_count: hook.postCount,
      },
      patterns: { hook: hook.hook },
    })
  }

  for (const [index, cta] of profile.bestCtaPatterns.entries()) {
    insights.push({
      insight_key: `best-cta-${index + 1}`,
      category: "cta",
      title: "High-performing CTA",
      message: `Captions ending with "${cta.pattern}" averaged ${cta.avgEngagementRate}% engagement.`,
      priority: 70 - index,
      metrics: {
        avg_engagement_rate: cta.avgEngagementRate,
        post_count: cta.postCount,
      },
      patterns: { cta_pattern: cta.pattern },
    })
  }

  for (const [index, weak] of profile.repeatedWeakPatterns.entries()) {
    insights.push({
      insight_key: `weak-pattern-${index + 1}`,
      category: "weak_pattern",
      title: "Repeated weak pattern",
      message: `"${weak.pattern}" (${weak.category}) underperformed in ${weak.occurrences} posts with ${weak.avgEngagementRate}% average engagement.`,
      priority: 60 - index,
      metrics: {
        occurrences: weak.occurrences,
        avg_engagement_rate: weak.avgEngagementRate,
      },
      patterns: {
        pattern: weak.pattern,
        category: weak.category,
      },
    })
  }

  const best = profile.bestPerformingPosts[0]
  if (best) {
    insights.push({
      insight_key: "top-post",
      category: "performance",
      title: "Top performer",
      message: `"${best.title}" leads with ${best.engagementRate}% engagement on ${best.platform}.`,
      priority: 92,
      metrics: {
        engagement_rate: best.engagementRate,
        views: best.views,
      },
      patterns: { post_id: best.postId },
    })
  }

  const worst = profile.worstPerformingPosts[0]
  if (worst) {
    insights.push({
      insight_key: "worst-post",
      category: "performance",
      title: "Lowest performer",
      message: `"${worst.title}" underperformed at ${worst.engagementRate}% engagement — consider revising the hook or CTA.`,
      priority: 55,
      metrics: {
        engagement_rate: worst.engagementRate,
        views: worst.views,
      },
      patterns: { post_id: worst.postId },
    })
  }

  return insights.sort((a, b) => b.priority - a.priority)
}

function buildRecommendations(profile: LearningProfile): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = []

  const topPost = profile.bestPerformingPosts[0]
  const weakPost = profile.worstPerformingPosts[0]

  if (profile.bestContentType) {
    recommendations.push({
      key: "double-down-content-type",
      title: `Create more ${profile.bestContentType} content`,
      message: `${profile.bestContentType} is your best-performing format. Plan 2–3 posts in this style next week.`,
      insight: `${profile.bestContentType} averaged the highest engagement across your tracked posts.`,
      whyItMatters:
        "Publishing more of what already works compounds reach without reinventing your workflow.",
      action: `Schedule 2–3 ${profile.bestContentType.toLowerCase()} posts for next week.`,
      triggerPostId: topPost?.postId ?? null,
      triggerPostTitle: topPost?.title ?? profile.bestContentType,
      category: "content_type",
      priority: 95,
    })
  }

  if (profile.bestPlatform) {
    recommendations.push({
      key: "prioritize-platform",
      title: `Prioritize ${profile.bestPlatform}`,
      message: `Shift more publishing volume to ${profile.bestPlatform} where engagement is strongest.`,
      insight: `${profile.bestPlatform} leads your platforms by average engagement rate.`,
      whyItMatters:
        "Channel focus prevents diluting effort on platforms where your audience engages less.",
      action: `Make ${profile.bestPlatform} your primary publish target for the next 5 posts.`,
      triggerPostId: topPost?.postId ?? null,
      triggerPostTitle: topPost?.title ?? profile.bestPlatform,
      category: "best_platform",
      priority: 90,
    })
  }

  const topHook = profile.bestHookPatterns[0]
  if (topHook) {
    recommendations.push({
      key: "reuse-hook-style",
      title: "Reuse your winning hook style",
      message: `Open your next posts with hooks similar to "${topHook.hook}".`,
      insight: `"${topHook.hook}" averaged ${topHook.avgEngagementRate}% engagement across ${topHook.postCount} post${topHook.postCount === 1 ? "" : "s"}.`,
      whyItMatters: "Strong opening lines determine whether viewers stop scrolling.",
      action: `Draft 2 posts that open with a hook in the same style as "${topHook.hook}".`,
      triggerPostId: topPost?.postId ?? null,
      triggerPostTitle: topHook.hook,
      category: "best_hook",
      priority: 88,
    })
  }

  const topCta = profile.bestCtaPatterns[0]
  if (topCta) {
    recommendations.push({
      key: "standardize-cta",
      title: "Standardize your CTA endings",
      message: `End captions with CTAs like "${topCta.pattern}" that already drive engagement.`,
      insight: `Captions ending with "${topCta.pattern}" averaged ${topCta.avgEngagementRate}% engagement.`,
      whyItMatters: "One clear CTA per post improves saves, comments, and follows.",
      action: `Rewrite your next 3 captions to end with: "${topCta.pattern}".`,
      triggerPostId: topPost?.postId ?? null,
      triggerPostTitle: topCta.pattern,
      category: "best_cta",
      priority: 85,
    })
  }

  if (profile.bestPostingTime !== "Not enough data") {
    recommendations.push({
      key: "schedule-peak-window",
      title: "Schedule during your peak window",
      message: `Publish high-value posts between ${profile.bestPostingTime}.`,
      insight: `Posts around ${profile.bestPostingTime} show the strongest engagement pattern in your data.`,
      whyItMatters:
        "Early engagement from posting at peak times helps algorithms distribute content further.",
      action: `Move your next 3 scheduled posts into the ${profile.bestPostingTime} window.`,
      triggerPostId: null,
      triggerPostTitle: profile.bestPostingTime,
      category: "posting_time",
      priority: 82,
    })
  }

  if (profile.repeatedWeakPatterns.length > 0) {
    const weak = profile.repeatedWeakPatterns[0]
    recommendations.push({
      key: "fix-weak-pattern",
      title: "Retire underperforming patterns",
      message: `Stop repeating "${weak.pattern}" — it has underperformed in ${weak.occurrences} posts.`,
      insight: `"${weak.pattern}" (${weak.category}) appeared in ${weak.occurrences} low-performing posts at ${weak.avgEngagementRate}% average engagement.`,
      whyItMatters:
        "Repeating weak hooks or formats drags down your overall engagement baseline.",
      action: `Pause content using "${weak.pattern}" and test a new hook angle this week.`,
      triggerPostId: weakPost?.postId ?? null,
      triggerPostTitle: weak.pattern,
      category: "improve_weak_post",
      priority: 78,
    })
  }

  if (weakPost && topPost && weakPost.postId !== topPost.postId) {
    recommendations.push({
      key: "revise-weak-post",
      title: `Improve "${weakPost.title}"`,
      message: `Revise or republish with a stronger hook and clearer CTA.`,
      insight: `"${weakPost.title}" reached ${weakPost.engagementRate}% engagement vs ${topPost.engagementRate}% on "${topPost.title}".`,
      whyItMatters:
        "Fixing underperformers is often faster than creating entirely new topics.",
      action: `Republish the idea behind "${weakPost.title}" using the hook style from "${topPost.title}".`,
      triggerPostId: weakPost.postId,
      triggerPostTitle: weakPost.title,
      category: "improve_weak_post",
      priority: 76,
    })
  }

  if (profile.averageEngagementRate < 5) {
    recommendations.push({
      key: "improve-baseline",
      title: "Lift your engagement baseline",
      message:
        "Test shorter hooks, clearer value in the first line, and a single explicit CTA per post.",
      insight: `Your average engagement rate is ${profile.averageEngagementRate}% across ${profile.postCount} posts.`,
      whyItMatters:
        "Small hook and CTA improvements compound when every post underperforms your target.",
      action:
        "Rewrite the first line and final CTA on your next draft before publishing.",
      triggerPostId: weakPost?.postId ?? null,
      triggerPostTitle: weakPost?.title ?? null,
      category: "engagement_trend",
      priority: 75,
    })
  }

  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 7)
}

function buildNextActions(
  profile: LearningProfile,
  recommendations: LearningRecommendation[],
): LearningNextAction[] {
  const actions: LearningNextAction[] = []

  const topHook = profile.bestHookPatterns[0]
  if (topHook) {
    actions.push({
      action: `Draft 2 posts opening with a hook like "${topHook.hook}".`,
      priority: 100,
      category: "hook",
    })
  }

  if (profile.bestPostingTime !== "Not enough data") {
    actions.push({
      action: `Schedule your next post between ${profile.bestPostingTime}.`,
      priority: 95,
      category: "posting_time",
    })
  }

  const topCta = profile.bestCtaPatterns[0]
  if (topCta) {
    actions.push({
      action: `Rewrite your next caption to end with: "${topCta.pattern}".`,
      priority: 90,
      category: "cta",
    })
  }

  if (profile.worstPerformingPosts[0]) {
    const worst = profile.worstPerformingPosts[0]
    actions.push({
      action: `Revise or republish "${worst.title}" with a stronger hook and clearer CTA.`,
      priority: 85,
      category: "improve_weak_post",
    })
  }

  for (const rec of recommendations.slice(0, 2)) {
    actions.push({
      action: rec.message,
      priority: rec.priority - 10,
      category: rec.key,
    })
  }

  const seen = new Set<string>()
  return actions
    .sort((a, b) => b.priority - a.priority)
    .filter((item) => {
      if (seen.has(item.action)) return false
      seen.add(item.action)
      return true
    })
    .slice(0, 5)
}

export function analyzeLearningData(
  runId: string,
  rows: LearningPerformanceRow[],
): LearningRunResult {
  if (rows.length < LEARNING_MIN_POSTS) {
    return {
      learning_profile: null,
      insights: [],
      recommendations: [],
      next_actions: [],
      message:
        "Not enough data yet. Publish at least 5 posts to unlock learning insights.",
    }
  }

  const profile = buildLearningProfile(runId, rows)
  const insights = buildInsights(profile)
  const recommendations = buildRecommendations(profile)
  const next_actions = buildNextActions(profile, recommendations)

  return {
    learning_profile: profile,
    insights,
    recommendations,
    next_actions,
  }
}
