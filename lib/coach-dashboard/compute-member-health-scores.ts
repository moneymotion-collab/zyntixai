import type { ClientGoalViewModel } from "@/lib/progress/client-goals"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import type { ProgressAlert } from "@/lib/progress/compute-progress-alerts"

export type MemberHealthStatus =
  | "strong"
  | "stable"
  | "needs_attention"
  | "high_risk"

export type MemberHealthScore = {
  memberId: string
  memberName: string
  healthScore: number
  status: MemberHealthStatus
  statusLabel: string
  latestCheckInDate: string | null
  latestCheckInDateLabel: string
  latestCheckInId: string | null
  mainRiskFactor: string
  suggestedCoachAction: string
  energyScore: number
  sleepScore: number
  motivationScore: number
  consistencyScore: number
}

type MemberRef = {
  id: string
  full_name: string | null
}

type MemberHealthContext = {
  goals?: ClientGoalViewModel[]
  activeWorkoutMemberIds?: Set<string>
  progressAlerts?: ProgressAlert[]
  upcomingSessionMemberIds?: Set<string>
  recentWorkoutCompletionMemberIds?: Set<string>
}

const STATUS_LABELS: Record<MemberHealthStatus, string> = {
  strong: "Strong",
  stable: "Stable",
  needs_attention: "Needs Attention",
  high_risk: "High Risk",
}

function compareCheckInsDesc(a: ClientCheckInRow, b: ClientCheckInRow): number {
  const dateCompare = b.checkin_date.localeCompare(a.checkin_date)
  if (dateCompare !== 0) return dateCompare
  return b.created_at.localeCompare(a.created_at)
}

function wellnessComponent(value: number | null | undefined): number {
  if (value == null || Number.isNaN(Number(value))) return 0
  const clamped = Math.max(0, Math.min(10, Number(value)))
  return (clamped / 10) * 25
}

