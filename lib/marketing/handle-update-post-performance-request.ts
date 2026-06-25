import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import {
  updatePostPerformance,
  type PostPerformanceMetrics,
} from "@/lib/marketing/analytics/update-post-performance"
import { createClient } from "@/lib/supabase/server"

function parseMetric(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.floor(parsed)
}

function parseMetrics(value: unknown): PostPerformanceMetrics | null {
  if (!value || typeof value !== "object") return null

  const metrics = value as Record<string, unknown>

  return {
    views: parseMetric(metrics.views),
    likes: parseMetric(metrics.likes),
    comments: parseMetric(metrics.comments),
    shares: parseMetric(metrics.shares),
    saves: parseMetric(metrics.saves),
  }
}

export async function handleUpdatePostPerformanceRequest(req: Request) {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    )
  }

  let body: Record<string, unknown>

  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const postId =
    typeof body.post_id === "string" ? body.post_id.trim() : ""
  const metrics = parseMetrics(body.metrics)

  if (!postId || !metrics) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 })
  }

  const result = await updatePostPerformance(supabase, postId, metrics)

  if (!result.ok) {
    const status = result.error.includes("not found") ? 404 : 500
    return NextResponse.json({ error: result.error }, { status })
  }

  return NextResponse.json({
    success: true,
    engagement_rate: result.engagement_rate,
  })
}
