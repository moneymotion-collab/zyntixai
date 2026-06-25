import { NextResponse } from "next/server"
import { marketingPlanToJson } from "@/lib/marketing/content-plans"
import { generatePostsFromPlan } from "@/lib/marketing/handle-generate-plan-posts-request"
import { generateMarketingStrategy } from "@/lib/marketing/generate-marketing-strategy"
import { resolvePlatformFromBrandFocus } from "@/lib/marketing/platform-availability"
import { createClient } from "@/lib/supabase/server"

const BRAND_SELECT =
  "id, name, description, niche, target_audience, tone_of_voice, goals, platform_focus" as const

const DURATION_DAYS = 14

type BrandStrategyBody = {
  plan_id?: unknown
}

function parsePlanId(body: BrandStrategyBody): string | null {
  if (typeof body.plan_id !== "string" || !body.plan_id.trim()) {
    return null
  }

  return body.plan_id.trim()
}

async function parseRequestBody(req: Request): Promise<BrandStrategyBody> {
  try {
    return (await req.json()) as BrandStrategyBody
  } catch {
    return {}
  }
}

async function handleExistingPlan(planId: string, userId: string) {
  return generatePostsFromPlan(planId, userId)
}

async function handleGeneratePlan(userId: string) {
  const supabase = await createClient()

  const { data: brand, error: brandError } = await supabase
    .from("brand_profiles")
    .select(BRAND_SELECT)
    .eq("owner_id", userId)
    .maybeSingle()

  if (brandError) {
    return NextResponse.json({ error: brandError.message }, { status: 500 })
  }

  if (!brand) {
    return NextResponse.json(
      { error: "Brand profile not found." },
      { status: 404 },
    )
  }

  const platform = resolvePlatformFromBrandFocus(brand.platform_focus)
  const campaignGoal = brand.goals.trim() || "growth"

  const result = await generateMarketingStrategy({
    brand,
    goal: campaignGoal,
    platform,
    durationDays: DURATION_DAYS,
  })

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        ...(result.raw ? { raw: result.raw } : {}),
      },
      { status: 500 },
    )
  }

  const strategy = result.strategy
  const planGoal = strategy.goal?.trim() || campaignGoal

  const { data: savedPlan, error: saveError } = await supabase
    .from("content_plans")
    .insert({
      brand_id: brand.id,
      plan_json: marketingPlanToJson(strategy.plan),
      platform,
      goal: planGoal,
      duration_days: DURATION_DAYS,
    })
    .select("*")
    .single()

  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    strategy,
    id: savedPlan.id,
    warning: result.warning,
  })
}

export async function handleBrandStrategyRequest(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await parseRequestBody(req)
  const planId = parsePlanId(body)

  if (planId) {
    return handleExistingPlan(planId, user.id)
  }

  return handleGeneratePlan(user.id)
}
