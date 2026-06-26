import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { normalizeScheduledDate } from "@/lib/marketing/normalize-scheduled-date"
import { formatVideoHashtags } from "@/lib/marketing/parse-video-script"
import { applyStyleThumbnailDefaults } from "@/lib/marketing/video-thumbnail-guides"
import { enrichScenesWithCinematics } from "@/lib/marketing/video-scene-cinematics"
import { enrichScenesWithImagePrompts } from "@/lib/marketing/build-scene-image-prompt"
import type { VideoScript } from "@/lib/marketing/video-script-types"
import { normalizeGeneratorVideoStyle } from "@/lib/marketing/video-styles"
import { getVideoSceneAssetFields } from "@/lib/marketing/app-showcase-engine"
import {
  syncContentPostMediaFromVideoProject,
} from "@/lib/marketing/sync-content-post-media"
import { resolveVideoProjectPublishUrl } from "@/lib/marketing/video-publish-url"

function buildThumbnailFields(
  video: Database["public"]["Tables"]["video_projects"]["Row"],
  scenes: VideoScript["scenes"],
): Pick<VideoScript, "thumbnail_title" | "thumbnail_text" | "thumbnail_visual"> {
  const style = normalizeGeneratorVideoStyle(video.style ?? undefined)

  return applyStyleThumbnailDefaults(
    style,
    video.hook ?? video.prompt,
    video.cta ?? "",
    scenes,
    video.thumbnail_title?.trim() ?? "",
    video.thumbnail_text?.trim() ?? "",
    video.thumbnail_visual?.trim() ?? "",
  )
}

type CreateMarketingVideoInput = {
  supabase: SupabaseClient<Database>
  userId: string
  script: VideoScript
  platform?: string
  brandName?: string
}

async function insertVideoScenes(
  supabase: SupabaseClient<Database>,
  videoId: string,
  script: VideoScript,
) {
  const scenesToInsert = script.scenes.map((scene, index) => ({
    video_id: videoId,
    scene_index: index + 1,
    text: scene.text,
    visual: scene.visual ?? "",
    image_prompt: scene.image_prompt,
    camera_motion: scene.camera_motion,
    transition: scene.transition,
    duration: scene.duration,
    style: script.style,
    ...getVideoSceneAssetFields(scene),
  }))

  const { error } = await supabase.from("video_scenes").insert(scenesToInsert)

  if (error) {
    throw new Error(error.message)
  }
}

export async function createMarketingVideo({
  supabase,
  userId,
  script,
  platform = "instagram",
  brandName = "ZyntixAI",
}: CreateMarketingVideoInput) {
  const { data, error } = await supabase
    .from("video_projects")
    .insert({
      user_id: userId,
      brand_name: brandName,
      prompt: script.hook,
      platform,
      status: "ready",
      hook: script.hook,
      cta: script.cta,
      style: script.style,
      music_mood: script.musicMood ?? null,
      mascot_name: script.mascot?.name ?? null,
      mascot_description: script.mascot?.description ?? null,
      mascot_style: script.mascot?.style ?? null,
      caption: script.caption ?? null,
      hashtags: script.hashtags ?? [],
      thumbnail_title: script.thumbnail_title,
      thumbnail_text: script.thumbnail_text,
      thumbnail_visual: script.thumbnail_visual,
      video_url: null,
    })
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await insertVideoScenes(supabase, data.id, script)

  return data
}

type ScheduleMarketingVideoInput = {
  supabase: SupabaseClient<Database>
  userId: string
  isAdmin: boolean
  videoId: string
  scheduledAt: string
}

function buildCaption(script: VideoScript): string {
  if (script.caption?.trim()) {
    return script.caption.trim()
  }

  const sceneLines = script.scenes.map((scene) => scene.text).join("\n")
  return [script.hook, sceneLines, script.cta].filter(Boolean).join("\n\n")
}

function buildVideoProjectTitle(
  video: Database["public"]["Tables"]["video_projects"]["Row"],
): string {
  return (
    video.hook?.trim() ||
    video.thumbnail_title?.trim() ||
    video.prompt?.trim() ||
    "Untitled video"
  )
}

function resolveVideoUrl(
  video: Database["public"]["Tables"]["video_projects"]["Row"],
): string | null {
  return resolveVideoProjectPublishUrl(video)
}

