import { NextResponse } from "next/server"
import { buildBrandContext } from "@/lib/marketing/build-brand-context"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

const BRAND_SELECT =
  "name, description, niche, target_audience, tone_of_voice, goals, platform_focus, mascot_name, mascot_description, mascot_style, mascot_voice_tone" as const

export async function GET() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: brand, error } = await supabase
    .from("brand_profiles")
    .select(BRAND_SELECT)
    .eq("owner_id", user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!brand) {
    return NextResponse.json(
      { error: "Brand profile not found." },
      { status: 404 },
    )
  }

  const context = buildBrandContext(brand)

  return NextResponse.json({ context })
}
