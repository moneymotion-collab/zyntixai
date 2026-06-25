import { NextResponse } from "next/server"
import {
  DEFAULT_GYM_SETTINGS_FORM,
  gymSettingsToFormValues,
  loadOrCreateGymSettings,
  saveGymSettings,
  type GymSettingsFormValues,
} from "@/lib/gym-settings"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

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

  const { settings, error } = await loadOrCreateGymSettings(supabase, user.id)

  if (error || !settings) {
    return NextResponse.json(
      { error: error ?? "Could not load gym settings." },
      { status: 500 },
    )
  }

  return NextResponse.json({
    settings: gymSettingsToFormValues(settings),
  })
}

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const body = (await req.json()) as Partial<GymSettingsFormValues>

  const values: GymSettingsFormValues = {
    gym_name: body.gym_name ?? DEFAULT_GYM_SETTINGS_FORM.gym_name,
    logo_url: body.logo_url ?? DEFAULT_GYM_SETTINGS_FORM.logo_url,
    website: body.website ?? DEFAULT_GYM_SETTINGS_FORM.website,
    instagram_url: body.instagram_url ?? DEFAULT_GYM_SETTINGS_FORM.instagram_url,
    facebook_url: body.facebook_url ?? DEFAULT_GYM_SETTINGS_FORM.facebook_url,
    tiktok_url: body.tiktok_url ?? DEFAULT_GYM_SETTINGS_FORM.tiktok_url,
    primary_color: body.primary_color ?? DEFAULT_GYM_SETTINGS_FORM.primary_color,
    secondary_color:
      body.secondary_color ?? DEFAULT_GYM_SETTINGS_FORM.secondary_color,
  }

  const { error } = await saveGymSettings(supabase, user.id, values)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
