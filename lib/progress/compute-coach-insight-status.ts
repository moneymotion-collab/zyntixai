import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import type { ClientGoalViewModel } from "@/lib/progress/client-goals"
import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"
import type {
  ClientHabitSignal,
  ProgressCoachingSignals,
  WorkoutAssignmentSignal,
  WorkoutCompletionSignal,
} from "@/lib/progress/fetch-progress-coaching-signals"
import {
  parseProgressDate,
  resolveProgressDateKeyFromRecord,
  sortByProgressDateAsc,
} from "@/lib/progress/progress-date"

export type CoachInsightCategory =
  | "needs_attention"
  | "on_track"
  | "improving"
  | "missing_data"

export type AtRiskReason =
  | "no_check_in_7d"
  | "no_habit_3d"
  | "no_workout_7d"
  | "no_progress_log_14d"
  | "goal_behind_pace"
  | "weight_trend_opposite"

export type MemberCoachInsightStatus = {
  memberId: string
  memberName: string
  category: CoachInsightCategory
  atRiskReasons: AtRiskReason[]
  improvingSignals: string[]
  summary: string
}

export type CoachInsightRosterSummary = {
  needsAttention: number
  onTrack: number
  improving: number
  missingData: number
  members: MemberCoachInsightStatus[]
}

const CHECK_IN_AT_RISK_DAYS = 7
const HABIT_AT_RISK_DAYS = 3
const WORKOUT_AT_RISK_DAYS = 7
const PROGRESS_LOG_AT_RISK_DAYS = 14

export const AT_RISK_REASON_LABELS: Record<AtRiskReason, string> = {
  no_check_in_7d: "No check-in in the last 7 days",
  no_habit_3d: "No habit log in the last 3 days",
  no_workout_7d: "No workout completion in the last 7 days",
  no_progress_log_14d: "No progress log in the last 14 days",
  goal_behind_pace: "Active goal progress is below expected pace",
  weight_trend_opposite: "Weight trend is moving opposite to the goal direction",
}

export const COACH_INSIGHT_CATEGORY_LABELS: Record<CoachInsightCategory, string> = {
  needs_attention: "Needs attention",
  on_track: "On track",
  improving: "Improving",
  missing_data: "Missing data",
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

function memberName(
  memberId: string,
  members: { id: string; full_name: string | null }[],
): string {
  return members.find((member) => member.id === memberId)?.full_name ?? "Member"
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
      return parsed ? { row, parsed, dateKey } : null
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry != null)
    .sort((left, right) => right.parsed.getTime() - left.parsed.getTime())

  return rows[0]?.row ?? null
}

function latestHabitDateForMember(
  habits: ClientHabitSignal[],
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
  assignments: WorkoutAssignmentSignal[],
  memberId: string,
): boolean {
  return assignments.some(
    (assignment) =>
      assignment.member_id === memberId &&
      isActiveWorkoutAssignment(assignment.status),
  )
}

