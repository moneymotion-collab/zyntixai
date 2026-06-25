import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { loadVideoScript } from "@/lib/marketing/schedule-marketing-video"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

type RouteContext = {
  params: Promise<{ videoProjectId: string }>
}

export async function GET(_req: Request, context: RouteContext) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  try {
    const supabase = await createClient()
    const { videoProjectId } = await context.params

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (!videoProjectId?.trim()) {
      return NextResponse.json(
        { error: "videoProjectId is required" },
        { status: 400 },
      )
    }

    const { data: project, error: projectError } = await supabase
      .from("video_projects")
      .select("id")
      .eq("id", videoProjectId.trim())
      .eq("user_id", user.id)
      .maybeSingle()

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 })
    }

    if (!project) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 })
    }

    const { video, script } = await loadVideoScript(supabase, videoProjectId.trim())

    return NextResponse.json({
      videoProject: video,
      script,
      mascotImageUrl: video.mascot_image_url,
      thumbnailUrl: video.thumbnail_url,
    })
  } catch (error) {
    console.error("VIDEO_PROJECT_GET_ERROR:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load video project",
      },
      { status: 500 },
    )
  }
}
