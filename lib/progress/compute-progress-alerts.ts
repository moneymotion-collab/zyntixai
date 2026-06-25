import type { ClientGoalViewModel } from "@/lib/progress/client-goals"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import { filterCheckInsByMember } from "@/lib/progress/client-checkin-member-view"
import { getWeeklyReportPeriod } from "@/lib/progress/compute-weekly-progress-report"

export type ProgressAlertType =
  | "low_energy"
  | "poor_sleep"
  | "low_motivation"
  | "weight_plateau"
  | "missing_check_ins"
  | "goal_behind_schedule"

export type AlertSeverity = "low" | "medium" | "high"

export type ProgressAlert = {
  id: string
  memberId: string
  memberName: string
  alertType: ProgressAlertType
  alertTypeLabel: string
  reason: string
  suggestedAction: string
  severity: AlertSeverity
}

type MemberRef = {
  id: string
  name: string
}

type MemberOption = {
  id: string
  full_name: string | null
}

const ALERT_TYPE_LABELS: Record<ProgressAlertType, string> = {
  low_energy: "Low Energy",
  poor_sleep: "Poor Sleep",
  low_motivation: "Low Motivation",
  weight_plateau: "Weight Plateau",
  missing_check_ins: "Missing Check-ins",
  goal_behind_schedule: "Goal Behind Schedule",
}

const BASE_SEVERITY: Record<ProgressAlertType, AlertSeverity> = {
  low_energy: "medium",
  poor_sleep: "medium",
  low_motivation: "medium",
  weight_plateau: "low",
  missing_check_ins: "low",
  goal_behind_schedule: "medium",
}

function compareCheckInsDesc(a: ClientCheckInRow, b: ClientCheckInRow): number {
  const dateCompare = b.checkin_date.localeCompare(a.checkin_date)
  if (dateCompare !== 0) return dateCompare
  return b.created_at.localeCompare(a.created_at)
}

function collectMemberRefs(
  members: MemberOption[],
  checkIns: ClientCheckInRow[],
  goals: ClientGoalViewModel[],
): MemberRef[] {
  const map = new Map<string, string>()

  for (const member of members) {
    map.set(member.id, member.full_name ?? "Member")
  }

  for (const row of checkIns) {
    if (row.member_id) {
      map.set(row.member_id, row.member_name)
    }
  }

  for (const goal of goals) {
    map.set(goal.memberId, goal.memberName)
  }

  return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
}

function getMemberCheckIns(
  checkIns: ClientCheckInRow[],
  memberId: string,
  memberName: string,
): ClientCheckInRow[] {
  return filterCheckInsByMember(checkIns, memberId, memberName)
}

function latestCheckIn(memberCheckIns: ClientCheckInRow[]): ClientCheckInRow | null {
  if (memberCheckIns.length === 0) return null
  return [...memberCheckIns].sort(compareCheckInsDesc)[0]
}

function hasRecentCheckIn(
  memberCheckIns: ClientCheckInRow[],
  periodStart: string,
): boolean {
  return memberCheckIns.some((row) => row.checkin_date >= periodStart)
}

function isWeightPlateau(memberCheckIns: ClientCheckInRow[]): boolean {
  const weights = memberCheckIns
    .filter((row) => row.weight != null && !Number.isNaN(Number(row.weight)))
    .sort(compareCheckInsDesc)
    .slice(0, 3)
    .map((row) => Number(row.weight))

  if (weights.length < 3) return false

  const max = Math.max(...weights)
  const min = Math.min(...weights)
  return max - min <= 0.3
}

function buildAlert(
  member: MemberRef,
  alertType: ProgressAlertType,
  reason: string,
  suggestedAction: string,
  suffix = "",
): ProgressAlert {
  return {
    id: `${member.id}-${alertType}${suffix}`,
    memberId: member.id,
    memberName: member.name,
    alertType,
    alertTypeLabel: ALERT_TYPE_LABELS[alertType],
    reason,
    suggestedAction,
    severity: BASE_SEVERITY[alertType],
  }
}

