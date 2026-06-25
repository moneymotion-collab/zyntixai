import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { generateVideoScriptFromPrompt } from "@/lib/video-script-generator"
import { loadLearningContextBlock } from "@/lib/marketing/learning/load-learning-context"
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

  let body: unknown

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const prompt =
    body &&
    typeof body === "object" &&
    "prompt" in body &&
    typeof (body as { prompt: unknown }).prompt === "string"
      ? (body as { prompt: string }).prompt
      : ""

  if (!prompt.trim()) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 })
  }

  const { context: learningContext } = await loadLearningContextBlock(
    supabase,
    authResult.auth.userId,
  )

  const result = await generateVideoScriptFromPrompt(prompt, learningContext)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    title: result.script.title,
    hook: result.script.hook,
    scenes: result.script.scenes,
    voiceover: result.script.voiceover,
    subtitles: result.script.subtitles,
    CTA: result.script.CTA,
    warning: result.warning,
  })
}
