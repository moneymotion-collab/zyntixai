import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { generateStoryStructure } from "@/lib/marketing/story-structure/generate"
import { loadLearningContextBlock } from "@/lib/marketing/learning/load-learning-context"
import { createClient } from "@/lib/supabase/server"

type StoryStructureBody = {
  campaign_name?: unknown
  target_audience?: unknown
  platform?: unknown
  goal?: unknown
  topic?: unknown
}

function parseRequiredString(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null
  }
  return value.trim()
}

export async function handleStoryStructureRequest(req: Request) {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return Response.json(
      { error: { message: authResult.error } },
      { status: authResult.status },
    )
  }

  let body: StoryStructureBody

  try {
    body = (await req.json()) as StoryStructureBody
  } catch {
    return Response.json(
      { error: { message: "Invalid request body." } },
      { status: 400 },
    )
  }

  const campaignName = parseRequiredString(body.campaign_name)
  const targetAudience = parseRequiredString(body.target_audience)
  const platform = parseRequiredString(body.platform)
  const goal = parseRequiredString(body.goal)
  const topic =
    typeof body.topic === "string" && body.topic.trim()
      ? body.topic.trim()
      : undefined

  if (!campaignName || !targetAudience || !platform || !goal) {
    return Response.json(
      {
        error: {
          message:
            "campaign_name, target_audience, platform, and goal are required.",
        },
      },
      { status: 400 },
    )
  }

  const { context: learningContext } = await loadLearningContextBlock(
    supabase,
    authResult.auth.userId,
  )

  const result = await generateStoryStructure({
    campaignName,
    targetAudience,
    platform,
    goal,
    topic,
    learningContext,
  })

  if (!result.ok) {
    return Response.json(
      {
        error: { message: result.error },
        ...(result.raw ? { raw: result.raw } : {}),
      },
      { status: 500 },
    )
  }

  return Response.json({
    success: true,
    campaign_name: campaignName,
    target_audience: targetAudience,
    platform,
    goal,
    topic: topic ?? campaignName,
    hook: result.hook,
    cta: result.cta,
    scenes: result.scenes,
    warning: result.warning,
  })
}
