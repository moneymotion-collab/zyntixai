import type { CalendarPost, CalendarPostFormat } from "@/lib/marketing/calendar-types"
import {
  formatEstimatedReach,
  getCalendarPostFormat,
} from "@/lib/marketing/calendar-display"
import { parseScheduledDate, toDateKey } from "@/lib/marketing/calendar-utils"
import { getBestPostingTimes, scorePostingTime } from "@/lib/marketing/posting-times"

export type AiPlanningSummary = {
  plannedDays: number
  estimatedReach: number
  estimatedReachLabel: string
  recommendedPostingWindow: string
  recommendedPostingHint: string
  bestContentType: CalendarPostFormat
  bestContentTypeHint: string
  insight: string
}

export type AiCalendarRecommendation = {
  id: string
  title: string
  description: string
  impact: string
}

const FORMAT_REACH_WEIGHT: Partial<Record<CalendarPostFormat, number>> = {
  Reel: 3.2,
  Transformation: 3.0,
  Workout: 2.8,
  Carousel: 2.1,
  Educational: 2.0,
  Nutrition: 1.9,
  Story: 1.4,
  Testimonial: 1.3,
}

const DEFAULT_POSTING_WINDOW = "Tue–Thu · 6–9 PM"
const DEFAULT_POSTING_HINT = "Based on fitness audience engagement patterns"
const DEFAULT_BEST_TYPE: CalendarPostFormat = "Reel"

function countPlannedDays(posts: CalendarPost[]): number {
  const days = new Set<string>()

  for (const post of posts) {
    const scheduled = parseScheduledDate(post.scheduled_date)
    if (!scheduled) continue
    days.add(toDateKey(scheduled))
  }

  return days.size
}

