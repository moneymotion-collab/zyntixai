import type { Database } from "@/lib/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { filterDemoRowsForWorkspace } from "@/lib/demo/workspace-data-filter"
import {
  attachContentPostsToPerformanceRows,
} from "@/lib/marketing/content-performance/attach-content-posts"
import {
  mapPerformanceRowToAnalyticsRow,
  type AnalyticsRowWithPost,
} from "@/lib/marketing/fetch-analytics-rows"
import { fetchWorkspaceMode } from "@/lib/workspace/workspace-mode"

export async function fetchRecommendationPerformanceRows(
  supabase: SupabaseClient<Database>,
  userId: string,
  brandId: string,
): Promise<{ data: AnalyticsRowWithPost[] | null; error: Error | null }> {
  const { data: performanceRows, error: performanceError } = await supabase
    .from("content_performance")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false })

  if (performanceError) {
    return { data: null, error: performanceError }
  }

  const workspaceMode = await fetchWorkspaceMode(supabase, userId)
  const filteredRows = filterDemoRowsForWorkspace(
    performanceRows ?? [],
    workspaceMode,
  )

  const { data: withPosts, error: postsError } =
    await attachContentPostsToPerformanceRows(supabase, filteredRows)

  if (postsError || !withPosts) {
    return { data: null, error: postsError }
  }

  const brandScoped = withPosts.filter((row) => {
    if (!row.content_posts) {
      return true
    }

    const postBrandId = row.content_posts.brand_id?.trim()
    if (!postBrandId) {
      return true
    }

    return postBrandId === brandId
  })

  return {
    data: brandScoped.map((row) =>
      mapPerformanceRowToAnalyticsRow(row, brandId),
    ),
    error: null,
  }
}
