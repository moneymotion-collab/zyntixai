import { latestCheckInIdForMember } from "@/lib/coach-dashboard/check-in-lookup"
import { shouldEvaluateMissingHabit } from "@/lib/coach-dashboard/member-habit-eligibility"
import type {
  AtRiskClientReason,
  AtRiskLevel,
  AtRiskMember,
  AtRiskMembersCenter,
} from "@/lib/coach-dashboard/types"
import type { ClientGoalViewModel } from "@/lib/progress/client-goals"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"
import {
  parseProgressDate,
  resolveProgressDateKeyFromRecord,
  sortByProgressDateAsc,
  toProgressDateKey,
} from "@/lib/progress/progress-date"

type MemberRef = {
  id: string
  full_name: string | null
  created_at?: string | null
}

type ClientReminderRef = {
  member_id: string
  status: string
  priority: string
}

type ClientHabitRef = {
  member_id: string
  logged_at: string
  created_at?: string
}

type WorkoutCompletionRef = {
  member_id: string
  completed_at: string
}

type WorkoutAssignmentRef = {
  member_id: string
  status: string
}

type NextSessionInfo = {
  date: string | null
  dateLabel: string
  time: string | null
}

export const AT_RISK_CLIENT_REASON_LABELS: Record<AtRiskClientReason, string> = {
  no_check_in_7d: "No check-in in 7 days",
  no_habit_3d: "No habit log in 3 days",
  no_workout_7d: "No workout in 7 days",
  no_progress_log_14d: "No progress log in 14 days",
  goal_behind_pace: "Goal behind pace",
  open_high_priority_reminder: "Open high-priority reminder",
}

const CHECK_IN_AT_RISK_DAYS = 7
const HABIT_AT_RISK_DAYS = 3
const WORKOUT_AT_RISK_DAYS = 7
const PROGRESS_LOG_AT_RISK_DAYS = 14

const RISK_LABELS: Record<AtRiskLevel, string> = {
  high: "High Risk",
  medium: "Medium Risk",
  low: "Low Risk",
}

const RISK_RANK: Record<AtRiskLevel, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export type ComputeAtRiskClientCenterInput = {
  members: MemberRef[]
  checkIns: ClientCheckInRow[]
  habits: ClientHabitRef[]
  completions: WorkoutCompletionRef[]
  assignments: WorkoutAssignmentRef[]
  progressLogs: ProgressLogRow[]
  goals: ClientGoalViewModel[]
  reminders: ClientReminderRef[]
  nextSessionByMember: Map<string, NextSessionInfo>
  referenceDate?: Date
}

function startOfWindowDaysInclusive(windowDays: number, reference = new Date()): Date {
  const start = new Date(reference)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (windowDays - 1))
  return start
}

function daysSinceProgressDate(value: unknown, reference = new Date()): number | null {
  const parsed = parseProgressDate(value)
  if (!parsed) return null

  const ref = new Date(reference)
  ref.setHours(12, 0, 0, 0)
  const target = new Date(parsed)
  target.setHours(12, 0, 0, 0)
  return Math.floor((ref.getTime() - target.getTime()) / (24 * 60 * 60 * 1000))
}

function isOnOrAfterWindow(value: unknown, windowDays: number, reference = new Date()): boolean {
  const parsed = parseProgressDate(value)
  if (!parsed) return false
  const windowStart = startOfWindowDaysInclusive(windowDays, reference)
  return parsed.getTime() >= windowStart.getTime()
}

function isActiveWorkoutAssignment(status: string | null | undefined): boolean {
  const normalized = (status ?? "").trim().toLowerCase()
  return normalized === "" || normalized === "active" || normalized === "assigned"
}

function isOpenReminder(status: string | null | undefined): boolean {
  return (status ?? "").trim().toLowerCase() === "open"
}

function isHighPriorityReminder(priority: string | null | undefined): boolean {
  return (priority ?? "").trim().toLowerCase() === "high"
}

