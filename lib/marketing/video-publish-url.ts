import type { Database } from "@/lib/database.types"
import { validateInstagramMediaUrl } from "@/lib/marketing/instagram/validate-media-url"

type VideoProject = Pick<
  Database["public"]["Tables"]["video_projects"]["Row"],
  "final_render_status" | "final_render_url" | "render_status" | "video_url"
>

export function isFinalRenderReady(status: string | null | undefined): boolean {
  const value = (status ?? "").trim().toLowerCase()
  return value === "ready" || value === "completed"
}

export function isPreviewRenderReady(status: string | null | undefined): boolean {
  const value = (status ?? "").trim().toLowerCase()
  return value === "ready" || value === "completed"
}

export function isPublicHttpsMediaUrl(url: string | null | undefined): boolean {
  return validateInstagramMediaUrl(url).ok
}

export function resolveVideoProjectPublishUrl(
  video: VideoProject,
): string | null {
  const finalUrl = video.final_render_url?.trim()
  if (
    isFinalRenderReady(video.final_render_status) &&
    finalUrl &&
    isPublicHttpsMediaUrl(finalUrl)
  ) {
    return finalUrl
  }

  return null
}

export function resolveVideoProjectPreviewUrl(
  video: VideoProject,
): string | null {
  const previewUrl = video.video_url?.trim()
  if (!previewUrl || !isPublicHttpsMediaUrl(previewUrl)) {
    return null
  }

  if (isPreviewRenderReady(video.render_status)) {
    return previewUrl
  }

  return previewUrl
}

export const FINAL_RENDER_REQUIRED_MESSAGE =
  "Render the final video in the Video Generator before publishing to Instagram. The live preview is not the same file Instagram receives."

export const MISSING_PUBLISHABLE_MEDIA_MESSAGE =
  "Post needs a rendered video or public image URL before publishing to Instagram. Render the final video in the Video Generator, then try again."
