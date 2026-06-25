import type { ContentIdeaCard } from "@/lib/marketing/content-idea-cards"
import { getMarketingPlatformDisplayLabel } from "@/lib/marketing/platform-availability"
import {
  getViralScoreLabel,
  getViralScoreStyles,
  getViralScoreTier,
} from "@/lib/marketing/viral-score"

export type ContentFormat = "Reel" | "Carousel" | "Story" | "Post" | "Video"

export type IdeaBadge = {
  label: string
  className: string
}

const PLATFORM_STYLES: Record<string, string> = {
  Instagram: "border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-800",
  TikTok: "border-gray-300 bg-gray-900 text-white",
  Facebook: "border-blue-200 bg-blue-50 text-blue-800",
  LinkedIn: "border-sky-200 bg-sky-50 text-sky-900",
}

const FORMAT_STYLES: Record<ContentFormat, string> = {
  Reel: "border-violet-200 bg-violet-50 text-violet-800",
  Carousel: "border-amber-200 bg-amber-50 text-amber-900",
  Story: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800",
  Post: "border-gray-200 bg-gray-100 text-gray-700",
  Video: "border-cyan-200 bg-cyan-50 text-cyan-900",
}

const CATEGORY_CTAS: Record<string, string> = {
  Transformation: "DM us “TRANSFORM” for a free assessment",
  Nutrition: "Save this post and tag a friend who needs meal prep help",
  Workout: "Comment “WORKOUT” for our free beginner plan",
  Motivation: "Share this with someone who needs a push today",
  "Member Story": "Book a free trial — link in bio",
  Promotion: "Claim your intro offer before spots fill up",
  Educational: "Follow for more science-backed fitness tips",
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function inferContentFormat(idea: ContentIdeaCard): ContentFormat {
  const explicit = idea.content_type?.trim()
  if (explicit) {
    const normalized = explicit.charAt(0).toUpperCase() + explicit.slice(1).toLowerCase()
    if (normalized in FORMAT_STYLES) {
      return normalized as ContentFormat
    }
    if (normalized === "Video") return "Video"
  }

  const platform = idea.platform.toLowerCase()
  const category = idea.category.toLowerCase()

  if (platform === "tiktok") return "Reel"
  if (category === "educational" || category === "nutrition") return "Carousel"
  if (category === "motivation" || category === "promotion") return "Story"
  if (platform === "facebook" || platform === "linkedin") return "Post"

  return hashString(`${idea.title}-${idea.platform}`) % 2 === 0 ? "Reel" : "Carousel"
}

export function inferSuggestedCta(idea: ContentIdeaCard): string {
  if (idea.suggested_cta?.trim()) {
    return idea.suggested_cta.trim()
  }

  return (
    CATEGORY_CTAS[idea.category] ??
    "Tap the link in bio to start your free trial"
  )
}

export function getEngagementPotential(score: number | null | undefined): {
  label: string
  description: string
  className: string
  badgeClassName: string
} {
  if (score == null) {
    return {
      label: "Pending",
      description: "Score this idea to unlock engagement insights",
      className: "text-gray-500",
      badgeClassName: "border-gray-200 bg-gray-100 text-gray-600",
    }
  }

  if (score >= 80) {
    return {
      label: "High Engagement",
      description: "Strong save & share potential with your audience",
      className: "text-emerald-700",
      badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-800",
    }
  }

  if (score >= 60) {
    return {
      label: "Solid Engagement",
      description: "Good reach expected with a sharper hook",
      className: "text-blue-700",
      badgeClassName: "border-blue-200 bg-blue-50 text-blue-800",
    }
  }

  return {
    label: "Growing Potential",
    description: "Refine the hook or CTA to boost performance",
    className: "text-amber-700",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-800",
  }
}

export function getPlatformBadgeClass(platform: string): string {
  return PLATFORM_STYLES[platform] ?? "border-gray-200 bg-gray-100 text-gray-700"
}

export function getFormatBadgeClass(format: ContentFormat): string {
  return FORMAT_STYLES[format]
}

export function buildIdeaBadges(idea: ContentIdeaCard): IdeaBadge[] {
  const format = inferContentFormat(idea)
  const engagement = getEngagementPotential(idea.viral_score)
  const platformLabel = getMarketingPlatformDisplayLabel(idea.platform)
  const badges: IdeaBadge[] = [
    {
      label: platformLabel,
      className: getPlatformBadgeClass(platformLabel),
    },
    {
      label: format,
      className: getFormatBadgeClass(format),
    },
    {
      label: idea.category,
      className: "border-gray-200 bg-white text-gray-700",
    },
  ]

  if (idea.viral_score != null && idea.viral_score >= 75) {
    badges.push({
      label: engagement.label,
      className: engagement.badgeClassName,
    })
  }

  if (idea.scheduledAt) {
    badges.push({
      label: "Scheduled",
      className: "border-cyan-200 bg-cyan-50 text-cyan-800",
    })
  }

  return badges
}

export function getViralScoreDisplay(score: number | null | undefined) {
  if (score == null) {
    return {
      tier: null,
      label: "Not scored",
      styles: { badge: "border-gray-200 bg-gray-100 text-gray-600", text: "text-gray-500" },
      progress: 0,
    }
  }

  const tier = getViralScoreTier(score)

  return {
    tier,
    label: getViralScoreLabel(tier),
    styles: getViralScoreStyles(tier),
    progress: Math.min(100, Math.max(0, score)),
  }
}
