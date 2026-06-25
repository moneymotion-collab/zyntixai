import { NextResponse } from "next/server"
import {
  BrandNotFoundError,
  consumeCredits,
  InsufficientCreditsError,
  UpgradeRequiredError,
} from "@/lib/ai/consume-credits"
import { analyzeViralPotential } from "@/lib/marketing/analyze-viral-potential"
import { evaluateContentQuality } from "@/lib/marketing/evaluate-content-quality"
import { serializeViralFeedback } from "@/lib/marketing/viral-score"
import { buildViralScoreBreakdown } from "@/lib/marketing/viral-score-breakdown"
import { createClient } from "@/lib/supabase/server"

type ViralScoreBody = {
  post_id?: unknown
  id?: unknown
}

function parsePostId(body: ViralScoreBody): string | null {
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

export async function handleViralScoreRequest(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: ViralScoreBody

  try {
    body = (await req.json()) as ViralScoreBody
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

  if (!post.brand_id) {
    return NextResponse.json(
      { error: "Post has no brand linked." },
      { status: 400 },
    )
  }

  try {
    await consumeCredits(post.brand_id, 1, "viral-score")
  } catch (error) {
    if (error instanceof UpgradeRequiredError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json(
        {
          error: "AI credits exhausted",
          upgrade_required: true,
        },
        { status: 403 },
      )
    }

    if (error instanceof BrandNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    throw error
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
  const clampedScore = Math.min(
    100,
    Math.max(0, Math.round(result.viral_score ?? 0)),
  )
  const quality = evaluateContentQuality(clampedScore)
  const serializedFeedback = serializeViralFeedback(result.feedback ?? [])
  const breakdown = buildViralScoreBreakdown({
    score: clampedScore,
    reason: result.viral_reason,
    viral_feedback: serializedFeedback,
    title: post.title,
    caption: post.caption,
  })

  const dimensionByKey = new Map(
    breakdown.dimensions.map((dimension) => [dimension.key, dimension.score]),
  )
  const hookStrength = dimensionByKey.get("hook") ?? Math.min(100, clampedScore + 8)
  const retention = dimensionByKey.get("retention") ?? Math.min(100, clampedScore + 2)
  const engagement = dimensionByKey.get("engagement") ?? Math.min(100, clampedScore + 6)
  const ctaClarity = dimensionByKey.get("cta") ?? Math.min(100, clampedScore + 3)
  const improvements = breakdown.improvements.length
    ? breakdown.improvements
    : (result.feedback ?? []).slice(0, 5)

  const { error: updateError } = await supabase
    .from("content_posts")
    .update({
      viral_score: clampedScore,
      viral_feedback: serializedFeedback,
      viral_reason: result.viral_reason,
      viral_status: result.recommendation,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("created_by", user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    viral_score: clampedScore,
    viral_reason: result.viral_reason,
    recommendation: breakdown.recommendation,
    breakdown: {
      hook_strength: hookStrength,
      retention,
      engagement,
      cta_clarity: ctaClarity,
    },
    improvements,
    result: {
      viral_score: clampedScore,
      feedback: result.feedback ?? [],
      recommendation: result.recommendation,
      viral_reason: result.viral_reason,
      quality,
    },
    warning: analysis.warning,
  })
}
