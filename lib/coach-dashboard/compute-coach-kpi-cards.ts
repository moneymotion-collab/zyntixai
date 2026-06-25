import { firstDayOfCurrentMonthString } from "@/lib/coach-dashboard/compute-business-overview"
import { startOfWeekDateString } from "@/lib/coach-dashboard/date-utils"
import type { ClientGoalViewModel } from "@/lib/progress/client-goals"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import type { Database } from "@/lib/database.types"
import {
  parseProgressDate,
  resolveProgressDateKeyFromRecord,
  toProgressDateKey,
} from "@/lib/progress/progress-date"

type MemberRef = {
  id: string
  full_name: string | null
}

type ClientReminderRef = {
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

type SessionRef = {
  scheduled_date: string | null
  status: string | null
}

type ClientGoalRow = Database["public"]["Tables"]["client_goals"]["Row"]

const CHECK_IN_WINDOW_DAYS = 7
const WORKOUT_WINDOW_DAYS = 7
const HABIT_WINDOW_DAYS = 7

export type CoachKpiCards = {
  activeClients: number
  clientsAtRisk: number
  checkInRate7d: number | null
  workoutCompletionRate7d: number | null
  habitAdherenceAvg7d: number | null
  openReminders: number
  sessionsThisWeek: number
  goalsCompletedThisMonth: number
}

export type ComputeCoachKpiCardsInput = {
  members: MemberRef[]
  checkIns: ClientCheckInRow[]
  habits: ClientHabitRef[]
  completions: WorkoutCompletionRef[]
  assignments: WorkoutAssignmentRef[]
  reminders: ClientReminderRef[]
  sessions: SessionRef[]
  goals: ClientGoalViewModel[]
  goalRows: ClientGoalRow[]
  clientsAtRisk: number
  referenceDate?: Date
}

function startOfWindowDaysInclusive(windowDays: number, reference = new Date()): Date {
  const start = new Date(reference)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (windowDays - 1))
  return start
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

function isCancelledSession(status: string | null | undefined): boolean {
  return (status ?? "").trim().toLowerCase() === "geannuleerd"
}

function roundPercent(value: number): number {
  return Math.round(value)
}

function computeCheckInRate7d(
  members: MemberRef[],
  checkIns: ClientCheckInRow[],
  reference = new Date(),
): number | null {
  if (members.length === 0) return null

  const membersWithCheckIn = members.filter((member) =>
    checkIns.some(
      (row) =>
        row.member_id === member.id &&
        isOnOrAfterWindow(
          resolveProgressDateKeyFromRecord(row as unknown as Record<string, unknown>),
          CHECK_IN_WINDOW_DAYS,
          reference,
        ),
    ),
  ).length

  return roundPercent((membersWithCheckIn / members.length) * 100)
}

function computeWorkoutCompletionRate7d(
  members: MemberRef[],
  completions: WorkoutCompletionRef[],
  assignments: WorkoutAssignmentRef[],
  reference = new Date(),
): number | null {
  const assignedMemberIds = members
    .filter((member) =>
      assignments.some(
        (assignment) =>
          assignment.member_id === member.id &&
          isActiveWorkoutAssignment(assignment.status),
      ),
    )
    .map((member) => member.id)

  if (assignedMemberIds.length === 0) return null

  const completedCount = assignedMemberIds.filter((memberId) =>
    completions.some(
      (completion) =>
        completion.member_id === memberId &&
        isOnOrAfterWindow(completion.completed_at, WORKOUT_WINDOW_DAYS, reference),
    ),
  ).length

  return roundPercent((completedCount / assignedMemberIds.length) * 100)
}

function computeHabitAdherenceAvg7d(
  members: MemberRef[],
  habits: ClientHabitRef[],
  reference = new Date(),
): number | null {
  if (members.length === 0) return null

  const windowStart = startOfWindowDaysInclusive(HABIT_WINDOW_DAYS, reference)

  const memberRates = members.map((member) => {
    const loggedDays = new Set<string>()

    for (const habit of habits) {
      if (habit.member_id !== member.id) continue
      const dateKey = toProgressDateKey(habit.logged_at ?? habit.created_at)
      const parsed = dateKey ? parseProgressDate(dateKey) : null
      if (!parsed || parsed.getTime() < windowStart.getTime()) continue
      loggedDays.add(dateKey!)
    }

    return (loggedDays.size / HABIT_WINDOW_DAYS) * 100
  })

  const total = memberRates.reduce((sum, rate) => sum + rate, 0)
  return roundPercent(total / memberRates.length)
}

function countOpenReminders(reminders: ClientReminderRef[]): number {
  return reminders.filter((reminder) => isOpenReminder(reminder.status)).length
}

function countSessionsThisWeek(sessions: SessionRef[]): number {
  const weekStart = startOfWeekDateString()

  return sessions.filter((session) => {
    if (!session.scheduled_date || isCancelledSession(session.status)) return false
    const sessionKey = toProgressDateKey(session.scheduled_date)
    return sessionKey != null && sessionKey >= weekStart
  }).length
}

function countGoalsCompletedThisMonth(
  goals: ClientGoalViewModel[],
  goalRows: ClientGoalRow[],
): number {
  const monthStart = firstDayOfCurrentMonthString()
  const completedIds = new Set(
    goals.filter((goal) => goal.status === "completed").map((goal) => goal.id),
  )

  return goalRows.filter((row) => {
    if (!completedIds.has(row.id)) return false
    const updatedKey = toProgressDateKey(row.updated_at)
    return updatedKey != null && updatedKey >= monthStart
  }).length
}

export function emptyCoachKpiCards(): CoachKpiCards {
  return {
    activeClients: 0,
    clientsAtRisk: 0,
    checkInRate7d: null,
    workoutCompletionRate7d: null,
    habitAdherenceAvg7d: null,
    openReminders: 0,
    sessionsThisWeek: 0,
    goalsCompletedThisMonth: 0,
  }
}

export function computeCoachKpiCards(input: ComputeCoachKpiCardsInput): CoachKpiCards {
  const reference = input.referenceDate ?? new Date()

  return {
    activeClients: input.members.length,
    clientsAtRisk: input.clientsAtRisk,
    checkInRate7d: computeCheckInRate7d(
      input.members,
      input.checkIns,
      reference,
    ),
    workoutCompletionRate7d: computeWorkoutCompletionRate7d(
      input.members,
      input.completions,
      input.assignments,
      reference,
    ),
    habitAdherenceAvg7d: computeHabitAdherenceAvg7d(
      input.members,
      input.habits,
      reference,
    ),
    openReminders: countOpenReminders(input.reminders),
    sessionsThisWeek: countSessionsThisWeek(input.sessions),
    goalsCompletedThisMonth: countGoalsCompletedThisMonth(
      input.goals,
      input.goalRows,
    ),
  }
}
