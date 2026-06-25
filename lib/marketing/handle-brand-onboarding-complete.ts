import { NextResponse } from "next/server"
import { marketingPlanToJson } from "@/lib/marketing/content-plans"
import { generatePostsFromPlan } from "@/lib/marketing/handle-generate-plan-posts-request"
import { generateMarketingStrategy } from "@/lib/marketing/generate-marketing-strategy"
import { resolvePlatformFromBrandFocus } from "@/lib/marketing/platform-availability"
import { createClient } from "@/lib/supabase/server"

const BRAND_SELECT =
  "id, name, description, niche, target_audience, tone_of_voice, goals, platform_focus" as const

const STARTER_DURATION_DAYS = 7

export async function handleBrandOnboardingComplete() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: brand, error: brandError } = await supabase
    .from("brand_profiles")
    .select(BRAND_SELECT)
    .eq("owner_id", user.id)
    .maybeSingle()

  if (brandError) {
    return NextResponse.json({ error: brandError.message }, { status: 500 })
  }

  if (!brand) {
    return NextResponse.json({ error: "No brand found" }, { status: 404 })
  }

  const platform = resolvePlatformFromBrandFocus(brand.platform_focus)
  const campaignGoal = brand.goals.trim() || "growth"

  const { data: existingPlan, error: existingPlanError } = await supabase
    .from("content_plans")
    .select("id")
    .eq("brand_id", brand.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingPlanError) {
    return NextResponse.json({ error: existingPlanError.message }, { status: 500 })
  }

  let planId = existingPlan?.id
  let strategyWarning: string | undefined

  if (!planId) {
    const result = await generateMarketingStrategy({
      brand,
      goal: campaignGoal,
      platform,
      durationDays: STARTER_DURATION_DAYS,
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

    strategyWarning = result.warning
    const strategy = result.strategy
    const planGoal = strategy.goal?.trim() || campaignGoal

    const { data: savedPlan, error: saveError } = await supabase
      .from("content_plans")
      .insert({
        brand_id: brand.id,
        plan_json: marketingPlanToJson(strategy.plan),
        platform,
        goal: planGoal,
        duration_days: STARTER_DURATION_DAYS,
      })
      .select("id")
      .single()

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 })
    }

    planId = savedPlan.id
  }

  const postsResponse = await generatePostsFromPlan(planId, user.id)
  const postsPayload = (await postsResponse.json()) as Record<string, unknown>

  if (!postsResponse.ok) {
    return NextResponse.json(
      {
        error:
          typeof postsPayload.error === "string"
            ? postsPayload.error
            : "Could not generate starter posts.",
        plan_id: planId,
      },
      { status: postsResponse.status },
    )
  }

  return NextResponse.json({
    success: true,
    message: "Onboarding completed",
    plan_id: planId,
    posts_created: postsPayload.posts_created ?? 0,
    posts: postsPayload.posts ?? [],
    ...(strategyWarning ? { warning: strategyWarning } : {}),
    ...(typeof postsPayload.warning === "string"
      ? { warning: postsPayload.warning }
      : {}),
  })
}
