import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"
import { getMarketingPlatformDisplayLabel } from "@/lib/marketing/platform-availability"
import { formatEstimatedReach } from "@/lib/marketing/calendar-display"
import {
  getViralScoreLabel,
  getViralScoreStyles,
  getViralScoreTier,
} from "@/lib/marketing/viral-score"

const BASE_REACH_BY_CONTENT: Record<string, number> = {
  video: 3_200,
  reel: 3_200,
  carousel: 2_100,
  story: 1_400,
  post: 1_800,
  image: 1_600,
}

const PLATFORM_REACH_MULTIPLIER: Record<string, number> = {
  tiktok: 1.35,
  instagram: 1.15,
  facebook: 0.95,
  linkedin: 0.85,
  youtube: 1.25,
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase()
}

export function getPostContentTypeDisplay(post: MarketingPost): string {
  if (post.content_type?.trim()) {
    const type = post.content_type.trim()
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
  }

  if (post.video_project_id || post.video_url || post.marketing_video_id) {
    return "Video"
  }

  const category = post.category?.trim().toLowerCase() ?? ""
  if (category.includes("carousel") || category === "educational" || category === "nutrition") {
    return "Carousel"
  }
  if (category.includes("story") || category === "testimonial") {
    return "Story"
  }
  if (category.includes("reel")) {
    return "Reel"
  }

  return "Post"
}

function getReachBase(post: MarketingPost): number {
  const contentKey = normalizeKey(getPostContentTypeDisplay(post))
  return BASE_REACH_BY_CONTENT[contentKey] ?? BASE_REACH_BY_CONTENT.post
}

function getPlatformMultiplier(platform: string): number {
  const key = normalizeKey(platform)
  for (const [name, multiplier] of Object.entries(PLATFORM_REACH_MULTIPLIER)) {
    if (key.includes(name)) return multiplier
  }
  return 1
}

function getScoreMultiplier(score: number | null | undefined): number {
  if (score == null) return 0.55
  return 0.45 + score / 125
}

export function estimatePostReach(post: MarketingPost): number {
  const base = getReachBase(post)
  const platform = getPlatformMultiplier(post.platform)
  const score = getScoreMultiplier(post.viral_score ?? post.optimized_score)
  const stableJitter =
    (post.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 17) /
      100 +
    0.92

  return Math.round(base * platform * score * stableJitter)
}

export function formatPostPublishDate(post: MarketingPost): {
  label: string
  date: string
  time: string | null
  iso: string | null
} {
  const status = (post.status ?? "").trim().toLowerCase()
  const publishedAt = post.published_at?.trim() || null
  const scheduledAt = post.scheduled_at?.trim() || null

  let iso: string | null = null
  let label = "Publish date"

  if (status === "published" && publishedAt) {
    iso = publishedAt
    label = "Published"
  } else if (scheduledAt) {
    iso = scheduledAt
    label = status === "published" ? "Published" : "Scheduled"
  } else if (publishedAt) {
    iso = publishedAt
    label = "Published"
  }

  if (!iso) {
    return {
      label,
      date: "Not set",
      time: null,
      iso: null,
    }
  }

  const parsed = new Date(iso)
  return {
    label,
    date: parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: parsed.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }),
    iso,
  }
}

export function getPostViralScoreDisplay(post: MarketingPost): {
  value: string
  sublabel: string
  tier: ReturnType<typeof getViralScoreTier> | null
} {
  const score = post.viral_score ?? post.optimized_score

  if (score == null) {
    return {
      value: "—",
      sublabel: "Run score to predict",
      tier: null,
    }
  }

  const tier = getViralScoreTier(score)
  return {
    value: String(score),
    sublabel: getViralScoreLabel(tier),
    tier,
  }
}

export function getPostEstimatedReachDisplay(post: MarketingPost): string {
  return formatEstimatedReach(estimatePostReach(post))
}

export function getPostPlatformDisplay(post: MarketingPost): string {
  return getMarketingPlatformDisplayLabel(post.platform?.trim() || "Social")
}

export function getViralScoreAccent(
  tier: ReturnType<typeof getViralScoreTier> | null,
): { card: string; icon: string; value: string } {
  if (!tier) {
    return {
      card: "border-gray-200 bg-gradient-to-br from-gray-50 to-white",
      icon: "text-gray-400",
      value: "text-gray-400",
    }
  }

  const styles = getViralScoreStyles(tier)
  switch (tier) {
    case "high":
      return {
        card: "border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40",
        icon: "text-emerald-600",
        value: styles.text,
      }
    case "good":
      return {
        card: "border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50/40",
        icon: "text-amber-600",
        value: styles.text,
      }
    default:
      return {
        card: "border-rose-200/80 bg-gradient-to-br from-rose-50 via-white to-orange-50/30",
        icon: "text-rose-600",
        value: styles.text,
      }
  }
}
