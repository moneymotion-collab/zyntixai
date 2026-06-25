import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { filterDemoRowsForWorkspace } from "@/lib/demo/workspace-data-filter"
import {
  mapContentPostsToCalendarPosts,
  type ContentPostCalendarRow,
} from "@/lib/marketing/map-content-post-to-calendar"
import type { CalendarPost } from "@/lib/marketing/calendar-types"
import type { WorkspaceMode } from "@/lib/workspace/workspace-mode"

export type FetchCalendarPostsInput = {
  supabase: SupabaseClient<Database>
  userId: string
  isAdmin: boolean
  workspaceMode: WorkspaceMode
}

export type FetchCalendarPostsResult =
  | { ok: true; posts: CalendarPost[] }
  | { ok: false; error: string }

export async function fetchCalendarPosts(
  input: FetchCalendarPostsInput,
): Promise<FetchCalendarPostsResult> {
  const { supabase, userId, isAdmin, workspaceMode } = input

  let query = supabase
    .from("content_posts")
    .select("*")
    .order("updated_at", { ascending: false })

  if (!isAdmin) {
    query = query.eq("created_by", userId)
  }

  const { data, error } = await query

  if (error) {
    return { ok: false, error: error.message }
  }

  const filtered = filterDemoRowsForWorkspace(
    (data ?? []) as ContentPostCalendarRow[],
    workspaceMode,
  )

  return {
    ok: true,
    posts: mapContentPostsToCalendarPosts(filtered),
  }
}
