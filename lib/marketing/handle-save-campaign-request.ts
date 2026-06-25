import { getAiCoachAuth } from "@/lib/ai-coach/access"
import {
  campaignContentToJson,
  jsonToCampaignContent,
  type CampaignContentItem,
} from "@/lib/marketing/campaign-content-types"
import {
  CAMPAIGN_DURATIONS,
  type CampaignDuration,
} from "@/lib/marketing/marketing-campaign-types"
import { createClient } from "@/lib/supabase/server"

type SaveCampaignBody = {
  id?: unknown
  name?: unknown
  target_audience?: unknown
  platform?: unknown
  campaign_goal?: unknown
  duration_days?: unknown
  campaign?: unknown
  items?: unknown
  brand_id?: unknown
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

function parseCampaignItems(value: unknown): CampaignContentItem[] | null {
  if (Array.isArray(value)) {
    const items = jsonToCampaignContent(value as never)
    return items.length > 0 ? items : null
  }

  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>

  if (Array.isArray(record.items)) {
    const items = jsonToCampaignContent({ items: record.items } as never)
    return items.length > 0 ? items : null
  }

  return null
}

export async function handleSaveCampaignRequest(req: Request) {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return Response.json(
      { error: { message: authResult.error } },
      { status: authResult.status },
    )
  }

  let body: SaveCampaignBody

  try {
    body = (await req.json()) as SaveCampaignBody
  } catch {
    return Response.json(
      { error: { message: "Invalid request body." } },
      { status: 400 },
    )
  }

  const name = parseRequiredString(body.name)
  const targetAudience = parseRequiredString(body.target_audience)
  const platform = parseRequiredString(body.platform)
  const campaignGoal = parseRequiredString(body.campaign_goal)
  const durationDays = parseDurationDays(body.duration_days)
  const campaignItems =
    parseCampaignItems(body.items) ?? parseCampaignItems(body.campaign)
  const existingId =
    typeof body.id === "string" && body.id.trim() ? body.id.trim() : null
  const brandId =
    typeof body.brand_id === "string" && body.brand_id.trim()
      ? body.brand_id.trim()
      : null

  if (
    !name ||
    !targetAudience ||
    !platform ||
    !campaignGoal ||
    !durationDays ||
    !campaignItems
  ) {
    return Response.json(
      {
        error: {
          message:
            "name, target_audience, platform, campaign_goal, duration_days, and campaign are required.",
        },
      },
      { status: 400 },
    )
  }

  if (brandId) {
    const { data: brand, error: brandError } = await supabase
      .from("brand_profiles")
      .select("id")
      .eq("id", brandId)
      .eq("owner_id", authResult.auth.userId)
      .maybeSingle()

    if (brandError) {
      return Response.json({ error: { message: brandError.message } }, { status: 500 })
    }

    if (!brand) {
      return Response.json(
        { error: { message: "Brand not found." } },
        { status: 404 },
      )
    }
  }

  const row = {
    owner_id: authResult.auth.userId,
    brand_id: brandId,
    name,
    target_audience: targetAudience,
    platform,
    campaign_goal: campaignGoal,
    duration_days: durationDays,
    campaign_json: campaignContentToJson(campaignItems),
    status: "saved" as const,
    updated_at: new Date().toISOString(),
  }

  if (existingId) {
    const { data: updated, error: updateError } = await supabase
      .from("marketing_campaigns")
      .update(row)
      .eq("id", existingId)
      .eq("owner_id", authResult.auth.userId)
      .select("*")
      .maybeSingle()

    if (updateError) {
      return Response.json({ error: { message: updateError.message } }, { status: 500 })
    }

    if (!updated) {
      return Response.json(
        { error: { message: "Campaign not found." } },
        { status: 404 },
      )
    }

    return Response.json({ success: true, campaign: updated })
  }

  const { data: created, error: insertError } = await supabase
    .from("marketing_campaigns")
    .insert(row)
    .select("*")
    .single()

  if (insertError) {
    return Response.json({ error: { message: insertError.message } }, { status: 500 })
  }

  return Response.json({ success: true, campaign: created })
}

export async function handleListCampaignsRequest() {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return Response.json(
      { error: { message: authResult.error } },
      { status: authResult.status },
    )
  }

  const { data, error } = await supabase
    .from("marketing_campaigns")
    .select(
      "id, name, target_audience, platform, campaign_goal, duration_days, status, created_at, updated_at",
    )
    .eq("owner_id", authResult.auth.userId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    return Response.json({ error: { message: error.message } }, { status: 500 })
  }

  return Response.json({ campaigns: data ?? [] })
}
