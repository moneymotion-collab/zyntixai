import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { ensurePostAnalyticsRow } from "@/lib/marketing/analytics/ensure-post-analytics-row"
import type { WorkspaceMode } from "@/lib/workspace/workspace-mode"
import { isMockSyncEnabled } from "@/lib/marketing/analytics/is-mock-sync-enabled"
import { mockMetricsForPost } from "@/lib/marketing/analytics/mock-post-metrics"
import {
  updatePostPerformance,
  type PostPerformanceMetrics,
} from "@/lib/marketing/analytics/update-post-performance"
import type { InstagramConnection } from "@/lib/marketing/instagram/publish-with-connection"
import { isInstagramPlatform } from "@/lib/marketing/social-publish/match-platform"

type SyncablePost = Pick<
  Database["public"]["Tables"]["content_posts"]["Row"],
  | "id"
  | "brand_id"
  | "platform"
  | "created_by"
  | "user_id"
  | "external_post_id"
  | "published_at"
>

type InstagramInsightValue = {
  name: string
  values: Array<{ value: number }>
}

type InstagramInsightsResponse = {
  data?: InstagramInsightValue[]
  error?: { message: string }
}

type InstagramMediaResponse = {
  like_count?: number
  comments_count?: number
  error?: { message: string }
}

export type SyncInstagramMetricsSkipReason =
  | "no_instagram_connection"
  | "no_syncable_posts"

export type SyncInstagramMetricsResult =
  | { ok: true; skipped: true; reason: SyncInstagramMetricsSkipReason }
  | {
      ok: true
      skipped: false
      synced: number
      failed: number
      mode: "real" | "mock"
    }
  | { ok: false; error: string }

function hasExternalPostId(post: SyncablePost): boolean {
  return (
    typeof post.external_post_id === "string" &&
    post.external_post_id.trim().length > 0
  )
}

function metricFromInsights(
  insights: InstagramInsightValue[] | undefined,
  name: string,
): number {
  const entry = insights?.find((item) => item.name === name)
  const value = entry?.values?.[0]?.value
  return typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : 0
}

function metricsFromMediaFields(
  likes: number,
  comments: number,
): PostPerformanceMetrics {
  const views = Math.max(likes + comments, 1) * 10

  return {
    views,
    likes,
    comments,
    shares: Math.floor(likes * 0.08),
    saves: Math.floor(likes * 0.12),
  }
}

export async function fetchInstagramMetricsForMedia(
  accessToken: string,
  mediaId: string,
): Promise<
  { ok: true; metrics: PostPerformanceMetrics } | { ok: false; error: string }
> {
  let likes = 0
  let comments = 0

  try {
    const mediaUrl = new URL(`https://graph.facebook.com/v19.0/${mediaId}`)
    mediaUrl.searchParams.set("fields", "like_count,comments_count")
    mediaUrl.searchParams.set("access_token", accessToken)

    const mediaRes = await fetch(mediaUrl.toString())
    const mediaPayload = (await mediaRes.json()) as InstagramMediaResponse

    if (mediaRes.ok) {
      likes = mediaPayload.like_count ?? 0
      comments = mediaPayload.comments_count ?? 0
    }

    const insightsUrl = new URL(
      `https://graph.facebook.com/v19.0/${mediaId}/insights`,
    )
    insightsUrl.searchParams.set(
      "metric",
      "impressions,reach,saved,shares,likes,comments",
    )
    insightsUrl.searchParams.set("access_token", accessToken)

    const insightsRes = await fetch(insightsUrl.toString())
    const insightsPayload = (await insightsRes.json()) as InstagramInsightsResponse

    if (insightsRes.ok && insightsPayload.data?.length) {
      const views =
        metricFromInsights(insightsPayload.data, "impressions") ||
        metricFromInsights(insightsPayload.data, "reach")
      const insightLikes =
        metricFromInsights(insightsPayload.data, "likes") || likes
      const insightComments =
        metricFromInsights(insightsPayload.data, "comments") || comments

      return {
        ok: true,
        metrics: {
          views: views || Math.max(insightLikes + insightComments, 1) * 10,
          likes: insightLikes,
          comments: insightComments,
          shares: metricFromInsights(insightsPayload.data, "shares"),
          saves: metricFromInsights(insightsPayload.data, "saved"),
        },
      }
    }

    if (mediaRes.ok) {
      return { ok: true, metrics: metricsFromMediaFields(likes, comments) }
    }

    return {
      ok: false,
      error:
        mediaPayload.error?.message ??
        insightsPayload.error?.message ??
        "Instagram metrics request failed.",
    }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Instagram metrics request failed.",
    }
  }
}

