import {
  findBestPlatform,
  findBestPost,
  findWorstPost,
  getAnalyticsTitle,
  withEngagementRate,
  type AnalyticsWithRate,
} from "@/lib/marketing/aggregate-content-performance"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import { getRowEngagement } from "@/lib/marketing/recommendations/recommendation-data-thresholds"

const DEFAULT_TOP_COUNT = 5
const DEFAULT_WEAK_COUNT = 3
const DEFAULT_PATTERN_COUNT = 3

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

export type PerformancePostSummary = {
  postId: string | null
  title: string
  hook: string
  platform: string
  contentType: string | null
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  engagement: number
  engagementRate: number
  viralScore: number
}

export const BEST_PERFORMING_CONTENT_LIMIT = 5

export function resolvePostViralScore(row: AnalyticsRowWithPost): number {
  const stored = row.content_posts?.viral_score
  if (typeof stored === "number" && Number.isFinite(stored)) {
    return Math.min(100, Math.max(0, Math.round(stored)))
  }

  const rated = withEngagementRate(row)
  const rateScore = Math.min(rated.engagement_rate * 8, 58)
  const viewScore = Math.min(Math.log10(Math.max(row.views, 1)) * 14, 32)
  const engagementBonus = Math.min(getRowEngagement(row) / 45, 10)

  return Math.round(Math.min(100, rateScore + viewScore + engagementBonus))
}

function getPerformanceRankScore(row: AnalyticsWithRate): number {
  const engagement = getRowEngagement(row)
  const viewWeight = Math.log10(Math.max(row.views, 1)) * 12
  return row.engagement_rate * 100 + viewWeight + engagement * 0.05
}

export type HookPattern = {
  hook: string
  avgEngagementRate: number
  postCount: number
}

export type CtaPattern = {
  pattern: string
  avgEngagementRate: number
  postCount: number
}

export type PerformanceSummary = {
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  totalSaves: number
  totalEngagement: number
  averageEngagementRate: number
  bestPost: PerformancePostSummary | null
  worstPost: PerformancePostSummary | null
  bestPlatform: string | null
  bestContentType: string | null
  topPosts: PerformancePostSummary[]
  weakPosts: PerformancePostSummary[]
  hookPatterns: HookPattern[]
  ctaPatterns: CtaPattern[]
}

export type BuildPerformanceSummaryOptions = {
  topCount?: number
  weakCount?: number
  patternCount?: number
}

export type PlatformStat = {
  platform: string
  views: number
  postCount: number
  avgEngagementRate: number
}

function getPlatformStatsFromRows(rows: AnalyticsRowWithPost[]): PlatformStat[] {
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
      avgEngagementRate:
        Math.round((bucket.engagementSum / bucket.postCount) * 10) / 10,
    }))
    .sort((a, b) => b.views - a.views)
}

export function getPlatformStats(rows: AnalyticsRowWithPost[]): PlatformStat[] {
  return getPlatformStatsFromRows(rows)
}

function getPostHook(row: AnalyticsRowWithPost): string {
  return row.content_posts?.title?.trim() || getAnalyticsTitle(row)
}

function toPostSummary(row: AnalyticsWithRate): PerformancePostSummary {
  return {
    postId: row.post_id,
    title: getAnalyticsTitle(row),
    hook: getPostHook(row),
    platform: row.platform,
    contentType: row.content_posts?.content_type?.trim() || null,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    saves: row.saves,
    engagement: getRowEngagement(row),
    engagementRate: row.engagement_rate,
    viralScore: resolvePostViralScore(row),
  }
}

function findBestContentType(rows: AnalyticsRowWithPost[]): string | null {
  const stats = new Map<string, { engagementSum: number; count: number }>()

  for (const row of rows.map(withEngagementRate)) {
    const contentType = row.content_posts?.content_type?.trim()
    if (!contentType) continue

    const current = stats.get(contentType) ?? { engagementSum: 0, count: 0 }
    stats.set(contentType, {
      engagementSum: current.engagementSum + row.engagement_rate,
      count: current.count + 1,
    })
  }

  let bestContentType: string | null = null
  let bestAvg = -1

  for (const [contentType, bucket] of stats) {
    const avg = bucket.engagementSum / bucket.count
    if (avg > bestAvg) {
      bestAvg = avg
      bestContentType = contentType
    }
  }

  return bestContentType
}

