import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { postsToContentIdeaCards } from "@/lib/marketing/content-idea-cards"
import { improveContentIdea } from "@/lib/marketing/improve-content-idea"
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

  let id: string | undefined

  try {
    const body = (await req.json()) as { id?: unknown }
    id = typeof body.id === "string" ? body.id.trim() : undefined
  } catch {
    return Response.json(
      { error: { message: "Invalid request body." } },
      { status: 400 },
    )
  }

  if (!id) {
    return Response.json(
      { error: { message: "Post id is required." } },
      { status: 400 },
    )
  }

  let fetchQuery = supabase.from("content_posts").select("*").eq("id", id)

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

  const result = await improveContentIdea({
    title: post.title,
    caption: post.caption,
    hashtags: post.hashtags,
    platform: post.platform,
    category: post.category,
    viral_score: post.viral_score,
    viral_reason: post.viral_reason,
  })

  if (!result.ok) {
    return Response.json({ error: { message: result.error } }, { status: 500 })
  }

  let updateQuery = supabase
    .from("content_posts")
    .update({
      title: result.idea.title,
      caption: result.idea.caption,
      hashtags: result.idea.hashtags,
      viral_score: result.idea.viral_score,
      viral_reason: result.idea.viral_reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (!authResult.auth.isAdmin) {
    updateQuery = updateQuery.eq("created_by", authResult.auth.userId)
  }

  const { data: updated, error: updateError } = await updateQuery
    .select("*")
    .single()

  if (updateError || !updated) {
    return Response.json(
      { error: { message: updateError?.message ?? "Could not save improved post." } },
      { status: 500 },
    )
  }

  const [idea] = postsToContentIdeaCards([updated])

  return Response.json({
    idea: {
      ...idea,
      scheduledAt: updated.scheduled_at ?? null,
    },
    warning: result.warning,
  })
}
