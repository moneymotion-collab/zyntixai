import type { PublishablePost, PublishResult, SocialPublishEnv } from "./types"

function buildTikTokCaption(post: PublishablePost): string {
  if (post.content !== undefined) {
    const hashtags = post.hashtags?.trim()
    return hashtags ? `${post.content} ${hashtags}` : post.content
  }

  return post.text
}

export async function publishToTikTok(
  post: PublishablePost,
  env: SocialPublishEnv,
): Promise<PublishResult> {
  const accessToken = env.tiktokAccessToken
  const videoUrl = post.videoUrl ?? env.tiktokDefaultVideoUrl

  if (!accessToken || !videoUrl) {
    console.log("[tiktok] simulated publish", { postId: post.id, text: post.text })
    return {
      ok: true,
      platform: "tiktok",
      postId: post.id,
      simulated: true,
    }
  }

  const response = await fetch("https://open.tiktokapis.com/v2/post/publish/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      caption: buildTikTokCaption(post),
      video_url: videoUrl,
    }),
  })

  const payload = (await response.json()) as {
    data?: { publish_id?: string; id?: string }
    error?: { message?: string }
  }

  const externalId = payload.data?.publish_id ?? payload.data?.id

  if (!response.ok || !externalId) {
    return {
      ok: false,
      platform: "tiktok",
      postId: post.id,
      error: payload.error?.message ?? "TikTok publish failed.",
    }
  }

  return {
    ok: true,
    platform: "tiktok",
    postId: post.id,
    externalId,
  }
}
