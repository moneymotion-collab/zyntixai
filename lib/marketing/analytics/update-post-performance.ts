import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { ensurePostAnalyticsRow } from "@/lib/marketing/analytics/ensure-post-analytics-row"
import { upsertContentPerformanceRow } from "@/lib/marketing/analytics/upsert-content-performance"

export type PostPerformanceMetrics = {
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
}

export type UpdatePostPerformanceResult =
  | { ok: true; engagement_rate: number }
  | { ok: false; error: string }

function normalizeMetric(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return Math.floor(value)
}

function normalizeMetrics(metrics: PostPerformanceMetrics): PostPerformanceMetrics {
  return {
    views: normalizeMetric(metrics.views),
    likes: normalizeMetric(metrics.likes),
    comments: normalizeMetric(metrics.comments),
    shares: normalizeMetric(metrics.shares),
    saves: normalizeMetric(metrics.saves),
  }
}

export async function updatePostPerformance(
  supabase: SupabaseClient<Database>,
  postId: string,
  metrics: PostPerformanceMetrics,
): Promise<UpdatePostPerformanceResult> {
  const normalized = normalizeMetrics(metrics)

  const { data: initialRow, error: fetchError } = await supabase
    .from("analytics")
    .select("id")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError) {
    return { ok: false, error: fetchError.message }
  }

  let row = initialRow

  if (!row) {
    const { data: post, error: postError } = await supabase
      .from("content_posts")
      .select("id, brand_id, platform, created_by, user_id, title, content_type")
      .eq("id", postId)
      .maybeSingle()

    if (postError) {
      return { ok: false, error: postError.message }
    }

    if (!post) {
      return { ok: false, error: "Analytics row not found for post." }
    }

    const ensured = await ensurePostAnalyticsRow(supabase, post)
    if (!ensured.ok) {
      return { ok: false, error: ensured.error }
    }

    const { data: createdRow, error: refetchError } = await supabase
      .from("analytics")
      .select("id")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (refetchError || !createdRow) {
      return {
        ok: false,
        error: refetchError?.message ?? "Analytics row not found for post.",
      }
    }

    row = createdRow
  }

  const { error: updateError } = await supabase
    .from("analytics")
    .update(normalized)
    .eq("id", row.id)

  if (updateError) {
    return { ok: false, error: updateError.message }
  }

  const { data: postForPerformance, error: performancePostError } = await supabase
    .from("content_posts")
    .select("id, title, platform, content_type, created_by, user_id")
    .eq("id", postId)
    .maybeSingle()

  if (performancePostError) {
    return { ok: false, error: performancePostError.message }
  }

  if (postForPerformance) {
    const performanceResult = await upsertContentPerformanceRow(
      supabase,
      postForPerformance,
      normalized,
    )

    if (!performanceResult.ok) {
      return performanceResult
    }
  }

  const engagement_rate =
    normalized.views <= 0
      ? 0
      : Math.round(
          ((normalized.likes + normalized.comments) / normalized.views) * 1000,
        ) / 10

  return { ok: true, engagement_rate }
}
