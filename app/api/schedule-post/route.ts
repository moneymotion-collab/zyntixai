import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { parseContentPostStatus } from "@/lib/marketing/content-post-status"
import { normalizeScheduledDate } from "@/lib/marketing/normalize-scheduled-date"
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

  let body: { post_id?: unknown; scheduled_for?: unknown; status?: unknown }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const postId = typeof body.post_id === "string" ? body.post_id.trim() : ""
  const status = parseContentPostStatus(body.status) ?? "scheduled"
  const scheduledFor = normalizeScheduledDate(
    typeof body.scheduled_for === "string" ? body.scheduled_for.trim() : null,
  )

  if (!postId) {
    return NextResponse.json({ error: "post_id is required." }, { status: 400 })
  }

  if (status === "scheduled" && !scheduledFor) {
    return NextResponse.json(
      { error: "scheduled_for is required when status is scheduled." },
      { status: 400 },
    )
  }

  const now = new Date().toISOString()
  const updates: {
    status: typeof status
    scheduled_at: string | null
    publish_error: null
    updated_at: string
  } = {
    status,
    scheduled_at: status === "scheduled" ? scheduledFor : null,
    publish_error: null,
    updated_at: now,
  }

  let query = supabase
    .from("content_posts")
    .update(updates)
    .eq("id", postId)

  if (!authResult.auth.isAdmin) {
    query = query.eq("created_by", authResult.auth.userId)
  }

  const { data, error } = await query.select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 })
  }

  return NextResponse.json({ success: true, post: data })
}
