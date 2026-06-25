import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { postsToContentIdeaCards } from "@/lib/marketing/content-idea-cards"
import { buildContentPostRows } from "@/lib/marketing/build-content-post-rows"
import { parseContentIdeaCount } from "@/lib/marketing/content-idea-counts"
import { parseContentCategories } from "@/lib/marketing/content-categories"
import { parseContentGoals } from "@/lib/marketing/content-goals"
import { generateContentIdeas } from "@/lib/marketing/generate-content-ideas"
import { loadLearningContextBlock } from "@/lib/marketing/learning/load-learning-context"
import { createClient } from "@/lib/supabase/server"

export async function handleContentIdeasRequest(req: Request) {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return Response.json(
      { error: { message: authResult.error } },
      { status: authResult.status },
    )
  }

  let count = parseContentIdeaCount(5)
  let categories = parseContentCategories([])
  let goals = parseContentGoals([])

  try {
    const body = (await req.json()) as {
      count?: unknown
      categories?: unknown
      goals?: unknown
    }
    count = parseContentIdeaCount(body.count ?? 5)
    categories = parseContentCategories(body.categories ?? [])
    goals = parseContentGoals(body.goals ?? [])
  } catch {
    // Empty body — use defaults (count 5, no filters).
  }

  const { context: learningContext } = await loadLearningContextBlock(
    supabase,
    authResult.auth.userId,
  )

  const result = await generateContentIdeas(
    goals,
    count,
    categories,
    learningContext,
  )

  if (!result.ok) {
    return Response.json({ error: { message: result.error } }, { status: 500 })
  }

  const rows = buildContentPostRows(
    result.ideas,
    authResult.auth.userId,
    categories,
    goals,
  )

  const { data, error } = await supabase
    .from("content_posts")
    .insert(rows)
    .select()

  if (error) {
    return Response.json({ error }, { status: 500 })
  }

  return Response.json({
    ideas: postsToContentIdeaCards(data ?? []),
    warning: result.warning,
  })
}
