import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import {
  formatProgressChartDate,
  parseProgressDate,
  resolveProgressDateKeyFromRecord,
  toProgressDateKey,
} from "@/lib/progress/progress-date"

type WorkoutCompletionInput = {
  member_id: string
  completed_at: string
}

type WorkoutAssignmentInput = {
  member_id: string
  status: string
}

type NutritionAssignmentInput = {
  member_id: string
  status: string
  nutrition_plans: { title: string } | null
}

type ClientHabitInput = {
  member_id: string
  logged_at: string
  created_at?: string
}

export type WorkoutAdherenceMetrics = {
  completedLast7Days: number
  completedLast30Days: number
  activeAssignments: number
}

export type NutritionAdherenceMetrics = {
  hasActivePlan: boolean
  status: string | null
  planTitle: string | null
}

export type HabitAdherenceMetrics = {
  completionPercent7d: number | null
  completionPercent30d: number | null
  loggedDays7d: number
  loggedDays30d: number
}

export type CheckInAdherenceMetrics = {
  latestCheckInDate: string | null
  latestCheckInLabel: string | null
  missedCheckIn: boolean
  daysSinceLatest: number | null
}

export type MemberAdherenceMetrics = {
  memberId: string
  workout: WorkoutAdherenceMetrics
  nutrition: NutritionAdherenceMetrics
  habit: HabitAdherenceMetrics
  checkIn: CheckInAdherenceMetrics
}

export type ProgressAdherenceSnapshot = {
  byMember: Map<string, MemberAdherenceMetrics>
}

export type RosterAdherenceSummary = {
  workoutCompleted7d: number
  workoutCompleted30d: number
  membersWithActiveWorkoutPlan: number
  membersWithActiveNutritionPlan: number
  membersTotal: number
  averageHabitCompletion7d: number | null
  averageHabitCompletion30d: number | null
  membersMissedCheckIn: number
  latestCheckInLabel: string | null
}

const CHECK_IN_MISSED_DAYS = 7
const HABIT_WINDOW_7 = 7
const HABIT_WINDOW_30 = 30

function startOfWindowDaysInclusive(windowDays: number, reference = new Date()): Date {
  const start = new Date(reference)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (windowDays - 1))
  return start
}

function isOnOrAfterWindow(value: unknown, windowStart: Date): boolean {
  const parsed = parseProgressDate(value)
  if (!parsed) return false
  return parsed.getTime() >= windowStart.getTime()
}

function daysSinceDate(value: Date, reference = new Date()): number {
  const ref = new Date(reference)
  ref.setHours(12, 0, 0, 0)
  const target = new Date(value)
  target.setHours(12, 0, 0, 0)
  return Math.floor((ref.getTime() - target.getTime()) / (24 * 60 * 60 * 1000))
}

function isActiveNutritionStatus(status: string | null | undefined): boolean {
  const normalized = (status ?? "").trim().toLowerCase()
  return normalized !== "" && normalized !== "inactive" && normalized !== "cancelled"
}

function isActiveWorkoutAssignmentStatus(status: string | null | undefined): boolean {
  const normalized = (status ?? "").trim().toLowerCase()
  return normalized === "" || normalized === "active" || normalized === "assigned"
}

function computeHabitCompletionPercent(
  habits: ClientHabitInput[],
  memberId: string,
  windowDays: number,
  reference = new Date(),
): { percent: number | null; loggedDays: number } {
  const windowStart = startOfWindowDaysInclusive(windowDays, reference)
  const loggedDates = new Set<string>()

  for (const habit of habits) {
    if (habit.member_id !== memberId) continue
    const dateKey =
      toProgressDateKey(habit.logged_at) ??
      resolveProgressDateKeyFromRecord(habit as unknown as Record<string, unknown>)
    if (!dateKey) continue
    if (!isOnOrAfterWindow(dateKey, windowStart)) continue
    loggedDates.add(dateKey)
  }

  if (loggedDates.size === 0) {
    const hasAnyHabit = habits.some((habit) => habit.member_id === memberId)
    return { percent: hasAnyHabit ? 0 : null, loggedDays: 0 }
  }

  const percent = Math.min(
    100,
    Math.round((loggedDates.size / windowDays) * 100),
  )

  return { percent, loggedDays: loggedDates.size }
}

