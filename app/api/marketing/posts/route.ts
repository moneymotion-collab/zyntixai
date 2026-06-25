import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { ensurePostAnalyticsRow } from "@/lib/marketing/analytics/ensure-post-analytics-row"
import {
  parseContentPostStatus,
  type ContentPostStatus,
} from "@/lib/marketing/content-post-status"
import { filterDemoRowsForWorkspace } from "@/lib/demo/workspace-data-filter"
import { fetchWorkspaceMode } from "@/lib/workspace/workspace-mode"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)
  const status = parseContentPostStatus(searchParams.get("status") ?? undefined)

  let query = supabase
    .from("content_posts")
    .select("*")
    .order("updated_at", { ascending: false })

  if (!authResult.auth.isAdmin) {
    query = query.eq("created_by", authResult.auth.userId)
  }

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const workspaceMode = await fetchWorkspaceMode(supabase, authResult.auth.userId)
  const posts = filterDemoRowsForWorkspace(data ?? [], workspaceMode)

  return NextResponse.json({ posts })
}

export async function POST(request: Request) {
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

  let body: {
    title?: unknown
    caption?: unknown
    hashtags?: unknown
    platform?: unknown
    category?: unknown
    goal?: unknown
    status?: unknown
    scheduled_at?: unknown
  }

  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const title = typeof body.title === "string" ? body.title.trim() : ""

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 })
  }

  const status: ContentPostStatus =
    parseContentPostStatus(body.status) ?? "draft"

  if (status === "published") {
    return NextResponse.json(
      { error: "Use the publish API to create published posts." },
      { status: 400 },
    )
  }

  const scheduledAt =
    typeof body.scheduled_at === "string" && body.scheduled_at.trim()
      ? body.scheduled_at
      : null

  const { data, error } = await supabase
    .from("content_posts")
    .insert({
      user_id: authResult.auth.userId,
      created_by: authResult.auth.userId,
      title,
      caption: typeof body.caption === "string" ? body.caption.trim() : "",
      hashtags: typeof body.hashtags === "string" ? body.hashtags.trim() : "",
      platform: typeof body.platform === "string" ? body.platform.trim() : "",
      category: typeof body.category === "string" ? body.category.trim() : "",
      goal: typeof body.goal === "string" ? body.goal.trim() : "",
      status,
      scheduled_at: status === "scheduled" ? scheduledAt : null,
      published_at: null,
      publish_error: null,
      external_post_id: null,
    })
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (data?.status === "published") {
    await ensurePostAnalyticsRow(supabase, data)
  }

  return NextResponse.json({ post: data })
}

export async function DELETE() {
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

  const { userId, isAdmin } = authResult.auth

  let postsQuery = supabase
    .from("content_posts")
    .delete({ count: "exact" })
    .in("status", ["draft", "scheduled", "published"])

  if (!isAdmin) {
    postsQuery = postsQuery.eq("created_by", userId)
  }

  const { error: postsError, count } = await postsQuery

  if (postsError) {
    return NextResponse.json({ error: postsError.message }, { status: 500 })
  }

  let scheduledQuery = supabase.from("scheduled_posts").delete()

  if (!isAdmin) {
    scheduledQuery = scheduledQuery.eq("user_id", userId)
  }

  const { error: scheduledError } = await scheduledQuery

  if (scheduledError) {
    return NextResponse.json({ error: scheduledError.message }, { status: 500 })
  }

  let performanceQuery = supabase.from("content_performance").delete()

  if (!isAdmin) {
    performanceQuery = performanceQuery.eq("created_by", userId)
  }

  const { error: performanceError } = await performanceQuery

  if (performanceError) {
    return NextResponse.json({ error: performanceError.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: count ?? 0 })
}