import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import type { ContentPerformanceRow } from "@/lib/marketing/content-performance/types"

export function mockAnalyticsToContentPerformanceRows(
  rows: AnalyticsRowWithPost[],
  createdBy = "demo",
): ContentPerformanceRow[] {
  return rows.map((row) => ({
    id: row.id,
    post_id: row.post_id,
    created_by: createdBy,
    platform: row.platform,
    title: row.content_posts?.title?.trim() || row.platform || "Untitled post",
    content_type: row.content_posts?.content_type?.trim() || "post",
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    saves: row.saves,
    followers_gained: 0,
    created_at: row.created_at,
  }))
}
