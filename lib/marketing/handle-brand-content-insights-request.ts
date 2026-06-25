import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { generateBrandContentInsights } from "@/lib/marketing/generate-brand-content-insights"
import { fetchAnalyticsRowsForBrandInsights } from "@/lib/marketing/fetch-analytics-rows"
import { createClient } from "@/lib/supabase/server"

type BrandContentInsightsBody = {
  brand_id?: unknown
}

function parseBrandId(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null
  }

  return value.trim()
}

export async function handleBrandContentInsightsRequest(req: Request) {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    )
  }

  let body: BrandContentInsightsBody

  try {
    body = (await req.json()) as BrandContentInsightsBody
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const brandId = parseBrandId(body.brand_id)

  if (!brandId) {
    return NextResponse.json({ error: "Missing brand_id" }, { status: 400 })
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

  const { data: rows, error: rowsError } =
    await fetchAnalyticsRowsForBrandInsights(supabase, brandId, {
      userId: authResult.auth.userId,
      isAdmin: authResult.auth.isAdmin,
    })

  if (rowsError) {
    return NextResponse.json({ error: rowsError.message }, { status: 500 })
  }

  const analyticsRows = rows ?? []
  const generated = await generateBrandContentInsights(analyticsRows)

  if (!generated.ok) {
    if (generated.error === "No data") {
      return NextResponse.json({ error: "No data" }, { status: 404 })
    }

    if (generated.fallback) {
      return NextResponse.json({
        success: true,
        insights: generated.fallback,
        warning: generated.error,
      })
    }

    return NextResponse.json({ error: generated.error }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    insights: generated.insights,
    ...(generated.source === "rules" ? { source: "rules" } : {}),
  })
}
