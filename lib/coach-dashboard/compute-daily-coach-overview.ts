import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"
import {
  parseProgressDate,
  resolveProgressDateKeyFromRecord,
  toProgressDateKey,
} from "@/lib/progress/progress-date"
import { todayDateString } from "@/lib/coach-dashboard/date-utils"
import { shouldEvaluateMissingHabit } from "@/lib/coach-dashboard/member-habit-eligibility"
import type { TodaySession } from "@/lib/coach-dashboard/types"

type MemberRef = {
  id: string
  full_name: string | null
  created_at?: string | null
}

type ClientReminderRef = {
  id: string
  member_id: string
  title: string
  due_date: string
  status: string
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

const CHECK_IN_MISSING_DAYS = 7
const HABIT_MISSING_DAYS = 3
const WORKOUT_MISSING_DAYS = 7
const PROGRESS_MISSING_DAYS = 14

export type DailyCoachOverviewMetricId =
  | "sessions_today"
  | "reminders_due_today"
  | "missing_check_ins"
  | "missing_habits"
  | "no_workout_7d"
  | "no_progress_14d"

export type DailyCoachOverviewMetric = {
  id: DailyCoachOverviewMetricId
  label: string
  count: number
  detail: string
  href: string
  emphasis?: "neutral" | "warning"
}

export type DailyCoachReminderPreview = {
  id: string
  memberId: string
  title: string
}

export type DailyCoachOverview = {
  metrics: DailyCoachOverviewMetric[]
  remindersDueToday: DailyCoachReminderPreview[]
  sessionsToday: TodaySession[]
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

function isActiveWorkoutAssignment(status: string | null | undefined): boolean {
  const normalized = (status ?? "").trim().toLowerCase()
  return normalized === "" || normalized === "active" || normalized === "assigned"
}

function isOpenReminder(status: string | null | undefined): boolean {
  return (status ?? "").trim().toLowerCase() === "open"
}

function latestCheckInDateForMember(
  checkIns: ClientCheckInRow[],
  memberId: string,
): string | null {
  const dates = checkIns
    .filter((row) => row.member_id === memberId)
    .map((row) =>
      resolveProgressDateKeyFromRecord(row as unknown as Record<string, unknown>),
    )
    .filter((value): value is string => Boolean(value))

  if (dates.length === 0) return null

  return dates.sort((left, right) => {
    const leftTime = parseProgressDate(left)?.getTime() ?? 0
    const rightTime = parseProgressDate(right)?.getTime() ?? 0
    return rightTime - leftTime
  })[0]
}

function latestHabitDateForMember(
  habits: ClientHabitRef[],
  memberId: string,
): string | null {
  const dates = habits
    .filter((habit) => habit.member_id === memberId)
    .map((habit) => toProgressDateKey(habit.logged_at ?? habit.created_at))
    .filter((value): value is string => Boolean(value))

  if (dates.length === 0) return null

  return dates.sort((left, right) => {
    const leftTime = parseProgressDate(left)?.getTime() ?? 0
    const rightTime = parseProgressDate(right)?.getTime() ?? 0
    return rightTime - leftTime
  })[0]
}

function latestProgressLogDateForMember(
  logs: ProgressLogRow[],
  memberId: string,
): string | null {
  const dates = logs
    .filter((log) => log.member_id === memberId && log.updated_at)
    .map((log) => toProgressDateKey(log.updated_at))
    .filter((value): value is string => Boolean(value))

  if (dates.length === 0) return null

  return dates.sort((left, right) => {
    const leftTime = parseProgressDate(left)?.getTime() ?? 0
    const rightTime = parseProgressDate(right)?.getTime() ?? 0
    return rightTime - leftTime
  })[0]
}

function hasWorkoutCompletionInWindow(
  completions: WorkoutCompletionRef[],
  memberId: string,
  windowDays: number,
  reference = new Date(),
): boolean {
  return completions.some((completion) => {
    if (completion.member_id !== memberId) return false
    const days = daysSinceProgressDate(completion.completed_at, reference)
    return days != null && days <= windowDays - 1
  })
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

function countMembersMissingCheckIns(
  members: MemberRef[],
  checkIns: ClientCheckInRow[],
  reference = new Date(),
): number {
  return members.filter((member) => {
    const latest = latestCheckInDateForMember(checkIns, member.id)
    if (!latest) return true
    const days = daysSinceProgressDate(latest, reference)
    return days == null || days > CHECK_IN_MISSING_DAYS
  }).length
}

function countMembersMissingHabits(
  members: MemberRef[],
  habits: ClientHabitRef[],
  reference = new Date(),
): number {
  return members.filter((member) => {
    if (!shouldEvaluateMissingHabit(member, habits, reference)) return false

    const latest = latestHabitDateForMember(habits, member.id)
    if (!latest) return true
    const days = daysSinceProgressDate(latest, reference)
    return days == null || days > HABIT_MISSING_DAYS
  }).length
}

function countMembersNoWorkoutCompletion(
  members: MemberRef[],
  completions: WorkoutCompletionRef[],
  assignments: WorkoutAssignmentRef[],
  reference = new Date(),
): number {
  return members.filter((member) => {
    if (!hasActiveWorkoutAssignment(assignments, member.id)) return false
    return !hasWorkoutCompletionInWindow(
      completions,
      member.id,
      WORKOUT_MISSING_DAYS,
      reference,
    )
  }).length
}

function countMembersNoProgressUpdate(
  members: MemberRef[],
  logs: ProgressLogRow[],
  reference = new Date(),
): number {
  return members.filter((member) => {
    const latest = latestProgressLogDateForMember(logs, member.id)
    if (!latest) return true
    const days = daysSinceProgressDate(latest, reference)
    return days == null || days > PROGRESS_MISSING_DAYS
  }).length
}

function filterRemindersDueToday(
  reminders: ClientReminderRef[],
  today = todayDateString(),
): DailyCoachReminderPreview[] {
  return reminders
    .filter((reminder) => {
      if (!isOpenReminder(reminder.status)) return false
      const dueKey = toProgressDateKey(reminder.due_date)
      return dueKey === today
    })
    .map((reminder) => ({
      id: reminder.id,
      memberId: reminder.member_id,
      title: reminder.title,
    }))
}

export function computeDailyCoachOverview(input: {
  members: MemberRef[]
  todaySessions: TodaySession[]
  reminders: ClientReminderRef[]
  checkIns: ClientCheckInRow[]
  habits: ClientHabitRef[]
  completions: WorkoutCompletionRef[]
  assignments: WorkoutAssignmentRef[]
  progressLogs: ProgressLogRow[]
  referenceDate?: Date
}): DailyCoachOverview {
  const reference = input.referenceDate ?? new Date()
  const today = todayDateString()
  const remindersDueToday = filterRemindersDueToday(input.reminders, today)

  const missingCheckIns = countMembersMissingCheckIns(
    input.members,
    input.checkIns,
    reference,
  )
  const missingHabits = countMembersMissingHabits(
    input.members,
    input.habits,
    reference,
  )
  const noWorkout7d = countMembersNoWorkoutCompletion(
    input.members,
    input.completions,
    input.assignments,
    reference,
  )
  const noProgress14d = countMembersNoProgressUpdate(
    input.members,
    input.progressLogs,
    reference,
  )

  const metrics: DailyCoachOverviewMetric[] = [
    {
      id: "sessions_today",
      label: "Sessions today",
      count: input.todaySessions.length,
      detail: "On your calendar today",
      href: "/sessions",
      emphasis: "neutral",
    },
    {
      id: "reminders_due_today",
      label: "Reminders due today",
      count: remindersDueToday.length,
      detail: "Open client reminders",
      href: "/coach-workspace",
      emphasis: remindersDueToday.length > 0 ? "warning" : "neutral",
    },
    {
      id: "missing_check_ins",
      label: "Missing check-ins",
      count: missingCheckIns,
      detail: "No check-in in 7+ days",
      href: "/progress",
      emphasis: missingCheckIns > 0 ? "warning" : "neutral",
    },
    {
      id: "missing_habits",
      label: "Missing habits",
      count: missingHabits,
      detail: "No habit log in 3+ days",
      href: "/coach-workspace",
      emphasis: missingHabits > 0 ? "warning" : "neutral",
    },
    {
      id: "no_workout_7d",
      label: "No workout (7d)",
      count: noWorkout7d,
      detail: "Assigned plan, no completion",
      href: "/progress",
      emphasis: noWorkout7d > 0 ? "warning" : "neutral",
    },
    {
      id: "no_progress_14d",
      label: "No progress (14d)",
      count: noProgress14d,
      detail: "No progress log update",
      href: "/progress",
      emphasis: noProgress14d > 0 ? "warning" : "neutral",
    },
  ]

  return {
    metrics,
    remindersDueToday,
    sessionsToday: input.todaySessions,
  }
}
