import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { upsertContentPerformanceRow } from "@/lib/marketing/analytics/upsert-content-performance"
import { buildMarketingAnalyticsApiResponse } from "@/lib/marketing/content-performance/build-api-response"
import { fetchContentPerformanceRows } from "@/lib/marketing/content-performance/fetch-rows"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

function parseMetric(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.floor(parsed)
}

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

  const body = await req.json()
  const postId =
    typeof body.post_id === "string" && body.post_id.trim()
      ? body.post_id.trim()
      : null

  if (!postId) {
    return NextResponse.json({ error: "post_id is required." }, { status: 400 })
  }

  const { data: post, error: postError } = await supabase
    .from("content_posts")
    .select("id, title, platform, content_type, created_by, user_id, brand_id")
    .eq("id", postId)
    .maybeSingle()

  if (postError) {
    return NextResponse.json({ error: postError.message }, { status: 500 })
  }

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 })
  }

  if (
    !authResult.auth.isAdmin &&
    post.created_by !== authResult.auth.userId &&
    post.user_id !== authResult.auth.userId
  ) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 })
  }

  const metrics = {
    views: parseMetric(body.views),
    likes: parseMetric(body.likes),
    comments: parseMetric(body.comments),
    shares: parseMetric(body.shares),
    saves: parseMetric(body.saves),
  }

  const upsertResult = await upsertContentPerformanceRow(
    supabase,
    post,
    metrics,
  )

  if (!upsertResult.ok) {
    return NextResponse.json({ error: upsertResult.error }, { status: 500 })
  }

  const { data: rows, error: fetchError } = await fetchContentPerformanceRows(
    supabase,
    authResult.auth.userId,
    authResult.auth.isAdmin,
  )

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const savedRow = (rows ?? []).find((row) => row.post_id === postId)

  return NextResponse.json({
    success: true,
    data: savedRow ?? null,
    analytics: buildMarketingAnalyticsApiResponse(rows ?? []),
  })
}

export async function GET() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status },
    )
  }

  const { data, error } = await fetchContentPerformanceRows(
    supabase,
    authResult.auth.userId,
    authResult.auth.isAdmin,
  )

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    )
  }

  return NextResponse.json(buildMarketingAnalyticsApiResponse(data ?? []))
}