function buildContentPostFieldsFromVideoProject(
  video: Database["public"]["Tables"]["video_projects"]["Row"],
  script: VideoScript,
) {
  return {
    title: buildVideoProjectTitle(video),
    caption: video.caption?.trim() || buildCaption(script),
    hashtags: formatVideoHashtags(
      video.hashtags?.length ? video.hashtags : script.hashtags,
    ),
    platform: video.platform || "instagram",
    topic: script.style || video.style || "Short-form video",
    video_url: resolveVideoUrl(video),
  }
}

function buildDraftContentPostInsert(
  video: Database["public"]["Tables"]["video_projects"]["Row"],
  script: VideoScript,
  userId: string,
) {
  const postFields = buildContentPostFieldsFromVideoProject(video, script)

  return {
    user_id: userId,
    created_by: userId,
    title: postFields.title,
    caption: postFields.caption,
    hashtags: postFields.hashtags,
    platform: postFields.platform,
    content_type: "video" as const,
    status: "draft" as const,
    scheduled_at: null,
    published_at: null,
    publish_error: null,
    external_post_id: null,
    video_url: postFields.video_url,
    video_project_id: video.id,
    category: "Workout",
    goal: "Increase Engagement",
    topic: postFields.topic,
  }
}

export async function loadVideoScript(
  supabase: SupabaseClient<Database>,
  videoId: string,
): Promise<{ video: Database["public"]["Tables"]["video_projects"]["Row"]; script: VideoScript }> {
  const { data: video, error: videoError } = await supabase
    .from("video_projects")
    .select("*")
    .eq("id", videoId)
    .maybeSingle()

  if (videoError) {
    throw new Error(videoError.message)
  }

  if (!video) {
    throw new Error("Video not found.")
  }

  const { data: sceneRows, error: scenesError } = await supabase
    .from("video_scenes")
    .select("*")
    .eq("video_id", videoId)
    .order("scene_index", { ascending: true })

  if (scenesError) {
    throw new Error(scenesError.message)
  }

  const scenes = enrichScenesWithCinematics(
    (sceneRows ?? []).map((scene) => ({
      text: scene.text,
      visual: scene.visual ?? "",
      image_prompt: scene.image_prompt ?? "",
      camera_motion: scene.camera_motion ?? "",
      transition: scene.transition ?? "",
      duration: Number(scene.duration),
      ...(scene.asset_key ? { asset_key: scene.asset_key } : {}),
      ...(scene.asset_url ? { asset_url: scene.asset_url } : {}),
      ...(scene.image_url ? { image_url: scene.image_url, imageUrl: scene.image_url } : {}),
      ...(scene.image_status ? { image_status: scene.image_status } : {}),
      ...(scene.narration_audio_url
        ? { narrationAudioUrl: scene.narration_audio_url }
        : {}),
      ...(scene.audio_status ? { audio_status: scene.audio_status } : {}),
      ...(scene.ui_focus_area ? { ui_focus_area: scene.ui_focus_area } : {}),
      ...(scene.cursor_action ? { cursor_action: scene.cursor_action } : {}),
      ...(scene.overlay_text ? { overlay_text: scene.overlay_text } : {}),
      ...(scene.narration ? { narration: scene.narration } : {}),
      ...(scene.professional_purpose
        ? { professional_purpose: scene.professional_purpose }
        : {}),
      ...(scene.workflow_step ? { workflow_step: scene.workflow_step } : {}),
    })),
    normalizeGeneratorVideoStyle(video.style ?? sceneRows?.[0]?.style),
  )

  const mascot =
    video.mascot_name || video.mascot_description || video.mascot_style
      ? {
          name: video.mascot_name ?? "",
          description: video.mascot_description ?? "",
          style: video.mascot_style ?? "",
          personality: "",
        }
      : undefined

  const script: VideoScript = {
    hook: video.hook ?? video.prompt,
    cta: video.cta ?? "",
    style: video.style ?? sceneRows?.[0]?.style ?? "",
    ...(video.workflow_type ? { workflow_type: video.workflow_type } : {}),
    ...(video.workflow_summary ? { workflow_summary: video.workflow_summary } : {}),
    musicMood: video.music_mood ?? undefined,
    caption: video.caption ?? undefined,
    hashtags: video.hashtags ?? [],
    ...buildThumbnailFields(video, scenes),
    mascot,
    scenes: enrichScenesWithImagePrompts(scenes, mascot),
  }

  return { video, script }
}