function dominantPlatform(posts: CalendarPost[]): string {
  const counts = new Map<string, number>()

  for (const post of posts) {
    const platform = (post.platform ?? "Instagram").trim() || "Instagram"
    const key = platform.toLowerCase()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  let best = "instagram"
  let bestCount = 0

  for (const [platform, count] of counts) {
    if (count > bestCount) {
      best = platform
      bestCount = count
    }
  }

  return best
}

function formatHourLabel(hour24: number): string {
  const period = hour24 >= 12 ? "PM" : "AM"
  const hour12 = hour24 % 12 || 12
  return `${hour12} ${period}`
}

function formatTimeSlot(time: string): string {
  const hour = Number.parseInt(time.split(":")[0] ?? "", 10)
  if (!Number.isFinite(hour)) return time
  return formatHourLabel(hour)
}

function buildPostingWindowLabel(platform: string, posts: CalendarPost[]): string {
  const times = getBestPostingTimes(platform)
    .slice()
    .sort((a, b) => scorePostingTime(b) - scorePostingTime(a))

  const topTimes = times.slice(0, 2).map(formatTimeSlot)

  const weekdayCounts = { weekday: 0, weekend: 0 }
  for (const post of posts) {
    const scheduled = parseScheduledDate(post.scheduled_date)
    if (!scheduled) continue
    const day = scheduled.getDay()
    if (day === 0 || day === 6) weekdayCounts.weekend += 1
    else weekdayCounts.weekday += 1
  }

  const dayRange =
    weekdayCounts.weekend > weekdayCounts.weekday ? "Sat–Sun" : "Tue–Thu"

  if (topTimes.length === 0) return DEFAULT_POSTING_WINDOW
  if (topTimes.length === 1) return `${dayRange} · ${topTimes[0]}`

  return `${dayRange} · ${topTimes[0]} & ${topTimes[1]}`
}

function pickBestContentType(posts: CalendarPost[]): CalendarPostFormat {
  const counts = new Map<CalendarPostFormat, number>()

  for (const post of posts) {
    const format = getCalendarPostFormat(post)
    counts.set(format, (counts.get(format) ?? 0) + 1)
  }

  let best = DEFAULT_BEST_TYPE
  let bestScore = -1

  for (const [format, count] of counts) {
    const reachWeight = FORMAT_REACH_WEIGHT[format] ?? 1.5
    const score = count * reachWeight
    if (score > bestScore) {
      best = format
      bestScore = score
    }
  }

  return best
}

function buildInsight(
  posts: CalendarPost[],
  plannedDays: number,
  bestContentType: CalendarPostFormat,
  estimatedReach: number,
): string {
  if (posts.length === 0) {
    return "Add posts to your calendar and I'll optimize timing, reach, and content mix for you."
  }

  const formatCount = posts.filter(
    (post) => getCalendarPostFormat(post) === bestContentType,
  ).length

  if (plannedDays >= 20) {
    return `Strong month ahead — ${formatEstimatedReach(estimatedReach)} projected reach across ${plannedDays} active days. ${bestContentType} content is your highest-impact format right now.`
  }

  if (plannedDays >= 7) {
    return `${bestContentType} posts lead your plan with ${formatCount} scheduled. Spreading content across ${plannedDays} days keeps the algorithm fed without audience fatigue.`
  }

  return `Your calendar has room to grow — prioritize ${bestContentType} posts during peak windows to maximize reach this month.`
}

function countFormat(posts: CalendarPost[], format: CalendarPostFormat): number {
  return posts.filter((post) => getCalendarPostFormat(post) === format).length
}

function countReelsOnDays(posts: CalendarPost[], days: number[]): number {
  return posts.filter((post) => {
    if (getCalendarPostFormat(post) !== "Reel") return false
    const scheduled = parseScheduledDate(post.scheduled_date)
    if (!scheduled) return false
    return days.includes(scheduled.getDay())
  }).length
}

function postsWithCta(posts: CalendarPost[]): number {
  return posts.filter((post) => {
    const text = `${post.hook} ${post.content}`.replace(
      /\.?\s*Tailored for .+ with AI-optimized timing and CTA\.?/i,
      "",
    )
    return (
      /\bdm (us|["'])/i.test(text) ||
      /\bcomment ["']/i.test(text) ||
      /\blink in bio\b/i.test(text) ||
      /\bbook (a|your)\b/i.test(text) ||
      /\btap the link\b/i.test(text) ||
      /\bclaim your\b/i.test(text) ||
      /\bfollow for\b/i.test(text) ||
      /\bsign up\b/i.test(text) ||
      /\bfree trial\b/i.test(text) ||
      /\btag a friend\b/i.test(text) ||
      /\bsave this\b/i.test(text)
    )
  }).length
}

export function buildAiRecommendations(posts: CalendarPost[]): AiCalendarRecommendation[] {
  const total = posts.length
  const transformationCount = countFormat(posts, "Transformation")
  const reelCount = countFormat(posts, "Reel")
  const monThuReels = countReelsOnDays(posts, [1, 4])
  const ctaCount = postsWithCta(posts)
  const ctaPct = total > 0 ? Math.round((ctaCount / total) * 100) : 0

  const transformationShare =
    total > 0 ? Math.round((transformationCount / total) * 100) : 0

  return [
    {
      id: "transformation-content",
      title: "Post more transformation content.",
      description:
        total > 0
          ? `Transformation posts make up ${transformationShare}% of your plan. Adding 2–3 more could lift saves and inbound DMs.`
          : "Transformation posts drive 2.4× higher saves. Start with before/after stories and member wins.",
      impact: "+24% projected engagement",
    },
    {
      id: "reels-mon-thu",
      title: "Schedule reels on Monday and Thursday.",
      description:
        total > 0
          ? `You have ${monThuReels} reel${monThuReels === 1 ? "" : "s"} on Mon/Thu vs ${Math.max(reelCount - monThuReels, 0)} on other days. Shift short-form video to these peak windows.`
          : "Monday and Thursday consistently outperform for fitness reels — aim for 6–9 PM posting.",
      impact: "+18% reel reach",
    },
    {
      id: "cta-usage",
      title: "Increase CTA usage.",
      description:
        total > 0
          ? `${ctaPct}% of scheduled posts include a clear CTA. Add prompts like “DM TRANSFORM” or “Book a free trial” to every caption.`
          : "Posts with explicit CTAs convert 2× better. End every caption with one specific action.",
      impact: "+2× conversion potential",
    },
  ]
}

export function buildAiPlanningSummary(
  posts: CalendarPost[],
  estimatedReach: number,
): AiPlanningSummary {
  const plannedDays = countPlannedDays(posts)
  const platform = dominantPlatform(posts)
  const platformLabel =
    platform.charAt(0).toUpperCase() + platform.slice(1).split(" ")[0]
  const bestContentType = posts.length > 0 ? pickBestContentType(posts) : DEFAULT_BEST_TYPE
  const bestContentTypeCount = posts.filter(
    (post) => getCalendarPostFormat(post) === bestContentType,
  ).length

  return {
    plannedDays,
    estimatedReach,
    estimatedReachLabel: formatEstimatedReach(estimatedReach),
    recommendedPostingWindow:
      posts.length > 0
        ? buildPostingWindowLabel(platform, posts)
        : DEFAULT_POSTING_WINDOW,
    recommendedPostingHint:
      posts.length > 0
        ? `Optimized for ${platformLabel} peak engagement`
        : DEFAULT_POSTING_HINT,
    bestContentType,
    bestContentTypeHint:
      posts.length > 0
        ? `${bestContentTypeCount} post${bestContentTypeCount === 1 ? "" : "s"} · highest projected impact`
        : "Recommended starting format for fitness brands",
    insight: buildInsight(posts, plannedDays, bestContentType, estimatedReach),
  }
}
