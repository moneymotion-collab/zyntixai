import { loadOrCreateBrandProfile } from "@/lib/marketing/brand-profile"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { ensurePostAnalyticsRow } from "@/lib/marketing/analytics/ensure-post-analytics-row"
import { fetchInstagramMediaMetrics } from "@/lib/marketing/analytics/fetch-instagram-media-metrics"
import type { WorkspaceMode } from "@/lib/workspace/workspace-mode"
import { isMockSyncEnabled } from "@/lib/marketing/analytics/is-mock-sync-enabled"
import { loadInstagramCredentials } from "@/lib/marketing/analytics/load-instagram-credentials"
import { mockMetricsForPost } from "@/lib/marketing/analytics/mock-post-metrics"
import {
  updatePostPerformance,
  type PostPerformanceMetrics,
} from "@/lib/marketing/analytics/update-post-performance"
import { isInstagramPlatform } from "@/lib/marketing/social-publish/match-platform"

type PublishedPost = Pick<
  Database["public"]["Tables"]["content_posts"]["Row"],
  "id" | "brand_id" | "platform" | "created_by" | "user_id" | "published_at"
>

export type SyncPostAnalyticsMode = "real" | "mock"

export type SyncPostAnalyticsResult =
  | { ok: true; updated: number; mode: SyncPostAnalyticsMode }
  | { ok: false; error: string }

async function fetchPublishedPostsForBrand(
  supabase: SupabaseClient<Database>,
  brandId: string,
  userId: string,
): Promise<{ posts: PublishedPost[]; error: string | null }> {
  const { data, error } = await supabase
    .from("content_posts")
    .select("id, brand_id, platform, created_by, user_id, published_at")
    .eq("status", "published")
    .or(`brand_id.eq.${brandId},and(brand_id.is.null,created_by.eq.${userId})`)
    .order("published_at", { ascending: false })

  if (error) {
    return { posts: [], error: error.message }
  }

  return { posts: (data ?? []) as PublishedPost[], error: null }
}

export async function syncPostAnalytics(
  supabase: SupabaseClient<Database>,
  userId: string,
  workspaceMode: WorkspaceMode = "live",
): Promise<SyncPostAnalyticsResult> {
  const { profile, error: brandError } = await loadOrCreateBrandProfile(
    supabase,
    userId,
  )

  if (brandError || !profile) {
    return {
      ok: false,
      error: brandError ?? "Could not load brand profile.",
    }
  }

  const { posts: publishedPosts, error: postsError } =
    await fetchPublishedPostsForBrand(supabase, profile.id, userId)

  if (postsError) {
    return { ok: false, error: postsError }
  }

  if (publishedPosts.length === 0) {
    return { ok: true, updated: 0, mode: "real" }
  }

  const credentials = await loadInstagramCredentials(supabase, userId)
  const instagramMedia =
    credentials === null
      ? null
      : await fetchInstagramMediaMetrics(credentials)

  const useRealInstagramMetrics =
    credentials !== null && instagramMedia !== null && instagramMedia.length > 0

  const useMockMetrics =
    !useRealInstagramMetrics && isMockSyncEnabled(workspaceMode)
  const mode: SyncPostAnalyticsMode = useRealInstagramMetrics
    ? "real"
    : useMockMetrics
      ? "mock"
      : "real"

  const instagramPosts = publishedPosts.filter((post) =>
    isInstagramPlatform(post.platform),
  )
  const metricsByPostId = new Map<string, PostPerformanceMetrics>()

  if (useRealInstagramMetrics) {
    for (let index = 0; index < instagramPosts.length; index++) {
      const post = instagramPosts[index]
      const media = instagramMedia[index]
      if (!media) break
      metricsByPostId.set(post.id, media.metrics)
    }
  }

  let updated = 0

  for (const post of publishedPosts) {
    const ensured = await ensurePostAnalyticsRow(supabase, post)
    if (!ensured.ok) {
      return { ok: false, error: ensured.error }
    }

    const metrics = metricsByPostId.get(post.id)
    if (metrics) {
      const result = await updatePostPerformance(supabase, post.id, metrics)
      if (!result.ok) {
        return { ok: false, error: result.error }
      }
    } else if (useMockMetrics) {
      const result = await updatePostPerformance(
        supabase,
        post.id,
        mockMetricsForPost(post.id),
      )
      if (!result.ok) {
        return { ok: false, error: result.error }
      }
    }

    updated++
  }

  return { ok: true, updated, mode }
}
