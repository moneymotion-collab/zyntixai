import { isActiveMemberStatus } from "@/lib/coach-dashboard/compute-business-overview"
import { sevenDaysAgoDateString } from "@/lib/coach-dashboard/date-utils"
import type {
  CoachPerformanceCenter,
  CoachPerformanceInsight,
  CoachPerformanceKpi,
  CoachPerformanceStatus,
} from "@/lib/coach-dashboard/types"
import type { ClientGoalViewModel } from "@/lib/progress/client-goals"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"

type MemberLike = {
  id: string
  status: string | null
}

type SessionLike = {
  status: string | null
}

type WorkoutAssignmentLike = {
  status: string
}

export type ComputeCoachPerformanceInput = {
  members: MemberLike[]
  goals: ClientGoalViewModel[]
  checkIns: ClientCheckInRow[]
  sessionsThisMonth: SessionLike[]
  workoutAssignments: WorkoutAssignmentLike[]
}

const KPI_IDS = {
  retention: "client_retention",
  goalCompletion: "goal_completion",
  checkInEngagement: "check_in_engagement",
  sessionCompletion: "session_completion",
  workoutCompletion: "workout_completion",
  membersImproved: "members_improved",
} as const

const STATUS_LABELS: Record<CoachPerformanceStatus, string> = {
  excellent: "Excellent",
  good: "Good",
  needs_work: "Needs Work",
}

function percent(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null
  return Math.round((numerator / denominator) * 1000) / 10
}

function formatPercent(value: number | null): string {
  if (value == null) return "—"
  return `${value}%`
}

function resolvePerformanceStatus(score: number): CoachPerformanceStatus {
  if (score >= 80) return "excellent"
  if (score >= 60) return "good"
  return "needs_work"
}

function compareCheckInsDesc(a: ClientCheckInRow, b: ClientCheckInRow): number {
  const dateCompare = b.checkin_date.localeCompare(a.checkin_date)
  if (dateCompare !== 0) return dateCompare
  return b.created_at.localeCompare(a.created_at)
}

function wellnessAverage(checkIn: ClientCheckInRow): number | null {
  const values = [checkIn.energy, checkIn.sleep, checkIn.motivation].filter(
    (value): value is number => value != null && !Number.isNaN(Number(value)),
  )

  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + Number(value), 0) / values.length
}

function countMembersImproved(
  members: MemberLike[],
  checkIns: ClientCheckInRow[],
): { improved: number; eligible: number } {
  let improved = 0
  let eligible = 0

  for (const member of members) {
    const memberCheckIns = checkIns
      .filter((row) => row.member_id === member.id)
      .sort(compareCheckInsDesc)

    if (memberCheckIns.length < 2) continue

    const latestAvg = wellnessAverage(memberCheckIns[0])
    const previousAvg = wellnessAverage(memberCheckIns[1])

    if (latestAvg == null || previousAvg == null) continue

    eligible += 1
    if (latestAvg > previousAvg) improved += 1
  }

  return { improved, eligible }
}

const SUGGESTED_ACTIONS: Record<string, string> = {
  [KPI_IDS.retention]:
    "Reach out to inactive members, confirm their goals, and refresh their coaching plan.",
  [KPI_IDS.goalCompletion]:
    "Review active goals with members, adjust timelines, and celebrate completed milestones.",
  [KPI_IDS.checkInEngagement]:
    "Send check-in reminders and make wellness logging part of your weekly touchpoints.",
  [KPI_IDS.sessionCompletion]:
    "Follow up on missed sessions, reschedule quickly, and confirm attendance expectations.",
  [KPI_IDS.workoutCompletion]:
    "Review training adherence, simplify plans if needed, and reinforce completion habits.",
  [KPI_IDS.membersImproved]:
    "Focus coaching conversations on sleep, energy, and motivation to lift wellness scores.",
}

const STRENGTH_LABELS: Record<string, string> = {
  [KPI_IDS.retention]: "Strong client retention",
  [KPI_IDS.goalCompletion]: "Strong goal completion",
  [KPI_IDS.checkInEngagement]: "Strong check-in engagement",
  [KPI_IDS.sessionCompletion]: "Strong session completion",
  [KPI_IDS.workoutCompletion]: "Strong workout completion",
  [KPI_IDS.membersImproved]: "Strong member wellness improvement",
}

const IMPROVEMENT_LABELS: Record<string, string> = {
  [KPI_IDS.retention]: "Client retention",
  [KPI_IDS.goalCompletion]: "Goal completion rate",
  [KPI_IDS.checkInEngagement]: "Check-in engagement",
  [KPI_IDS.sessionCompletion]: "Session completion rate",
  [KPI_IDS.workoutCompletion]: "Workout completion rate",
  [KPI_IDS.membersImproved]: "Member wellness improvement",
}

function buildPerformanceInsight(
  kpis: CoachPerformanceKpi[],
): CoachPerformanceInsight | null {
  const measured = kpis.filter((kpi) => kpi.hasData && kpi.valuePercent != null)
  if (measured.length === 0) return null

  const sorted = [...measured].sort(
    (a, b) => (b.valuePercent ?? 0) - (a.valuePercent ?? 0),
  )
  const strongest = sorted[0]
  const weakest = sorted[sorted.length - 1]

  return {
    biggestStrength:
      STRENGTH_LABELS[strongest.id] ?? strongest.label,
    biggestImprovementArea:
      IMPROVEMENT_LABELS[weakest.id] ?? weakest.label,
    suggestedNextAction:
      SUGGESTED_ACTIONS[weakest.id] ??
      "Review your roster metrics and prioritize the lowest-performing area this week.",
  }
}

