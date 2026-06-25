import type { AttentionReason } from "@/lib/coach-dashboard/types"
import type { Database } from "@/lib/database.types"

export type WorkspaceMember = {
  id: string
  fullName: string
  email: string
}

export type LatestProgress = {
  metric: string
  currentValue: number
  changeValue: number | null
  updatedAt: string
}

export type ActivePlan = {
  id: string
  title: string
}

export type UpcomingSession = {
  id: string
  sessionType: string | null
  scheduledAt: string
  status: string | null
}

export type WorkspaceMemberProfile = WorkspaceMember & {
  latestProgress: LatestProgress | null
  activeWorkoutPlan: ActivePlan | null
  activeNutritionPlan: ActivePlan | null
  upcomingSessions: UpcomingSession[]
  attentionReasons: AttentionReason[]
  needsAttention: boolean
}

export type TodayTaskType =
  | "stale_progress"
  | "negative_progress"
  | "no_workout_plan"
  | "no_nutrition_plan"

export type TodayTask = {
  id: string
  type: TodayTaskType
  memberId: string
  memberName: string
  title: string
  description: string
}

export type TaskStatus = "todo" | "done" | "dismissed"

export type CoachWorkspaceData = {
  members: WorkspaceMemberProfile[]
  tasks: TodayTask[]
  workoutPlans: Pick<
    Database["public"]["Tables"]["workout_plans"]["Row"],
    "id" | "title" | "goal"
  >[]
  nutritionPlans: Pick<
    Database["public"]["Tables"]["nutrition_plans"]["Row"],
    "id" | "title" | "goal"
  >[]
}

export type CoachWorkspaceResult = {
  data: CoachWorkspaceData | null
  error: string | null
}
