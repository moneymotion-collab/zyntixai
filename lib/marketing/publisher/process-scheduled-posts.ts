import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { ensurePostAnalyticsRow } from "@/lib/marketing/analytics/ensure-post-analytics-row"
import { publishScheduledPostInstagram } from "@/lib/marketing/instagram/publish-scheduled-post"
import { isInstagramPlatform } from "@/lib/marketing/platform-utils"
import {
  socialEnvFromProcess,
  type PublishResult,
  type SocialPublishEnv,
} from "@/lib/marketing/social-publish"
import { publishContentPost } from "@/lib/marketing/publish-content-post"
import { markPublishFailed } from "@/lib/publishers/mark-publish-failed"
import { publishPost } from "@/lib/publishers/publishPost"
import { createAdminClient } from "@/lib/supabase/admin"

type ContentPost = Database["public"]["Tables"]["content_posts"]["Row"]

export type ProcessScheduledPostsResult = {
  message?: string
  success?: boolean
  published: number
  posts: ContentPost[]
  results: PublishResult[]
}

export async function processScheduledPosts(options?: {
  supabase?: SupabaseClient<Database>
  env?: SocialPublishEnv
  now?: string
}): Promise<ProcessScheduledPostsResult> {
  const supabase = options?.supabase ?? createAdminClient()
  const env = options?.env ?? socialEnvFromProcess()
  const now = options?.now ?? new Date().toISOString()

  const results: PublishResult[] = []
  const publishedPosts: ContentPost[] = []

  const { data: dueContent, error: fetchContentError } = await supabase
    .from("content_posts")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_at", now)

  if (fetchContentError) {
    throw new Error(fetchContentError.message)
  }

  for (const post of dueContent ?? []) {
    try {
      const publishResult = await publishContentPost(supabase, post, env)

      if (!publishResult.ok) {
        results.push({
          ok: false,
          platform: post.platform,
          postId: post.id,
          error: publishResult.error,
        })
        await markPublishFailed(supabase, "content_posts", post, now, {
          error: publishResult.error,
          keepScheduled: false,
        })
        continue
      }

      if (!publishResult.externalPostId) {
        const message =
          "Instagram did not return a media id. Post was not marked as published."
        results.push({
          ok: false,
          platform: post.platform,
          postId: post.id,
          error: message,
        })
        await markPublishFailed(supabase, "content_posts", post, now, {
          error: message,
          keepScheduled: false,
        })
        continue
      }

      results.push({
        ok: true,
        platform: post.platform,
        postId: post.id,
        externalId: publishResult.externalPostId,
        ...(publishResult.social ?? {}),
      })

      const { data, error } = await supabase
        .from("content_posts")
        .update({
          status: "published",
          published_at: now,
          external_post_id: publishResult.externalPostId ?? null,
          publish_error: null,
          updated_at: now,
        })
        .eq("id", post.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      if (data) {
        await ensurePostAnalyticsRow(supabase, data)
        publishedPosts.push(data)
      }
    } catch (err) {
      console.error("Publish failed:", err)
      const message =
        err instanceof Error ? err.message : "Publish failed."
      await markPublishFailed(supabase, "content_posts", post, now, {
        error: message,
        keepScheduled: false,
      })
    }
  }

  const { data: dueScheduled, error: fetchScheduledError } = await supabase
    .from("scheduled_posts")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_date", now)

  if (fetchScheduledError) {
    throw new Error(fetchScheduledError.message)
  }

  for (const post of dueScheduled ?? []) {
    try {
      const result = isInstagramPlatform(post.platform)
        ? await publishScheduledPostInstagram(supabase, post, now)
        : await publishPost(post, env)

      results.push(result)

      if (!result.ok) {
        if (!isInstagramPlatform(post.platform)) {
          await markPublishFailed(supabase, "scheduled_posts", post, now, {
            error: result.error,
            keepScheduled: false,
          })
        }
        continue
      }

      if (!result.externalId) {
        const message = "Publish succeeded but no external media id was returned."
        if (!isInstagramPlatform(post.platform)) {
          await markPublishFailed(supabase, "scheduled_posts", post, now, {
            error: message,
            keepScheduled: false,
          })
        }
        continue
      }

      if (!isInstagramPlatform(post.platform)) {
        await supabase
          .from("scheduled_posts")
          .update({
            status: "published",
            publish_status: "published",
            published_at: now,
            publish_error: null,
          })
          .eq("id", post.id)
      }
    } catch (err) {
      console.error("Publish failed:", err)
      const message =
        err instanceof Error ? err.message : "Publish failed."
      await markPublishFailed(supabase, "scheduled_posts", post, now, {
        error: message,
        keepScheduled: false,
      })
    }
  }

  if (results.length === 0) {
    return { message: "No posts to publish", published: 0, posts: [], results: [] }
  }

  return {
    success: true,
    published: publishedPosts.length,
    posts: publishedPosts,
    results,
  }
}
