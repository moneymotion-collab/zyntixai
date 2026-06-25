import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { publishContentPostToInstagram } from "@/lib/marketing/instagram/publish-content-post-instagram"
import { isInstagramPlatform, isTikTokPlatform } from "@/lib/marketing/platform-utils"
import {
  isTikTokPublishingAvailable,
  TIKTOK_PUBLISHING_COMING_SOON_MESSAGE,
} from "@/lib/marketing/platform-availability"
import {
  socialEnvFromProcess,
  type SocialPublishEnv,
} from "@/lib/marketing/social-publish"
import {
  publishPostToSocial,
  contentPostToPublishable,
} from "@/lib/marketing/social-publish"

type ContentPost = Database["public"]["Tables"]["content_posts"]["Row"]

export type PublishContentPostResult =
  | {
      ok: true
      externalPostId?: string | null
      social?: Awaited<ReturnType<typeof publishPostToSocial>>
      ownerId?: string
    }
  | { ok: false; error: string; ownerId?: string }

export async function publishContentPost(
  supabase: SupabaseClient<Database>,
  post: ContentPost,
  env: SocialPublishEnv = socialEnvFromProcess(),
): Promise<PublishContentPostResult> {
  if (isInstagramPlatform(post.platform)) {
    const result = await publishContentPostToInstagram(supabase, post)

    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
        ownerId: result.ownerId,
      }
    }

    return {
      ok: true,
      externalPostId: result.externalPostId,
      ownerId: result.ownerId,
    }
  }

  if (isTikTokPlatform(post.platform) && !isTikTokPublishingAvailable()) {
    return {
      ok: false,
      error: TIKTOK_PUBLISHING_COMING_SOON_MESSAGE,
    }
  }

  const social = await publishPostToSocial(contentPostToPublishable(post), env)

  if (!social.ok) {
    return {
      ok: false,
      error: social.error ?? `Publish failed for ${post.platform}`,
    }
  }

  return { ok: true, social }
}
