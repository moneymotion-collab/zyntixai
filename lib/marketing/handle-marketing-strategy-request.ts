import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { buildPlanDayPostRows } from "@/lib/marketing/build-plan-day-post-rows"
import { marketingPlanToJson } from "@/lib/marketing/content-plans"
import { generateMarketingStrategy } from "@/lib/marketing/generate-marketing-strategy"
import { createClient } from "@/lib/supabase/server"

type MarketingStrategyBody = {
  brand_id?: unknown
  goal?: unknown
  platform?: unknown
  duration_days?: unknown
}

function parseRequiredString(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null
  }
  return value.trim()
}

function parseDurationDays(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 90) {
    return null
  }

  return parsed
}

export async function handleMarketingStrategyRequest(req: Request) {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return Response.json(
      { error: { message: authResult.error } },
      { status: authResult.status },
    )
  }

  let body: MarketingStrategyBody

  try {
    body = (await req.json()) as MarketingStrategyBody
  } catch {
    return Response.json(
      { error: { message: "Invalid request body." } },
      { status: 400 },
    )
  }

  const brandId = parseRequiredString(body.brand_id)
  const goal = parseRequiredString(body.goal)
  const platform = parseRequiredString(body.platform)
  const durationDays = parseDurationDays(body.duration_days)

  if (!brandId || !goal || !platform || !durationDays) {
    return Response.json(
      {
        error: {
          message:
            "brand_id, goal, platform, and duration_days are required.",
        },
      },
      { status: 400 },
    )
  }

  const { data: brand, error: brandError } = await supabase
    .from("brand_profiles")
    .select(
      "id, name, description, niche, target_audience, tone_of_voice, goals, platform_focus",
    )
    .eq("id", brandId)
    .eq("owner_id", authResult.auth.userId)
    .maybeSingle()

  if (brandError) {
    return Response.json({ error: brandError.message }, { status: 500 })
  }

  if (!brand) {
    return Response.json({ error: "Brand not found" }, { status: 404 })
  }

  const result = await generateMarketingStrategy({
    brand,
    goal,
    platform,
    durationDays,
  })

  if (!result.ok) {
    return Response.json(
      {
        error: result.error,
        ...(result.raw ? { raw: result.raw } : {}),
      },
      { status: 500 },
    )
  }

  const { data: savedPlan, error: saveError } = await supabase
    .from("content_plans")
    .insert({
      brand_id: brand.id,
      goal,
      platform,
      duration_days: durationDays,
      plan_json: marketingPlanToJson(result.strategy.plan),
    })
    .select("*")
    .single()

  if (saveError) {
    return Response.json({ error: saveError.message }, { status: 500 })
  }

  const postRows = buildPlanDayPostRows({
    plan: result.strategy.plan,
    contentPlanId: savedPlan.id,
    brandId: brand.id,
    platform,
    createdBy: authResult.auth.userId,
  })

  const { data: posts, error: postsError } = await supabase
    .from("content_posts")
    .insert(postRows)
    .select("*")

  if (postsError) {
    return Response.json({ error: postsError.message }, { status: 500 })
  }

  return Response.json({
    success: true,
    brand: brand.name,
    strategy: result.strategy,
    id: savedPlan.id,
    brand_id: brand.id,
    goal,
    platform,
    duration_days: durationDays,
    posts: posts ?? [],
    created_at: savedPlan.created_at,
    warning: result.warning,
  })
}
