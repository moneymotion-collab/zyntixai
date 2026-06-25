import type { Database } from "@/lib/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { PostPerformanceMetrics } from "@/lib/marketing/analytics/update-post-performance"

type PostForPerformance = Pick<
  Database["public"]["Tables"]["content_posts"]["Row"],
  "id" | "title" | "platform" | "content_type" | "created_by" | "user_id"
>

function followersGainedFromMetrics(metrics: PostPerformanceMetrics): number {
  return Math.max(Math.round(metrics.shares * 0.4 + metrics.saves * 0.25), 0)
}

export async function upsertContentPerformanceRow(
  supabase: SupabaseClient<Database>,
  post: PostForPerformance,
  metrics: PostPerformanceMetrics,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const createdBy = post.created_by || post.user_id

  const { data: existing, error: fetchError } = await supabase
    .from("content_performance")
    .select("id")
    .eq("post_id", post.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError) {
    return { ok: false, error: fetchError.message }
  }

  const payload = {
    views: metrics.views,
    likes: metrics.likes,
    comments: metrics.comments,
    shares: metrics.shares,
    saves: metrics.saves,
    followers_gained: followersGainedFromMetrics(metrics),
    platform: post.platform?.trim() || "",
    title: post.title?.trim() || "Untitled post",
    content_type: post.content_type?.trim() || "post",
  }

  if (existing?.id) {
    const { error } = await supabase
      .from("content_performance")
      .update(payload)
      .eq("id", existing.id)

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true }
  }

  const { error: insertError } = await supabase.from("content_performance").insert({
    ...payload,
    created_by: createdBy,
    post_id: post.id,
  })

  if (insertError) {
    return { ok: false, error: insertError.message }
  }

  return { ok: true }
}
