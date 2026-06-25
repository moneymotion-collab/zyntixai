import type { PublishablePost, PublishResult, SocialPublishEnv } from "./types"
import { publishInstagramWithConnection } from "@/lib/marketing/instagram/publish-with-connection"
import {
  inferInstagramMediaType,
  validateInstagramMediaUrl,
} from "@/lib/marketing/instagram/validate-media-url"

function buildInstagramCaption(post: PublishablePost): string {
  if (post.content !== undefined) {
    const hashtags = post.hashtags?.trim()
    return hashtags ? `${post.content}\n\n${hashtags}` : post.content
  }

  return post.text
}

function resolveLegacyMedia(post: PublishablePost, env: SocialPublishEnv) {
  const videoUrl = post.videoUrl?.trim() || null
  const imageUrl = post.imageUrl?.trim() || env.instagramDefaultImageUrl?.trim() || null

  if (videoUrl) {
    return {
      mediaUrl: videoUrl,
      mediaType: inferInstagramMediaType(videoUrl, "REEL"),
    }
  }

  if (imageUrl) {
    return {
      mediaUrl: imageUrl,
      mediaType: "IMAGE" as const,
    }
  }

  return null
}

export async function publishToInstagram(
  post: PublishablePost,
  env: SocialPublishEnv,
): Promise<PublishResult> {
  const accessToken = env.instagramAccessToken
  const userId = env.instagramUserId
  const resolved = resolveLegacyMedia(post, env)

  if (!accessToken || !userId || !resolved) {
    console.log("[instagram] simulated publish", { postId: post.id, text: post.text })
    return {
      ok: true,
      platform: "instagram",
      postId: post.id,
      simulated: true,
    }
  }

  const mediaValidation = validateInstagramMediaUrl(resolved.mediaUrl)
  if (!mediaValidation.ok) {
    console.error("[instagram] legacy publish media validation failed", {
      postId: post.id,
      media_url: resolved.mediaUrl,
      error: mediaValidation.error,
    })

    return {
      ok: false,
      platform: "instagram",
      postId: post.id,
      error: mediaValidation.error,
    }
  }

  const publishResult = await publishInstagramWithConnection(
    {
      access_token: accessToken,
      instagram_business_account_id: userId,
    },
    {
      caption: buildInstagramCaption(post),
      mediaUrl: mediaValidation.url,
      mediaType: resolved.mediaType,
    },
  )

  if (!publishResult.ok) {
    return {
      ok: false,
      platform: "instagram",
      postId: post.id,
      error: publishResult.error,
    }
  }

  if (!publishResult.mediaId) {
    return {
      ok: false,
      platform: "instagram",
      postId: post.id,
      error: "Instagram did not return a media id. Post was not published.",
    }
  }

  return {
    ok: true,
    platform: "instagram",
    postId: post.id,
    externalId: publishResult.mediaId,
  }
}
