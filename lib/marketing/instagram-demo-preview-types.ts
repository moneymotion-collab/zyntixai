import type { ContentPostStatus } from "@/lib/marketing/content-post-status"
import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"

export type InstagramPostPerformance = {
  reach: string
  engagement: string
  saves: string
}

export type InstagramDemoProfile = {
  displayName: string
  username: string
  bio: string
  postsCount: number
  followersCount: string
  followingCount: string
  isDemoFallback: boolean
}

export type InstagramDemoPreviewPost = Pick<
  MarketingPost,
  | "id"
  | "title"
  | "caption"
  | "hashtags"
  | "viral_score"
  | "viral_reason"
  | "status"
  | "content_type"
  | "category"
  | "platform"
  | "image_url"
  | "video_url"
> & {
  status: ContentPostStatus | string
  performance?: InstagramPostPerformance
}

export type InstagramDemoPreviewData = {
  profile: InstagramDemoProfile
  posts: InstagramDemoPreviewPost[]
}