export async function scheduleMarketingVideo({
  supabase,
  userId,
  isAdmin,
  videoId,
  scheduledAt,
}: ScheduleMarketingVideoInput) {
  const normalizedScheduledAt = normalizeScheduledDate(scheduledAt)
  if (!normalizedScheduledAt) {
    throw new Error("A valid scheduled_at date is required.")
  }

  const draftResult = await addVideoToCalendar({
    supabase,
    userId,
    isAdmin,
    videoId,
  })

  const { script } = await loadVideoScript(supabase, videoId)
  const postFields = buildContentPostFieldsFromVideoProject(draftResult.video, script)
  const contentPostId = draftResult.contentPost.id

  const { data: contentPost, error: contentPostError } = await supabase
    .from("content_posts")
    .update({
      status: "scheduled",
      scheduled_at: normalizedScheduledAt,
      published_at: null,
      publish_error: null,
      video_url: postFields.video_url ?? draftResult.contentPost.video_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contentPostId)
    .select("*")
    .single()

  if (contentPostError) {
    throw new Error(contentPostError.message)
  }

  const { data: updatedVideo, error: updateError } = await supabase
    .from("video_projects")
    .update({
      status: "scheduled",
      content_post_id: contentPost.id,
    })
    .eq("id", videoId)
    .select("*")
    .single()

  if (updateError) {
    throw new Error(updateError.message)
  }

  return {
    video: updatedVideo,
    contentPost,
    calendarUrl: buildVideoCalendarWorkflowUrl(contentPost.id),
    message: "Video scheduled for publishing.",
  }
}

type AddVideoToCalendarInput = {
  supabase: SupabaseClient<Database>
  userId: string
  isAdmin: boolean
  videoId: string
}

export const VIDEO_CALENDAR_WORKFLOW_PATH = "/marketing/scheduled"

export function buildVideoCalendarWorkflowUrl(
  contentPostId: string,
  options?: { added?: boolean },
): string {
  const params = new URLSearchParams({
    status: "draft",
    post: contentPostId,
  })

  if (options?.added) {
    params.set("added", "1")
  }

  return `${VIDEO_CALENDAR_WORKFLOW_PATH}?${params.toString()}`
}

export async function addVideoToCalendar({
  supabase,
  userId,
  isAdmin,
  videoId,
}: AddVideoToCalendarInput) {
  let videoQuery = supabase
    .from("video_projects")
    .select("*")
    .eq("id", videoId)

  if (!isAdmin) {
    videoQuery = videoQuery.eq("user_id", userId)
  }

  const { data: existingVideo, error: videoError } = await videoQuery.maybeSingle()

  if (videoError) {
    throw new Error(videoError.message)
  }

  if (!existingVideo) {
    throw new Error("Video not found.")
  }

  if (existingVideo.content_post_id) {
    const { data: existingPost, error: existingPostError } = await supabase
      .from("content_posts")
      .select("*")
      .eq("id", existingVideo.content_post_id)
      .maybeSingle()

    if (existingPostError) {
      throw new Error(existingPostError.message)
    }

    if (existingPost) {
      const syncedPost = await syncContentPostMediaFromVideoProject(
        supabase,
        existingPost,
      )

      return {
        video: existingVideo,
        contentPost: syncedPost,
        calendarUrl: buildVideoCalendarWorkflowUrl(syncedPost.id),
        alreadyExists: true,
        message: syncedPost.video_url || syncedPost.image_url
          ? "Video draft updated with latest media."
          : "Video is already on your calendar.",
      }
    }
  }

  const { script } = await loadVideoScript(supabase, videoId)

  const { data: contentPost, error: contentPostError } = await supabase
    .from("content_posts")
    .insert(buildDraftContentPostInsert(existingVideo, script, userId))
    .select("*")
    .single()

  if (contentPostError) {
    throw new Error(contentPostError.message)
  }

  const { data: updatedVideo, error: updateError } = await supabase
    .from("video_projects")
    .update({
      content_post_id: contentPost.id,
    })
    .eq("id", existingVideo.id)
    .select("*")
    .single()

  if (updateError) {
    throw new Error(updateError.message)
  }

  return {
    video: updatedVideo,
    contentPost,
    calendarUrl: buildVideoCalendarWorkflowUrl(contentPost.id, { added: true }),
    alreadyExists: false,
    message: "Video added to calendar as a draft.",
  }
}