function hasWorkoutCompletionInWindow(
  completions: WorkoutCompletionSignal[],
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

function hasOppositeWeightTrend(
  checkIns: ClientCheckInRow[],
  goals: ClientGoalViewModel[],
  memberId: string,
): boolean {
  const weightGoals = goals.filter(
    (goal) =>
      goal.memberId === memberId &&
      (goal.goalType === "weight_loss" || goal.goalType === "weight_gain") &&
      goal.status !== "completed",
  )

  if (weightGoals.length === 0) return false

  const weights = sortByProgressDateAsc(
    checkIns
      .filter(
        (row) =>
          row.member_id === memberId &&
          row.weight != null &&
          !Number.isNaN(Number(row.weight)),
      )
      .map((row) => ({
        dateKey:
          resolveProgressDateKeyFromRecord(row as unknown as Record<string, unknown>) ??
          "",
        value: Number(row.weight),
      }))
      .filter((row) => row.dateKey),
    "dateKey",
  )

  if (weights.length < 2) return false

  const previous = weights[weights.length - 2].value
  const latest = weights[weights.length - 1].value
  const delta = latest - previous

  if (delta === 0) return false

  return weightGoals.some((goal) => {
    if (goal.goalType === "weight_loss") return delta > 0
    if (goal.goalType === "weight_gain") return delta < 0
    return false
  })
}

function memberHasAnyData(input: {
  memberId: string
  checkIns: ClientCheckInRow[]
  logs: ProgressLogRow[]
  habits: ClientHabitSignal[]
  completions: WorkoutCompletionSignal[]
  goals: ClientGoalViewModel[]
}): boolean {
  return (
    input.checkIns.some((row) => row.member_id === input.memberId) ||
    input.logs.some((log) => log.member_id === input.memberId) ||
    input.habits.some((habit) => habit.member_id === input.memberId) ||
    input.completions.some((completion) => completion.member_id === input.memberId) ||
    input.goals.some((goal) => goal.memberId === input.memberId)
  )
}

function detectAtRiskReasons(input: {
  memberId: string
  checkIns: ClientCheckInRow[]
  logs: ProgressLogRow[]
  habits: ClientHabitSignal[]
  completions: WorkoutCompletionSignal[]
  assignments: WorkoutAssignmentSignal[]
  goals: ClientGoalViewModel[]
  referenceDate?: Date
}): AtRiskReason[] {
  const reference = input.referenceDate ?? new Date()
  const reasons: AtRiskReason[] = []

  const latestCheckIn = latestCheckInForMember(input.checkIns, input.memberId)
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

  const latestHabitDate = latestHabitDateForMember(input.habits, input.memberId)
  const habitDays = latestHabitDate
    ? daysSinceProgressDate(latestHabitDate, reference)
    : null

  if (habitDays == null || habitDays > HABIT_AT_RISK_DAYS) {
    reasons.push("no_habit_3d")
  }

  if (
    hasActiveWorkoutAssignment(input.assignments, input.memberId) &&
    !hasWorkoutCompletionInWindow(
      input.completions,
      input.memberId,
      WORKOUT_AT_RISK_DAYS,
      reference,
    )
  ) {
    reasons.push("no_workout_7d")
  }

  const latestLog = latestProgressLogForMember(input.logs, input.memberId)
  const logDays = latestLog?.updated_at
    ? daysSinceProgressDate(latestLog.updated_at, reference)
    : null

  if (logDays == null || logDays > PROGRESS_LOG_AT_RISK_DAYS) {
    reasons.push("no_progress_log_14d")
  }

  if (
    input.goals.some(
      (goal) =>
        goal.memberId === input.memberId && goal.status === "behind_schedule",
    )
  ) {
    reasons.push("goal_behind_pace")
  }

  if (hasOppositeWeightTrend(input.checkIns, input.goals, input.memberId)) {
    reasons.push("weight_trend_opposite")
  }

  return reasons
}

function detectImprovingSignals(input: {
  memberId: string
  checkIns: ClientCheckInRow[]
  logs: ProgressLogRow[]
  habits: ClientHabitSignal[]
  completions: WorkoutCompletionSignal[]
  goals: ClientGoalViewModel[]
  referenceDate?: Date
}): string[] {
  const reference = input.referenceDate ?? new Date()
  const signals: string[] = []

  const onTrackGoals = input.goals.filter(
    (goal) => goal.memberId === input.memberId && goal.status === "on_track",
  )
  if (onTrackGoals.some((goal) => goal.progressPercent >= 25)) {
    signals.push("Goal progress is on track")
  }

  const latestLog = latestProgressLogForMember(input.logs, input.memberId)
  if (latestLog?.change_value != null && Number(latestLog.change_value) > 0) {
    signals.push("Recent progress log shows improvement")
  }

  const workouts7d = input.completions.filter(
    (completion) =>
      completion.member_id === input.memberId &&
      isOnOrAfterWindow(completion.completed_at, 7, reference),
  ).length

  if (workouts7d >= 2) {
    signals.push("Consistent workout completions this week")
  }

  const habitDays7d = new Set(
    input.habits
      .filter((habit) => habit.member_id === input.memberId)
      .map((habit) => parseProgressDate(habit.logged_at ?? habit.created_at))
      .filter((date): date is Date => date != null)
      .filter((date) => isOnOrAfterWindow(date, 7, reference))
      .map((date) => date.toISOString().slice(0, 10)),
  ).size

  if (habitDays7d >= 4) {
    signals.push("Strong habit logging this week")
  }

  const checkInDays = daysSinceProgressDate(
    resolveProgressDateKeyFromRecord(
      (latestCheckInForMember(input.checkIns, input.memberId) ??
        {}) as unknown as Record<string, unknown>,
    ),
    reference,
  )

  if (checkInDays != null && checkInDays <= 3) {
    signals.push("Recent check-in recorded")
  }

  return signals
}

function buildMemberSummary(
  category: CoachInsightCategory,
  atRiskReasons: AtRiskReason[],
  improvingSignals: string[],
): string {
  if (category === "missing_data") {
    return "No coaching activity logged yet — start with a check-in or progress entry."
  }
  if (category === "needs_attention") {
    return atRiskReasons.map((reason) => AT_RISK_REASON_LABELS[reason]).join(" · ")
  }
  if (category === "improving") {
    return improvingSignals.join(" · ")
  }
  return "Engagement looks steady — keep monitoring goals and check-ins."
}

export function computeMemberCoachInsightStatus(input: {
  memberId: string
  memberName: string
  checkIns: ClientCheckInRow[]
  logs: ProgressLogRow[]
  goals: ClientGoalViewModel[]
  signals: Pick<
    ProgressCoachingSignals,
    "completions" | "assignments" | "habits"
  >
  referenceDate?: Date
}): MemberCoachInsightStatus {
  const shared = {
    memberId: input.memberId,
    checkIns: input.checkIns,
    logs: input.logs,
    habits: input.signals.habits,
    completions: input.signals.completions,
    assignments: input.signals.assignments,
    goals: input.goals,
    referenceDate: input.referenceDate,
  }

  if (!memberHasAnyData(shared)) {
    return {
      memberId: input.memberId,
      memberName: input.memberName,
      category: "missing_data",
      atRiskReasons: [],
      improvingSignals: [],
      summary: buildMemberSummary("missing_data", [], []),
    }
  }

  const atRiskReasons = detectAtRiskReasons(shared)
  const improvingSignals = detectImprovingSignals(shared)

  let category: CoachInsightCategory = "on_track"

  if (atRiskReasons.length > 0) {
    category = "needs_attention"
  } else if (improvingSignals.length >= 2) {
    category = "improving"
  }

  return {
    memberId: input.memberId,
    memberName: input.memberName,
    category,
    atRiskReasons,
    improvingSignals,
    summary: buildMemberSummary(category, atRiskReasons, improvingSignals),
  }
}

export function computeCoachInsightRoster(input: {
  members: { id: string; full_name: string | null }[]
  checkIns: ClientCheckInRow[]
  logs: ProgressLogRow[]
  goals: ClientGoalViewModel[]
  signals: ProgressCoachingSignals
  memberFilter?: string
  referenceDate?: Date
}): CoachInsightRosterSummary {
  const scopedMembers =
    input.memberFilter && input.memberFilter !== "all"
      ? input.members.filter((member) => member.id === input.memberFilter)
      : input.members

  const members = scopedMembers.map((member) =>
    computeMemberCoachInsightStatus({
      memberId: member.id,
      memberName: member.full_name ?? "Member",
      checkIns: input.signals.checkIns.length > 0 ? input.signals.checkIns : input.checkIns,
      logs: input.logs,
      goals: input.goals,
      signals: input.signals,
      referenceDate: input.referenceDate,
    }),
  )

  return {
    needsAttention: members.filter((member) => member.category === "needs_attention")
      .length,
    onTrack: members.filter((member) => member.category === "on_track").length,
    improving: members.filter((member) => member.category === "improving").length,
    missingData: members.filter((member) => member.category === "missing_data").length,
    members,
  }
}
