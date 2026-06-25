import type { Database } from "@/lib/database.types"
import type { WorkoutExerciseSummary } from "@/lib/workout-exercises"

export type WorkoutAssignmentRow =
  Database["public"]["Tables"]["workout_assignments"]["Row"]

export type AssignedWorkoutPlanDetails = Pick<
  Database["public"]["Tables"]["workout_plans"]["Row"],
  "id" | "title" | "goal"
> & {
  workout_plan_exercises: WorkoutExerciseSummary[]
}

export type MyWorkoutAssignment = WorkoutAssignmentRow & {
  workout_plans: AssignedWorkoutPlanDetails | null
}

export type MyWorkoutsQueryResult = {
  assignments: MyWorkoutAssignment[]
  memberId: string | null
  noMemberProfile: boolean
  schemaMissing?: boolean
  schemaHint?: string
}

export type MyWorkoutsLoadState = {
  loading: boolean
  error: string | null
  data: MyWorkoutsQueryResult
}
