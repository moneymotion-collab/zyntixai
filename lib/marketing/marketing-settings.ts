import type { Database } from "@/lib/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { isMarketingPlatformSelectable } from "@/lib/marketing/platform-availability"

export type MarketingSettings =
  Database["public"]["Tables"]["marketing_settings"]["Row"]

export type MarketingSettingsFormValues = {
  gym_type: string
  target_audience: string
  business_goal: string
  posting_frequency: string
  content_tone: string
  preferred_platform: string
}

export const MARKETING_GYM_TYPES = [
  "General Fitness",
  "CrossFit",
  "Bodybuilding",
  "Boutique Studio",
  "Personal Training",
  "Group Classes",
] as const

export const MARKETING_TARGET_AUDIENCES = [
  "Beginners",
  "Busy Professionals",
  "Athletes",
  "Seniors",
  "Weight Loss",
  "Muscle Building",
  "Local Community",
] as const

export const MARKETING_BUSINESS_GOALS = [
  "Get More Members",
  "Increase Engagement",
  "Promote Personal Training",
  "Build Brand Awareness",
  "Retention",
  "Launch a Challenge",
] as const

export const MARKETING_POSTING_FREQUENCIES = [
  "Daily",
  "5x per week",
  "3x per week",
  "2x per week",
  "Weekly",
] as const

export const MARKETING_CONTENT_TONES = [
  "Motivational",
  "Educational",
  "Friendly",
  "Professional",
  "Bold",
  "Community-focused",
] as const

export const MARKETING_PLATFORMS = [
  "Instagram",
  "TikTok",
  "Facebook",
  "LinkedIn",
  "YouTube",
] as const

/** Platforms users can pick in Marketing AI UI (beta: Instagram; + Facebook/TikTok when enabled). */
export const MARKETING_SELECTABLE_PLATFORMS = MARKETING_PLATFORMS.filter(
  (platform) => isMarketingPlatformSelectable(platform),
) as ReadonlyArray<(typeof MARKETING_PLATFORMS)[number]>

export const MARKETING_SELECTABLE_PLATFORMS_LOWERCASE =
  MARKETING_SELECTABLE_PLATFORMS.map((platform) => platform.toLowerCase()) as ReadonlyArray<
    Lowercase<(typeof MARKETING_PLATFORMS)[number]>
  >

export const DEFAULT_MARKETING_SETTINGS_FORM: MarketingSettingsFormValues = {
  gym_type: "",
  target_audience: "",
  business_goal: "",
  posting_frequency: "",
  content_tone: "",
  preferred_platform: "",
}

export function marketingSettingsToFormValues(
  settings: MarketingSettings,
): MarketingSettingsFormValues {
  return {
    gym_type: settings.gym_type ?? "",
    target_audience: settings.target_audience ?? "",
    business_goal: settings.business_goal ?? "",
    posting_frequency: settings.posting_frequency ?? "",
    content_tone: settings.content_tone ?? "",
    preferred_platform: settings.preferred_platform ?? "",
  }
}

export async function loadOrCreateMarketingSettings(
  supabase: SupabaseClient<Database>,
  ownerId: string,
): Promise<{ settings: MarketingSettings | null; error: string | null }> {
  const { data: existing, error: selectError } = await supabase
    .from("marketing_settings")
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
    .from("marketing_settings")
    .insert({ owner_id: ownerId, ...DEFAULT_MARKETING_SETTINGS_FORM })
    .select("*")
    .single()

  if (insertError) {
    return { settings: null, error: insertError.message }
  }

  return { settings: created, error: null }
}

export async function saveMarketingSettings(
  supabase: SupabaseClient<Database>,
  ownerId: string,
  values: MarketingSettingsFormValues,
): Promise<{ error: string | null }> {
  const { settings, error: loadError } = await loadOrCreateMarketingSettings(
    supabase,
    ownerId,
  )

  if (loadError || !settings) {
    return { error: loadError ?? "Marketing settings not found." }
  }

  const { error } = await supabase
    .from("marketing_settings")
    .update(values)
    .eq("owner_id", ownerId)

  return { error: error?.message ?? null }
}
