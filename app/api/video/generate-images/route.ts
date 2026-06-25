import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateVideoProjectImages } from "@/lib/marketing/generate-scene-images"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

function parseVideoProjectId(body: unknown): string {
  if (!body || typeof body !== "object") return ""

  const record = body as { videoProjectId?: unknown; videoId?: unknown }

  if (typeof record.videoProjectId === "string" && record.videoProjectId.trim()) {
    return record.videoProjectId.trim()
  }

  if (typeof record.videoId === "string" && record.videoId.trim()) {
    return record.videoId.trim()
  }

  return ""
}

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const videoProjectId = parseVideoProjectId(await req.json())

    if (!videoProjectId) {
      return NextResponse.json(
        { error: "videoProjectId is required" },
        { status: 400 },
      )
    }

    const { generated } = await generateVideoProjectImages({
      supabase,
      videoProjectId,
      userId: user.id,
    })

    return NextResponse.json({ success: true, generated })
  } catch (error) {
    console.error("VIDEO_GENERATE_IMAGES_ERROR:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate scene images",
      },
      { status: 500 },
    )
  }
}
