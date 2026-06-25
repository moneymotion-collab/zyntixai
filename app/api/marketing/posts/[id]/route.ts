import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { ensurePostAnalyticsRow } from "@/lib/marketing/analytics/ensure-post-analytics-row"
import {
  parseContentPostStatus,
  type ContentPostStatus,
} from "@/lib/marketing/content-post-status"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
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

  const { id } = await context.params

  let body: {
    status?: unknown
    scheduled_at?: unknown
  }

  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const status = parseContentPostStatus(body.status)

  if (!status) {
    return NextResponse.json({ error: "Valid status is required." }, { status: 400 })
  }

  if (status === "published") {
    return NextResponse.json(
      {
        error:
          "Use the publish API to move posts to published. Direct status updates are not allowed.",
      },
      { status: 400 },
    )
  }

  const updates: {
    status: ContentPostStatus
    updated_at: string
    scheduled_at?: string | null
    published_at?: string | null
  } = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === "scheduled") {
    const scheduledAt =
      typeof body.scheduled_at === "string" && body.scheduled_at.trim()
        ? body.scheduled_at
        : null

    if (!scheduledAt) {
      return NextResponse.json(
        { error: "scheduled_at is required when status is scheduled." },
        { status: 400 },
      )
    }

    updates.scheduled_at = scheduledAt
    updates.published_at = null
  } else {
    updates.scheduled_at = null
    updates.published_at = null
  }

  let query = supabase.from("content_posts").update(updates).eq("id", id)

  if (!authResult.auth.isAdmin) {
    query = query.eq("created_by", authResult.auth.userId)
  }

  const { data, error } = await query.select("*").single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (data?.status === "published") {
    await ensurePostAnalyticsRow(supabase, data)
  }

  return NextResponse.json({ post: data })
}
