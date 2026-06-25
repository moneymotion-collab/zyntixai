import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { publishInstagramWithConnection } from "@/lib/marketing/instagram/publish-with-connection"
import {
  formatInstagramPublishError,
  normalizeInstagramPublishError,
} from "@/lib/marketing/instagram/publish-errors"
import { resolveContentPostOwnerId } from "@/lib/marketing/instagram/resolve-content-post-owner"
import { validateInstagramConnectionForPublish } from "@/lib/marketing/instagram/validate-connection-for-publish"
import { resolveInstagramMediaForContentPost } from "@/lib/marketing/resolve-instagram-content-post-media"
import { formatCaption } from "@/lib/marketing/social-publish/format-caption"

type ContentPost = Database["public"]["Tables"]["content_posts"]["Row"]

export type PublishInstagramContentPostResult =
  | { ok: true; externalPostId: string; ownerId: string }
  | { ok: false; error: string; ownerId: string }

function buildPostCaption(post: ContentPost): string {
  return formatCaption([
    formatCaption([post.title, post.caption]),
    post.hashtags,
  ])
}

export async function publishContentPostToInstagram(
  supabase: SupabaseClient<Database>,
  post: ContentPost,
): Promise<PublishInstagramContentPostResult> {
  const ownerId = resolveContentPostOwnerId(post)

  const connectionResult = await validateInstagramConnectionForPublish(
    supabase,
    ownerId,
  )

  if (!connectionResult.ok) {
    return {
      ok: false,
      error: connectionResult.error,
      ownerId,
    }
  }

  const mediaResult = await resolveInstagramMediaForContentPost(supabase, post)

  if (!mediaResult.ok) {
    console.error("[instagram] content post media validation failed", {
      postId: mediaResult.syncedPost.id,
      ownerId,
      error: mediaResult.error,
    })

    return {
      ok: false,
      error: formatInstagramPublishError(
        "invalid_media_url",
        mediaResult.error,
      ),
      ownerId,
    }
  }

  const publishResult = await publishInstagramWithConnection(
    connectionResult.value.connection,
    {
      caption: buildPostCaption(mediaResult.syncedPost),
      mediaUrl: mediaResult.mediaUrl,
      mediaType: mediaResult.mediaType,
    },
  )

  if (!publishResult.ok) {
    const normalized = normalizeInstagramPublishError(publishResult.error)
    return {
      ok: false,
      error: normalized.message,
      ownerId,
    }
  }

  if (!publishResult.mediaId) {
    return {
      ok: false,
      error: formatInstagramPublishError("instagram_api_error"),
      ownerId,
    }
  }

  return {
    ok: true,
    externalPostId: publishResult.mediaId,
    ownerId,
  }
}
