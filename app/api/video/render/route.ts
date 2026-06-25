import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Json } from "@/lib/database.types"
import {
  GENERATED_VIDEO_STATUS,
  getGeneratedVideoForUser,
  getLatestGeneratedVideoForProject,
  insertGeneratedVideoDraft,
  linkGeneratedVideoToProject,
  loadVideoProjectForRender,
  loadVideoProjectRenderStatus,
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

export async function GET(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const videoId = new URL(req.url).searchParams.get("videoId")
    const generatedVideoId = new URL(req.url).searchParams.get("generatedVideoId")

    if (!videoId && !generatedVideoId) {
      return NextResponse.json(
        { error: "videoId or generatedVideoId is required" },
        { status: 400 },
      )
    }

    let generatedVideo = generatedVideoId
      ? await getGeneratedVideoForUser(supabase, generatedVideoId, user.id)
      : null

    if (generatedVideoId && !generatedVideo) {
      return NextResponse.json({ error: "Generated video not found" }, { status: 404 })
    }

    const projectVideoId = videoId ?? generatedVideo?.video_project_id ?? null

    const project = projectVideoId
      ? await loadVideoProjectRenderStatus(supabase, projectVideoId, user.id)
      : null

    if (projectVideoId && !project) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    if (!generatedVideo && projectVideoId) {
      generatedVideo = await getLatestGeneratedVideoForProject(
        supabase,
        projectVideoId,
        user.id,
      )
    }

    const videoUrl =
      (isValidVideoUrl(generatedVideo?.video_url) ? generatedVideo?.video_url : null) ??
      (isValidVideoUrl(project?.video_url) ? project?.video_url : null)

    const renderStatus =
      generatedVideo?.status ?? project?.render_status ?? project?.status

    return NextResponse.json({
      success: true,
      status: project?.status,
      renderStatus,
      videoUrl,
      generatedVideoId: generatedVideo?.id ?? null,
      generatedVideo,
      renderError: project?.render_error ?? generatedVideo?.render_error ?? null,
      renderStartedAt:
        project?.render_started_at ?? generatedVideo?.render_started_at ?? null,
      renderFinishedAt:
        project?.render_finished_at ?? generatedVideo?.render_finished_at ?? null,
    })
  } catch (error) {
    console.error("VIDEO_RENDER_STATUS_ERROR:", error)

    return NextResponse.json(
      { error: "Failed to fetch render status" },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  let videoId: string | null = null
  let generatedVideoId: string | null = null

  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = (await req.json()) as {
      video_project_id?: string
      videoId?: string
      generatedVideoId?: string
      _debug?: {
        brandName?: string
        hook?: string
        sceneTexts?: string[]
      }
    }
    const videoProjectId =
      body.video_project_id?.trim() ?? body.videoId?.trim() ?? null
    const requestedGeneratedVideoId = body.generatedVideoId?.trim() ?? null
    videoId = videoProjectId
    generatedVideoId = requestedGeneratedVideoId

    if (!videoProjectId) {
      return NextResponse.json(
        { error: "video_project_id is required" },
        { status: 400 },
      )
    }

    console.log("[VIDEO_RENDER API] client _debug payload:", body._debug ?? null)
    console.log(
      "[VIDEO_RENDER API] requested generated_video_id:",
      requestedGeneratedVideoId ?? "none",
    )

    logRenderStep(videoProjectId, "API_VALIDATE_VIDEO_ID")

    let project: Awaited<ReturnType<typeof loadVideoProjectForRender>>
    try {
      project = await loadVideoProjectForRender(
        supabase,
        videoProjectId,
        user.id,
      )
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

    console.log("[VIDEO_RENDER API] loaded project id:", project.id)
    console.log("[VIDEO_RENDER API] loaded project title:", project.brand_name)

    const { script: projectScript, video: loadedProject } =
      await loadVideoScript(supabase, videoProjectId)

    if (loadedProject.id !== videoProjectId) {
      return NextResponse.json(
        { error: "Loaded project does not match selected video_project_id" },
        { status: 500 },
      )
    }

    console.log("[VIDEO_RENDER API] loaded project script:", {
      hook: projectScript.hook,
      cta: projectScript.cta,
      sceneCount: projectScript.scenes.length,
      scenes: projectScript.scenes.map((scene) => ({
        text: scene.text,
        duration: scene.duration,
        visual_description: scene.visual_description ?? scene.visual,
        image_url: scene.image_url ?? scene.imageUrl,
        screenshot_url: scene.screenshot_url,
        asset_url: scene.asset_url,
      })),
    })

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

    console.log("[VIDEO_RENDER API] render props for Remotion:", renderProps)

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
      } else {
        console.warn(
          "[VIDEO_RENDER API] ignoring mismatched generatedVideoId:",
          requestedGeneratedVideoId,
        )
        generatedVideoId = null
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

    if (!generatedVideoId) {
      logRenderStep(videoProjectId, "API_CREATE_GENERATED_VIDEO_ROW")

      const created = await insertGeneratedVideoDraft(supabase, {
        userId: user.id,
        title: loadedProject.brand_name,
        prompt: loadedProject.prompt,
        videoType: loadedProject.style ?? "auto",
        script: projectScript,
        videoProjectId,
        renderType: "preview",
      })

      generatedVideoId = created.id

      await linkGeneratedVideoToProject(supabase, videoProjectId, generatedVideoId)
    }

    let generatedVideo = await getGeneratedVideoForUser(
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

    generatedVideo = await getGeneratedVideoForUser(
      supabase,
      generatedVideoId,
      user.id,
    )

    if (!generatedVideo) {
      return NextResponse.json(
        { error: "Generated video not found after script sync" },
        { status: 404 },
      )
    }

    console.log("[VIDEO_RENDER API] synced generated_videos.script:", {
      generatedVideoId,
      hook: projectScript.hook,
      sceneCount: projectScript.scenes.length,
    })

    const startedAt = new Date().toISOString()

    await updateGeneratedVideo(supabase, generatedVideoId, {
      status: GENERATED_VIDEO_STATUS.RENDERING,
      render_started_at: startedAt,
      render_finished_at: null,
      render_error: null,
      video_url: null,
      video_project_id: videoProjectId,
    })

    logRenderStep(videoProjectId, "API_MARK_PROCESSING")

    try {
      await patchVideoProjectForRender(
        supabase,
        videoProjectId,
        user.id,
        {
          status: RENDER_PIPELINE_STATUS.PROCESSING,
          render_status: RENDER_PIPELINE_STATUS.PROCESSING,
          render_error: null,
          render_started_at: startedAt,
          render_finished_at: null,
          video_url: null,
        },
        generatedVideoId,
      )
    } catch (updateError) {
      console.error("VIDEO_PROJECT_UPDATE_ERROR:", updateError)
      return NextResponse.json(
        {
          error:
            updateError instanceof Error
              ? updateError.message
              : "Failed to update video project",
        },
        { status: 500 },
      )
    }

    logRenderStep(videoProjectId, "API_SPAWN_SCRIPT", generatedVideoId)

    console.log("[VIDEO_RENDER API] spawning render with:", {
      video_project_id: videoProjectId,
      generated_video_id: generatedVideoId,
      composition: "FitCoreVideoTemplate",
      renderProps,
    })

    const parsed = await spawnRenderScript(
      "render-video-by-id.mjs",
      [videoProjectId],
      {
        VIDEO_PROJECT_ID: videoProjectId,
        GENERATED_VIDEO_ID: generatedVideoId,
        RENDER_INPUT_PROPS: JSON.stringify(renderProps),
      },
    )

    if (!isValidVideoUrl(parsed.videoUrl)) {
      throw new Error("Render finished without a valid video URL")
    }

    logRenderStep(videoProjectId, "API_COMPLETED", parsed.videoUrl)

    const cacheBustedUrl = parsed.videoUrl
      ? `${parsed.videoUrl}${parsed.videoUrl.includes("?") ? "&" : "?"}v=${Date.now()}`
      : parsed.videoUrl

    return NextResponse.json({
      success: true,
      generatedVideoId,
      status: RENDER_PIPELINE_STATUS.COMPLETED,
      renderStatus: RENDER_PIPELINE_STATUS.COMPLETED,
      videoUrl: cacheBustedUrl,
      message: "Video render completed",
      debug: {
        videoProjectId,
        renderProps,
      },
    })
  } catch (error) {
    console.error("VIDEO_RENDER_API_ERROR:", error)

    const message = error instanceof Error ? error.message : String(error)

    if (videoId) {
      logRenderStep(videoId, "API_FAILED", message)

      try {
        const supabase = await createClient()
        const finishedAt = new Date().toISOString()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          await patchVideoProjectForRender(supabase, videoId, user.id, {
            status: RENDER_PIPELINE_STATUS.FAILED,
            render_status: RENDER_PIPELINE_STATUS.FAILED,
            render_error: message,
            render_finished_at: finishedAt,
          })
        }

        if (generatedVideoId) {
          await updateGeneratedVideo(supabase, generatedVideoId, {
            status: GENERATED_VIDEO_STATUS.FAILED,
            render_error: message,
            render_finished_at: finishedAt,
          })
        }
      } catch {
        // Best-effort failure status update.
      }
    }

    return NextResponse.json(
      {
        error: message || "Failed to render video",
        status: RENDER_PIPELINE_STATUS.FAILED,
        generatedVideoId,
      },
      { status: 500 },
    )
  }
}
