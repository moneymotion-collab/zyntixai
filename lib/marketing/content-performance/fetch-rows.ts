import type { Database } from "@/lib/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { filterDemoRowsForWorkspace } from "@/lib/demo/workspace-data-filter"
import { attachContentPostsToPerformanceRows } from "@/lib/marketing/content-performance/attach-content-posts"
import type { ContentPerformanceRow } from "@/lib/marketing/content-performance/types"
import { fetchWorkspaceMode } from "@/lib/workspace/workspace-mode"

export type ContentPerformanceRowEnriched = ContentPerformanceRow & {
  caption?: string | null
}

export async function fetchContentPerformanceRows(
  supabase: SupabaseClient<Database>,
  userId: string,
  isAdmin: boolean,
): Promise<{ data: ContentPerformanceRowEnriched[] | null; error: Error | null }> {
  let query = supabase
    .from("content_performance")
    .select("*")
    .order("created_at", { ascending: false })

  if (!isAdmin) {
    query = query.eq("created_by", userId)
  }

  const { data, error } = await query

  if (error) {
    return { data: null, error }
  }

  const workspaceMode = await fetchWorkspaceMode(supabase, userId)
  const filteredRows = filterDemoRowsForWorkspace(data ?? [], workspaceMode)

  const { data: withPosts, error: postsError } =
    await attachContentPostsToPerformanceRows(supabase, filteredRows)

  if (postsError || !withPosts) {
    return { data: null, error: postsError }
  }

  return {
    data: withPosts.map((row) => ({
      ...row,
      caption: row.content_posts?.caption?.trim() || null,
    })),
    error: null,
  }
}
