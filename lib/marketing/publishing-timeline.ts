import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"
import type { ContentPostStatus } from "@/lib/marketing/content-post-status"
import { parseContentPostStatus } from "@/lib/marketing/content-post-status"
import { getPostContentTypeDisplay } from "@/lib/marketing/post-performance-preview"
import {
  getPipelineStage,
  PIPELINE_STAGE_LABELS,
  type PipelineStage,
} from "@/lib/marketing/post-pipeline"

export type PublishingTimelineEntry = {
  id: string
  title: string
  platform: string
  contentType: string
  status: ContentPostStatus
  pipelineStage: PipelineStage
  statusLabel: string
  scheduledAt: string
  dateLabel: string
  timeLabel: string
  weekdayLabel: string
  isPast: boolean
}

function formatTimelineDate(iso: string): {
  dateLabel: string
  timeLabel: string
  weekdayLabel: string
} {
  const date = new Date(iso)

  return {
    weekdayLabel: date.toLocaleDateString(undefined, { weekday: "long" }),
    dateLabel: date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    timeLabel: date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }),
  }
}

function getTimelineTimestamp(post: MarketingPost): string | null {
  const scheduled = post.scheduled_at?.trim()
  if (scheduled) return scheduled

  const status = (post.status ?? "").trim().toLowerCase()
  if (status === "published" && post.published_at?.trim()) {
    return post.published_at.trim()
  }

  return null
}

export function buildPublishingTimeline(
  posts: MarketingPost[],
): PublishingTimelineEntry[] {
  const now = Date.now()

  return posts
    .flatMap((post) => {
      const scheduledAt = getTimelineTimestamp(post)
      if (!scheduledAt) return []

      const status = parseContentPostStatus(post.status) ?? "draft"
      if (status === "published") return []

      const pipelineStage = getPipelineStage(post)
      const { dateLabel, timeLabel, weekdayLabel } =
        formatTimelineDate(scheduledAt)

      return [
        {
          id: post.id,
          title: post.title,
          platform: post.platform?.trim() || "Social",
          contentType: getPostContentTypeDisplay(post),
          status,
          pipelineStage,
          statusLabel: PIPELINE_STAGE_LABELS[pipelineStage],
          scheduledAt,
          dateLabel,
          timeLabel,
          weekdayLabel,
          isPast: Date.parse(scheduledAt) < now,
        },
      ]
    })
    .sort(
      (a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt),
    )
}

export function getPublishingTimelinePosts(
  posts: MarketingPost[],
  useDemoContent: boolean,
  getDemoPosts: () => MarketingPost[],
): PublishingTimelineEntry[] {
  const entries = buildPublishingTimeline(posts)
  if (entries.length > 0 || !useDemoContent) return entries
  return buildPublishingTimeline(getDemoPosts())
}
