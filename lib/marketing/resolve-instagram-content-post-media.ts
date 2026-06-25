import type { Database } from "@/lib/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  inferInstagramMediaType,
  type InstagramMediaType,
  validateInstagramMediaUrl,
} from "@/lib/marketing/instagram/validate-media-url"
import { syncContentPostMediaFromVideoProject } from "@/lib/marketing/sync-content-post-media"
import {
  FINAL_RENDER_REQUIRED_MESSAGE,
  isFinalRenderReady,
  isPublicHttpsMediaUrl,
  MISSING_PUBLISHABLE_MEDIA_MESSAGE,
  resolveVideoProjectPublishUrl,
} from "@/lib/marketing/video-publish-url"

type ContentPost = Database["public"]["Tables"]["content_posts"]["Row"]

export type ResolvedInstagramMedia =
  | {
      ok: true
      mediaUrl: string
      mediaType: InstagramMediaType
      syncedPost: ContentPost
    }
  | { ok: false; error: string; syncedPost: ContentPost }

export async function resolveInstagramMediaForContentPost(
  supabase: SupabaseClient<Database>,
  post: ContentPost,
): Promise<ResolvedInstagramMedia> {
  const syncedPost = await syncContentPostMediaFromVideoProject(supabase, post)
  const videoProjectId = syncedPost.video_project_id?.trim()

  if (videoProjectId) {
    const { data: videoProject } = await supabase
      .from("video_projects")
      .select("final_render_status, final_render_url, render_status, video_url")
      .eq("id", videoProjectId)
      .maybeSingle()

    const publishableFinalUrl = videoProject
      ? resolveVideoProjectPublishUrl(videoProject)
      : null

    if (publishableFinalUrl) {
      return {
        ok: true,
        mediaUrl: publishableFinalUrl,
        mediaType: inferInstagramMediaType(publishableFinalUrl, "REEL"),
        syncedPost,
      }
    }

    const hasUnapprovedPreview =
      Boolean(syncedPost.video_url?.trim() && isPublicHttpsMediaUrl(syncedPost.video_url)) ||
      Boolean(videoProject?.video_url?.trim() && isPublicHttpsMediaUrl(videoProject.video_url))

    if (
      hasUnapprovedPreview &&
      videoProject &&
      !isFinalRenderReady(videoProject.final_render_status)
    ) {
      return {
        ok: false,
        error: FINAL_RENDER_REQUIRED_MESSAGE,
        syncedPost,
      }
    }
  }

  const imageUrl = syncedPost.image_url?.trim()
  if (imageUrl) {
    const imageValidation = validateInstagramMediaUrl(imageUrl)
    if (imageValidation.ok) {
      return {
        ok: true,
        mediaUrl: imageValidation.url,
        mediaType: "IMAGE",
        syncedPost,
      }
    }
  }

  const videoUrl = syncedPost.video_url?.trim()
  if (videoUrl) {
    const videoValidation = validateInstagramMediaUrl(videoUrl)
    if (videoValidation.ok) {
      return {
        ok: true,
        mediaUrl: videoValidation.url,
        mediaType: inferInstagramMediaType(videoValidation.url, "REEL"),
        syncedPost,
      }
    }

    return {
      ok: false,
      error: videoValidation.error,
      syncedPost,
    }
  }

  return {
    ok: false,
    error: MISSING_PUBLISHABLE_MEDIA_MESSAGE,
    syncedPost,
  }
}