function applySeverityRules(alerts: ProgressAlert[]): ProgressAlert[] {
  const counts = alerts.reduce<Map<string, number>>((map, alert) => {
    map.set(alert.memberId, (map.get(alert.memberId) ?? 0) + 1)
    return map
  }, new Map())

  return alerts.map((alert) => {
    if ((counts.get(alert.memberId) ?? 0) >= 2) {
      return { ...alert, severity: "high" }
    }
    return alert
  })
}

const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export function computeProgressAlerts(
  members: MemberOption[],
  checkIns: ClientCheckInRow[],
  goals: ClientGoalViewModel[],
  memberFilter = "all",
  memberName?: string | null,
): ProgressAlert[] {
  const scopedCheckIns = filterCheckInsByMember(checkIns, memberFilter, memberName)
  const scopedGoals =
    memberFilter === "all"
      ? goals
      : goals.filter((goal) => goal.memberId === memberFilter)

  const memberRefs =
    memberFilter === "all"
      ? collectMemberRefs(members, checkIns, goals)
      : collectMemberRefs(members, scopedCheckIns, scopedGoals).filter(
          (member) => member.id === memberFilter,
        )

  const period = getWeeklyReportPeriod()
  const rawAlerts: ProgressAlert[] = []

  for (const member of memberRefs) {
    const memberCheckIns = getMemberCheckIns(scopedCheckIns, member.id, member.name)
    const latest = latestCheckIn(memberCheckIns)

    if (latest?.energy != null && latest.energy < 5) {
      rawAlerts.push(
        buildAlert(
          member,
          "low_energy",
          `Latest energy score is ${latest.energy}/10 on ${latest.checkin_date}.`,
          "Review training load, recovery balance, and daily nutrition with the member.",
        ),
      )
    }

    if (latest?.sleep != null && latest.sleep < 5) {
      rawAlerts.push(
        buildAlert(
          member,
          "poor_sleep",
          `Latest sleep score is ${latest.sleep}/10 on ${latest.checkin_date}.`,
          "Improve recovery habits, sleep routine, and evening wind-down consistency.",
        ),
      )
    }

    if (latest?.motivation != null && latest.motivation < 5) {
      rawAlerts.push(
        buildAlert(
          member,
          "low_motivation",
          `Latest motivation score is ${latest.motivation}/10 on ${latest.checkin_date}.`,
          "Adjust goals, accountability touchpoints, and short-term wins to rebuild momentum.",
        ),
      )
    }

    if (isWeightPlateau(memberCheckIns)) {
      rawAlerts.push(
        buildAlert(
          member,
          "weight_plateau",
          "Weight has shifted by 0.3 kg or less across the last three logged check-ins.",
          "Review calorie targets, training progression, and adherence before changing the plan.",
        ),
      )
    }

    if (!hasRecentCheckIn(memberCheckIns, period.start)) {
      rawAlerts.push(
        buildAlert(
          member,
          "missing_check_ins",
          `No check-in logged in the last 7 days (${period.label}).`,
          "Send a check-in reminder and confirm the member's current schedule and priorities.",
        ),
      )
    }
  }

  for (const goal of scopedGoals) {
    if (goal.status !== "behind_schedule") continue

    rawAlerts.push(
      buildAlert(
        { id: goal.memberId, name: goal.memberName },
        "goal_behind_schedule",
        `"${goal.title}" is at ${goal.progressPercent}% with target date ${goal.targetDate}.`,
        "Reassess the goal timeline, weekly actions, and check-in consistency to get back on track.",
        `-${goal.id}`,
      ),
    )
  }

  return applySeverityRules(rawAlerts).sort((left, right) => {
    const severityCompare =
      SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity]
    if (severityCompare !== 0) return severityCompare
    return left.memberName.localeCompare(right.memberName)
  })
}

export function getAlertSeverityLabel(severity: AlertSeverity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1)
}
