import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { ensurePostAnalyticsRow } from "@/lib/marketing/analytics/ensure-post-analytics-row"
import { parseContentPostStatus } from "@/lib/marketing/content-post-status"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return Response.json(
      { data: null, error: { message: authResult.error } },
      { status: authResult.status },
    )
  }

  const { id, status, scheduled_at, viral_status } = await req.json()
  const parsedStatus = parseContentPostStatus(status)

  if (!parsedStatus && typeof viral_status === "string" && viral_status.trim()) {
    if (typeof id !== "string" || !id.trim()) {
      return Response.json({
        data: null,
        error: { message: "Post id is required." },
      })
    }

    const now = new Date().toISOString()
    let query = supabase
      .from("content_posts")
      .update({
        viral_status: viral_status.trim(),
        updated_at: now,
      })
      .eq("id", id.trim())

    if (!authResult.auth.isAdmin) {
      query = query.eq("created_by", authResult.auth.userId)
    }

    const { data, error } = await query.select().single()
    return Response.json({ data, error })
  }

  if (!parsedStatus) {
    return Response.json({
      data: null,
      error: { message: "Valid status is required." },
    })
  }

  if (parsedStatus === "published") {
    return Response.json({
      data: null,
      error: {
        message:
          "Use the publish API to move posts to published. Direct status updates are not allowed.",
      },
    }, { status: 400 })
  }

  const now = new Date().toISOString()
  const updates: {
    status: typeof parsedStatus
    updated_at: string
    scheduled_at: string | null
    published_at: string | null
  } = {
    status: parsedStatus,
    updated_at: now,
    scheduled_at: null,
    published_at: null,
  }

  if (parsedStatus === "scheduled") {
    const scheduledAt =
      typeof scheduled_at === "string" && scheduled_at.trim()
        ? scheduled_at
        : null

    if (!scheduledAt) {
      return Response.json({
        data: null,
        error: { message: "scheduled_at is required when status is scheduled." },
      })
    }

    updates.scheduled_at = scheduledAt
  } else {
    updates.scheduled_at = null
  }

  let query = supabase.from("content_posts").update(updates).eq("id", id)

  if (!authResult.auth.isAdmin) {
    query = query.eq("created_by", authResult.auth.userId)
  }

  const { data, error } = await query.select().single()

  if (data?.status === "published") {
    await ensurePostAnalyticsRow(supabase, data)
  }

  return Response.json({ data, error })
}
