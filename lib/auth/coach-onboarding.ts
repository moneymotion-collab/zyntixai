import type { SupabaseClient } from "@supabase/supabase-js"
import { saveCoachGymName } from "@/lib/auth/save-coach-gym"
import type { Database } from "@/lib/database.types"

export type CoachOnboardingStatus = {
  complete: boolean
  hasGymName: boolean
  hasGymRecord: boolean
  isDemoWorkspace: boolean
}

function hasNonEmptyGymName(value: string | null | undefined): boolean {
  return Boolean(value?.trim())
}

export async function getCoachOnboardingStatus(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<CoachOnboardingStatus> {
  const [gymSettingsResult, gymsResult] = await Promise.all([
    supabase
      .from("gym_settings")
      .select("gym_name, is_demo_workspace")
      .eq("owner_id", userId)
      .maybeSingle(),
    supabase
      .from("gyms")
      .select("name")
      .eq("owner_id", userId)
      .maybeSingle(),
  ])

  const gymSettings = gymSettingsResult.data
  const gymName =
    gymSettings?.gym_name?.trim() || gymsResult.data?.name?.trim() || ""
  const hasGymName = hasNonEmptyGymName(gymName)
  const hasGymRecord = Boolean(gymsResult.data)
  const isDemoWorkspace = Boolean(gymSettings?.is_demo_workspace)

  return {
    complete: isDemoWorkspace || hasGymName,
    hasGymName,
    hasGymRecord,
    isDemoWorkspace,
  }
}

export async function hasCompletedCoachOnboarding(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const status = await getCoachOnboardingStatus(supabase, userId)
  return status.complete
}

export async function markCoachOnboardingComplete(
  supabase: SupabaseClient<Database>,
  userId: string,
  gymName?: string,
): Promise<{ error: string | null }> {
  if (gymName?.trim()) {
    return saveCoachGymName(supabase, userId, gymName)
  }

  if (await hasCompletedCoachOnboarding(supabase, userId)) {
    return { error: null }
  }

  return {
    error: "Set your gym or business name to finish onboarding.",
  }
}
