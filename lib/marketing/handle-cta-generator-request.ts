import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { generateCtaLibrary } from "@/lib/marketing/cta-generator/generate"
import { loadLearningContextBlock } from "@/lib/marketing/learning/load-learning-context"
import { createClient } from "@/lib/supabase/server"

type CtaGeneratorBody = {
  campaign_name?: unknown
  target_audience?: unknown
  platform?: unknown
  campaign_goal?: unknown
  brand_name?: unknown
}

function parseRequiredString(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null
  }
  return value.trim()
}

export async function handleCtaGeneratorRequest(req: Request) {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return Response.json(
      { error: { message: authResult.error } },
      { status: authResult.status },
    )
  }

  let body: CtaGeneratorBody

  try {
    body = (await req.json()) as CtaGeneratorBody
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
  const brandName =
    typeof body.brand_name === "string" && body.brand_name.trim()
      ? body.brand_name.trim()
      : undefined

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

  const result = await generateCtaLibrary({
    campaignName,
    targetAudience,
    platform,
    campaignGoal,
    brandName,
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
    brand_name: brandName,
    ctas: result.ctas,
    warning: result.warning,
  })
}
