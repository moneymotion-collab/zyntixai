import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { publishInstagramWithConnection } from "@/lib/marketing/instagram/publish-with-connection"
import { normalizeInstagramPublishError } from "@/lib/marketing/instagram/publish-errors"
import { validateInstagramConnectionForPublish } from "@/lib/marketing/instagram/validate-connection-for-publish"
import {
  inferInstagramMediaType,
  validateInstagramMediaUrl,
} from "@/lib/marketing/instagram/validate-media-url"
import { formatCaption } from "@/lib/marketing/social-publish/format-caption"
import type { PublishResult } from "@/lib/marketing/social-publish/types"

type ScheduledPost = Database["public"]["Tables"]["scheduled_posts"]["Row"]

function buildScheduledPostCaption(post: ScheduledPost): string {
  return formatCaption([post.hook, post.content])
}

async function markScheduledPostFailed(
  supabase: SupabaseClient<Database>,
  postId: string,
  rawMessage: string,
  extra?: Record<string, unknown>,
) {
  const { message } = normalizeInstagramPublishError(rawMessage)

  await supabase
    .from("scheduled_posts")
    .update({
      publish_status: "failed",
      publish_error: message,
      status: "failed",
      ...extra,
    })
    .eq("id", postId)
}

export async function publishScheduledPostInstagram(
  supabase: SupabaseClient<Database>,
  post: ScheduledPost,
  now = new Date().toISOString(),
): Promise<PublishResult> {
  const mediaValidation = validateInstagramMediaUrl(post.media_url)

  if (!mediaValidation.ok) {
    console.error("[instagram] scheduled post media validation failed", {
      postId: post.id,
      media_url: post.media_url ?? null,
      error: mediaValidation.error,
    })

    await markScheduledPostFailed(supabase, post.id, mediaValidation.error)

    return {
      ok: false,
      platform: post.platform,
      postId: post.id,
      error: mediaValidation.error,
    }
  }

  const mediaUrl = mediaValidation.url
  const mediaType = inferInstagramMediaType(mediaUrl, post.media_type)

  const connectionResult = await validateInstagramConnectionForPublish(
    supabase,
    post.user_id,
  )

  if (!connectionResult.ok) {
    await markScheduledPostFailed(
      supabase,
      post.id,
      connectionResult.error,
    )

    return {
      ok: false,
      platform: post.platform,
      postId: post.id,
      error: connectionResult.error,
    }
  }

  const publishResult = await publishInstagramWithConnection(
    connectionResult.value.connection,
    {
      caption: buildScheduledPostCaption(post),
      mediaUrl,
      mediaType,
    },
    {
      onContainerCreated: async (containerId) => {
        await supabase
          .from("scheduled_posts")
          .update({
            instagram_container_id: containerId,
            publish_status: "processing",
            publish_error: null,
            media_url: mediaUrl,
            media_type: mediaType,
          })
          .eq("id", post.id)
      },
    },
  )

  if (!publishResult.ok) {
    const { message } = normalizeInstagramPublishError(publishResult.error)

    await markScheduledPostFailed(supabase, post.id, message, {
      ...(publishResult.containerId
        ? { instagram_container_id: publishResult.containerId }
        : {}),
    })

    return {
      ok: false,
      platform: post.platform,
      postId: post.id,
      error: message,
    }
  }

  if (!publishResult.mediaId) {
    const message =
      "Instagram did not return a media id. Post was not published."

    await markScheduledPostFailed(supabase, post.id, message, {
      instagram_container_id: publishResult.containerId,
    })

    return {
      ok: false,
      platform: post.platform,
      postId: post.id,
      error: message,
    }
  }

  await supabase
    .from("scheduled_posts")
    .update({
      status: "published",
      publish_status: "published",
      instagram_container_id: publishResult.containerId,
      instagram_media_id: publishResult.mediaId,
      published_at: now,
      publish_error: null,
      media_url: mediaUrl,
      media_type: mediaType,
    })
    .eq("id", post.id)

  return {
    ok: true,
    platform: post.platform,
    postId: post.id,
    externalId: publishResult.mediaId,
  }
}