export function computeCoachPerformance(
  input: ComputeCoachPerformanceInput,
): CoachPerformanceCenter {
  const { members, goals, checkIns, sessionsThisMonth, workoutAssignments } =
    input

  const totalMembers = members.length
  const activeMembers = members.filter((member) =>
    isActiveMemberStatus(member.status),
  ).length

  const retentionRate = percent(activeMembers, totalMembers)

  const totalGoals = goals.length
  const completedGoals = goals.filter((goal) => goal.status === "completed").length
  const goalCompletionRate = percent(completedGoals, totalGoals)

  const checkInCutoff = sevenDaysAgoDateString()
  const membersWithRecentCheckIn = new Set(
    checkIns
      .filter((row) => row.checkin_date >= checkInCutoff && row.member_id)
      .map((row) => row.member_id),
  ).size
  const checkInEngagementRate = percent(membersWithRecentCheckIn, totalMembers)

  const totalSessionsThisMonth = sessionsThisMonth.length
  const completedSessionsThisMonth = sessionsThisMonth.filter(
    (session) => session.status === "voltooid",
  ).length
  const sessionCompletionRate = percent(
    completedSessionsThisMonth,
    totalSessionsThisMonth,
  )

  const totalWorkoutAssignments = workoutAssignments.length
  const completedWorkoutAssignments = workoutAssignments.filter(
    (assignment) => assignment.status === "completed",
  ).length
  const workoutCompletionRate = percent(
    completedWorkoutAssignments,
    totalWorkoutAssignments,
  )

  const { improved, eligible } = countMembersImproved(members, checkIns)
  const membersImprovedRate = percent(improved, eligible)

  const kpis: CoachPerformanceKpi[] = [
    {
      id: KPI_IDS.retention,
      label: "Client Retention",
      valuePercent: retentionRate,
      displayValue: formatPercent(retentionRate),
      hasData: totalMembers > 0,
      detail: `${activeMembers} of ${totalMembers} members active`,
    },
    {
      id: KPI_IDS.goalCompletion,
      label: "Goal Completion Rate",
      valuePercent: goalCompletionRate,
      displayValue: formatPercent(goalCompletionRate),
      hasData: totalGoals > 0,
      detail: `${completedGoals} of ${totalGoals} goals completed`,
    },
    {
      id: KPI_IDS.checkInEngagement,
      label: "Check-in Engagement",
      valuePercent: checkInEngagementRate,
      displayValue: formatPercent(checkInEngagementRate),
      hasData: totalMembers > 0,
      detail: `${membersWithRecentCheckIn} of ${totalMembers} checked in last 7 days`,
    },
    {
      id: KPI_IDS.sessionCompletion,
      label: "Session Completion Rate",
      valuePercent: sessionCompletionRate,
      displayValue: formatPercent(sessionCompletionRate),
      hasData: totalSessionsThisMonth > 0,
      detail: `${completedSessionsThisMonth} of ${totalSessionsThisMonth} sessions completed this month`,
    },
    {
      id: KPI_IDS.workoutCompletion,
      label: "Workout Completion Rate",
      valuePercent: workoutCompletionRate,
      displayValue: formatPercent(workoutCompletionRate),
      hasData: totalWorkoutAssignments > 0,
      detail: `${completedWorkoutAssignments} of ${totalWorkoutAssignments} assignments completed`,
    },
    {
      id: KPI_IDS.membersImproved,
      label: "Members Improved",
      valuePercent: membersImprovedRate,
      displayValue:
        eligible > 0 ? `${improved} (${formatPercent(membersImprovedRate)})` : "—",
      hasData: eligible > 0,
      detail:
        eligible > 0
          ? `${improved} of ${eligible} members improved wellness vs previous check-in`
          : "Need 2+ check-ins per member with wellness data",
    },
  ]

  const measuredPercents = kpis
    .filter((kpi) => kpi.hasData && kpi.valuePercent != null)
    .map((kpi) => kpi.valuePercent as number)

  const overallScore =
    measuredPercents.length > 0
      ? Math.round(
          (measuredPercents.reduce((sum, value) => sum + value, 0) /
            measuredPercents.length) *
            10,
        ) / 10
      : null

  const overallStatus =
    overallScore != null ? resolvePerformanceStatus(overallScore) : null

  return {
    overallScore,
    overallStatus,
    overallStatusLabel: overallStatus ? STATUS_LABELS[overallStatus] : "—",
    kpis,
    insight: buildPerformanceInsight(kpis),
    hasEnoughData: totalMembers > 0 && measuredPercents.length > 0,
  }
}

export function getPerformanceStatusStyles(status: CoachPerformanceStatus): {
  badge: string
  ring: string
} {
  switch (status) {
    case "excellent":
      return {
        badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
        ring: "from-emerald-400/30 to-emerald-500/10",
      }
    case "good":
      return {
        badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
        ring: "from-cyan-400/30 to-cyan-500/10",
      }
    case "needs_work":
      return {
        badge: "border-amber-500/30 bg-amber-500/10 text-amber-200",
        ring: "from-amber-400/30 to-amber-500/10",
      }
  }
}
