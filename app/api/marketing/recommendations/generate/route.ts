import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { loadOrCreateBrandProfile } from "@/lib/marketing/brand-profile"
import { generateRecommendations } from "@/lib/marketing/recommendations/generate-recommendations"
import { formatRecommendationView } from "@/lib/marketing/recommendations/format-recommendation"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

function parseBrandId(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null
  }

  return value.trim()
}

async function resolveBrandId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  requestedBrandId: string | null,
): Promise<
  | { ok: true; brandId: string }
  | { ok: false; error: string; status: number }
> {
  if (requestedBrandId) {
    const { data: brand, error } = await supabase
      .from("brand_profiles")
      .select("id")
      .eq("id", requestedBrandId)
      .eq("owner_id", userId)
      .maybeSingle()

    if (error) {
      return { ok: false, error: error.message, status: 500 }
    }

    if (!brand?.id) {
      return { ok: false, error: "Brand not found.", status: 404 }
    }

    return { ok: true, brandId: brand.id }
  }

  const { profile, error } = await loadOrCreateBrandProfile(supabase, userId)

  if (error) {
    return { ok: false, error, status: 500 }
  }

  if (!profile?.id) {
    return { ok: false, error: "Brand profile could not be created.", status: 500 }
  }

  return { ok: true, brandId: profile.id }
}

export async function POST(req: Request) {
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

  let requestedBrandId: string | null = null

  try {
    const body = (await req.json()) as { brand_id?: unknown }
    requestedBrandId = parseBrandId(body.brand_id)
  } catch {
    // Optional body — load or create the user's brand profile below.
  }

  const brandResult = await resolveBrandId(
    supabase,
    authResult.auth.userId,
    requestedBrandId,
  )

  if (!brandResult.ok) {
    return NextResponse.json(
      { error: brandResult.error },
      { status: brandResult.status },
    )
  }

  const result = await generateRecommendations({
    supabase,
    userId: authResult.auth.userId,
    brandId: brandResult.brandId,
  })

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 500 },
    )
  }

  return NextResponse.json({
    success: true,
    summary: result.summary,
    recommendations: result.recommendations.map(formatRecommendationView),
    readiness: result.readiness,
  })
}
