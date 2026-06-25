import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { syncSingleContentPostAnalytics } from "@/lib/marketing/analytics/sync-single-content-post-analytics"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const postId = typeof body?.postId === "string" ? body.postId.trim() : ""

  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 })
  }

  const result = await syncSingleContentPostAnalytics(supabase, user.id, postId)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({
    success: true,
    metrics: result.metrics,
    engagement_rate: result.engagement_rate,
  })
}
