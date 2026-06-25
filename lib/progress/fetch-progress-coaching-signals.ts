import type { SupabaseClient } from "@supabase/supabase-js"
import { getCoachMemberIds, getCoachScope } from "@/lib/auth/coach-scope"
import type { Database } from "@/lib/database.types"
import { fetchClientCheckins, type ClientCheckInRow } from "@/lib/progress/client-checkins"
import { resolveLinkedMemberId } from "@/lib/member-link"

export type WorkoutCompletionSignal = {
  member_id: string
  completed_at: string
}

export type WorkoutAssignmentSignal = {
  member_id: string
  status: string
}

export type NutritionAssignmentSignal = {
  member_id: string
  status: string
  nutrition_plans: { title: string } | null
}

export type ClientHabitSignal = {
  member_id: string
  logged_at: string
  created_at?: string
}

export type ProgressCoachingSignals = {
  completions: WorkoutCompletionSignal[]
  assignments: WorkoutAssignmentSignal[]
  nutritionAssignments: NutritionAssignmentSignal[]
  habits: ClientHabitSignal[]
  checkIns: ClientCheckInRow[]
}

function coachingSignalsWindowStartIso(): string {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 29)
  return start.toISOString()
}

export async function resolveCoachingScopeMemberIds(
  supabase: SupabaseClient<Database>,
): Promise<string[] | null> {
  const scope = await getCoachScope(supabase)

  if (scope.isMember) {
    const memberId = await resolveLinkedMemberId(supabase)
    return memberId ? [memberId] : []
  }

  if (scope.isCoach && scope.userId) {
    return getCoachMemberIds(supabase, scope.userId)
  }

  return null
}

export async function fetchProgressCoachingSignals(
  supabase: SupabaseClient<Database>,
): Promise<{ data: ProgressCoachingSignals | null; error: string | null }> {
  try {
    const scope = await getCoachScope(supabase)
    let memberIds: string[] | null = null

    if (scope.isMember) {
      const memberId = await resolveLinkedMemberId(supabase)
      memberIds = memberId ? [memberId] : []
    } else if (scope.isCoach && scope.userId) {
      memberIds = await getCoachMemberIds(supabase, scope.userId)
    }

    if (memberIds && memberIds.length === 0) {
      return {
        data: {
          completions: [],
          assignments: [],
          nutritionAssignments: [],
          habits: [],
          checkIns: [],
        },
        error: null,
      }
    }

    const windowStart = coachingSignalsWindowStartIso()

    let completionsQuery = supabase
      .from("workout_completions")
      .select("member_id, completed_at")
      .gte("completed_at", windowStart)

    let assignmentsQuery = supabase
      .from("workout_assignments")
      .select("member_id, status")

    let nutritionQuery = supabase.from("member_nutrition_assignments").select(`
        member_id,
        status,
        nutrition_plans (
          title
        )
      `)

    let habitsQuery = supabase
      .from("client_habits")
      .select("member_id, logged_at, created_at")

    if (memberIds) {
      completionsQuery = completionsQuery.in("member_id", memberIds)
      assignmentsQuery = assignmentsQuery.in("member_id", memberIds)
      nutritionQuery = nutritionQuery.in("member_id", memberIds)
      habitsQuery = habitsQuery.in("member_id", memberIds)
    }

    const [completionsResult, assignmentsResult, nutritionResult, habitsResult, checkInsResult] =
      await Promise.all([
        completionsQuery,
        assignmentsQuery,
        nutritionQuery,
        habitsQuery,
        fetchClientCheckins(supabase),
      ])

    if (completionsResult.error) {
      return { data: null, error: completionsResult.error.message }
    }
    if (assignmentsResult.error) {
      return { data: null, error: assignmentsResult.error.message }
    }
    if (nutritionResult.error) {
      return { data: null, error: nutritionResult.error.message }
    }
    if (habitsResult.error) {
      return { data: null, error: habitsResult.error.message }
    }
    if (checkInsResult.error) {
      return { data: null, error: checkInsResult.error }
    }

    return {
      data: {
        completions: completionsResult.data ?? [],
        assignments: assignmentsResult.data ?? [],
        nutritionAssignments: (nutritionResult.data ?? []) as NutritionAssignmentSignal[],
        habits: habitsResult.data ?? [],
        checkIns: checkInsResult.data,
      },
      error: null,
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load coaching signals"
    return { data: null, error: message }
  }
}