function extractCtaPattern(caption: string | null | undefined): string | null {
  const trimmed = caption?.trim()
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

function detectHookPatterns(
  rows: AnalyticsRowWithPost[],
  patternCount: number,
): HookPattern[] {
  const ratedRows = rows
    .map(withEngagementRate)
    .filter((row) => row.views > 0)
    .sort((a, b) => b.engagement_rate - a.engagement_rate)

  if (ratedRows.length === 0) return []

  const topCount = Math.max(1, Math.ceil(ratedRows.length * 0.25))
  const hookScores = new Map<
    string,
    { hook: string; score: number; count: number }
  >()

  for (const row of ratedRows.slice(0, topCount)) {
    const hook = row.content_posts?.title?.trim()
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
      avgEngagementRate:
        Math.round((entry.score / entry.count) * 10) / 10,
      postCount: entry.count,
    }))
}

function detectCtaPatterns(
  rows: AnalyticsRowWithPost[],
  patternCount: number,
): CtaPattern[] {
  const patternScores = new Map<
    string,
    { pattern: string; score: number; count: number }
  >()

  for (const row of rows.map(withEngagementRate)) {
    const pattern = extractCtaPattern(row.content_posts?.caption)
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
      avgEngagementRate:
        Math.round((entry.score / entry.count) * 10) / 10,
      postCount: entry.count,
    }))
}

function rankPosts(
  rows: AnalyticsRowWithPost[],
  direction: "desc" | "asc",
  count: number,
): PerformancePostSummary[] {
  const sorted = [...rows]
    .map(withEngagementRate)
    .sort((a, b) => {
      if (direction === "desc") {
        return getPerformanceRankScore(b) - getPerformanceRankScore(a)
      }
      return getPerformanceRankScore(a) - getPerformanceRankScore(b)
    })

  return sorted.slice(0, count).map(toPostSummary)
}

export function buildBestPerformingPosts(
  rows: AnalyticsRowWithPost[],
  limit = BEST_PERFORMING_CONTENT_LIMIT,
): PerformancePostSummary[] {
  return rankPosts(rows, "desc", limit)
}

export function buildPerformanceSummary(
  rows: AnalyticsRowWithPost[],
  options: BuildPerformanceSummaryOptions = {},
): PerformanceSummary {
  const topCount = options.topCount ?? DEFAULT_TOP_COUNT
  const weakCount = options.weakCount ?? DEFAULT_WEAK_COUNT
  const patternCount = options.patternCount ?? DEFAULT_PATTERN_COUNT

  const totalViews = rows.reduce((sum, row) => sum + row.views, 0)
  const totalLikes = rows.reduce((sum, row) => sum + row.likes, 0)
  const totalComments = rows.reduce((sum, row) => sum + row.comments, 0)
  const totalShares = rows.reduce((sum, row) => sum + row.shares, 0)
  const totalSaves = rows.reduce((sum, row) => sum + row.saves, 0)
  const totalEngagement = rows.reduce(
    (sum, row) => sum + getRowEngagement(row),
    0,
  )

  const ratedRows = rows.map(withEngagementRate)
  const averageEngagementRate =
    ratedRows.length > 0
      ? Math.round(
          (ratedRows.reduce((sum, row) => sum + row.engagement_rate, 0) /
            ratedRows.length) *
            10,
        ) / 10
      : 0

  const bestRow = findBestPost(rows)
  const worstRow = findWorstPost(rows)

  return {
    totalViews,
    totalLikes,
    totalComments,
    totalShares,
    totalSaves,
    totalEngagement,
    averageEngagementRate,
    bestPost: bestRow ? toPostSummary(bestRow) : null,
    worstPost: worstRow ? toPostSummary(worstRow) : null,
    bestPlatform: findBestPlatform(rows),
    bestContentType: findBestContentType(rows),
    topPosts: rankPosts(rows, "desc", topCount),
    weakPosts: rankPosts(rows, "asc", weakCount),
    hookPatterns: detectHookPatterns(rows, patternCount),
    ctaPatterns: detectCtaPatterns(rows, patternCount),
  }
}
