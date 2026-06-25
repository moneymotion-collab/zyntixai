import type { Database } from "@/lib/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export type GymSettings = Database["public"]["Tables"]["gym_settings"]["Row"]

export type GymSettingsFormValues = {
  gym_name: string
  logo_url: string
  website: string
  instagram_url: string
  facebook_url: string
  tiktok_url: string
  primary_color: string
  secondary_color: string
}

export const DEFAULT_GYM_SETTINGS_FORM: GymSettingsFormValues = {
  gym_name: "",
  logo_url: "",
  website: "",
  instagram_url: "",
  facebook_url: "",
  tiktok_url: "",
  primary_color: "#000000",
  secondary_color: "#ffffff",
}

export function gymSettingsToFormValues(
  settings: GymSettings,
): GymSettingsFormValues {
  return {
    gym_name: settings.gym_name ?? DEFAULT_GYM_SETTINGS_FORM.gym_name,
    logo_url: settings.logo_url ?? DEFAULT_GYM_SETTINGS_FORM.logo_url,
    website: settings.website ?? DEFAULT_GYM_SETTINGS_FORM.website,
    instagram_url:
      settings.instagram_url ?? DEFAULT_GYM_SETTINGS_FORM.instagram_url,
    facebook_url:
      settings.facebook_url ?? DEFAULT_GYM_SETTINGS_FORM.facebook_url,
    tiktok_url: settings.tiktok_url ?? DEFAULT_GYM_SETTINGS_FORM.tiktok_url,
    primary_color:
      settings.primary_color ?? DEFAULT_GYM_SETTINGS_FORM.primary_color,
    secondary_color:
      settings.secondary_color ?? DEFAULT_GYM_SETTINGS_FORM.secondary_color,
  }
}

export async function loadOrCreateGymSettings(
  supabase: SupabaseClient<Database>,
  ownerId: string,
): Promise<{ settings: GymSettings | null; error: string | null }> {
  const { data: existing, error: selectError } = await supabase
    .from("gym_settings")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (selectError) {
    return { settings: null, error: selectError.message }
  }

  if (existing) {
    return { settings: existing, error: null }
  }

  const { data: created, error: insertError } = await supabase
    .from("gym_settings")
    .insert({ owner_id: ownerId })
    .select("*")
    .single()

  if (insertError) {
    return { settings: null, error: insertError.message }
  }

  return { settings: created, error: null }
}

export async function saveGymSettings(
  supabase: SupabaseClient<Database>,
  ownerId: string,
  values: GymSettingsFormValues,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("gym_settings")
    .upsert(
      {
        owner_id: ownerId,
        ...values,
      },
      { onConflict: "owner_id" },
    )

  return { error: error?.message ?? null }
}
