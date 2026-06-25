import type { Database } from "@/lib/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { ContentPerformanceRow } from "@/lib/marketing/content-performance/types"

export type AnalyticsContentPostEmbed = Pick<
  Database["public"]["Tables"]["content_posts"]["Row"],
  "title" | "category"
> &
  Partial<
    Pick<
      Database["public"]["Tables"]["content_posts"]["Row"],
      | "caption"
      | "content_type"
      | "topic"
      | "platform"
      | "scheduled_at"
      | "published_at"
      | "viral_score"
      | "brand_id"
    >
  >

export const CONTENT_POST_ANALYTICS_SELECT =
  "id, title, category, caption, content_type, topic, platform, scheduled_at, published_at, viral_score, brand_id"

export type PerformanceRowWithPost = ContentPerformanceRow & {
  content_posts: AnalyticsContentPostEmbed | null
}

export async function attachContentPostsToPerformanceRows(
  supabase: SupabaseClient<Database>,
  rows: ContentPerformanceRow[],
): Promise<{ data: PerformanceRowWithPost[] | null; error: Error | null }> {
  if (rows.length === 0) {
    return { data: [], error: null }
  }

  const postIds = [
    ...new Set(
      rows
        .map((row) => row.post_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  ]

  if (postIds.length === 0) {
    return {
      data: rows.map((row) => ({ ...row, content_posts: null })),
      error: null,
    }
  }

  const { data: posts, error } = await supabase
    .from("content_posts")
    .select(CONTENT_POST_ANALYTICS_SELECT)
    .in("id", postIds)

  if (error) {
    return { data: null, error }
  }

  const postMap = new Map(
    (posts ?? []).map((post) => {
      const { id: _id, ...embed } = post
      return [post.id, embed as AnalyticsContentPostEmbed]
    }),
  )

  return {
    data: rows.map((row) => ({
      ...row,
      content_posts: row.post_id ? (postMap.get(row.post_id) ?? null) : null,
    })),
    error: null,
  }
}

export function resolvePerformanceBrandId(
  row: PerformanceRowWithPost,
  fallbackBrandId = "",
): string {
  const postBrandId = row.content_posts?.brand_id?.trim()
  if (postBrandId) return postBrandId
  return fallbackBrandId
}