function sevenDaysAgoDateString(): string {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function hasCheckInWithinLast7Days(checkIns: ClientCheckInRow[]): boolean {
  const cutoff = sevenDaysAgoDateString()
  return checkIns.some((row) => row.checkin_date >= cutoff)
}

function formatCheckInDateLabel(value: string | null): string {
  if (!value) return "No check-in yet"
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function resolveMemberHealthStatus(score: number): MemberHealthStatus {
  if (score >= 80) return "strong"
  if (score >= 60) return "stable"
  if (score >= 40) return "needs_attention"
  return "high_risk"
}

export function getMemberHealthStatusLabel(status: MemberHealthStatus): string {
  return STATUS_LABELS[status]
}

function latestCheckInForMember(
  checkIns: ClientCheckInRow[],
  memberId: string,
): ClientCheckInRow | null {
  return (
    checkIns
      .filter((row) => row.member_id === memberId)
      .sort(compareCheckInsDesc)[0] ?? null
  )
}

function memberCheckIns(
  checkIns: ClientCheckInRow[],
  memberId: string,
): ClientCheckInRow[] {
  return checkIns.filter((row) => row.member_id === memberId)
}

type RiskComponent = {
  label: string
  score: number
  action: string
}

function resolveMainRisk(
  components: RiskComponent[],
  context: MemberHealthContext,
  memberId: string,
  memberName: string,
  hasAnyCheckIn: boolean,
): { mainRiskFactor: string; suggestedCoachAction: string } {
  const memberAlert = context.progressAlerts?.find(
    (alert) => alert.memberId === memberId,
  )

  if (memberAlert) {
    return {
      mainRiskFactor: memberAlert.alertTypeLabel,
      suggestedCoachAction: memberAlert.suggestedAction,
    }
  }

  const behindGoal = context.goals?.find(
    (goal) => goal.memberId === memberId && goal.status === "behind_schedule",
  )
  if (behindGoal) {
    return {
      mainRiskFactor: "Goal behind schedule",
      suggestedCoachAction: `Review "${behindGoal.title}" progress and adjust the plan with ${memberName}.`,
    }
  }

  if (!hasAnyCheckIn) {
    return {
      mainRiskFactor: "No check-ins logged",
      suggestedCoachAction: "Log the first wellness check-in to establish a baseline.",
    }
  }

  const weakest = [...components].sort((a, b) => a.score - b.score)[0]
  if (weakest && weakest.score < 25) {
    return {
      mainRiskFactor: weakest.label,
      suggestedCoachAction: weakest.action,
    }
  }

  if (context.activeWorkoutMemberIds && !context.activeWorkoutMemberIds.has(memberId)) {
    return {
      mainRiskFactor: "No active workout plan",
      suggestedCoachAction: "Assign or reactivate a workout plan to support consistency.",
    }
  }

  if (
    context.upcomingSessionMemberIds &&
    !context.upcomingSessionMemberIds.has(memberId)
  ) {
    return {
      mainRiskFactor: "No upcoming session scheduled",
      suggestedCoachAction: "Book a 1-on-1 session to reconnect and review progress.",
    }
  }

  if (
    context.recentWorkoutCompletionMemberIds &&
    !context.recentWorkoutCompletionMemberIds.has(memberId)
  ) {
    return {
      mainRiskFactor: "No recent workout completions",
      suggestedCoachAction: "Check training adherence and motivation during the next touchpoint.",
    }
  }

  return {
    mainRiskFactor: "Wellness scores trending low",
    suggestedCoachAction: "Review energy, sleep, and motivation patterns in Progress Dashboard.",
  }
}

function buildRiskComponents(
  latest: ClientCheckInRow | null,
  memberRows: ClientCheckInRow[],
): RiskComponent[] {
  const energyScore = wellnessComponent(latest?.energy)
  const sleepScore = wellnessComponent(latest?.sleep)
  const motivationScore = wellnessComponent(latest?.motivation)
  const consistencyScore = hasCheckInWithinLast7Days(memberRows) ? 25 : 0

  return [
    {
      label: "Low energy",
      score: energyScore,
      action: "Review recovery, nutrition, and training load to improve energy.",
    },
    {
      label: "Poor sleep",
      score: sleepScore,
      action: "Discuss sleep hygiene and evening routines with the member.",
    },
    {
      label: "Low motivation",
      score: motivationScore,
      action: "Reset goals and celebrate small wins to rebuild momentum.",
    },
    {
      label: "Missing recent check-in",
      score: consistencyScore,
      action: "Log a wellness check-in within the next 7 days.",
    },
  ]
}

export function computeMemberHealthScore(
  member: MemberRef,
  checkIns: ClientCheckInRow[],
  context: MemberHealthContext = {},
): MemberHealthScore {
  const memberRows = memberCheckIns(checkIns, member.id)
  const latest = latestCheckInForMember(checkIns, member.id)
  const components = buildRiskComponents(latest, memberRows)

  const energyScore = components[0].score
  const sleepScore = components[1].score
  const motivationScore = components[2].score
  const consistencyScore = components[3].score

  const healthScore = Math.round(
    energyScore + sleepScore + motivationScore + consistencyScore,
  )
  const status = resolveMemberHealthStatus(healthScore)
  const memberName = member.full_name ?? "Member"

  const { mainRiskFactor, suggestedCoachAction } = resolveMainRisk(
    components,
    context,
    member.id,
    memberName,
    memberRows.length > 0,
  )

  return {
    memberId: member.id,
    memberName,
    healthScore,
    status,
    statusLabel: getMemberHealthStatusLabel(status),
    latestCheckInDate: latest?.checkin_date ?? null,
    latestCheckInDateLabel: formatCheckInDateLabel(latest?.checkin_date ?? null),
    latestCheckInId: latest?.id ?? null,
    mainRiskFactor,
    suggestedCoachAction,
    energyScore: Math.round(energyScore),
    sleepScore: Math.round(sleepScore),
    motivationScore: Math.round(motivationScore),
    consistencyScore,
  }
}

export function computeMemberHealthScores(
  members: MemberRef[],
  checkIns: ClientCheckInRow[],
  context: MemberHealthContext = {},
): MemberHealthScore[] {
  return members
    .map((member) => computeMemberHealthScore(member, checkIns, context))
    .sort((a, b) => a.healthScore - b.healthScore)
}

export function hasMemberHealthData(
  members: MemberRef[],
  checkIns: ClientCheckInRow[],
): boolean {
  return members.length > 0 && checkIns.length > 0
}
