import type { CoachTask } from "@/lib/coach-dashboard/compute-coach-tasks"
import type { CoachAction, FocusMember } from "@/lib/coach-dashboard/compute-coach-focus"
import type { CoachInsight } from "@/lib/coach-dashboard/compute-coach-insights"
import type { DailyCoachOverview } from "@/lib/coach-dashboard/compute-daily-coach-overview"
import type { MemberHealthScore } from "@/lib/coach-dashboard/compute-member-health-scores"
import type { AiActivityStats } from "@/lib/coach-dashboard/ai-activity-stats"
import type { CoachKpiCards } from "@/lib/coach-dashboard/compute-coach-kpi-cards"
import type { AlertSeverity } from "@/lib/progress/compute-progress-alerts"

export type NeedsAttentionAlertType =
  | "missed_workout"
  | "upcoming_session"
  | "progress_stalled"
  | "nutrition_adherence_low"

export type NeedsAttentionAlert = {
  id: string
  memberId: string
  memberName: string
  alertType: NeedsAttentionAlertType
  alertTypeLabel: string
  reason: string
  suggestedAction: string
  severity: AlertSeverity
  href: string
}

export type CoachOverviewStats = {
  memberCount: number
  activeWorkoutPlans: number
  activeGoals: number
  openProgressAlerts: number
  upcomingSessions: number
  membersNeedingAttention: number
  /** Legacy stats retained for insights and secondary displays */
  activeNutritionPlans: number
  completedWorkoutsThisWeek: number
}

/** Revenue source — Stripe reserved for future integration */
export type RevenueSource = "estimated" | "stripe"

export type CoachBusinessSettings = {
  revenuePerMember: number
  currency: string
  /** Future Stripe Connect account id */
  stripeAccountId: string | null
  stripeConnected: boolean
}

export type BusinessKpis = {
  totalMembers: number
  activeMembers: number
  newMembersThisMonth: number
  activeWorkoutPlans: number
  activeNutritionPlans: number
  sessionsThisMonth: number
}

export type RevenueOverview = {
  source: RevenueSource
  revenuePerMember: number
  currency: string
  estimatedMonthlyRevenue: number
  estimatedAnnualRevenue: number
  revenueGrowthPercent: number | null
  memberGrowthPercent: number | null
}

export type BusinessTrendPoint = {
  monthKey: string
  monthLabel: string
  memberCount: number
  newMembers: number
  activeMembers: number
  estimatedRevenue: number
}

export type CoachBusinessOverview = {
  kpis: BusinessKpis
  revenue: RevenueOverview
  memberGrowthTrend: BusinessTrendPoint[]
  revenueTrend: BusinessTrendPoint[]
  settings: CoachBusinessSettings
}

export type AtRiskLevel = "high" | "medium" | "low"

export type AtRiskClientReason =
  | "no_check_in_7d"
  | "no_habit_3d"
  | "no_workout_7d"
  | "no_progress_log_14d"
  | "goal_behind_pace"
  | "open_high_priority_reminder"

export type AtRiskMembersSummary = {
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  totalAtRisk: number
}

export type AtRiskMember = {
  memberId: string
  memberName: string
  riskReasons: AtRiskClientReason[]
  riskReasonLabels: string[]
  riskLevel: AtRiskLevel
  riskLevelLabel: string
  lastActivityDate: string | null
  lastActivityDateLabel: string
  healthScore: number
  lastCheckInDate: string | null
  lastCheckInDateLabel: string
  activeAlertsCount: number
  mainRiskReason: string
  goalStatus: string
  nextSessionDate: string | null
  nextSessionDateLabel: string
  latestCheckInId: string | null
}

export type AtRiskMembersCenter = {
  summary: AtRiskMembersSummary
  members: AtRiskMember[]
}

export type CoachPerformanceStatus = "excellent" | "good" | "needs_work"

export type CoachPerformanceKpi = {
  id: string
  label: string
  valuePercent: number | null
  displayValue: string
  hasData: boolean
  detail: string
}

export type CoachPerformanceInsight = {
  biggestStrength: string
  biggestImprovementArea: string
  suggestedNextAction: string
}

export type CoachPerformanceCenter = {
  overallScore: number | null
  overallStatus: CoachPerformanceStatus | null
  overallStatusLabel: string
  kpis: CoachPerformanceKpi[]
  insight: CoachPerformanceInsight | null
  hasEnoughData: boolean
}

export type AttentionReason =
  | "stale_progress"
  | "negative_progress"
  | "no_workout_plan"
  | "no_nutrition_plan"

export type AttentionMember = {
  memberId: string
  memberName: string
  reasons: AttentionReason[]
}

export type TodaySession = {
  id: string
  memberId: string | null
  memberName: string
  sessionType: string | null
  scheduledDate: string | null
  scheduledDateLabel: string
  scheduledTime: string | null
  duration: number | null
  status: string | null
  statusLabel: string
  notes: string | null
  sortKey: string
}

export type RecentActivityType =
  | "client_checkin"
  | "workout_completion"
  | "nutrition_assignment"
  | "progress_log"
  | "goal_update"
  | "session"
  | "new_member"
  | "workout_plan"
  | "nutrition_plan"
  | "session_booked"
  | "nutrition_assignment"

export type RecentActivityItem = {
  id: string
  type: RecentActivityType
  title: string
  subtitle: string
  timestamp: string
  href: string
}

export type RecentCheckIn = {
  id: string
  memberId: string
  memberName: string
  weightKg: number | null
  energy: number | null
  sleep: number | null
  motivation: number | null
  createdAt: string
}

export type CoachOverviewData = {
  stats: CoachOverviewStats
  coachDisplayName: string
  currentDateLabel: string
  todaySessions: TodaySession[]
  upcomingSessionList: TodaySession[]
  attentionMembers: AttentionMember[]
  focusMembers: FocusMember[]
  coachActions: CoachAction[]
  needsAttentionAlerts: NeedsAttentionAlert[]
  recentActivity: RecentActivityItem[]
  recentCheckIns: RecentCheckIn[]
  memberHealthScores: MemberHealthScore[]
  hasMemberHealthData: boolean
  coachTasks: CoachTask[]
  insights: CoachInsight[]
  completedGoalsCount: number
  businessOverview: CoachBusinessOverview
  aiActivity: AiActivityStats
  atRiskMembers: AtRiskMembersCenter
  coachPerformance: CoachPerformanceCenter
  hasDemoWorkspace: boolean
  dailyOverview: DailyCoachOverview
  coachKpiCards: CoachKpiCards
}

export type CoachOverviewResult = {
  data: CoachOverviewData | null
  error: string | null
}
