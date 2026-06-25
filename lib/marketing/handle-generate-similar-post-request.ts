import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { generateSimilarPost } from "@/lib/marketing/generate-similar-post"
import { createClient } from "@/lib/supabase/server"

export async function handleGenerateSimilarPostRequest(req: Request) {
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
    const body = (await req.json()) as { id?: unknown; post_id?: unknown }
    const rawId =
      typeof body.id === "string"
        ? body.id
        : typeof body.post_id === "string"
          ? body.post_id
          : undefined
    id = rawId?.trim() || undefined
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

  const result = await generateSimilarPost({
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

  const { data: created, error: insertError } = await supabase
    .from("content_posts")
    .insert({
      user_id: authResult.auth.userId,
      created_by: authResult.auth.userId,
      brand_id: post.brand_id,
      title: result.idea.title,
      caption: result.idea.caption,
      hashtags: result.idea.hashtags,
      viral_score: result.idea.viral_score,
      viral_reason: result.idea.viral_reason,
      platform: post.platform,
      category: post.category,
      goal: post.goal,
      content_type: post.content_type,
      topic: post.topic,
      status: "draft",
    })
    .select("*")
    .single()

  if (insertError || !created) {
    return Response.json(
      {
        error: {
          message: insertError?.message ?? "Could not save similar post.",
        },
      },
      { status: 500 },
    )
  }

  return Response.json({ post: created, warning: result.warning })
}
