import type { SupabaseClient } from "@supabase/supabase-js"

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
  supabase: SupabaseClient,
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
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const status = await getCoachOnboardingStatus(supabase, userId)
  return status.complete
}
