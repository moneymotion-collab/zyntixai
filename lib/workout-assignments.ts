import type { SupabaseClient } from "@supabase/supabase-js"
import type { PostgrestError } from "@supabase/supabase-js"
import { getCoachMemberIds } from "@/lib/auth/coach-scope"
import type { Database } from "@/lib/database.types"
import type {
  AssignWorkoutInput,
  AssignWorkoutResult,
  CoachWorkoutAssignment,
} from "@/lib/types/workout-assignments"
import { WORKOUT_ASSIGNMENT_STATUS } from "@/lib/types/workout-assignments"

export const COACH_ASSIGNMENTS_SELECT = `
  member_id,
  workout_plan_id,
  assigned_at,
  members ( full_name, email ),
  workout_plans ( title, goal )
`

export function getAssignErrorMessage(error: PostgrestError): string {
  if (error.code === "23505") {
    return "This workout is already assigned to this member."
  }
  return error.message
}

export async function assignWorkoutToMember(
  supabase: SupabaseClient<Database>,
  input: AssignWorkoutInput,
): Promise<AssignWorkoutResult> {
  const { error } = await supabase.from("workout_assignments").insert([
    {
      member_id: input.memberId,
      workout_plan_id: input.workoutPlanId,
      status: WORKOUT_ASSIGNMENT_STATUS.active,
    },
  ])

  if (error) {
    return { success: false, message: getAssignErrorMessage(error) }
  }

  return { success: true }
}

export async function fetchCoachAssignments(
  supabase: SupabaseClient<Database>,
  options?: { coachUserId?: string | null; isAdmin?: boolean },
): Promise<CoachWorkoutAssignment[]> {
  let query = supabase
    .from("workout_assignments")
    .select(COACH_ASSIGNMENTS_SELECT)
    .order("assigned_at", { ascending: false })

  if (!options?.isAdmin && options?.coachUserId) {
    const memberIds = await getCoachMemberIds(supabase, options.coachUserId)
    if (memberIds.length === 0) {
      return []
    }
    query = query.in("member_id", memberIds)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return (data as CoachWorkoutAssignment[]) ?? []
}
