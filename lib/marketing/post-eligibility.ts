import type { CalendarPost } from "@/lib/marketing/calendar-types"
import { getCalendarPostStatus } from "@/lib/marketing/calendar-display"
import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"
import { isInstagramPlatform, isTikTokPlatform } from "@/lib/marketing/platform-utils"
import { isTikTokPublishingAvailable } from "@/lib/marketing/platform-availability"
import { getPipelineStage, isApprovedViralStatus } from "@/lib/marketing/post-pipeline"

export function isPostPublished(status: string | null | undefined): boolean {
  return (status ?? "").trim().toLowerCase() === "published"
}

export function canApproveMarketingPost(post: MarketingPost): boolean {
  const stage = getPipelineStage(post)
  return stage === "draft" && !isApprovedViralStatus(post.viral_status)
}

export function canApproveCalendarPost(post: CalendarPost): boolean {
  const displayStatus = getCalendarPostStatus(post)
  if (
    displayStatus === "published" ||
    displayStatus === "scheduled" ||
    displayStatus === "failed"
  ) {
    return false
  }
  return !isApprovedViralStatus(post.viral_status)
}

export function canScheduleMarketingPost(post: MarketingPost): boolean {
  const stage = getPipelineStage(post)
  return stage === "draft" || stage === "approved"
}

export function canScheduleCalendarPost(post: CalendarPost): boolean {
  const displayStatus = getCalendarPostStatus(post)
  return displayStatus === "draft" || displayStatus === "approved"
}

export function canPublishMarketingPostToInstagram(
  post: MarketingPost,
  hasInstagramConnection: boolean,
): boolean {
  if (!hasInstagramConnection) return false
  const status = (post.status ?? "").trim().toLowerCase()
  if (status === "published" || status === "failed") return false
  if (!isInstagramPlatform(post.platform)) return false
  return isApprovedViralStatus(post.viral_status) || status === "scheduled"
}

export function canPublishMarketingPostToGenericPlatform(
  post: MarketingPost,
): boolean {
  const status = (post.status ?? "").trim().toLowerCase()
  if (status !== "scheduled") return false
  if (isInstagramPlatform(post.platform)) return false
  if (isTikTokPlatform(post.platform) && !isTikTokPublishingAvailable()) {
    return false
  }
  return true
}

export function shouldShowTikTokPublishingComingSoon(
  platform: string | null | undefined,
): boolean {
  return isTikTokPlatform(platform) && !isTikTokPublishingAvailable()
}

export function canPublishCalendarPostToInstagram(
  post: CalendarPost,
  hasInstagramConnection: boolean,
): boolean {
  if (!hasInstagramConnection) return false
  const displayStatus = getCalendarPostStatus(post)
  if (displayStatus === "published" || displayStatus === "failed") return false
  const platform = (post.platform ?? "").trim().toLowerCase()
  const isInstagram =
    platform === "instagram" || platform.includes("instagram")
  if (!isInstagram) return false
  return isApprovedViralStatus(post.viral_status) || displayStatus === "scheduled"
}

export function confirmInstagramPublishWithoutApproval(
  viralStatus: string | null | undefined,
  isScheduled: boolean,
): boolean {
  if (isApprovedViralStatus(viralStatus)) return true
  if (!isScheduled) return false
  return window.confirm(
    "This post is scheduled but not explicitly approved. Publish to Instagram anyway?",
  )
}
