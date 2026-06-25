import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import {
  ANALYTICS_SYNC_NO_POSTS_MESSAGE,
  REAL_ANALYTICS_NOT_CONNECTED_MESSAGE,
} from "@/lib/marketing/analytics/analytics-messages"
import { upsertContentPerformanceRow } from "@/lib/marketing/analytics/upsert-content-performance"
import {
  fetchInstagramMetricsForMedia,
} from "@/lib/marketing/instagram/sync-instagram-metrics"
import {
  updatePostPerformance,
  type PostPerformanceMetrics,
} from "@/lib/marketing/analytics/update-post-performance"
import { isInstagramPlatform } from "@/lib/marketing/social-publish/match-platform"

export type SyncSinglePostAnalyticsResult =
  | {
      ok: true
      metrics: PostPerformanceMetrics
      engagement_rate: number
    }
  | { ok: false; error: string; status: number }

async function loadInstagramAccessToken(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string | null> {
  const { data: connection, error } = await supabase
    .from("social_connections")
    .select("access_token")
    .eq("user_id", userId)
    .eq("provider", "instagram")
    .maybeSingle()

  if (error || !connection?.access_token?.trim()) {
    return null
  }

  return connection.access_token.trim()
}

export async function syncSingleContentPostAnalytics(
  supabase: SupabaseClient<Database>,
  userId: string,
  postId: string,
): Promise<SyncSinglePostAnalyticsResult> {
  const { data: post, error: postError } = await supabase
    .from("content_posts")
    .select(
      "id, title, platform, content_type, created_by, user_id, external_post_id, status",
    )
    .eq("id", postId)
    .or(`user_id.eq.${userId},created_by.eq.${userId}`)
    .single()

  if (postError || !post) {
    return { ok: false, error: "Post not found.", status: 404 }
  }

  if (post.status !== "published") {
    return {
      ok: false,
      error: "Only published posts can sync analytics.",
      status: 400,
    }
  }

  if (!isInstagramPlatform(post.platform)) {
    return {
      ok: false,
      error: REAL_ANALYTICS_NOT_CONNECTED_MESSAGE,
      status: 400,
    }
  }

  const externalPostId = post.external_post_id?.trim()
  if (!externalPostId) {
    return {
      ok: false,
      error: ANALYTICS_SYNC_NO_POSTS_MESSAGE,
      status: 400,
    }
  }

  const accessToken = await loadInstagramAccessToken(supabase, userId)
  if (!accessToken) {
    return {
      ok: false,
      error: REAL_ANALYTICS_NOT_CONNECTED_MESSAGE,
      status: 400,
    }
  }

  const fetchResult = await fetchInstagramMetricsForMedia(
    accessToken,
    externalPostId,
  )

  if (!fetchResult.ok) {
    return {
      ok: false,
      error: fetchResult.error,
      status: 502,
    }
  }

  const performanceResult = await upsertContentPerformanceRow(
    supabase,
    post,
    fetchResult.metrics,
  )

  if (!performanceResult.ok) {
    return {
      ok: false,
      error: performanceResult.error,
      status: 500,
    }
  }

  const analyticsResult = await updatePostPerformance(
    supabase,
    post.id,
    fetchResult.metrics,
  )

  if (!analyticsResult.ok) {
    return {
      ok: false,
      error: analyticsResult.error,
      status: 500,
    }
  }

  return {
    ok: true,
    metrics: fetchResult.metrics,
    engagement_rate: analyticsResult.engagement_rate,
  }
}
