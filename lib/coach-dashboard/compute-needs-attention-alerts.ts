import type { AlertSeverity } from "@/lib/progress/compute-progress-alerts"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import type { NeedsAttentionAlert, NeedsAttentionAlertType } from "@/lib/coach-dashboard/types"
import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"
import type { TodaySession } from "@/lib/coach-dashboard/types"
import { startOfWeekIso } from "@/lib/coach-dashboard/date-utils"

type MemberRef = {
  id: string
  full_name: string | null
}

type WorkoutCompletionRef = {
  member_id: string
  completed_at: string
}

const ALERT_TYPE_LABELS: Record<NeedsAttentionAlertType, string> = {
  missed_workout: "Missed workout",
  upcoming_session: "Upcoming session",
  progress_stalled: "Progress stalled",
  nutrition_adherence_low: "Nutrition adherence low",
}

const BASE_SEVERITY: Record<NeedsAttentionAlertType, AlertSeverity> = {
  missed_workout: "medium",
  upcoming_session: "low",
  progress_stalled: "medium",
  nutrition_adherence_low: "high",
}

const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

function compareCheckInsDesc(a: ClientCheckInRow, b: ClientCheckInRow): number {
  const dateCompare = b.checkin_date.localeCompare(a.checkin_date)
  if (dateCompare !== 0) return dateCompare
  return b.created_at.localeCompare(a.created_at)
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

function latestCompletionByMember(
  completions: WorkoutCompletionRef[],
): Map<string, string> {
  const map = new Map<string, string>()

  for (const row of completions) {
    const existing = map.get(row.member_id)
    if (!existing || row.completed_at > existing) {
      map.set(row.member_id, row.completed_at)
    }
  }

  return map
}

function memberProgressLogs(
  logs: ProgressLogRow[],
  memberId: string,
): ProgressLogRow[] {
  return logs
    .filter((log) => log.member_id === memberId)
    .sort(
      (a, b) =>
        new Date(b.updated_at ?? 0).getTime() -
        new Date(a.updated_at ?? 0).getTime(),
    )
}

function isProgressStalled(logs: ProgressLogRow[]): boolean {
  const recent = logs.slice(0, 3)
  if (recent.length < 2) return false

  return recent.every((log) => {
    const change = log.change_value
    if (change == null || Number.isNaN(Number(change))) return false
    return Math.abs(Number(change)) <= 0.3
  })
}

function isWeightPlateau(checkIns: ClientCheckInRow[]): boolean {
  const weights = checkIns
    .filter((row) => row.weight != null && !Number.isNaN(Number(row.weight)))
    .sort(compareCheckInsDesc)
    .slice(0, 3)
    .map((row) => Number(row.weight))

  if (weights.length < 3) return false

  const max = Math.max(...weights)
  const min = Math.min(...weights)
  return max - min <= 0.3
}

function daysUntil(dateString: string | null): number | null {
  if (!dateString) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${dateString}T12:00:00`)
  target.setHours(0, 0, 0, 0)

  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

function buildAlert(
  member: MemberRef,
  alertType: NeedsAttentionAlertType,
  reason: string,
  suggestedAction: string,
  suffix = "",
): NeedsAttentionAlert {
  return {
    id: `${member.id}-${alertType}${suffix}`,
    memberId: member.id,
    memberName: member.full_name ?? "Member",
    alertType,
    alertTypeLabel: ALERT_TYPE_LABELS[alertType],
    reason,
    suggestedAction,
    severity: BASE_SEVERITY[alertType],
    href: `/members/${member.id}`,
  }
}

export type ComputeNeedsAttentionAlertsInput = {
  members: MemberRef[]
  checkIns: ClientCheckInRow[]
  progressLogs: ProgressLogRow[]
  activeWorkoutMemberIds: Set<string>
  activeNutritionMemberIds: Set<string>
  workoutCompletions: WorkoutCompletionRef[]
  upcomingSessions: TodaySession[]
}

export function computeNeedsAttentionAlerts(
  input: ComputeNeedsAttentionAlertsInput,
): NeedsAttentionAlert[] {
  const {
    members,
    checkIns,
    progressLogs,
    activeWorkoutMemberIds,
    activeNutritionMemberIds,
    workoutCompletions,
    upcomingSessions,
  } = input

  const weekStart = startOfWeekIso()
  const latestCompletionByMemberId = latestCompletionByMember(workoutCompletions)
  const alerts: NeedsAttentionAlert[] = []
  const seen = new Set<string>()

  function pushAlert(alert: NeedsAttentionAlert) {
    const key = `${alert.memberId}-${alert.alertType}`
    if (seen.has(key)) return
    seen.add(key)
    alerts.push(alert)
  }

  for (const member of members) {
    if (!activeWorkoutMemberIds.has(member.id)) continue

    const lastCompletedAt = latestCompletionByMemberId.get(member.id)
    if (!lastCompletedAt || lastCompletedAt < weekStart) {
      pushAlert(
        buildAlert(
          member,
          "missed_workout",
          lastCompletedAt
            ? `No workout logged since ${new Date(lastCompletedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}.`
            : "Assigned workout plan with no logged completions this week.",
          "Follow up on training adherence and reschedule the missed session.",
        ),
      )
    }
  }

  for (const session of upcomingSessions) {
    if (!session.memberId) continue

    const days = daysUntil(session.scheduledDate)
    if (days == null || days < 0 || days > 3) continue

    const member =
      members.find((row) => row.id === session.memberId) ??
      ({
        id: session.memberId,
        full_name: session.memberName,
      } satisfies MemberRef)

    const when =
      days === 0
        ? "today"
        : days === 1
          ? "tomorrow"
          : `in ${days} days`

    pushAlert(
      buildAlert(
        member,
        "upcoming_session",
        `${session.sessionType ?? "Session"} scheduled ${when}${session.scheduledTime ? ` at ${session.scheduledTime}` : ""}.`,
        "Review goals, notes, and prep materials before the session.",
        `-${session.id}`,
      ),
    )
  }

  for (const member of members) {
    const memberLogs = memberProgressLogs(progressLogs, member.id)
    const memberRows = memberCheckIns(checkIns, member.id)
    const stalledByLogs =
      memberLogs.length >= 2 && isProgressStalled(memberLogs)
    const stalledByCheckIns = isWeightPlateau(memberRows)

    if (stalledByLogs || stalledByCheckIns) {
      pushAlert(
        buildAlert(
          member,
          "progress_stalled",
          stalledByCheckIns
            ? "Weight has plateaued across the last three check-ins."
            : "Progress metrics show little movement across recent logs.",
          "Review training load, nutrition targets, and recovery before changing the plan.",
        ),
      )
    }
  }

  for (const member of members) {
    if (!activeNutritionMemberIds.has(member.id)) continue

    const latest = latestCheckInForMember(checkIns, member.id)
    const lowMotivation =
      latest?.motivation != null && latest.motivation < 5
    const lowEnergy = latest?.energy != null && latest.energy < 5

    if (!lowMotivation && !lowEnergy) continue

    const signals = [
      lowMotivation ? `motivation ${latest?.motivation}/10` : null,
      lowEnergy ? `energy ${latest?.energy}/10` : null,
    ].filter(Boolean)

    pushAlert(
      buildAlert(
        member,
        "nutrition_adherence_low",
        `Nutrition plan active with soft wellness signals (${signals.join(", ")}).`,
        "Check meal logging, macro adherence, and simplify the plan if needed.",
      ),
    )
  }

  return alerts.sort((left, right) => {
    const severityCompare =
      SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity]
    if (severityCompare !== 0) return severityCompare
    return left.memberName.localeCompare(right.memberName)
  })
}
