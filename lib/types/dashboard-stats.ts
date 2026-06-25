export type CoachDashboardStats = {
  kind: "coach"
  memberCount: number
  workoutPlanCount: number
  assignmentsTotal: number
  assignmentsPending: number
  assignmentsCompleted: number
  nutritionPlans: number
}

export type MemberDashboardStats = {
  kind: "member"
  assignedTotal: number
  assignedPending: number
  assignedCompleted: number
  completionRate: number
  completedTrendPercent: number | null
}

export type DashboardStats = CoachDashboardStats | MemberDashboardStats

export type DashboardStatsResult = {
  stats: DashboardStats | null
  error: string | null
}

/** @deprecated Use MemberDashboardStats */
export type ClientDashboardStats = MemberDashboardStats
