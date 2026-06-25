import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { normalizeScheduledDate } from "@/lib/marketing/normalize-scheduled-date"
import { clampViralScore } from "@/lib/marketing/viral-score"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  console.log("SAVE POST API TRIGGERED")

  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    console.log("AUTH ERROR:", authResult.error)
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    )
  }

  let body: {
    platform?: unknown
    content?: unknown
    hook?: unknown
    post_type?: unknown
    scheduled_date?: unknown
    viral_score?: unknown
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  console.log("BODY:", body)

  const {
    platform: rawPlatform,
    content: rawContent,
    hook: rawHook,
    post_type: rawPostType,
    scheduled_date: rawScheduledDate,
    viral_score: rawViralScore,
  } = body

  const platform = typeof rawPlatform === "string" ? rawPlatform.trim() : ""
  const content = typeof rawContent === "string" ? rawContent.trim() : ""
  const hook = typeof rawHook === "string" ? rawHook.trim() : ""
  const post_type = typeof rawPostType === "string" ? rawPostType.trim() : ""
  const scheduled_date = normalizeScheduledDate(
    typeof rawScheduledDate === "string" ? rawScheduledDate.trim() : null,
  )
  const viral_score = clampViralScore(rawViralScore)

  let data = null
  let error: { message: string } | null = null

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("INSERT via service role → scheduled_posts")
    const admin = createAdminClient()
    const result = await admin.from("scheduled_posts").insert([
      {
        user_id: authResult.auth.userId,
        platform,
        content,
        hook,
        post_type,
        scheduled_date,
        viral_score,
        status: "draft",
        publish_status: "draft",
      },
    ]).select()
    data = result.data
    error = result.error
  } else {
    console.log("INSERT via user session → scheduled_posts")
    const result = await supabase.from("scheduled_posts").insert([
      {
        user_id: authResult.auth.userId,
        platform,
        content,
        hook,
        post_type,
        scheduled_date,
        viral_score,
        status: "draft",
        publish_status: "draft",
      },
    ]).select()
    data = result.data
    error = result.error
  }

  console.log("DATA:", data)
  console.log("ERROR:", error)

  if (error) {
    return NextResponse.json(
      {
        error:
          error.message +
          " — Fix: Supabase SQL Editor → run: alter table public.scheduled_posts disable row level security; OR add SUPABASE_SERVICE_ROLE_KEY to .env.local",
      },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, data })
}
