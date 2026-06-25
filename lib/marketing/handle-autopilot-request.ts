import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { generateAutopilotStrategy } from "@/lib/marketing/generate-autopilot-strategy"
import { fetchAnalyticsRowsByBrandId } from "@/lib/marketing/fetch-analytics-rows"
import { createClient } from "@/lib/supabase/server"

export async function handleAutopilotRequest(req: Request) {
  try {
    const supabase = await createClient()
    const authResult = await getAiCoachAuth(supabase)

    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      )
    }

    const body = await req.json()
    const brandId =
      typeof body.brand_id === "string" ? body.brand_id.trim() : ""

    if (!brandId) {
      return NextResponse.json(
        { error: "brand_id is required." },
        { status: 400 },
      )
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

    const { data: analytics, error: analyticsError } =
      await fetchAnalyticsRowsByBrandId(supabase, brandId, {
        userId: authResult.auth.userId,
        isAdmin: authResult.auth.isAdmin,
      })

    if (analyticsError) {
      return NextResponse.json(
        { error: analyticsError.message },
        { status: 500 },
      )
    }

    const result = await generateAutopilotStrategy(analytics ?? [])

    if (!result.ok) {
      if (result.error === "No analytics found.") {
        return NextResponse.json({ error: result.error }, { status: 404 })
      }

      return NextResponse.json(
        {
          error: result.error,
          ...(result.raw ? { raw: result.raw } : {}),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      brand_id: brandId,
      autopilot: result.autopilot,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