function computeLatestCheckIn(
  checkIns: ClientCheckInRow[],
  memberId: string,
): CheckInAdherenceMetrics {
  const memberCheckIns = checkIns
    .filter((row) => row.member_id === memberId)
    .map((row) => {
      const dateKey = resolveProgressDateKeyFromRecord(
        row as unknown as Record<string, unknown>,
      )
      return dateKey ? { dateKey, parsed: parseProgressDate(dateKey)! } : null
    })
    .filter((row): row is { dateKey: string; parsed: Date } => row != null)
    .sort((left, right) => right.parsed.getTime() - left.parsed.getTime())

  const latest = memberCheckIns[0]

  if (!latest) {
    return {
      latestCheckInDate: null,
      latestCheckInLabel: null,
      missedCheckIn: true,
      daysSinceLatest: null,
    }
  }

  const daysSinceLatest = daysSinceDate(latest.parsed)

  return {
    latestCheckInDate: latest.dateKey,
    latestCheckInLabel: formatProgressChartDate(latest.dateKey),
    missedCheckIn: daysSinceLatest > CHECK_IN_MISSED_DAYS,
    daysSinceLatest,
  }
}

export function emptyMemberAdherence(memberId: string): MemberAdherenceMetrics {
  return {
    memberId,
    workout: {
      completedLast7Days: 0,
      completedLast30Days: 0,
      activeAssignments: 0,
    },
    nutrition: {
      hasActivePlan: false,
      status: null,
      planTitle: null,
    },
    habit: {
      completionPercent7d: null,
      completionPercent30d: null,
      loggedDays7d: 0,
      loggedDays30d: 0,
    },
    checkIn: {
      latestCheckInDate: null,
      latestCheckInLabel: null,
      missedCheckIn: true,
      daysSinceLatest: null,
    },
  }
}

export function computeMemberAdherenceMetrics(input: {
  memberId: string
  completions: WorkoutCompletionInput[]
  assignments: WorkoutAssignmentInput[]
  nutritionAssignments: NutritionAssignmentInput[]
  habits: ClientHabitInput[]
  checkIns: ClientCheckInRow[]
  referenceDate?: Date
}): MemberAdherenceMetrics {
  const reference = input.referenceDate ?? new Date()
  const start7 = startOfWindowDaysInclusive(7, reference)
  const start30 = startOfWindowDaysInclusive(30, reference)
  const metrics = emptyMemberAdherence(input.memberId)

  for (const completion of input.completions) {
    if (completion.member_id !== input.memberId) continue
    if (isOnOrAfterWindow(completion.completed_at, start7)) {
      metrics.workout.completedLast7Days += 1
    }
    if (isOnOrAfterWindow(completion.completed_at, start30)) {
      metrics.workout.completedLast30Days += 1
    }
  }

  for (const assignment of input.assignments) {
    if (assignment.member_id !== input.memberId) continue
    if (isActiveWorkoutAssignmentStatus(assignment.status)) {
      metrics.workout.activeAssignments += 1
    }
  }

  for (const row of input.nutritionAssignments) {
    if (row.member_id !== input.memberId) continue
    if (!isActiveNutritionStatus(row.status)) continue
    metrics.nutrition.hasActivePlan = true
    metrics.nutrition.status = row.status
    metrics.nutrition.planTitle = row.nutrition_plans?.title ?? metrics.nutrition.planTitle
  }

  const habit7 = computeHabitCompletionPercent(
    input.habits,
    input.memberId,
    HABIT_WINDOW_7,
    reference,
  )
  const habit30 = computeHabitCompletionPercent(
    input.habits,
    input.memberId,
    HABIT_WINDOW_30,
    reference,
  )

  metrics.habit = {
    completionPercent7d: habit7.percent,
    completionPercent30d: habit30.percent,
    loggedDays7d: habit7.loggedDays,
    loggedDays30d: habit30.loggedDays,
  }

  metrics.checkIn = computeLatestCheckIn(input.checkIns, input.memberId)

  return metrics
}

