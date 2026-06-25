import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { generateSubtitlesFromVoiceover } from "@/lib/subtitles"
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

  const record =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {}

  const voiceover =
    typeof record.voiceover === "string" ? record.voiceover.trim() : ""

  if (!voiceover) {
    return NextResponse.json({ error: "voiceover is required." }, { status: 400 })
  }

  const durationSeconds =
    typeof record.durationSeconds === "number" &&
    Number.isFinite(record.durationSeconds)
      ? record.durationSeconds
      : undefined

  const sceneDurations = Array.isArray(record.sceneDurations)
    ? record.sceneDurations
        .map((value) => (typeof value === "number" ? value : Number(value)))
        .filter((value) => Number.isFinite(value) && value > 0)
    : undefined

  const maxWordsPerPhrase =
    typeof record.maxWordsPerPhrase === "number" &&
    Number.isFinite(record.maxWordsPerPhrase)
      ? record.maxWordsPerPhrase
      : undefined

  const subtitles = generateSubtitlesFromVoiceover(voiceover, {
    durationSeconds,
    sceneDurations,
    maxWordsPerPhrase,
  })

  return NextResponse.json({ subtitles })
}
