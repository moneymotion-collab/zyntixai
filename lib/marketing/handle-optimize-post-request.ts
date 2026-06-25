import { NextResponse } from "next/server"
import {
  optimizeSocialPost,
  optimizedResultToViralFeedback,
  optimizedResultToViralReason,
} from "@/lib/marketing/optimize-social-post"
import { calculateScoreImprovement } from "@/lib/marketing/viral-score"
import { createClient } from "@/lib/supabase/server"

type OptimizePostBody = {
  post_id?: unknown
  id?: unknown
}

function parsePostId(body: OptimizePostBody): string | null {
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

type OptimizePostOptions = {
  isAdmin?: boolean
}

export async function optimizePostForUser(
  postId: string,
  userId: string,
  options: OptimizePostOptions = {},
) {
  const supabase = await createClient()

  let fetchQuery = supabase.from("content_posts").select("*").eq("id", postId)

  if (!options.isAdmin) {
    fetchQuery = fetchQuery.eq("created_by", userId)
  }

  const { data: post, error: fetchError } = await fetchQuery.maybeSingle()

  if (fetchError) {
    return { ok: false as const, status: 500, error: fetchError.message }
  }

  if (!post) {
    return { ok: false as const, status: 404, error: "Post not found" }
  }

  const optimization = await optimizeSocialPost({
    title: post.title,
    caption: post.caption,
    hashtags: post.hashtags,
    platform: post.platform,
    viral_score: post.viral_score,
  })

  if (!optimization.ok) {
    return { ok: false as const, status: 500, error: optimization.error }
  }

  const { result } = optimization

  if (!result?.optimized_title || !result?.optimized_content) {
    return { ok: false as const, status: 500, error: "Invalid AI response" }
  }

  const current_score = post.viral_score
  const improvement = calculateScoreImprovement(
    result.predicted_score,
    current_score,
  )

  let updateQuery = supabase
    .from("content_posts")
    .update({
      optimized_title: result.optimized_title,
      optimized_content: result.optimized_content,
      optimized_hashtags: result.optimized_hashtags,
      optimized_score: result.predicted_score,
      viral_feedback: optimizedResultToViralFeedback(result.changes),
      viral_reason: optimizedResultToViralReason(result.changes),
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)

  if (!options.isAdmin) {
    updateQuery = updateQuery.eq("created_by", userId)
  }

  const { error: updateError } = await updateQuery

  if (updateError) {
    return { ok: false as const, status: 500, error: updateError.message }
  }

  return {
    ok: true as const,
    current_score,
    improvement,
    result,
    warning: optimization.warning,
  }
}

export async function handleOptimizePostRequest(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: OptimizePostBody

  try {
    body = (await req.json()) as OptimizePostBody
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const postId = parsePostId(body)

  if (!postId) {
    return NextResponse.json({ error: "post_id is required." }, { status: 400 })
  }

  const outcome = await optimizePostForUser(postId, user.id)

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error }, { status: outcome.status })
  }

  return NextResponse.json({
    success: true,
    current_score: outcome.current_score,
    improvement: outcome.improvement,
    result: outcome.result,
    warning: outcome.warning,
  })
}
