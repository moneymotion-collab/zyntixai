import { NextResponse } from "next/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"
import {
  generateVideoVoiceover,
  parseVideoProjectId,
} from "@/lib/marketing/generate-video-voiceover"
import { createClient } from "@/lib/supabase/server"

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

    const { voiceoverUrl, voiceoverScript, subtitles } = await generateVideoVoiceover({
      supabase,
      videoProjectId,
      userId: user.id,
    })

    return NextResponse.json({
      success: true,
      voiceoverUrl,
      voiceoverScript,
      subtitles,
    })
  } catch (error) {
    console.error("VIDEO_GENERATE_VOICEOVER_ERROR:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate voiceover",
      },
      { status: 500 },
    )
  }
}
