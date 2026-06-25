import type {
  AiLearningProfileSummary,
  LearningProfile,
} from "@/lib/marketing/learning/types"

export type LearningProfileSummaryInput = Omit<LearningProfile, "aiSummary">

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

function padHour(hour: number): string {
  return hour.toString().padStart(2, "0")
}

export function formatContentTypeLabel(raw: string | null | undefined): string {
  if (!raw?.trim()) return "Mixed content"

  const lower = raw.trim().toLowerCase()

  if (lower.includes("reel")) return "Reels"
  if (lower.includes("carousel")) return "Carousels"
  if (lower.includes("story")) return "Stories"
  if (lower.includes("educational") || lower === "educational_post") {
    return "Educational posts"
  }
  if (lower.includes("workout")) return "Workout content"
  if (lower.includes("transformation")) return "Transformation posts"
  if (lower.includes("motivation")) return "Motivation posts"
  if (lower.includes("promotion") || lower.includes("promo")) {
    return "Promotional posts"
  }
  if (lower.includes("testimonial")) return "Testimonials"
  if (lower.includes("video")) return "Videos"

  return raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1)
}

export function classifyHookStyle(hook: string | null | undefined): string {
  const text = hook?.trim() ?? ""
  if (!text) return "Scroll-stopping hooks"

  const lower = text.toLowerCase()

  if (
    /\b(wrong|mistake|stop|don't|dont|never|failing|killing|problem|ruining|hurting|losing|broken)\b/.test(
      lower,
    )
  ) {
    return "Problem-first hooks"
  }

  if (/\b(how to|\d+\s*(ways|tips|steps|mistakes|reasons|secrets))\b/.test(lower)) {
    return "Listicle hooks"
  }

  if (lower.includes("pov")) return "POV hooks"
  if (text.includes("?")) return "Question hooks"

  if (
    /\b(secret|truth|nobody|hidden|actually|real reason|most people)\b/.test(
      lower,
    )
  ) {
    return "Curiosity hooks"
  }

  if (/\b(you|your)\b/.test(lower)) return "Direct-address hooks"

  return "Bold statement hooks"
}

export function formatBestCtaLabel(pattern: string | null | undefined): string {
  if (!pattern?.trim()) return "Clear save or follow CTA"

  const trimmed = pattern.trim()
  const lower = trimmed.toLowerCase()

  const commentMatch = trimmed.match(
    /comment\s+["']?([A-Za-z0-9]+)["']?/i,
  )
  if (commentMatch) {
    return `Comment "${commentMatch[1].toUpperCase()}"`
  }

  const dmMatch = trimmed.match(/dm\s+["']?([A-Za-z0-9]+)["']?/i)
  if (dmMatch) {
    return `DM "${dmMatch[1].toUpperCase()}"`
  }

  if (lower.startsWith("save")) return "Save this post"
  if (lower.startsWith("follow")) return "Follow for more"
  if (lower.startsWith("share")) return "Share with a friend"
  if (lower.startsWith("book")) return "Book a free session"
  if (lower.startsWith("link")) return "Link in bio CTA"

  if (trimmed.length <= 48) return trimmed

  return `${trimmed.slice(0, 45).trim()}…`
}

function isCommentCta(cta: string): boolean {
  return cta.toLowerCase().startsWith("comment")
}

export function buildHeadlineRecommendation(
  summary: Pick<
    AiLearningProfileSummary,
    "bestContentType" | "bestHookStyle" | "bestCta"
  >,
): string {
  const hookPhrase = summary.bestHookStyle.toLowerCase()
  const ctaPhrase = isCommentCta(summary.bestCta)
    ? "a clear comment-based CTA"
    : `a clear CTA (${summary.bestCta})`

  return `Create 3 more ${summary.bestContentType} this week using ${hookPhrase} and ${ctaPhrase}.`
}

export function buildAiLearningProfileSummary(
  profile: LearningProfileSummaryInput,
): AiLearningProfileSummary {
  const topHook = profile.bestHookPatterns[0]?.hook ?? null
  const topCta = profile.bestCtaPatterns[0]?.pattern ?? null

  const bestContentType = formatContentTypeLabel(profile.bestContentType)
  const bestHookStyle = classifyHookStyle(topHook)
  const bestCta = formatBestCtaLabel(topCta)
  const bestPostingTime =
    profile.bestPostingTime === "Not enough data"
      ? "Varied posting times"
      : profile.bestPostingTime

  const partial = { bestContentType, bestHookStyle, bestCta }

  return {
    ...partial,
    bestPostingTime,
    recommendation: buildHeadlineRecommendation(partial),
  }
}

export function findBestPostingDayTime(
  rows: Array<{ timestamp: string; engagementRate: number }>,
): string {
  if (rows.length === 0) return "Not enough data"

  const buckets = new Map<
    string,
    { label: string; engagementSum: number; count: number }
  >()

  for (const row of rows) {
    const date = new Date(row.timestamp)
    if (Number.isNaN(date.getTime())) continue

    const day = DAY_NAMES[date.getDay()]
    const hour = date.getHours()
    const key = `${date.getDay()}-${hour}`
    const label = `${day} ${padHour(hour)}:00`
    const current = buckets.get(key) ?? { label, engagementSum: 0, count: 0 }

    buckets.set(key, {
      label,
      engagementSum: current.engagementSum + row.engagementRate,
      count: current.count + 1,
    })
  }

  if (buckets.size === 0) return "Not enough data"

  let bestLabel = "Not enough data"
  let bestAvg = -1

  for (const bucket of buckets.values()) {
    const avg = bucket.engagementSum / bucket.count
    if (avg > bestAvg) {
      bestAvg = avg
      bestLabel = bucket.label
    }
  }

  return bestLabel
}