function latestCheckInForMember(
  checkIns: ClientCheckInRow[],
  memberId: string,
): ClientCheckInRow | null {
  const rows = checkIns
    .filter((row) => row.member_id === memberId)
    .map((row) => {
      const dateKey = resolveProgressDateKeyFromRecord(
        row as unknown as Record<string, unknown>,
      )
      const parsed = dateKey ? parseProgressDate(dateKey) : null
      return parsed ? { row, parsed } : null
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry != null)
    .sort((left, right) => right.parsed.getTime() - left.parsed.getTime())

  return rows[0]?.row ?? null
}

function latestHabitDateForMember(
  habits: ClientHabitRef[],
  memberId: string,
): string | null {
  const dates = habits
    .filter((habit) => habit.member_id === memberId)
    .map((habit) => parseProgressDate(habit.logged_at ?? habit.created_at))
    .filter((date): date is Date => date != null)
    .sort((left, right) => right.getTime() - left.getTime())

  return dates[0] ? dates[0].toISOString() : null
}

function latestProgressLogForMember(
  logs: ProgressLogRow[],
  memberId: string,
): ProgressLogRow | null {
  const memberLogs = logs.filter((log) => log.member_id === memberId)
  return sortByProgressDateAsc(memberLogs, "updated_at").at(-1) ?? null
}

function hasActiveWorkoutAssignment(
  assignments: WorkoutAssignmentRef[],
  memberId: string,
): boolean {
  return assignments.some(
    (assignment) =>
      assignment.member_id === memberId &&
      isActiveWorkoutAssignment(assignment.status),
  )
}

function hasWorkoutCompletionInWindow(
  completions: WorkoutCompletionRef[],
  memberId: string,
  windowDays: number,
  reference = new Date(),
): boolean {
  return completions.some(
    (completion) =>
      completion.member_id === memberId &&
      isOnOrAfterWindow(completion.completed_at, windowDays, reference),
  )
}

function hasOpenHighPriorityReminder(
  reminders: ClientReminderRef[],
  memberId: string,
): boolean {
  return reminders.some(
    (reminder) =>
      reminder.member_id === memberId &&
      isOpenReminder(reminder.status) &&
      isHighPriorityReminder(reminder.priority),
  )
}

function detectAtRiskReasons(input: {
  member: MemberRef
  checkIns: ClientCheckInRow[]
  habits: ClientHabitRef[]
  completions: WorkoutCompletionRef[]
  assignments: WorkoutAssignmentRef[]
  progressLogs: ProgressLogRow[]
  goals: ClientGoalViewModel[]
  reminders: ClientReminderRef[]
  referenceDate?: Date
}): AtRiskClientReason[] {
  const reference = input.referenceDate ?? new Date()
  const reasons: AtRiskClientReason[] = []
  const memberId = input.member.id

  const latestCheckIn = latestCheckInForMember(input.checkIns, memberId)
  const checkInDays = latestCheckIn
    ? daysSinceProgressDate(
        resolveProgressDateKeyFromRecord(
          latestCheckIn as unknown as Record<string, unknown>,
        ),
        reference,
      )
    : null

  if (checkInDays == null || checkInDays > CHECK_IN_AT_RISK_DAYS) {
    reasons.push("no_check_in_7d")
  }

  const latestHabitDate = latestHabitDateForMember(input.habits, memberId)
  const habitDays = latestHabitDate
    ? daysSinceProgressDate(latestHabitDate, reference)
    : null

  if (
    shouldEvaluateMissingHabit(input.member, input.habits, reference) &&
    (habitDays == null || habitDays > HABIT_AT_RISK_DAYS)
  ) {
    reasons.push("no_habit_3d")
  }

  if (
    hasActiveWorkoutAssignment(input.assignments, memberId) &&
    !hasWorkoutCompletionInWindow(
      input.completions,
      memberId,
      WORKOUT_AT_RISK_DAYS,
      reference,
    )
  ) {
    reasons.push("no_workout_7d")
  }

  const latestLog = latestProgressLogForMember(input.progressLogs, memberId)
  const logDays = latestLog?.updated_at
    ? daysSinceProgressDate(latestLog.updated_at, reference)
    : null

  if (logDays == null || logDays > PROGRESS_LOG_AT_RISK_DAYS) {
    reasons.push("no_progress_log_14d")
  }

  if (
    input.goals.some(
      (goal) =>
        goal.memberId === memberId && goal.status === "behind_schedule",
    )
  ) {
    reasons.push("goal_behind_pace")
  }

  if (hasOpenHighPriorityReminder(input.reminders, memberId)) {
    reasons.push("open_high_priority_reminder")
  }

  return reasons
}

function resolveRiskLevel(reasons: AtRiskClientReason[]): AtRiskLevel {
  if (
    reasons.includes("open_high_priority_reminder") ||
    reasons.length >= 3
  ) {
    return "high"
  }
  if (reasons.length >= 2) return "medium"
  return "low"
}

function resolveGoalStatus(
  goals: ClientGoalViewModel[],
  memberId: string,
): string {
  const memberGoals = goals.filter((goal) => goal.memberId === memberId)
  const activeGoals = memberGoals.filter((goal) => goal.status !== "completed")

  if (activeGoals.some((goal) => goal.status === "behind_schedule")) {
    return "Behind schedule"
  }
  if (activeGoals.some((goal) => goal.status === "on_track")) {
    return "On track"
  }
  if (memberGoals.length === 0) {
    return "No active goal"
  }
  return "Completed"
}

function formatActivityDateLabel(value: string | null): string {
  if (!value) return "No activity yet"
  const parsed = parseProgressDate(value)
  if (!parsed) return "No activity yet"
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatNextSessionLabel(session: NextSessionInfo | undefined): string {
  if (!session?.date) return "Not scheduled"
  if (session.time && session.time !== "—") {
    return `${session.dateLabel} · ${session.time}`
  }
  return session.dateLabel
}

function resolveLastActivityDate(input: {
  memberId: string
  checkIns: ClientCheckInRow[]
  habits: ClientHabitRef[]
  completions: WorkoutCompletionRef[]
  progressLogs: ProgressLogRow[]
}): string | null {
  const candidates: string[] = []

  const latestCheckIn = latestCheckInForMember(input.checkIns, input.memberId)
  const checkInKey = latestCheckIn
    ? resolveProgressDateKeyFromRecord(
        latestCheckIn as unknown as Record<string, unknown>,
      )
    : null
  if (checkInKey) candidates.push(checkInKey)

  const latestHabit = latestHabitDateForMember(input.habits, input.memberId)
  const habitKey = latestHabit ? toProgressDateKey(latestHabit) : null
  if (habitKey) candidates.push(habitKey)

  const latestCompletion = input.completions
    .filter((completion) => completion.member_id === input.memberId)
    .map((completion) => toProgressDateKey(completion.completed_at))
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => {
      const leftTime = parseProgressDate(left)?.getTime() ?? 0
      const rightTime = parseProgressDate(right)?.getTime() ?? 0
      return rightTime - leftTime
    })[0]
  if (latestCompletion) candidates.push(latestCompletion)

  const latestLog = latestProgressLogForMember(input.progressLogs, input.memberId)
  const logKey = latestLog?.updated_at ? toProgressDateKey(latestLog.updated_at) : null
  if (logKey) candidates.push(logKey)

  if (candidates.length === 0) return null

  return candidates.sort((left, right) => {
    const leftTime = parseProgressDate(left)?.getTime() ?? 0
    const rightTime = parseProgressDate(right)?.getTime() ?? 0
    return rightTime - leftTime
  })[0]
}

export function computeAtRiskClientCenter(
  input: ComputeAtRiskClientCenterInput,
): AtRiskMembersCenter {
  const atRiskMembers: AtRiskMember[] = []

  for (const member of input.members) {
    const riskReasons = detectAtRiskReasons({
      member,
      checkIns: input.checkIns,
      habits: input.habits,
      completions: input.completions,
      assignments: input.assignments,
      progressLogs: input.progressLogs,
      goals: input.goals,
      reminders: input.reminders,
      referenceDate: input.referenceDate,
    })

    if (riskReasons.length === 0) continue

    const riskReasonLabels = riskReasons.map(
      (reason) => AT_RISK_CLIENT_REASON_LABELS[reason],
    )
    const riskLevel = resolveRiskLevel(riskReasons)
    const latestCheckIn = latestCheckInForMember(input.checkIns, member.id)
    const lastCheckInDate =
      latestCheckIn != null
        ? resolveProgressDateKeyFromRecord(
            latestCheckIn as unknown as Record<string, unknown>,
          )
        : null
    const lastActivityDate = resolveLastActivityDate({
      memberId: member.id,
      checkIns: input.checkIns,
      habits: input.habits,
      completions: input.completions,
      progressLogs: input.progressLogs,
    })
    const nextSession = input.nextSessionByMember.get(member.id)

    atRiskMembers.push({
      memberId: member.id,
      memberName: member.full_name ?? "Member",
      riskReasons,
      riskReasonLabels,
      riskLevel,
      riskLevelLabel: RISK_LABELS[riskLevel],
      lastActivityDate,
      lastActivityDateLabel: formatActivityDateLabel(lastActivityDate),
      mainRiskReason: riskReasonLabels[0] ?? "Needs coach attention",
      healthScore: 0,
      lastCheckInDate,
      lastCheckInDateLabel: formatActivityDateLabel(lastCheckInDate),
      activeAlertsCount: riskReasons.length,
      goalStatus: resolveGoalStatus(input.goals, member.id),
      nextSessionDate: nextSession?.date ?? null,
      nextSessionDateLabel: formatNextSessionLabel(nextSession),
      latestCheckInId: latestCheckInIdForMember(input.checkIns, member.id),
    })
  }

  atRiskMembers.sort((left, right) => {
    const levelDiff = RISK_RANK[left.riskLevel] - RISK_RANK[right.riskLevel]
    if (levelDiff !== 0) return levelDiff
    if (right.riskReasons.length !== left.riskReasons.length) {
      return right.riskReasons.length - left.riskReasons.length
    }
    return left.memberName.localeCompare(right.memberName)
  })

  const highRiskCount = atRiskMembers.filter((member) => member.riskLevel === "high").length
  const mediumRiskCount = atRiskMembers.filter(
    (member) => member.riskLevel === "medium",
  ).length
  const lowRiskCount = atRiskMembers.filter((member) => member.riskLevel === "low").length

  return {
    summary: {
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      totalAtRisk: atRiskMembers.length,
    },
    members: atRiskMembers,
  }
}
