import type { PublishablePost, PublishResult, SocialPublishEnv } from "./types"

function buildLinkedInCaption(post: PublishablePost): string {
  if (post.content !== undefined) {
    const hashtags = post.hashtags?.trim()
    return hashtags ? `${post.content}\n\n${hashtags}` : post.content
  }

  return post.text
}

export async function publishToLinkedIn(
  post: PublishablePost,
  env: SocialPublishEnv,
): Promise<PublishResult> {
  const accessToken = env.linkedinAccessToken
  const authorUrn = env.linkedinAuthorUrn

  if (!accessToken || !authorUrn) {
    console.log("[linkedin] simulated publish", { postId: post.id, text: post.text })
    return {
      ok: true,
      platform: "linkedin",
      postId: post.id,
      simulated: true,
    }
  }

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: buildLinkedInCaption(post),
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  })

  const payload = (await res.json()) as {
    id?: string
    message?: string
    status?: number
  }

  if (!res.ok || !payload.id) {
    return {
      ok: false,
      platform: "linkedin",
      postId: post.id,
      error: payload.message ?? "LinkedIn publish failed.",
    }
  }

  return {
    ok: true,
    platform: "linkedin",
    postId: post.id,
    externalId: payload.id,
  }
}
