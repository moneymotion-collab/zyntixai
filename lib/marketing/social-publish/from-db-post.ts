import { formatCaption } from "./format-caption"
import type { PublishablePost } from "./types"

type ScheduledPostRow = {
  id: string
  platform: string
  hook: string
  content: string
  user_id: string
  media_url?: string | null
  media_type?: string | null
}

type ContentPostRow = {
  id: string
  platform: string
  title: string
  caption: string
  hashtags: string
  created_by: string
  video_url?: string | null
}

export function scheduledPostToPublishable(
  post: ScheduledPostRow,
): PublishablePost {
  const content = formatCaption([post.hook, post.content])
  return {
    id: post.id,
    platform: post.platform,
    text: content,
    content,
    userId: post.user_id,
    imageUrl:
      post.media_type?.toUpperCase() === "IMAGE" ? post.media_url ?? null : null,
    videoUrl:
      post.media_type?.toUpperCase() === "IMAGE"
        ? null
        : post.media_url ?? null,
  }
}

export function contentPostToPublishable(post: ContentPostRow): PublishablePost {
  const content = formatCaption([post.title, post.caption])
  return {
    id: post.id,
    platform: post.platform,
    text: formatCaption([content, post.hashtags]),
    content,
    hashtags: post.hashtags,
    userId: post.created_by,
    videoUrl: post.video_url ?? null,
  }
}
