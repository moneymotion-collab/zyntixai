import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { saveBrandProfile } from "@/lib/marketing/brand-profile"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

const BRAND_SELECT =
  "id, name, description, tone_of_voice, target_audience, niche, goals, platform_focus, mascot_name, mascot_description, mascot_style, mascot_voice_tone" as const

const EMPTY_BRAND_PROFILE = {
  id: null,
  name: "",
  description: "",
  tone_of_voice: "",
  target_audience: "",
  niche: "",
  goals: "",
  platform_focus: "",
  mascot_name: "",
  mascot_description: "",
  mascot_style: "",
  mascot_voice_tone: "",
}

export async function GET() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("brand_profiles")
    .select(BRAND_SELECT)
    .eq("owner_id", user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    profile: data ?? EMPTY_BRAND_PROFILE,
  })
}

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()

  const body = await req.json()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const { error } = await saveBrandProfile(supabase, user.id, {
    name: body.name ?? "",
    description: body.description ?? "",
    tone_of_voice: body.tone_of_voice ?? "",
    target_audience: body.target_audience ?? "",
    niche: body.niche ?? "",
    goals: body.goals ?? "",
    platform_focus: body.platform_focus ?? "",
    mascot_name: body.mascot_name ?? "",
    mascot_description: body.mascot_description ?? "",
    mascot_style: body.mascot_style ?? "",
    mascot_voice_tone: body.mascot_voice_tone ?? "",
  })

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