export function computeProgressAdherenceSnapshot(input: {
  memberIds: string[]
  completions: WorkoutCompletionInput[]
  assignments: WorkoutAssignmentInput[]
  nutritionAssignments: NutritionAssignmentInput[]
  habits: ClientHabitInput[]
  checkIns: ClientCheckInRow[]
  referenceDate?: Date
}): ProgressAdherenceSnapshot {
  const byMember = new Map<string, MemberAdherenceMetrics>()

  for (const memberId of input.memberIds) {
    byMember.set(
      memberId,
      computeMemberAdherenceMetrics({
        memberId,
        completions: input.completions,
        assignments: input.assignments,
        nutritionAssignments: input.nutritionAssignments,
        habits: input.habits,
        checkIns: input.checkIns,
        referenceDate: input.referenceDate,
      }),
    )
  }

  return { byMember }
}

export function aggregateRosterAdherence(
  snapshot: ProgressAdherenceSnapshot,
  memberIds: string[],
): RosterAdherenceSummary {
  const scopedIds =
    memberIds.length > 0 ? memberIds : [...snapshot.byMember.keys()]

  let workoutCompleted7d = 0
  let workoutCompleted30d = 0
  let membersWithActiveWorkoutPlan = 0
  let membersWithActiveNutritionPlan = 0
  let membersMissedCheckIn = 0
  let habit7Total = 0
  let habit7Count = 0
  let habit30Total = 0
  let habit30Count = 0
  let latestCheckIn: Date | null = null

  for (const memberId of scopedIds) {
    const metrics = snapshot.byMember.get(memberId) ?? emptyMemberAdherence(memberId)

    workoutCompleted7d += metrics.workout.completedLast7Days
    workoutCompleted30d += metrics.workout.completedLast30Days

    if (metrics.workout.activeAssignments > 0) {
      membersWithActiveWorkoutPlan += 1
    }
    if (metrics.nutrition.hasActivePlan) {
      membersWithActiveNutritionPlan += 1
    }
    if (metrics.checkIn.missedCheckIn) {
      membersMissedCheckIn += 1
    }

    if (metrics.habit.completionPercent7d != null) {
      habit7Total += metrics.habit.completionPercent7d
      habit7Count += 1
    }
    if (metrics.habit.completionPercent30d != null) {
      habit30Total += metrics.habit.completionPercent30d
      habit30Count += 1
    }

    if (metrics.checkIn.latestCheckInDate) {
      const parsed = parseProgressDate(metrics.checkIn.latestCheckInDate)
      if (parsed && (!latestCheckIn || parsed.getTime() > latestCheckIn.getTime())) {
        latestCheckIn = parsed
      }
    }
  }

  return {
    workoutCompleted7d,
    workoutCompleted30d,
    membersWithActiveWorkoutPlan,
    membersWithActiveNutritionPlan,
    membersTotal: scopedIds.length,
    averageHabitCompletion7d:
      habit7Count > 0 ? Math.round(habit7Total / habit7Count) : null,
    averageHabitCompletion30d:
      habit30Count > 0 ? Math.round(habit30Total / habit30Count) : null,
    membersMissedCheckIn,
    latestCheckInLabel: latestCheckIn
      ? formatProgressChartDate(latestCheckIn)
      : null,
  }
}

export function formatAdherencePercent(value: number | null | undefined): string {
  if (value == null) return "—"
  return `${value}%`
}

export function formatMissedCheckInStatus(metrics: CheckInAdherenceMetrics): string {
  if (!metrics.latestCheckInDate) return "No check-ins yet"
  if (metrics.missedCheckIn) {
    return metrics.daysSinceLatest != null
      ? `Overdue (${metrics.daysSinceLatest}d ago)`
      : "Overdue"
  }
  return "On track"
}
