import { NextResponse } from "next/server"
import { getPlanScheduleItems } from "@/lib/marketing/content-plans"
import { generatePlanDayPost } from "@/lib/marketing/generate-plan-day-post"
import {
  buildPlanPostCaption,
  formatPlanPostHashtags,
} from "@/lib/marketing/generated-post"
import { createClient } from "@/lib/supabase/server"

const BRAND_SELECT =
  "id, name, description, niche, target_audience, tone_of_voice, goals, platform_focus" as const

const GENERATED_FROM_PLAN = "generated_from_plan"

type GeneratePlanPostsBody = {
  plan_id?: unknown
  brand_id?: unknown
}

function parseId(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null
  }

  return value.trim()
}

async function resolvePlanIdForBrand(
  brandId: string,
  userId: string,
): Promise<
  | { ok: true; planId: string }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createClient()

  const { data: brand, error: brandError } = await supabase
    .from("brand_profiles")
    .select("id")
    .eq("id", brandId)
    .eq("owner_id", userId)
    .maybeSingle()

  if (brandError) {
    return {
      ok: false,
      response: NextResponse.json({ error: brandError.message }, { status: 500 }),
    }
  }

  if (!brand) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Brand not found" }, { status: 404 }),
    }
  }

  const { data: plan, error: planError } = await supabase
    .from("content_plans")
    .select("id")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (planError) {
    return {
      ok: false,
      response: NextResponse.json({ error: planError.message }, { status: 500 }),
    }
  }

  if (!plan) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "No content plan found for this brand." },
        { status: 404 },
      ),
    }
  }

  return { ok: true, planId: plan.id }
}

export async function generatePostsFromPlan(planId: string, userId: string) {
  const supabase = await createClient()

  const { data: plan, error: planError } = await supabase
    .from("content_plans")
    .select("id, brand_id, platform, plan_json")
    .eq("id", planId)
    .maybeSingle()

  if (planError) {
    return NextResponse.json({ error: planError.message }, { status: 500 })
  }

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  }

  const { data: brand, error: brandError } = await supabase
    .from("brand_profiles")
    .select(BRAND_SELECT)
    .eq("id", plan.brand_id)
    .eq("owner_id", userId)
    .maybeSingle()

  if (brandError) {
    return NextResponse.json({ error: brandError.message }, { status: 500 })
  }

  if (!brand) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  }

  const { data: existing, error: existingError } = await supabase
    .from("content_posts")
    .select("id")
    .eq("brand_id", plan.brand_id)
    .eq("content_type", GENERATED_FROM_PLAN)
    .eq("plan_id", planId)

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 })
  }

  if (existing && existing.length > 0) {
    const { data: posts, error: postsError } = await supabase
      .from("content_posts")
      .select("*")
      .eq("brand_id", plan.brand_id)
      .eq("content_type", GENERATED_FROM_PLAN)
      .eq("plan_id", planId)
      .order("plan_day", { ascending: true })

    if (postsError) {
      return NextResponse.json({ error: postsError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      posts_created: 0,
      posts: posts ?? [],
    })
  }

  const schedule = getPlanScheduleItems(plan.plan_json)

  if (schedule.length === 0) {
    return NextResponse.json({ error: "Content plan is empty." }, { status: 400 })
  }

  const platform = plan.platform.trim() || "instagram"
  const results = []
  let warning: string | undefined

  for (const day of schedule) {
    const generated = await generatePlanDayPost({
      brand,
      platform,
      day,
    })

    if (!generated.ok) {
      return NextResponse.json({ error: generated.error }, { status: 500 })
    }

    if (generated.warning && !warning) {
      warning = generated.warning
    }

    const post = generated.post

    const { data: saved, error: saveError } = await supabase
      .from("content_posts")
      .insert({
        user_id: userId,
        created_by: userId,
        brand_id: plan.brand_id,
        plan_id: planId,
        content_plan_id: plan.id,
        content_type: GENERATED_FROM_PLAN,
        plan_day: day.day,
        title: post.title,
        caption: buildPlanPostCaption(post),
        hashtags: formatPlanPostHashtags(post.hashtags),
        platform,
        category: post.angle,
        goal: day.goal,
        topic: post.hooks,
        status: "draft",
      })
      .select()
      .single()

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 })
    }

    results.push(saved)
  }

  return NextResponse.json({
    success: true,
    posts_created: results.length,
    posts: results,
    ...(warning ? { warning } : {}),
  })
}

export async function handleGeneratePlanPostsRequest(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: GeneratePlanPostsBody

  try {
    body = (await req.json()) as GeneratePlanPostsBody
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const planId = parseId(body.plan_id)
  const brandId = parseId(body.brand_id)

  if (planId) {
    return generatePostsFromPlan(planId, user.id)
  }

  if (brandId) {
    const resolved = await resolvePlanIdForBrand(brandId, user.id)

    if (!resolved.ok) {
      return resolved.response
    }

    return generatePostsFromPlan(resolved.planId, user.id)
  }

  return NextResponse.json(
    { error: "plan_id or brand_id is required." },
    { status: 400 },
  )
}
