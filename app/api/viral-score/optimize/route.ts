import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { optimizePostForUser } from "@/lib/marketing/handle-optimize-post-request"
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

  const outcome = await optimizePostForUser(postId, authResult.auth.userId, {
    isAdmin: authResult.auth.isAdmin,
  })

  if (!outcome.ok) {
    return Response.json(
      { error: { message: outcome.error } },
      { status: outcome.status },
    )
  }

  return Response.json({
    success: true,
    current_score: outcome.current_score,
    improvement: outcome.improvement,
    result: outcome.result,
    warning: outcome.warning,
  })
}
