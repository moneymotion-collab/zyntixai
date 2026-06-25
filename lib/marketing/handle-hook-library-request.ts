import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { generateHookLibrary } from "@/lib/marketing/hook-library/generate"
import { loadLearningContextBlock } from "@/lib/marketing/learning/load-learning-context"
import { createClient } from "@/lib/supabase/server"

type HookLibraryBody = {
  campaign_name?: unknown
  target_audience?: unknown
  platform?: unknown
  campaign_goal?: unknown
}

function parseRequiredString(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null
  }
  return value.trim()
}

export async function handleHookLibraryRequest(req: Request) {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return Response.json(
      { error: { message: authResult.error } },
      { status: authResult.status },
    )
  }

  let body: HookLibraryBody

  try {
    body = (await req.json()) as HookLibraryBody
  } catch {
    return Response.json(
      { error: { message: "Invalid request body." } },
      { status: 400 },
    )
  }

  const campaignName = parseRequiredString(body.campaign_name)
  const targetAudience = parseRequiredString(body.target_audience)
  const platform = parseRequiredString(body.platform)
  const campaignGoal = parseRequiredString(body.campaign_goal)

  if (!campaignName || !targetAudience || !platform || !campaignGoal) {
    return Response.json(
      {
        error: {
          message:
            "campaign_name, target_audience, platform, and campaign_goal are required.",
        },
      },
      { status: 400 },
    )
  }

  const { context: learningContext } = await loadLearningContextBlock(
    supabase,
    authResult.auth.userId,
  )

  const result = await generateHookLibrary({
    campaignName,
    targetAudience,
    platform,
    campaignGoal,
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
    campaign_goal: campaignGoal,
    hooks: result.hooks,
    warning: result.warning,
  })
}
