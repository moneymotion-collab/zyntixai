import { isTikTokPlatform } from "@/lib/marketing/social-publish/match-platform"

/** Flip to true when TikTok OAuth + publish is production-ready. */
export const TIKTOK_PUBLISHING_ENABLED = false

/** Flip to true when Facebook publish is production-ready (no publish adapter yet). */
export const FACEBOOK_PUBLISHING_ENABLED = false

export const TIKTOK_PUBLISHING_COMING_SOON_MESSAGE =
  "TikTok publishing coming soon"

export function isTikTokPublishingAvailable(): boolean {
  return TIKTOK_PUBLISHING_ENABLED
}

function isFacebookPlatform(platform: string): boolean {
  const normalized = platform.trim().toLowerCase()
  return normalized === "facebook" || normalized.includes("facebook")
}

export function isMarketingPlatformSelectable(platform: string): boolean {
  const normalized = platform.trim().toLowerCase()
  if (!normalized) return false

  if (isTikTokPlatform(normalized)) {
    return isTikTokPublishingAvailable()
  }

  if (isFacebookPlatform(normalized)) {
    return FACEBOOK_PUBLISHING_ENABLED
  }

  if (normalized.includes("instagram")) {
    return true
  }

  return false
}

/** User-facing platform label — maps hidden TikTok rows to Instagram Reels in beta. */
export function getMarketingPlatformDisplayLabel(platform: string): string {
  const trimmed = platform.trim()
  if (!trimmed) return "Instagram"

  if (isTikTokPlatform(trimmed) && !isTikTokPublishingAvailable()) {
    return "Instagram Reels"
  }

  if (trimmed.toLowerCase() === "instagram") return "Instagram"
  if (trimmed.toLowerCase() === "facebook") return "Facebook"
  if (trimmed.toLowerCase() === "linkedin") return "LinkedIn"
  if (trimmed.toLowerCase() === "youtube") return "YouTube"
  if (trimmed.toLowerCase() === "tiktok") return "TikTok"

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

export function resolvePlatformFromBrandFocus(focus: string): string {
  const normalized = focus.trim().toLowerCase()

  if (normalized.includes("instagram")) return "instagram"
  if (normalized.includes("linkedin")) return "linkedin"
  if (normalized.includes("facebook")) return "facebook"
  if (normalized.includes("youtube")) return "youtube"
  if (normalized.includes("tiktok") && isTikTokPublishingAvailable()) {
    return "tiktok"
  }

  return "instagram"
}
