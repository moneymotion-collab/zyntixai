import type { Database } from "@/lib/database.types"
import type { CalendarPost } from "@/lib/marketing/calendar-types"
import { isApprovedViralStatus } from "@/lib/marketing/post-pipeline"

export type ContentPostCalendarRow =
  Database["public"]["Tables"]["content_posts"]["Row"]

export function resolveCalendarDisplayStatus(
  status: string | null | undefined,
  viralStatus: string | null | undefined,
): string {
  const normalizedStatus = (status ?? "draft").trim().toLowerCase()

  if (
    normalizedStatus === "published" ||
    normalizedStatus === "publish" ||
    normalizedStatus === "live"
  ) {
    return "published"
  }

  if (normalizedStatus === "failed") return "failed"
  if (normalizedStatus === "scheduled") return "scheduled"

  if (isApprovedViralStatus(viralStatus)) return "approved"

  return "draft"
}

export function resolveCalendarScheduledDate(
  row: Pick<
    ContentPostCalendarRow,
    "scheduled_at" | "published_at" | "created_at" | "status"
  >,
): string | null {
  const scheduledAt = row.scheduled_at?.trim()
  if (scheduledAt) return scheduledAt

  const publishedAt = row.published_at?.trim()
  if (publishedAt && row.status?.trim().toLowerCase() === "published") {
    return publishedAt
  }

  return row.created_at?.trim() || null
}

export function mapContentPostToCalendarPost(
  row: ContentPostCalendarRow,
): CalendarPost {
  const caption = row.caption?.trim() ?? ""
  const hashtags = row.hashtags?.trim() ?? ""
  const content = [caption, hashtags].filter(Boolean).join("\n\n")

  return {
    id: row.id,
    platform: row.platform?.trim() || "Instagram",
    hook: row.title?.trim() || "Untitled",
    content,
    status: resolveCalendarDisplayStatus(row.status, row.viral_status),
    post_type: row.content_type?.trim() || "Reel",
    scheduled_date: resolveCalendarScheduledDate(row),
    viral_status: row.viral_status?.trim() || null,
  }
}

export function mapContentPostsToCalendarPosts(
  rows: ContentPostCalendarRow[],
): CalendarPost[] {
  return rows.map(mapContentPostToCalendarPost)
}
