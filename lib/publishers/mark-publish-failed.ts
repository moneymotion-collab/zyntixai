import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { normalizeInstagramPublishError } from "@/lib/marketing/instagram/publish-errors"

type PublishRetryRow = {
  id: string
  retry_count?: number | null
}

function formatPublishError(message?: string) {
  const trimmed = message?.trim()
  if (!trimmed) return "Publish failed."
  return normalizeInstagramPublishError(trimmed).message
}

export async function markPublishFailed(
  supabase: SupabaseClient<Database>,
  table: "content_posts" | "scheduled_posts",
  post: PublishRetryRow,
  now = new Date().toISOString(),
  options?: {
    error?: string
    keepScheduled?: boolean
  },
) {
  const retryCount = (post.retry_count ?? 0) + 1

  if (table === "content_posts") {
    await supabase
      .from("content_posts")
      .update({
        status: options?.keepScheduled ? "scheduled" : "failed",
        retry_count: retryCount,
        publish_error: formatPublishError(options?.error),
        updated_at: now,
      })
      .eq("id", post.id)
    return
  }

  await supabase
    .from("scheduled_posts")
    .update({
      status: options?.keepScheduled ? "scheduled" : "failed",
      publish_status: options?.keepScheduled ? "scheduled" : "failed",
      retry_count: retryCount,
      publish_error: formatPublishError(options?.error),
    })
    .eq("id", post.id)
}
