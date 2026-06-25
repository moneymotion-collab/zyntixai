import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { generateVideoScript } from "@/lib/marketing/generate-video-script"
import {
  createMarketingVideo,
} from "@/lib/marketing/schedule-marketing-video"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST() {
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

  const result = await generateVideoScript()

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  try {
    const video = await createMarketingVideo({
      supabase,
      userId: authResult.auth.userId,
      script: result.script,
    })

    return NextResponse.json({
      video,
      script: result.script,
      warning: result.warning,
    })
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not save generated video.",
      },
      { status: 500 },
    )
  }
}
