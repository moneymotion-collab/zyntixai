import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type { MyWorkoutAssignment } from "@/lib/types/my-workouts"
import {
  fetchExercisesByPlanIds,
  groupExercisesByPlanId,
  isWorkoutPlanExercisesSchemaError,
  mapWorkoutPlanExercise,
  WORKOUT_PLAN_EXERCISES_SELECT,
  type WorkoutPlanExerciseRow,
} from "@/lib/workout-exercises"

const MEMBER_ASSIGNMENTS_SELECT = `*, workout_plans ( id, title, goal, workout_plan_exercises ( ${WORKOUT_PLAN_EXERCISES_SELECT} ) )`

function sortAssignments(assignments: MyWorkoutAssignment[]): MyWorkoutAssignment[] {
  return assignments.map((assignment) => {
    const exercises = assignment.workout_plans?.workout_plan_exercises ?? []
    return {
      ...assignment,
      workout_plans: assignment.workout_plans
        ? {
            ...assignment.workout_plans,
            workout_plan_exercises: [...exercises].sort(
              (a, b) => a.order_index - b.order_index,
            ),
          }
        : null,
    }
  })
}

export async function fetchMemberAssignedWorkouts(
  supabase: SupabaseClient<Database>,
  memberId: string,
): Promise<{ assignments: MyWorkoutAssignment[]; error: string | null }> {
  const { data, error } = await supabase
    .from("workout_assignments")
    .select(MEMBER_ASSIGNMENTS_SELECT)
    .eq("member_id", memberId)
    .order("assigned_at", { ascending: false })

  if (!error) {
    const assignments: MyWorkoutAssignment[] = (data ?? []).map((assignment) => {
      const plan = assignment.workout_plans as {
        id: string
        title: string
        goal: string | null
        workout_plan_exercises: WorkoutPlanExerciseRow[] | null
      } | null

      return {
        ...assignment,
        workout_plans: plan
          ? {
              ...plan,
              workout_plan_exercises: (plan.workout_plan_exercises ?? []).map(
                mapWorkoutPlanExercise,
              ),
            }
          : null,
      }
    })

    return {
      assignments: sortAssignments(assignments),
      error: null,
    }
  }

  if (!isWorkoutPlanExercisesSchemaError(error.message)) {
    return { assignments: [], error: error.message }
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("workout_assignments")
    .select("*, workout_plans ( id, title, goal )")
    .eq("member_id", memberId)
    .order("assigned_at", { ascending: false })

  if (fallbackError) {
    return { assignments: [], error: fallbackError.message }
  }

  const planIds = (fallbackData ?? [])
    .map((row) => row.workout_plans?.id)
    .filter((id): id is string => Boolean(id))

  const { rows, error: exercisesError } = await fetchExercisesByPlanIds(
    supabase,
    planIds,
  )

  if (exercisesError) {
    return { assignments: [], error: exercisesError.message }
  }

  const grouped = groupExercisesByPlanId(rows)
  const assignments = (fallbackData ?? []).map((assignment) => {
    const plan = assignment.workout_plans as {
      id: string
      title: string
      goal: string | null
    } | null

    return {
      ...assignment,
      workout_plans: plan
        ? {
            ...plan,
            workout_plan_exercises: (grouped.get(plan.id) ?? []).map(
              mapWorkoutPlanExercise,
            ),
          }
        : null,
    }
  }) as MyWorkoutAssignment[]

  return { assignments: sortAssignments(assignments), error: null }
}
