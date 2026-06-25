import { NextResponse } from "next/server"
import { analyzeViralPotential } from "@/lib/marketing/analyze-viral-potential"
import { evaluateContentQuality } from "@/lib/marketing/evaluate-content-quality"
import { serializeViralFeedback } from "@/lib/marketing/viral-score"
import { createClient } from "@/lib/supabase/server"

type QualityCheckBody = {
  post_id?: unknown
  id?: unknown
}

function parsePostId(body: QualityCheckBody): string | null {
  const rawId =
    typeof body.post_id === "string"
      ? body.post_id
      : typeof body.id === "string"
        ? body.id
        : undefined

  if (!rawId?.trim()) {
    return null
  }

  return rawId.trim()
}

export async function handleQualityCheckRequest(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: QualityCheckBody

  try {
    body = (await req.json()) as QualityCheckBody
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const postId = parsePostId(body)

  if (!postId) {
    return NextResponse.json({ error: "post_id is required." }, { status: 400 })
  }

  const { data: post, error: fetchError } = await supabase
    .from("content_posts")
    .select("*")
    .eq("id", postId)
    .eq("created_by", user.id)
    .maybeSingle()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }

  const analysis = await analyzeViralPotential({
    title: post.title,
    caption: post.caption,
    hashtags: post.hashtags,
    platform: post.platform,
  })

  if (!analysis.ok) {
    return NextResponse.json({ error: analysis.error }, { status: 500 })
  }

  const result = analysis.result
  const quality = evaluateContentQuality(result.viral_score)

  const { error: updateError } = await supabase
    .from("content_posts")
    .update({
      viral_score: result.viral_score,
      viral_feedback: serializeViralFeedback(result.feedback),
      viral_reason: result.viral_reason,
      viral_status: quality.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("created_by", user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    post_id: postId,
    viral_score: result.viral_score,
    status: quality.status,
    action: quality.action,
    reason: quality.reason,
    warning: analysis.warning,
  })
}
