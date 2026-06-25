import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { generateCampaignContent } from "@/lib/marketing/generate-campaign-content"
import {
  CAMPAIGN_DURATIONS,
  type CampaignDuration,
} from "@/lib/marketing/marketing-campaign-types"
import { createClient } from "@/lib/supabase/server"

type GenerateCampaignBody = {
  name?: unknown
  campaign_name?: unknown
  target_audience?: unknown
  platform?: unknown
  campaign_goal?: unknown
  duration_days?: unknown
}

function parseRequiredString(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null
  }
  return value.trim()
}

function parseDurationDays(value: unknown): CampaignDuration | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN

  if (!CAMPAIGN_DURATIONS.includes(parsed as CampaignDuration)) {
    return null
  }

  return parsed as CampaignDuration
}

/** @deprecated Use handleMarketingGenerateCampaignRequest */
export async function handleGenerateCampaignRequest(req: Request) {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return Response.json(
      { error: { message: authResult.error } },
      { status: authResult.status },
    )
  }

  let body: GenerateCampaignBody

  try {
    body = (await req.json()) as GenerateCampaignBody
  } catch {
    return Response.json(
      { error: { message: "Invalid request body." } },
      { status: 400 },
    )
  }

  const campaignName =
    parseRequiredString(body.campaign_name) ?? parseRequiredString(body.name)
  const targetAudience = parseRequiredString(body.target_audience)
  const platform = parseRequiredString(body.platform)
  const campaignGoal = parseRequiredString(body.campaign_goal)
  const durationDays = parseDurationDays(body.duration_days)

  if (
    !campaignName ||
    !targetAudience ||
    !platform ||
    !campaignGoal ||
    !durationDays
  ) {
    return Response.json(
      {
        error: {
          message:
            "campaign_name, target_audience, platform, campaign_goal, and duration_days are required.",
        },
      },
      { status: 400 },
    )
  }

  const result = await generateCampaignContent({
    campaignName,
    targetAudience,
    platform,
    campaignGoal,
    durationDays,
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
    duration_days: durationDays,
    items: result.items,
    warning: result.warning,
    campaign: { items: result.items },
    meta: {
      name: campaignName,
      target_audience: targetAudience,
      platform,
      campaign_goal: campaignGoal,
      duration_days: durationDays,
    },
  })
}
