import { getAiCoachAuth } from "@/lib/ai-coach/access"
import {
  BrandNotFoundError,
  consumeCredits,
  InsufficientCreditsError,
  UpgradeRequiredError,
} from "@/lib/ai/consume-credits"
import { analyzeViralPotential } from "@/lib/marketing/analyze-viral-potential"
import { evaluateContentQuality } from "@/lib/marketing/evaluate-content-quality"
import { serializeViralFeedback } from "@/lib/marketing/viral-score"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return Response.json(
      { error: { message: authResult.error } },
      { status: authResult.status },
    )
  }

  let postId: string | undefined

  try {
    const body = (await req.json()) as { post_id?: unknown; id?: unknown }
    const rawId =
      typeof body.post_id === "string"
        ? body.post_id
        : typeof body.id === "string"
          ? body.id
          : undefined
    postId = rawId?.trim() || undefined
  } catch {
    return Response.json(
      { error: { message: "Invalid request body." } },
      { status: 400 },
    )
  }

  if (!postId) {
    return Response.json(
      { error: { message: "Post id is required." } },
      { status: 400 },
    )
  }

  let fetchQuery = supabase.from("content_posts").select("*").eq("id", postId)

  if (!authResult.auth.isAdmin) {
    fetchQuery = fetchQuery.eq("created_by", authResult.auth.userId)
  }

  const { data: post, error: fetchError } = await fetchQuery.single()

  if (fetchError || !post) {
    return Response.json(
      { error: { message: "Post not found." } },
      { status: 404 },
    )
  }

  if (!post.brand_id) {
    return Response.json(
      { error: { message: "Post has no brand linked." } },
      { status: 400 },
    )
  }

  try {
    await consumeCredits(post.brand_id, 1, "viral-score")
  } catch (error) {
    if (error instanceof UpgradeRequiredError) {
      return Response.json({ error: error.message }, { status: 403 })
    }

    if (error instanceof InsufficientCreditsError) {
      return Response.json(
        {
          error: "AI credits exhausted",
          upgrade_required: true,
        },
        { status: 403 },
      )
    }

    if (error instanceof BrandNotFoundError) {
      return Response.json(
        { error: { message: error.message } },
        { status: 404 },
      )
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
    return Response.json(
      { error: { message: analysis.error } },
      { status: 500 },
    )
  }

  const result = analysis.result
  const quality = evaluateContentQuality(result.viral_score)

  let updateQuery = supabase
    .from("content_posts")
    .update({
      viral_score: result.viral_score,
      viral_reason: result.viral_reason,
      viral_feedback: serializeViralFeedback(result.feedback),
      viral_status: result.recommendation,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)

  if (!authResult.auth.isAdmin) {
    updateQuery = updateQuery.eq("created_by", authResult.auth.userId)
  }

  const { error: updateError } = await updateQuery

  if (updateError) {
    return Response.json(
      { error: { message: updateError.message } },
      { status: 500 },
    )
  }

  return Response.json({
    success: true,
    result: {
      viral_score: result.viral_score,
      feedback: result.feedback,
      recommendation: result.recommendation,
      viral_reason: result.viral_reason,
      quality,
    },
    warning: analysis.warning,
  })
}