async function loadInstagramConnection(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<
  | { ok: true; connection: InstagramConnection }
  | { ok: false; reason: SyncInstagramMetricsSkipReason }
> {
  const { data: connection, error } = await supabase
    .from("social_connections")
    .select("access_token, instagram_business_account_id")
    .eq("user_id", userId)
    .eq("provider", "instagram")
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!connection?.access_token?.trim()) {
    return { ok: false, reason: "no_instagram_connection" }
  }

  return {
    ok: true,
    connection: {
      access_token: connection.access_token.trim(),
      instagram_business_account_id:
        connection.instagram_business_account_id?.trim() ?? "",
    },
  }
}

async function loadPublishedInstagramPosts(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ posts: SyncablePost[]; error: string | null }> {
  const { data, error } = await supabase
    .from("content_posts")
    .select(
      "id, brand_id, platform, created_by, user_id, external_post_id, published_at",
    )
    .eq("status", "published")
    .or(`user_id.eq.${userId},created_by.eq.${userId}`)
    .order("published_at", { ascending: false })

  if (error) {
    return { posts: [], error: error.message }
  }

  const posts = (data ?? []).filter((post) => isInstagramPlatform(post.platform))

  return { posts, error: null }
}

async function updatePostSyncStatuses(
  supabase: SupabaseClient<Database>,
  postId: string,
  statuses: { sync_status: string; metrics_sync_status: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await (supabase as any)
    .from("content_posts")
    .update({
      sync_status: statuses.sync_status,
      metrics_sync_status: statuses.metrics_sync_status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

async function applyMetricsSync(
  supabase: SupabaseClient<Database>,
  post: SyncablePost,
  metrics: PostPerformanceMetrics,
  statuses: { sync_status: string; metrics_sync_status: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ensured = await ensurePostAnalyticsRow(supabase, post)
  if (!ensured.ok) {
    return ensured
  }

  const updateResult = await updatePostPerformance(supabase, post.id, metrics)
  if (!updateResult.ok) {
    return updateResult
  }

  return updatePostSyncStatuses(supabase, post.id, statuses)
}

async function applyMockSync(
  supabase: SupabaseClient<Database>,
  post: SyncablePost,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return applyMetricsSync(supabase, post, mockMetricsForPost(post.id), {
    sync_status: "mock",
    metrics_sync_status: "mock",
  })
}

async function applyRealSync(
  supabase: SupabaseClient<Database>,
  post: SyncablePost,
  metrics: PostPerformanceMetrics,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return applyMetricsSync(supabase, post, metrics, {
    sync_status: "synced",
    metrics_sync_status: "synced",
  })
}

export async function syncInstagramMetricsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  options?: { workspaceMode?: WorkspaceMode },
): Promise<SyncInstagramMetricsResult> {
  const workspaceMode = options?.workspaceMode ?? "live"
  const { posts, error: postsError } = await loadPublishedInstagramPosts(
    supabase,
    userId,
  )

  if (postsError) {
    return { ok: false, error: postsError }
  }

  const mockEnabled = isMockSyncEnabled(workspaceMode)
  const postsWithExternalId = posts.filter(hasExternalPostId)
  const postsWithoutExternalId = mockEnabled
    ? posts.filter((post) => !hasExternalPostId(post))
    : []

  if (postsWithExternalId.length === 0 && postsWithoutExternalId.length === 0) {
    return { ok: true, skipped: true, reason: "no_syncable_posts" }
  }

  let synced = 0
  let failed = 0
  let usedMock = false

  if (postsWithExternalId.length > 0) {
    let connectionResult: Awaited<ReturnType<typeof loadInstagramConnection>>

    try {
      connectionResult = await loadInstagramConnection(supabase, userId)
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not load Instagram connection.",
      }
    }

    if (!connectionResult.ok) {
      if (postsWithoutExternalId.length === 0) {
        return { ok: true, skipped: true, reason: connectionResult.reason }
      }
    } else {
      const accessToken = connectionResult.connection.access_token

      for (const post of postsWithExternalId) {
        const mediaId = post.external_post_id!.trim()
        const fetchResult = await fetchInstagramMetricsForMedia(
          accessToken,
          mediaId,
        )

        if (fetchResult.ok) {
          const result = await applyRealSync(
            supabase,
            post,
            fetchResult.metrics,
          )
          if (!result.ok) {
            return { ok: false, error: result.error }
          }
          synced++
          continue
        }

        if (mockEnabled) {
          const result = await applyMockSync(supabase, post)
          if (!result.ok) {
            return { ok: false, error: result.error }
          }
          usedMock = true
          synced++
          continue
        }

        failed++
        const statusUpdate = await updatePostSyncStatuses(supabase, post.id, {
          sync_status: "failed",
          metrics_sync_status: "failed",
        })
        if (!statusUpdate.ok) {
          return { ok: false, error: statusUpdate.error }
        }
      }
    }
  }

  for (const post of postsWithoutExternalId) {
    const result = await applyMockSync(supabase, post)
    if (!result.ok) {
      return { ok: false, error: result.error }
    }
    usedMock = true
    synced++
  }

  return {
    ok: true,
    skipped: false,
    synced,
    failed,
    mode: usedMock ? "mock" : "real",
  }
}
