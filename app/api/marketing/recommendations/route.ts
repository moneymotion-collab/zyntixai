import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { loadLatestMarketingRecommendations } from "@/lib/marketing/recommendations/load-latest-recommendations"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function GET() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    )
  }

  const { data: brand, error: brandError } = await supabase
    .from("brand_profiles")
    .select("id")
    .eq("owner_id", authResult.auth.userId)
    .maybeSingle()

  if (brandError) {
    return NextResponse.json({ error: brandError.message }, { status: 500 })
  }

  if (!brand?.id) {
    return NextResponse.json({ recommendations: [] })
  }

  const { data: recommendations, runId, readiness, error } =
    await loadLatestMarketingRecommendations(
      supabase,
      brand.id,
      authResult.auth.userId,
    )

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ recommendations, runId, readiness })
}
