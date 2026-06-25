import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { postsToContentIdeaCards, type ContentIdeaCard } from "@/lib/marketing/content-idea-cards"
import { filterDemoRowsForWorkspace } from "@/lib/demo/workspace-data-filter"
import { isApprovedViralStatus } from "@/lib/marketing/post-pipeline"
import type { WorkspaceMode } from "@/lib/workspace/workspace-mode"

export type ContentPostDraftRow =
  Database["public"]["Tables"]["content_posts"]["Row"]

export function isContentIdeaDraftPost(
  post: Pick<ContentPostDraftRow, "status" | "viral_status">,
): boolean {
  const status = (post.status ?? "").trim().toLowerCase()
  if (status !== "draft") return false

  const viral = (post.viral_status ?? "").trim().toLowerCase()
  if (!viral || viral === "pending") return true
  if (isApprovedViralStatus(post.viral_status)) return false
  if (viral === "rejected") return false

  return true
}

export type FetchContentIdeaDraftsInput = {
  supabase: SupabaseClient<Database>
  userId: string
  isAdmin: boolean
  workspaceMode: WorkspaceMode
  brandId?: string | null
}

export type FetchContentIdeaDraftsResult =
  | { ok: true; ideas: ContentIdeaCard[] }
  | { ok: false; error: string }

export async function fetchContentIdeaDrafts(
  input: FetchContentIdeaDraftsInput,
): Promise<FetchContentIdeaDraftsResult> {
  const { supabase, userId, isAdmin, workspaceMode, brandId } = input

  let query = supabase
    .from("content_posts")
    .select("*")
    .eq("status", "draft")
    .order("updated_at", { ascending: false })

  if (!isAdmin) {
    query = query.eq("created_by", userId)
  }

  if (brandId?.trim()) {
    query = query.or(`brand_id.eq.${brandId.trim()},brand_id.is.null`)
  }

  const { data, error } = await query

  if (error) {
    return { ok: false, error: error.message }
  }

  const filtered = filterDemoRowsForWorkspace(
    (data ?? []) as ContentPostDraftRow[],
    workspaceMode,
  ).filter(isContentIdeaDraftPost)

  return {
    ok: true,
    ideas: postsToContentIdeaCards(filtered),
  }
}
