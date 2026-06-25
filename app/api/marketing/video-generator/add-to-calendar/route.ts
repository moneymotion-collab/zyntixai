import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { addVideoToCalendar } from "@/lib/marketing/schedule-marketing-video"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    )
  }

  let body: { video_id?: unknown }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const videoId =
    typeof body.video_id === "string" ? body.video_id.trim() : ""

  if (!videoId) {
    return NextResponse.json({ error: "video_id is required." }, { status: 400 })
  }

  try {
    const result = await addVideoToCalendar({
      supabase,
      userId: authResult.auth.userId,
      isAdmin: authResult.auth.isAdmin,
      videoId,
    })

    return NextResponse.json({
      success: true,
      video: result.video,
      content_post: result.contentPost,
      calendar_url: result.calendarUrl,
      already_exists: result.alreadyExists,
      message: result.message,
    })
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not add video to calendar.",
      },
      { status: 400 },
    )
  }
}
