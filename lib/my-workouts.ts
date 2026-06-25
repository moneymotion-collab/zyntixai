import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { resolveLinkedMemberId } from "@/lib/member-link"
import type {
  MyWorkoutAssignment,
  MyWorkoutsQueryResult,
} from "@/lib/types/my-workouts"
import {
  fetchExercisesByPlanIds,
  groupExercisesByPlanId,
  isWorkoutPlanExercisesSchemaError,
  mapWorkoutPlanExercise,
  WORKOUT_PLAN_EXERCISES_MIGRATION_HINT,
  WORKOUT_PLAN_EXERCISES_SELECT,
  type WorkoutPlanExerciseRow,
} from "@/lib/workout-exercises"

const MY_WORKOUTS_SELECT = `*, workout_plans ( id, title, goal, workout_plan_exercises ( ${WORKOUT_PLAN_EXERCISES_SELECT} ) )`

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

export async function fetchMyWorkouts(
  supabase: SupabaseClient<Database>,
): Promise<MyWorkoutsQueryResult> {
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError) {
    throw new Error(authError.message)
  }

  if (!userData.user) {
    return { assignments: [], memberId: null, noMemberProfile: false }
  }

  const memberId = await resolveLinkedMemberId(supabase)

  if (!memberId) {
    return { assignments: [], memberId: null, noMemberProfile: true }
  }

  const { data, error } = await supabase
    .from("workout_assignments")
    .select(MY_WORKOUTS_SELECT)
    .eq("member_id", memberId)
    .order("assigned_at", { ascending: false })

  if (error && !isWorkoutPlanExercisesSchemaError(error.message)) {
    throw new Error(error.message)
  }

  if (error) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("workout_assignments")
      .select("*, workout_plans ( id, title, goal )")
      .eq("member_id", memberId)
      .order("assigned_at", { ascending: false })

    if (fallbackError) {
      throw new Error(fallbackError.message)
    }

    const planIds = (fallbackData ?? [])
      .map((row) => row.workout_plans?.id)
      .filter((id): id is string => Boolean(id))

    const { rows, error: exercisesError } = await fetchExercisesByPlanIds(
      supabase,
      planIds,
    )

    if (exercisesError && isWorkoutPlanExercisesSchemaError(exercisesError.message)) {
      const assignments = ((fallbackData ?? []) as MyWorkoutAssignment[]).map(
        (assignment) => ({
          ...assignment,
          workout_plans: assignment.workout_plans
            ? { ...assignment.workout_plans, workout_plan_exercises: [] }
            : null,
        }),
      )

      return {
        assignments: sortAssignments(assignments),
        memberId,
        noMemberProfile: false,
        schemaMissing: true,
        schemaHint: WORKOUT_PLAN_EXERCISES_MIGRATION_HINT,
      }
    }

    if (exercisesError) {
      throw new Error(exercisesError.message)
    }

    const grouped = groupExercisesByPlanId(rows)
    const assignments = (fallbackData ?? []).map((assignment) => {
      const plan = assignment.workout_plans
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

    return {
      assignments: sortAssignments(assignments),
      memberId,
      noMemberProfile: false,
    }
  }

  const assignments: MyWorkoutAssignment[] = (
    (data as Array<
      Omit<MyWorkoutAssignment, "workout_plans"> & {
        workout_plans:
          | (Omit<
              NonNullable<MyWorkoutAssignment["workout_plans"]>,
              "workout_plan_exercises"
            > & {
              workout_plan_exercises: WorkoutPlanExerciseRow[] | null
            })
          | null
      }
    >) ?? []
  ).map((assignment) => ({
    ...assignment,
    workout_plans: assignment.workout_plans
      ? {
          ...assignment.workout_plans,
          workout_plan_exercises: (
            assignment.workout_plans.workout_plan_exercises ?? []
          ).map(mapWorkoutPlanExercise),
        }
      : null,
  }))

  return {
    assignments: sortAssignments(assignments),
    memberId,
    noMemberProfile: false,
  }
}

export function getTodaysWorkoutAssignment(
  assignments: MyWorkoutAssignment[],
): MyWorkoutAssignment | null {
  if (assignments.length === 0) return null
  return (
    assignments.find((assignment) => assignment.status !== "completed") ??
    assignments[0]
  )
}
