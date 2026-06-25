import {
  contentPostToPublishable,
  publishPostToSocial,
  scheduledPostToPublishable,
  socialEnvFromProcess,
  type PublishablePost,
  type PublishResult,
  type SocialPublishEnv,
} from "@/lib/marketing/social-publish"

type ContentPostRow = {
  id: string
  platform: string
  title: string
  caption: string
  hashtags: string
  created_by: string
  video_url?: string | null
}

type ScheduledPostRow = {
  id: string
  platform: string
  hook: string
  content: string
  user_id: string
}

export type PublishPostInput =
  | PublishablePost
  | ContentPostRow
  | ScheduledPostRow

function toPublishable(post: PublishPostInput): PublishablePost {
  if ("text" in post) {
    return post
  }

  if ("hook" in post) {
    return scheduledPostToPublishable(post)
  }

  return contentPostToPublishable(post)
}

export async function publishPost(
  post: PublishPostInput,
  env: SocialPublishEnv = socialEnvFromProcess(),
): Promise<PublishResult> {
  const result = await publishPostToSocial(toPublishable(post), env)

  if (!result.ok) {
    throw new Error(result.error ?? `Publish failed for ${post.platform}`)
  }

  return result
}
