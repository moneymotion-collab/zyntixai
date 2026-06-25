import type { ProgressCoachInsight } from "@/lib/progress/compute-progress-coach-insights"
import type { MemberProgressSummary } from "@/lib/progress/compute-member-progress-summary"
import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"
import type { CoachNoteRow } from "@/lib/progress/fetch-coach-notes"
import type { ClientGoalViewModel } from "@/lib/progress/client-goals"

export const RECENT_HISTORY_LIMIT = 10

export type ProgressReportDateRange = {
  start: string | null
  end: string | null
  label: string
}

export type ProgressReportGoals = {
  active: ClientGoalViewModel[]
  completed: ClientGoalViewModel[]
  overdue: ClientGoalViewModel[]
}

export type ProgressReportData = {
  memberName: string
  memberEmail: string | null
  generatedAt: string
  dateRange: ProgressReportDateRange
  totalLogs: number
  bestImprovement: MemberProgressSummary["bestMetricImprovement"]
  goals: ProgressReportGoals
  coachInsights: ProgressCoachInsight[]
  recentHistory: ProgressLogRow[]
  coachNotes: CoachNoteRow[]
}

export function computeProgressDateRange(logs: ProgressLogRow[]): ProgressReportDateRange {
  const timestamps = logs
    .map((log) => log.updated_at)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())

  if (timestamps.length === 0) {
    return {
      start: null,
      end: null,
      label: "No progress data recorded",
    }
  }

  const min = Math.min(...timestamps)
  const max = Math.max(...timestamps)
  const start = new Date(min).toISOString()
  const end = new Date(max).toISOString()

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", { dateStyle: "medium" })

  const startLabel = formatDate(start)
  const endLabel = formatDate(end)

  return {
    start,
    end,
    label: startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`,
  }
}

export function groupGoalsForReport(goals: ClientGoalViewModel[]): ProgressReportGoals {
  return {
    active: goals.filter((goal) => goal.status === "on_track"),
    completed: goals.filter((goal) => goal.status === "completed"),
    overdue: goals.filter((goal) => goal.status === "behind_schedule"),
  }
}

export function buildProgressReportData(input: {
  memberName: string
  memberEmail: string | null
  logs: ProgressLogRow[]
  goals: ClientGoalViewModel[]
  summary: MemberProgressSummary
  coachInsights: ProgressCoachInsight[]
  coachNotes: CoachNoteRow[]
}): ProgressReportData {
  const sortedLogs = input.logs
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime(),
    )

  return {
    memberName: input.memberName,
    memberEmail: input.memberEmail,
    generatedAt: new Date().toISOString(),
    dateRange: computeProgressDateRange(input.logs),
    totalLogs: input.summary.totalLogs,
    bestImprovement: input.summary.bestMetricImprovement,
    goals: groupGoalsForReport(input.goals),
    coachInsights: input.coachInsights,
    recentHistory: sortedLogs.slice(0, RECENT_HISTORY_LIMIT),
    coachNotes: input.coachNotes,
  }
}
