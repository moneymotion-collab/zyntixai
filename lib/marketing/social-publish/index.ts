import {
  isInstagramPlatform,
  isLinkedInPlatform,
  isTikTokPlatform,
} from "./match-platform"
import {
  isTikTokPublishingAvailable,
  TIKTOK_PUBLISHING_COMING_SOON_MESSAGE,
} from "@/lib/marketing/platform-availability"
import { publishToInstagram } from "./publish-to-instagram"
import { publishToLinkedIn } from "./publish-to-linkedin"
import { publishToTikTok } from "./publish-to-tiktok"
import type { PublishablePost, PublishResult, SocialPublishEnv } from "./types"

export type { PublishablePost, PublishResult, SocialPublishEnv } from "./types"
export { publishToInstagram } from "./publish-to-instagram"
export { publishToTikTok } from "./publish-to-tiktok"
export { publishToLinkedIn } from "./publish-to-linkedin"
export {
  scheduledPostToPublishable,
  contentPostToPublishable,
} from "./from-db-post"

export function socialEnvFromProcess(): SocialPublishEnv {
  return {
    instagramAccessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    instagramUserId: process.env.INSTAGRAM_USER_ID,
    instagramDefaultImageUrl: process.env.INSTAGRAM_DEFAULT_IMAGE_URL,
    tiktokAccessToken: process.env.TIKTOK_ACCESS_TOKEN,
    tiktokDefaultVideoUrl: process.env.TIKTOK_DEFAULT_VIDEO_URL,
    linkedinAccessToken: process.env.LINKEDIN_ACCESS_TOKEN,
    linkedinAuthorUrn: process.env.LINKEDIN_AUTHOR_URN,
  }
}

export function socialEnvFromGetter(
  get: (key: string) => string | undefined,
): SocialPublishEnv {
  return {
    instagramAccessToken: get("INSTAGRAM_ACCESS_TOKEN"),
    instagramUserId: get("INSTAGRAM_USER_ID"),
    instagramDefaultImageUrl: get("INSTAGRAM_DEFAULT_IMAGE_URL"),
    tiktokAccessToken: get("TIKTOK_ACCESS_TOKEN"),
    tiktokDefaultVideoUrl: get("TIKTOK_DEFAULT_VIDEO_URL"),
    linkedinAccessToken: get("LINKEDIN_ACCESS_TOKEN"),
    linkedinAuthorUrn: get("LINKEDIN_AUTHOR_URN"),
  }
}

type SupportedPlatform = "instagram" | "tiktok" | "linkedin"

function resolvePlatform(platform: string): SupportedPlatform | null {
  if (isInstagramPlatform(platform)) return "instagram"
  if (isTikTokPlatform(platform)) return "tiktok"
  if (isLinkedInPlatform(platform)) return "linkedin"
  return null
}

export async function publishPostToSocial(
  post: PublishablePost,
  env: SocialPublishEnv,
): Promise<PublishResult> {
  switch (resolvePlatform(post.platform)) {
    case "instagram":
      return publishToInstagram(post, env)

    case "tiktok":
      if (!isTikTokPublishingAvailable()) {
        return {
          ok: false,
          platform: "tiktok",
          postId: post.id,
          error: TIKTOK_PUBLISHING_COMING_SOON_MESSAGE,
        }
      }
      return publishToTikTok(post, env)

    case "linkedin":
      return publishToLinkedIn(post, env)

    default:
      console.log("[social] unsupported platform, skipping", {
        postId: post.id,
        platform: post.platform,
      })

      return {
        ok: true,
        platform: post.platform,
        postId: post.id,
        simulated: true,
      }
  }
}
