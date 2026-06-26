import type { SupabaseClient } from "@supabase/supabase-js"
import { saveCoachGymName } from "@/lib/auth/save-coach-gym"
import type { Database } from "@/lib/database.types"
import {
  getCoachOnboardingStatus,
  hasCompletedCoachOnboarding,
  type CoachOnboardingStatus,
} from "@/lib/auth/coach-onboarding-status"

export type { CoachOnboardingStatus }
export { getCoachOnboardingStatus, hasCompletedCoachOnboarding }

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
