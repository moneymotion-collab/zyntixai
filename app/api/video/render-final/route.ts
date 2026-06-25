import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Json } from "@/lib/database.types"
import {
  GENERATED_VIDEO_STATUS,
  getGeneratedVideoForUser,
  insertGeneratedVideoDraft,
  linkGeneratedVideoToProject,
  loadVideoProjectForRender,
  patchVideoProjectForRender,
  updateGeneratedVideo,
} from "@/lib/marketing/generated-video-record"
import { loadVideoScript } from "@/lib/marketing/schedule-marketing-video"
import { buildFitCoreRenderPropsFromProject } from "@/lib/video/build-render-props"
import {
  isValidVideoUrl,
  logRenderStep,
  RENDER_PIPELINE_STATUS,
} from "@/lib/video/render-pipeline"
import { spawnRenderScript } from "@/lib/video/spawn-render-script"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export const runtime = "nodejs"
export const maxDuration = 300

type RenderFinalRequest = {
  video_project_id?: string
  videoProjectId?: string
  generatedVideoId?: string
}

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  let videoProjectId = ""
  let generatedVideoId: string | null = null

  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  let body: RenderFinalRequest
  try {
    body = (await req.json()) as RenderFinalRequest
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  videoProjectId =
    body.video_project_id?.trim() ?? body.videoProjectId?.trim() ?? ""
  const requestedGeneratedVideoId = body.generatedVideoId?.trim() ?? null

  if (!videoProjectId) {
    return NextResponse.json(
      { error: "video_project_id is required" },
      { status: 400 },
    )
  }

  console.log("[VIDEO_RENDER_FINAL API] selected video_project_id:", videoProjectId)

  logRenderStep(videoProjectId, "API_FINAL_VALIDATE_VIDEO_ID")

  let project: Awaited<ReturnType<typeof loadVideoProjectForRender>>
  try {
    project = await loadVideoProjectForRender(supabase, videoProjectId, user.id)
  } catch (loadError) {
    console.error("VIDEO_PROJECT_SELECT_ERROR:", loadError)
    return NextResponse.json(
      {
        error:
          loadError instanceof Error
            ? loadError.message
            : "Failed to load video project",
      },
      { status: 500 },
    )
  }

  if (!project || project.id !== videoProjectId) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 })
  }

  const { script: projectScript, video: loadedProject } =
    await loadVideoScript(supabase, videoProjectId)

  if (loadedProject.id !== videoProjectId) {
    return NextResponse.json(
      { error: "Loaded project does not match selected video_project_id" },
      { status: 500 },
    )
  }

  const renderProps = buildFitCoreRenderPropsFromProject(
    {
      id: loadedProject.id,
      brand_name: loadedProject.brand_name,
      prompt: loadedProject.prompt,
      hook: loadedProject.hook,
      cta: loadedProject.cta,
    },
    projectScript,
  )

  if (requestedGeneratedVideoId) {
    const requestedGenerated = await getGeneratedVideoForUser(
      supabase,
      requestedGeneratedVideoId,
      user.id,
    )

    if (
      requestedGenerated &&
      requestedGenerated.video_project_id === videoProjectId
    ) {
      generatedVideoId = requestedGeneratedVideoId
    }
  }

  if (!generatedVideoId && project.generated_video_id) {
    const linked = await getGeneratedVideoForUser(
      supabase,
      project.generated_video_id,
      user.id,
    )
    if (linked?.video_project_id === videoProjectId) {
      generatedVideoId = project.generated_video_id
    }
  }

  try {
    if (!generatedVideoId) {
      const created = await insertGeneratedVideoDraft(supabase, {
        userId: user.id,
        title: loadedProject.brand_name,
        prompt: loadedProject.prompt,
        videoType: loadedProject.style ?? "auto",
        script: projectScript,
        videoProjectId,
        renderType: "final",
      })
      generatedVideoId = created.id

      await linkGeneratedVideoToProject(supabase, videoProjectId, generatedVideoId)
    }

    const generatedVideo = await getGeneratedVideoForUser(
      supabase,
      generatedVideoId,
      user.id,
    )

    if (!generatedVideo) {
      return NextResponse.json({ error: "Generated video not found" }, { status: 404 })
    }

    if (
      generatedVideo.video_project_id &&
      generatedVideo.video_project_id !== videoProjectId
    ) {
      return NextResponse.json(
        {
          error:
            "Generated video belongs to a different project. Generate a new script first.",
        },
        { status: 409 },
      )
    }

    await updateGeneratedVideo(supabase, generatedVideoId, {
      script: projectScript as unknown as Json,
      video_project_id: videoProjectId,
      title: loadedProject.brand_name,
      prompt: loadedProject.prompt,
    })

    const startedAt = new Date().toISOString()

    await updateGeneratedVideo(supabase, generatedVideoId, {
      status: GENERATED_VIDEO_STATUS.RENDERING,
      render_type: "final",
      render_started_at: startedAt,
      render_finished_at: null,
      render_error: null,
      video_url: null,
      video_project_id: videoProjectId,
    })

    try {
      await patchVideoProjectForRender(
        supabase,
        videoProjectId,
        user.id,
        {
          status: RENDER_PIPELINE_STATUS.PROCESSING,
          final_render_status: RENDER_PIPELINE_STATUS.PROCESSING,
          final_render_error: null,
          final_render_url: null,
          render_started_at: startedAt,
          render_finished_at: null,
        },
        generatedVideoId,
      )
    } catch (markRenderingError) {
      console.error("VIDEO_PROJECT_UPDATE_ERROR:", markRenderingError)
      return NextResponse.json(
        {
          error:
            markRenderingError instanceof Error
              ? markRenderingError.message
              : "Failed to update video project",
        },
        { status: 500 },
      )
    }

    logRenderStep(videoProjectId, "API_FINAL_SPAWN_SCRIPT", generatedVideoId)

    const parsed = await spawnRenderScript(
      "render-final-video-by-id.mjs",
      [videoProjectId],
      {
        VIDEO_PROJECT_ID: videoProjectId,
        GENERATED_VIDEO_ID: generatedVideoId,
        RENDER_INPUT_PROPS: JSON.stringify(renderProps),
      },
    )

    if (!isValidVideoUrl(parsed.videoUrl)) {
      throw new Error("Final render finished without a valid video URL")
    }

    logRenderStep(videoProjectId, "API_FINAL_COMPLETED", parsed.videoUrl)

    const cacheBustedUrl = parsed.videoUrl
      ? `${parsed.videoUrl}${parsed.videoUrl.includes("?") ? "&" : "?"}v=${Date.now()}`
      : parsed.videoUrl

    return NextResponse.json({
      success: true,
      generatedVideoId,
      status: RENDER_PIPELINE_STATUS.COMPLETED,
      renderStatus: RENDER_PIPELINE_STATUS.COMPLETED,
      videoUrl: cacheBustedUrl,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const finishedAt = new Date().toISOString()

    logRenderStep(videoProjectId, "API_FINAL_FAILED", message)

    await patchVideoProjectForRender(
      supabase,
      videoProjectId,
      user.id,
      {
        status: RENDER_PIPELINE_STATUS.FAILED,
        final_render_status: RENDER_PIPELINE_STATUS.FAILED,
        final_render_error: message,
        render_finished_at: finishedAt,
      },
    )

    if (generatedVideoId) {
      await updateGeneratedVideo(supabase, generatedVideoId, {
        status: GENERATED_VIDEO_STATUS.FAILED,
        render_error: message,
        render_finished_at: finishedAt,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
        status: RENDER_PIPELINE_STATUS.FAILED,
        generatedVideoId,
      },
      { status: 500 },
    )
  }
}
