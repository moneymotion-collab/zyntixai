import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { normalizeInstagramPublishError } from "@/lib/marketing/instagram/publish-errors"

export async function markContentPostPublishFailed(
  supabase: SupabaseClient<Database>,
  contentPostId: string,
  ownerScopeId: string,
  rawMessage: string,
  options?: {
    keepScheduled?: boolean
    now?: string
  },
) {
  const now = options?.now ?? new Date().toISOString()
  const { message } = normalizeInstagramPublishError(rawMessage)
  const status = options?.keepScheduled ? "scheduled" : "failed"

  await supabase
    .from("content_posts")
    .update({
      status,
      publish_error: message,
      updated_at: now,
    })
    .eq("id", contentPostId)
    .or(`user_id.eq.${ownerScopeId},created_by.eq.${ownerScopeId}`)
}
