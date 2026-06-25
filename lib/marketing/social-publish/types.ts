export type PublishablePost = {
  id: string
  platform: string
  text: string
  content?: string
  hashtags?: string
  userId?: string
  imageUrl?: string | null
  videoUrl?: string | null
}

export type PublishResult = {
  ok: boolean
  platform: string
  postId: string
  externalId?: string
  simulated?: boolean
  error?: string
}

export type SocialPublishEnv = {
  instagramAccessToken?: string
  instagramUserId?: string
  instagramDefaultImageUrl?: string
  tiktokAccessToken?: string
  tiktokDefaultVideoUrl?: string
  linkedinAccessToken?: string
  linkedinAuthorUrn?: string
}
