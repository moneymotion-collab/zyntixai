import { findBestPostingTime } from "@/lib/marketing/analyze-performance-insights"
import {
  buildPerformanceSummary,
  type PlatformStat,
} from "@/lib/marketing/analytics/build-performance-summary"
import {
  buildContentTypeBreakdown,
  type BreakdownContentType,
} from "@/lib/marketing/analytics/content-type-breakdown"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import { shouldUseAnalyticsDemo } from "@/lib/marketing/analytics/resolve-analytics-display"
import { mockAnalyticsRows } from "@/lib/marketing/mock-analytics"
import { getBestPostingTimes } from "@/lib/marketing/posting-times"

export type AnalyticsAiInsightCard = {
  id: string
  title: string
  summary: string
  action: string
}

export type AnalyticsAiInsights = {
  performedBest: AnalyticsAiInsightCard
  underperformed: AnalyticsAiInsightCard
  nextContent: AnalyticsAiInsightCard
  postingTimes: AnalyticsAiInsightCard
}

function formatCount(value: number): string {
  if (value >= 10_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  }
  return value.toLocaleString()
}

function formatClockTime(time: string): string {
  const [hours, minutes] = time.split(":").map((part) => Number.parseInt(part, 10))
  if (!Number.isFinite(hours)) return time

  const date = new Date()
  date.setHours(hours, Number.isFinite(minutes) ? minutes : 0, 0, 0)

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: Number.isFinite(minutes) && minutes > 0 ? "2-digit" : undefined,
  })
}

function formatPlatformSlots(platform: string): string {
  const slots = getBestPostingTimes(platform).slice(0, 2)
  if (slots.length === 0) return "12 PM"

  return slots.map(formatClockTime).join(" & ")
}

function getLeadingFormat(
  breakdown: ReturnType<typeof buildContentTypeBreakdown>,
): BreakdownContentType | null {
  const leader = breakdown.stats
    .filter((stat) => stat.postCount > 0)
    .sort((a, b) => b.performanceScore - a.performanceScore)[0]

  return leader?.type ?? breakdown.bestType
}

export function getDemoAnalyticsAiInsights(): AnalyticsAiInsights {
  return {
    performedBest: {
      id: "performed-best",
      title: "What performed best",
      summary:
        '"3 gym mistakes killing your members\' progress" on Instagram Reels — 12.4K views, 10.6% engagement. Reels lead your gym\'s content mix.',
      action:
        "Film 2 more Instagram Reels using form-correction hooks for gym beginners this week.",
    },
    underperformed: {
      id: "underperformed",
      title: "What underperformed",
      summary:
        '"Cardio before weights? Gym myth busted" reached 4.1K views at 8.0% — lowest engagement in your tracked set.',
      action:
        'Retire this Story angle or reopen it with your top hook: "Your squat form is wrong."',
    },
    nextContent: {
      id: "next-content",
      title: "Recommended next content",
      summary:
        "Winning pattern for your gym: Instagram Reels + mistake/correction hooks on training and nutrition.",
      action:
        'Record a 30s Reel: "What I tell every new gym member about protein" with a save-this checklist CTA.',
    },
    postingTimes: {
      id: "posting-times",
      title: "Recommended posting times",
      summary:
        "Peak window: 18:00–20:00. Instagram Reels: 3 PM & 8 PM. Feed posts: 9 AM & 6 PM.",
      action: "Schedule your next 3 gym posts inside the evening peak window.",
    },
  }
}

export function buildAnalyticsAiInsights(
  rows: AnalyticsRowWithPost[],
  platformStats: PlatformStat[],
  usingFallback = false,
): AnalyticsAiInsights {
  if (shouldUseAnalyticsDemo(rows, usingFallback)) {
    return getDemoAnalyticsAiInsights()
  }

  const summary = buildPerformanceSummary(rows, {
    topCount: 3,
    weakCount: 3,
    patternCount: 2,
  })
  const breakdown = buildContentTypeBreakdown(rows)
  const bestPost = summary.bestPost
  const weakPost = summary.weakPosts[0] ?? summary.worstPost
  const topPlatform = platformStats[0]?.platform ?? bestPost?.platform ?? "your top platform"
  const leadingFormat = getLeadingFormat(breakdown)
  const bestHook = summary.hookPatterns[0]?.hook ?? bestPost?.hook
  const bestTime = findBestPostingTime(rows)
  const platformSlots = formatPlatformSlots(topPlatform)

  const performedBest: AnalyticsAiInsightCard = {
    id: "performed-best",
    title: "What performed best",
    summary: bestPost
      ? `"${bestPost.title}" on ${bestPost.platform} — ${formatCount(bestPost.views)} views, ${bestPost.engagementRate}% engagement${leadingFormat ? `. ${leadingFormat} lead your mix` : ""}.`
      : `${topPlatform} drives your strongest results across tracked posts.`,
    action: bestPost
      ? `Publish 2 more ${bestPost.platform} ${leadingFormat ?? "posts"} using hooks like "${bestHook ?? bestPost.title}".`
      : `Prioritize ${topPlatform} and repeat your highest-engagement hook angle.`,
  }

  const underperformed: AnalyticsAiInsightCard = {
    id: "underperformed",
    title: "What underperformed",
    summary:
      weakPost && bestPost && weakPost.postId !== bestPost.postId
        ? `"${weakPost.title}" reached ${formatCount(weakPost.views)} views at ${weakPost.engagementRate}% — ${(bestPost.engagementRate - weakPost.engagementRate).toFixed(1)} pts below your top post.`
        : weakPost
          ? `"${weakPost.title}" is your lowest performer at ${weakPost.engagementRate}% engagement.`
          : "No clear underperformer yet — keep publishing to widen the comparison set.",
    action:
      weakPost && bestPost && weakPost.postId !== bestPost.postId
        ? `Rework "${weakPost.title}" with ${bestPost.platform === weakPost.platform ? `the "${bestPost.hook}" hook` : `a ${bestPost.platform}-style hook`} or pause this angle for 2 weeks.`
        : "Test one new hook style against your current best post to find a weaker baseline.",
  }

  const nextContent: AnalyticsAiInsightCard = {
    id: "next-content",
    title: "Recommended next content",
    summary: bestPost
      ? `Winning pattern: ${leadingFormat ?? bestPost.contentType ?? "short-form"} on ${topPlatform}${bestHook ? ` + "${bestHook}" hooks` : ""}.`
      : `Lead with ${leadingFormat ?? "your best format"} on ${topPlatform}.`,
    action: bestPost
      ? `Draft one ${leadingFormat ?? bestPost.contentType ?? "post"} for ${topPlatform} using ${bestHook ? `"${bestHook}"` : "your top hook"} — publish within 48 hours.`
      : `Create one ${leadingFormat ?? "Reel"} for ${topPlatform} and sync analytics after publish.`,
  }

  const postingTimes: AnalyticsAiInsightCard = {
    id: "posting-times",
    title: "Recommended posting times",
    summary:
      bestTime !== "Not enough data"
        ? `Peak window from your data: ${bestTime}. ${topPlatform}: ${platformSlots}.`
        : `${topPlatform} peaks at ${platformSlots}. Post Tue–Thu for fitness audiences.`,
    action:
      bestTime !== "Not enough data"
        ? `Schedule your next 3 posts between ${bestTime} and keep times consistent for 2 weeks.`
        : `Schedule 3 posts at ${platformSlots} across different days, then re-check this insight.`,
  }

  return {
    performedBest,
    underperformed,
    nextContent,
    postingTimes,
  }
}
