import type { Database } from "@/lib/database.types"
import {
  FITCORE_COACH_MASCOT,
  getMascotDescription,
  getMascotStyle,
  type MascotFieldOverrides,
} from "@/lib/marketing/brand-mascot"
import type { VideoScriptMascot } from "@/lib/marketing/video-script-types"
import type { SupabaseClient } from "@supabase/supabase-js"

export type BrandProfile =
  Database["public"]["Tables"]["brand_profiles"]["Row"]

export type BrandProfileFormValues = {
  name: string
  description: string
  tone_of_voice: string
  target_audience: string
  niche: string
  goals: string
  platform_focus: string
  mascot_name: string
  mascot_description: string
  mascot_style: string
  mascot_voice_tone: string
}

export type BrandContextInput = Pick<
  BrandProfile,
  | "name"
  | "description"
  | "niche"
  | "target_audience"
  | "tone_of_voice"
  | "goals"
  | "platform_focus"
  | "mascot_name"
  | "mascot_description"
  | "mascot_style"
  | "mascot_voice_tone"
>

export function buildBrandContext(brand: BrandContextInput): string {
  return `
You are creating marketing content for a brand.

BRAND PROFILE:
----------------
Name: ${brand.name}
Description: ${brand.description || "Not provided"}

Niche: ${brand.niche}
Target Audience: ${brand.target_audience}
Tone of Voice: ${brand.tone_of_voice}
Goals: ${brand.goals}
Platform Focus: ${brand.platform_focus}

MASCOT:
----------------
Name: ${brand.mascot_name || "Not provided"}
Description: ${brand.mascot_description || "Not provided"}
Style: ${brand.mascot_style || "Not provided"}
Voice tone: ${brand.mascot_voice_tone || "Not provided"}

RULES:
- Always match tone of voice
- Always target the specified audience
- Always align with goals
- Never change brand identity
- Keep content platform-specific

OUTPUT STYLE:
- Clear
- Actionable
- High engagement focus
- Social media optimized
`.trim()
}

export function buildStrategyBrandContext(
  brand: Pick<
    BrandProfile,
    "name" | "niche" | "target_audience" | "tone_of_voice"
  >,
  goal: string,
  platform: string,
): string {
  return `
Brand: ${brand.name}
Niche: ${brand.niche}
Audience: ${brand.target_audience}
Tone of voice: ${brand.tone_of_voice}
Goal: ${goal}
Platform: ${platform}
`.trim()
}

export const DEFAULT_BRAND_PROFILE_FORM: BrandProfileFormValues = {
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

export type BrandMascotDefaults = VideoScriptMascot & MascotFieldOverrides

export function getBrandMascotDefaults(
  brand: Pick<
    BrandProfile,
    "name" | "mascot_name" | "mascot_description" | "mascot_style" | "mascot_voice_tone"
  >,
): BrandMascotDefaults {
  return {
    name: brand.mascot_name.trim() || brand.name.trim() || FITCORE_COACH_MASCOT.name,
    description:
      brand.mascot_description.trim() || getMascotDescription(),
    style: brand.mascot_style.trim() || getMascotStyle(),
    personality:
      brand.mascot_voice_tone.trim() ||
      FITCORE_COACH_MASCOT.voiceTone.join(", "),
    voiceTone:
      brand.mascot_voice_tone.trim() ||
      FITCORE_COACH_MASCOT.voiceTone.join(", "),
  }
}

export function brandProfileToFormValues(
  profile: BrandProfile,
): BrandProfileFormValues {
  return {
    name: profile.name,
    description: profile.description,
    tone_of_voice: profile.tone_of_voice,
    target_audience: profile.target_audience,
    niche: profile.niche,
    goals: profile.goals,
    platform_focus: profile.platform_focus,
    mascot_name: profile.mascot_name,
    mascot_description: profile.mascot_description,
    mascot_style: profile.mascot_style,
    mascot_voice_tone: profile.mascot_voice_tone,
  }
}

export async function loadOrCreateBrandProfile(
  supabase: SupabaseClient<Database>,
  ownerId: string,
): Promise<{ profile: BrandProfile | null; error: string | null }> {
  const { data: existing, error: selectError } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (selectError) {
    return { profile: null, error: selectError.message }
  }

  if (existing) {
    return { profile: existing, error: null }
  }

  const { data: created, error: insertError } = await supabase
    .from("brand_profiles")
    .insert({ owner_id: ownerId, ...DEFAULT_BRAND_PROFILE_FORM })
    .select("*")
    .single()

  if (insertError) {
    return { profile: null, error: insertError.message }
  }

  return { profile: created, error: null }
}

export async function saveBrandProfile(
  supabase: SupabaseClient<Database>,
  ownerId: string,
  values: BrandProfileFormValues,
): Promise<{ profile: BrandProfile | null; error: string | null }> {
  const { profile, error: loadError } = await loadOrCreateBrandProfile(
    supabase,
    ownerId,
  )

  if (loadError || !profile) {
    return { profile: null, error: loadError ?? "Brand profile not found." }
  }

  const { data: updated, error } = await supabase
    .from("brand_profiles")
    .update(values)
    .eq("owner_id", ownerId)
    .select("*")
    .single()

  return { profile: updated, error: error?.message ?? null }
}
