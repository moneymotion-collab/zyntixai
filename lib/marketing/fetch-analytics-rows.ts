import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { filterDemoRowsForWorkspace } from "@/lib/demo/workspace-data-filter"
import {
  attachContentPostsToPerformanceRows,
  resolvePerformanceBrandId,
  type AnalyticsContentPostEmbed,
  type PerformanceRowWithPost,
} from "@/lib/marketing/content-performance/attach-content-posts"
import { fetchWorkspaceMode } from "@/lib/workspace/workspace-mode"

/** Unified analytics view model for Marketing AI (backed by content_performance). */
export type AnalyticsRow = {
  id: string
  brand_id: string
  post_id: string | null
  platform: string
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  created_at: string
}

export type AnalyticsRowWithPost = AnalyticsRow & {
  content_posts: AnalyticsContentPostEmbed | null
}

export type { AnalyticsContentPostEmbed } from "@/lib/marketing/content-performance/attach-content-posts"

export type FetchAnalyticsRowsOptions = {
  userId: string
  isAdmin?: boolean
  brandId?: string
  minViews?: number
}

async function fetchScopedPerformanceRows(
  supabase: SupabaseClient<Database>,
  options: FetchAnalyticsRowsOptions,
) {
  let query = supabase
    .from("content_performance")
    .select("*")
    .order("created_at", { ascending: false })

  if (!options.isAdmin) {
    query = query.eq("created_by", options.userId)
  }

  if (typeof options.minViews === "number") {
    query = query.gt("views", options.minViews)
  }

  const { data, error } = await query

  if (error) {
    return { data: null, error }
  }

  const workspaceMode = await fetchWorkspaceMode(supabase, options.userId)
  const filteredRows = filterDemoRowsForWorkspace(data ?? [], workspaceMode)

  const { data: withPosts, error: postsError } =
    await attachContentPostsToPerformanceRows(supabase, filteredRows)

  if (postsError || !withPosts) {
    return { data: null, error: postsError }
  }

  let brandScoped = withPosts

  if (options.brandId?.trim()) {
    const brandId = options.brandId.trim()
    brandScoped = withPosts.filter((row) => {
      const postBrandId = row.content_posts?.brand_id?.trim()
      if (!postBrandId) return true
      return postBrandId === brandId
    })
  }

  return {
    data: brandScoped.map((row) =>
      mapPerformanceRowToAnalyticsRow(row, options.brandId?.trim() ?? ""),
    ),
    error: null,
  }
}

export function mapPerformanceRowToAnalyticsRow(
  row: PerformanceRowWithPost,
  fallbackBrandId = "",
): AnalyticsRowWithPost {
  const embed =
    row.content_posts ??
    ({
      title: row.title?.trim() || "Untitled post",
      category: row.content_type?.trim() || "post",
      caption: "",
      content_type: row.content_type,
      platform: row.platform,
    } satisfies AnalyticsContentPostEmbed)

  return {
    id: row.id,
    brand_id: resolvePerformanceBrandId(row, fallbackBrandId),
    post_id: row.post_id,
    platform: row.platform,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    saves: row.saves,
    created_at: row.created_at,
    content_posts: embed,
  }
}

async function resolveFetchOptions(
  supabase: SupabaseClient<Database>,
  options?: Partial<FetchAnalyticsRowsOptions>,
): Promise<FetchAnalyticsRowsOptions | { error: Error }> {
  if (options?.userId?.trim()) {
    return {
      userId: options.userId.trim(),
      isAdmin: options.isAdmin ?? false,
      brandId: options.brandId,
      minViews: options.minViews,
    }
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: new Error("Not authenticated.") }
  }

  return {
    userId: user.id,
    isAdmin: options?.isAdmin ?? false,
    brandId: options?.brandId,
    minViews: options?.minViews,
  }
}

export async function fetchAnalyticsRows(
  supabase: SupabaseClient<Database>,
  options?: Partial<FetchAnalyticsRowsOptions>,
): Promise<{ data: AnalyticsRowWithPost[] | null; error: Error | null }> {
  const resolved = await resolveFetchOptions(supabase, options)

  if ("error" in resolved) {
    return { data: null, error: resolved.error }
  }

  return fetchScopedPerformanceRows(supabase, resolved)
}

export async function fetchAnalyticsRowsByBrandId(
  supabase: SupabaseClient<Database>,
  brandId: string,
  options?: Pick<FetchAnalyticsRowsOptions, "userId" | "isAdmin">,
): Promise<{ data: AnalyticsRowWithPost[] | null; error: Error | null }> {
  const resolved = await resolveFetchOptions(supabase, {
    ...options,
    brandId,
  })

  if ("error" in resolved) {
    return { data: null, error: resolved.error }
  }

  return fetchScopedPerformanceRows(supabase, resolved)
}

export async function fetchAnalyticsRowsForBrandInsights(
  supabase: SupabaseClient<Database>,
  brandId: string,
  options?: Pick<FetchAnalyticsRowsOptions, "userId" | "isAdmin">,
): Promise<{ data: AnalyticsRowWithPost[] | null; error: Error | null }> {
  const resolved = await resolveFetchOptions(supabase, {
    ...options,
    brandId,
    minViews: 0,
  })

  if ("error" in resolved) {
    return { data: null, error: resolved.error }
  }

  const result = await fetchScopedPerformanceRows(supabase, {
    ...resolved,
    minViews: 0,
  })

  if (!result.data) {
    return result
  }

  return {
    data: result.data.filter((row) => row.views > 0),
    error: null,
  }
}
