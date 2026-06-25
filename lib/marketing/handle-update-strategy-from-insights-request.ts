import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { parseBrandContentInsights } from "@/lib/marketing/brand-content-insights-types"
import {
  planJsonToStrategyWithInsights,
  strategyWithInsightsToPlanJson,
} from "@/lib/marketing/content-plans"
import { updateStrategyFromInsights } from "@/lib/marketing/update-strategy-from-insights"
import { createClient } from "@/lib/supabase/server"

type UpdateStrategyFromInsightsBody = {
  brand_id?: unknown
  insights?: unknown
}

function parseBrandId(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null
  }

  return value.trim()
}

export async function handleUpdateStrategyFromInsightsRequest(req: Request) {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    )
  }

  let body: UpdateStrategyFromInsightsBody

  try {
    body = (await req.json()) as UpdateStrategyFromInsightsBody
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const brandId = parseBrandId(body.brand_id)
  const insights = parseBrandContentInsights(body.insights)

  if (!brandId || !insights) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 })
  }

  const { data: brand, error: brandError } = await supabase
    .from("brand_profiles")
    .select("id")
    .eq("id", brandId)
    .eq("owner_id", authResult.auth.userId)
    .maybeSingle()

  if (brandError) {
    return NextResponse.json({ error: brandError.message }, { status: 500 })
  }

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 })
  }

  const { data: strategy, error: strategyError } = await supabase
    .from("content_plans")
    .select("*")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (strategyError) {
    return NextResponse.json({ error: strategyError.message }, { status: 500 })
  }

  if (!strategy) {
    return NextResponse.json({ error: "No strategy found" }, { status: 404 })
  }

  const current = planJsonToStrategyWithInsights(strategy.plan_json)
  const updated = updateStrategyFromInsights(current, insights)

  const { data, error: updateError } = await supabase
    .from("content_plans")
    .update({
      plan_json: strategyWithInsightsToPlanJson(updated),
    })
    .eq("id", strategy.id)
    .eq("brand_id", brandId)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    updated: data,
  })
}
