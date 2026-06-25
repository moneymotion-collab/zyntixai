import type { Database } from "@/lib/database.types"

export type MemberRow = Database["public"]["Tables"]["members"]["Row"]
export type WorkoutPlanRow =
  Database["public"]["Tables"]["workout_plans"]["Row"]

export type CoachWorkoutAssignment = {
  member_id: string
  workout_plan_id: string
  assigned_at: string
  members: Pick<MemberRow, "full_name" | "email"> | null
  workout_plans: Pick<WorkoutPlanRow, "title" | "goal"> | null
}

export type AssignWorkoutInput = {
  memberId: string
  workoutPlanId: string
}

export type AssignWorkoutResult =
  | { success: true }
  | { success: false; message: string }

export const WORKOUT_ASSIGNMENT_STATUS = {
  active: "active",
  completed: "completed",
} as const

export type WorkoutAssignmentStatus =
  (typeof WORKOUT_ASSIGNMENT_STATUS)[keyof typeof WORKOUT_ASSIGNMENT_STATUS]
