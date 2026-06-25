import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { saveBrandProfile } from "@/lib/marketing/brand-profile"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const {
      name,
      description,
      niche,
      target_audience,
      tone_of_voice,
      goals,
      platform_focus,
    } = body

    const { profile, error } = await saveBrandProfile(supabase, user.id, {
      name: name ?? "",
      description: description ?? "",
      niche: niche ?? "",
      target_audience: target_audience ?? "",
      tone_of_voice: tone_of_voice ?? "",
      goals: goals ?? "",
      platform_focus: platform_focus ?? "",
      mascot_name: "",
      mascot_description: "",
      mascot_style: "",
      mascot_voice_tone: "",
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      brand: profile,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
