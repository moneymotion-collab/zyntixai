import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import {
  DEFAULT_GYM_SETTINGS_FORM,
  saveGymSettings,
} from "@/lib/gym-settings"

export async function saveCoachGymName(
  supabase: SupabaseClient<Database>,
  ownerId: string,
  gymName: string,
): Promise<{ error: string | null }> {
  const trimmed = gymName.trim()
  if (!trimmed) {
    return { error: "Gym name is required." }
  }

  const { data: existingGym } = await supabase
    .from("gyms")
    .select("id")
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (existingGym) {
    const { error } = await supabase
      .from("gyms")
      .update({ name: trimmed })
      .eq("owner_id", ownerId)

    if (error) {
      return { error: error.message }
    }
  } else {
    const { error } = await supabase.from("gyms").insert({
      name: trimmed,
      owner_id: ownerId,
    })

    if (error) {
      return { error: error.message }
    }
  }

  return saveGymSettings(supabase, ownerId, {
    ...DEFAULT_GYM_SETTINGS_FORM,
    gym_name: trimmed,
  })
}
