import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import {
  isPublicHttpsMediaUrl,
  resolveVideoProjectPublishUrl,
  resolveVideoProjectPreviewUrl,
} from "@/lib/marketing/video-publish-url"

type ContentPost = Database["public"]["Tables"]["content_posts"]["Row"]
type VideoProject = Database["public"]["Tables"]["video_projects"]["Row"]

export function resolveVideoProjectUrl(video: VideoProject): string | null {
  const publishableUrl = resolveVideoProjectPublishUrl(video)
  if (publishableUrl) {
    return publishableUrl
  }

  return resolveVideoProjectPreviewUrl(video)
}

export function resolveContentPostMedia(post: ContentPost): {
  imageUrl: string | null
  videoUrl: string | null
} {
  const imageUrl = post.image_url?.trim() || null
  const videoUrl = post.video_url?.trim() || null

  return {
    imageUrl: imageUrl && isPublicHttpsMediaUrl(imageUrl) ? imageUrl : null,
    videoUrl: videoUrl && isPublicHttpsMediaUrl(videoUrl) ? videoUrl : null,
  }
}

function buildContentPostMediaUpdates(
  post: ContentPost,
  videoProject: VideoProject,
): {
  video_url?: string | null
  image_url?: string | null
  content_type?: string
  updated_at: string
} | null {
  const publishableVideoUrl = resolveVideoProjectPublishUrl(videoProject)

  const imageUrl =
    videoProject.thumbnail_url?.trim() ||
    videoProject.mascot_image_url?.trim() ||
    null

  const safeImageUrl =
    imageUrl && isPublicHttpsMediaUrl(imageUrl) ? imageUrl : null

  const updates: {
    video_url?: string | null
    image_url?: string | null
    content_type?: string
    updated_at: string
  } = {
    updated_at: new Date().toISOString(),
  }

  let changed = false

  if (publishableVideoUrl && publishableVideoUrl !== post.video_url?.trim()) {
    updates.video_url = publishableVideoUrl
    changed = true
  }

  if (safeImageUrl && !post.image_url?.trim()) {
    updates.image_url = safeImageUrl
    changed = true
  }

  if (publishableVideoUrl || safeImageUrl) {
    updates.content_type = publishableVideoUrl ? "video" : post.content_type || "post"
    if (publishableVideoUrl && post.content_type !== "video") {
      changed = true
    }
  }

  return changed ? updates : null
}

export async function syncContentPostMediaFromVideoProject(
  supabase: SupabaseClient<Database>,
  post: ContentPost,
): Promise<ContentPost> {
  const videoProjectId = post.video_project_id?.trim()

  if (!videoProjectId) {
    return post
  }

  const { data: videoProject, error } = await supabase
    .from("video_projects")
    .select("*")
    .eq("id", videoProjectId)
    .maybeSingle()

  if (error || !videoProject) {
    return post
  }

  const updates = buildContentPostMediaUpdates(post, videoProject)
  if (!updates) {
    return post
  }

  const { data: updatedPost, error: updateError } = await supabase
    .from("content_posts")
    .update(updates)
    .eq("id", post.id)
    .select("*")
    .single()

  if (updateError || !updatedPost) {
    return post
  }

  return updatedPost
}
