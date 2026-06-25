import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { buildPlanDayPostRows } from "@/lib/marketing/build-plan-day-post-rows"
import { marketingPlanToJson } from "@/lib/marketing/content-plans"
import { parseMarketingStrategyResponse } from "@/lib/marketing/marketing-strategy-types"
import { buildScheduledAtForPlanDay } from "@/lib/marketing/posting-times"
import { createClient } from "@/lib/supabase/server"

type StrategyToPostsBody = {
  brand_id?: unknown
  platform?: unknown
  strategy?: unknown
  content_plan_id?: unknown
}

function parseRequiredString(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null
  }
  return value.trim()
}

function parseOptionalString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null
  }
  return parseRequiredString(value)
}

export async function handleStrategyToPostsRequest(req: Request) {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status },
    )
  }

  let body: StrategyToPostsBody

  try {
    body = (await req.json()) as StrategyToPostsBody
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 })
  }

  const brandId = parseRequiredString(body.brand_id)
  const platform = parseRequiredString(body.platform)
  const contentPlanId = parseOptionalString(body.content_plan_id)

  const strategy = parseMarketingStrategyResponse(
    JSON.stringify(body.strategy ?? {}),
  )

  if (!brandId || !platform || !strategy?.plan.length) {
    return Response.json({ error: "Invalid strategy format" }, { status: 400 })
  }

  const { data: brand, error: brandError } = await supabase
    .from("brand_profiles")
    .select("id")
    .eq("id", brandId)
    .eq("owner_id", authResult.auth.userId)
    .maybeSingle()

  if (brandError) {
    return Response.json({ error: brandError.message }, { status: 500 })
  }

  if (!brand) {
    return Response.json({ error: "Brand not found" }, { status: 404 })
  }

  let planId = contentPlanId

  if (planId) {
    const { data: plan, error: planError } = await supabase
      .from("content_plans")
      .select("id")
      .eq("id", planId)
      .eq("brand_id", brand.id)
      .maybeSingle()

    if (planError) {
      return Response.json({ error: planError.message }, { status: 500 })
    }

    if (!plan) {
      return Response.json({ error: "Content plan not found" }, { status: 404 })
    }
  }

  let postsQuery = supabase
    .from("content_posts")
    .select("id, plan_day, status, scheduled_at")
    .eq("brand_id", brand.id)
    .eq("created_by", authResult.auth.userId)
    .order("plan_day", { ascending: true })

  if (planId) {
    postsQuery = postsQuery.eq("content_plan_id", planId)
  }

  const { data: existingPosts, error: existingPostsError } = await postsQuery

  if (existingPostsError) {
    return Response.json({ error: existingPostsError.message }, { status: 500 })
  }

  let posts = existingPosts ?? []

  if (posts.length === 0) {
    if (!planId) {
      const { data: savedPlan, error: savePlanError } = await supabase
        .from("content_plans")
        .insert({
          brand_id: brand.id,
          goal: strategy.plan[0]?.goal ?? "engagement",
          platform,
          duration_days: strategy.plan.length,
          plan_json: marketingPlanToJson(strategy.plan),
        })
        .select("id")
        .single()

      if (savePlanError) {
        return Response.json({ error: savePlanError.message }, { status: 500 })
      }

      planId = savedPlan.id
    }

    const postRows = buildPlanDayPostRows({
      plan: strategy.plan,
      contentPlanId: planId,
      brandId: brand.id,
      platform,
      createdBy: authResult.auth.userId,
    })

    const { data: insertedPosts, error: insertError } = await supabase
      .from("content_posts")
      .insert(postRows)
      .select("id, plan_day, status, scheduled_at")

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 })
    }

    posts = insertedPosts ?? []
  }

  const now = new Date().toISOString()
  const scheduledPosts = []

  for (const post of posts) {
    if (post.status === "scheduled" && post.scheduled_at) {
      scheduledPosts.push(post)
      continue
    }

    if (!post.plan_day) {
      continue
    }

    const planDay = post.plan_day

    const scheduledAt = buildScheduledAtForPlanDay(platform, planDay)

    const { data: updatedPost, error: updateError } = await supabase
      .from("content_posts")
      .update({
        status: "scheduled",
        scheduled_at: scheduledAt,
        updated_at: now,
      })
      .eq("id", post.id)
      .eq("created_by", authResult.auth.userId)
      .select("id, plan_day, status, scheduled_at")
      .single()

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 })
    }

    scheduledPosts.push(updatedPost)
  }

  return Response.json({
    success: true,
    inserted: posts.length,
    scheduled: scheduledPosts.length,
    content_plan_id: planId,
    posts: scheduledPosts,
  })
}
