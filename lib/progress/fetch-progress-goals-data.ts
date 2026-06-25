import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import {
  fetchClientGoals,
  type ClientGoalViewModel,
} from "@/lib/progress/client-goals"
import {
  fetchClientCheckins,
  type ClientCheckInRow,
} from "@/lib/progress/client-checkins"

export type ProgressGoalsData = {
  checkIns: ClientCheckInRow[]
  goals: ClientGoalViewModel[]
}

type FetchProgressGoalsDataOptions = {
  memberId?: string
}

/**
 * Shared goals + check-ins loader for Progress Dashboard Pro.
 * Source of truth: client_checkins + client_goals.
 */
export async function fetchProgressGoalsData(
  supabase: SupabaseClient<Database>,
  options: FetchProgressGoalsDataOptions = {},
): Promise<{ data: ProgressGoalsData; error: string | null }> {
  const checkInsResult = await fetchClientCheckins(supabase)

  if (checkInsResult.error) {
    return {
      data: { checkIns: [], goals: [] },
      error: checkInsResult.error,
    }
  }

  const goalsResult = await fetchClientGoals(supabase, checkInsResult.data)

  if (goalsResult.error) {
    return {
      data: { checkIns: checkInsResult.data, goals: [] },
      error: goalsResult.error,
    }
  }

  const { memberId } = options

  return {
    data: {
      checkIns: memberId
        ? checkInsResult.data.filter((row) => row.member_id === memberId)
        : checkInsResult.data,
      goals: memberId
        ? goalsResult.goals.filter((goal) => goal.memberId === memberId)
        : goalsResult.goals,
    },
    error: null,
  }
}
