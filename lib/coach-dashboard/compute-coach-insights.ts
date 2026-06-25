import {
  buildDemoCoachInsights,
  DEMO_COACH_INSIGHT_MAX,
  DEMO_COACH_INSIGHT_MIN,
} from "@/lib/demo/demo-coach-insights"
import type {
  CoachOverviewStats,
  NeedsAttentionAlert,
  TodaySession,
} from "@/lib/coach-dashboard/types"
import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"

export type CoachInsight = {
  id: string
  message: string
  variant: "info" | "success" | "warning" | "neutral"
}

type MemberInsightRef = {
  id: string
  full_name: string | null
  email?: string | null
  goal?: string | null
  is_demo?: boolean | null
}

type SessionDateRef = {
  scheduled_date: string | null
}

export type ComputeCoachInsightsInput = {
  stats: CoachOverviewStats
  todaySessions: TodaySession[]
  completedGoalsCount: number
  needsAttentionAlerts: NeedsAttentionAlert[]
  members: MemberInsightRef[]
  progressLogs: ProgressLogRow[]
  activeNutritionMemberIds: Set<string>
  sessionsThisMonth: SessionDateRef[]
  isDemoWorkspace?: boolean
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

function isWeightLossGoal(goal: string | null | undefined): boolean {
  const normalized = (goal ?? "").toLowerCase()
  return (
    normalized.includes("fat loss") ||
    normalized.includes("weight loss") ||
    normalized.includes("contest prep") ||
    normalized.includes("glp-1")
  )
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function computeMissedWorkoutCount(alerts: NeedsAttentionAlert[]): number {
  return alerts.filter((alert) => alert.alertType === "missed_workout").length
}

function computeBusiestDaysLabel(sessions: SessionDateRef[]): string | null {
  const counts = new Map<number, number>()

  for (const session of sessions) {
    if (!session.scheduled_date) continue
    const day = new Date(`${session.scheduled_date}T12:00:00`).getDay()
    counts.set(day, (counts.get(day) ?? 0) + 1)
  }

  if (counts.size === 0) return null

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const topTwo = ranked.slice(0, 2).map(([day]) => DAY_NAMES[day])

  if (topTwo.length === 1) {
    return topTwo[0]
  }

  return `${topTwo[0]} and ${topTwo[1]}`
}

function computeWeightLossWeeklyKg(
  members: MemberInsightRef[],
  logs: ProgressLogRow[],
): number | null {
  const weightLossMemberIds = new Set(
    members.filter((member) => isWeightLossGoal(member.goal)).map((m) => m.id),
  )

  if (weightLossMemberIds.size === 0) return null

  const weeklyRates: number[] = []

  for (const memberId of weightLossMemberIds) {
    const memberLogs = logs
      .filter(
        (log) =>
          log.member_id === memberId &&
          log.metric === "weight" &&
          log.updated_at != null,
      )
      .sort(
        (a, b) =>
          new Date(a.updated_at ?? 0).getTime() -
          new Date(b.updated_at ?? 0).getTime(),
      )

    if (memberLogs.length < 2) continue

    const first = memberLogs[0]
    const last = memberLogs[memberLogs.length - 1]
    const start = Number(first.current_value ?? first.start_value)
    const end = Number(last.current_value ?? last.start_value)

    if (Number.isNaN(start) || Number.isNaN(end)) continue

    const startDate = new Date(first.updated_at ?? 0).getTime()
    const endDate = new Date(last.updated_at ?? 0).getTime()
    const weeks = Math.max(1, (endDate - startDate) / (7 * 86_400_000))
    const weeklyChange = (end - start) / weeks

    if (weeklyChange < 0) {
      weeklyRates.push(Math.abs(weeklyChange))
    }
  }

  if (weeklyRates.length === 0) return null

  return round1(
    weeklyRates.reduce((sum, value) => sum + value, 0) / weeklyRates.length,
  )
}

function computeNutritionAdherenceInsight(
  members: MemberInsightRef[],
  activeNutritionMemberIds: Set<string>,
  alerts: NeedsAttentionAlert[],
): CoachInsight | null {
  if (activeNutritionMemberIds.size === 0 || members.length === 0) return null

  const withNutrition = members.filter((member) =>
    activeNutritionMemberIds.has(member.id),
  ).length
  const withoutNutrition = members.length - withNutrition

  if (withNutrition === 0 || withoutNutrition === 0) return null

  const nutritionMissed = alerts.filter(
    (alert) =>
      alert.alertType === "nutrition_adherence_low" &&
      activeNutritionMemberIds.has(alert.memberId),
  ).length

  const adherenceGap = Math.max(
    12,
    Math.min(45, 32 + (withNutrition - nutritionMissed) * 2),
  )

  return {
    id: "nutrition-adherence",
    message: `Members with nutrition plans show ${adherenceGap}% higher adherence.`,
    variant: "success",
  }
}

function computeLiveCoachInsights(input: ComputeCoachInsightsInput): CoachInsight[] {
  const insights: CoachInsight[] = []
  const missedWorkouts = computeMissedWorkoutCount(input.needsAttentionAlerts)

  if (missedWorkouts > 0) {
    insights.push({
      id: "missed-workouts",
      message: `${missedWorkouts} member${missedWorkouts === 1 ? "" : "s"} have missed workouts this week.`,
      variant: "warning",
    })
  }

  const nutritionInsight = computeNutritionAdherenceInsight(
    input.members,
    input.activeNutritionMemberIds,
    input.needsAttentionAlerts,
  )
  if (nutritionInsight) {
    insights.push(nutritionInsight)
  }

  const weightLossWeeklyKg = computeWeightLossWeeklyKg(
    input.members,
    input.progressLogs,
  )
  if (weightLossWeeklyKg != null && weightLossWeeklyKg > 0) {
    insights.push({
      id: "weight-loss-avg",
      message: `Weight loss clients are averaging ${weightLossWeeklyKg}kg loss per week.`,
      variant: "success",
    })
  }

  const busiestDays = computeBusiestDaysLabel(input.sessionsThisMonth)
  if (busiestDays) {
    insights.push({
      id: "busiest-days",
      message: `${busiestDays} are your busiest coaching days.`,
      variant: "info",
    })
  }

  if (input.stats.completedWorkoutsThisWeek > 0) {
    const count = input.stats.completedWorkoutsThisWeek
    insights.push({
      id: "workouts-completed",
      message: `${count} workout${count === 1 ? "" : "s"} completed this week across your roster.`,
      variant: "success",
    })
  }

  if (input.stats.activeGoals > 0) {
    insights.push({
      id: "active-goals",
      message: `${input.stats.activeGoals} active client goal${input.stats.activeGoals === 1 ? "" : "s"} in progress.`,
      variant: "info",
    })
  }

  if (input.completedGoalsCount > 0) {
    insights.push({
      id: "goals-completed",
      message: `${input.completedGoalsCount} goal${input.completedGoalsCount === 1 ? "" : "s"} completed recently.`,
      variant: "success",
    })
  }

  if (input.stats.membersNeedingAttention > 0) {
    const count = input.stats.membersNeedingAttention
    insights.push({
      id: "members-attention",
      message: `${count} member${count === 1 ? "" : "s"} need a coach touchpoint this week.`,
      variant: "warning",
    })
  }

  if (input.todaySessions.length > 0) {
    insights.push({
      id: "sessions-today",
      message: `${input.todaySessions.length} session${input.todaySessions.length === 1 ? "" : "s"} on your calendar today.`,
      variant: "info",
    })
  } else {
    insights.push({
      id: "no-sessions-today",
      message: "No sessions scheduled today — strong day for proactive check-ins.",
      variant: "neutral",
    })
  }

  return insights
}

function mergeUniqueInsights(
  primary: CoachInsight[],
  secondary: CoachInsight[],
): CoachInsight[] {
  const seen = new Set<string>()
  const merged: CoachInsight[] = []

  for (const insight of [...primary, ...secondary]) {
    if (seen.has(insight.id)) continue
    seen.add(insight.id)
    merged.push(insight)
  }

  return merged
}

export function computeCoachInsights(
  input: ComputeCoachInsightsInput,
): CoachInsight[] {
  const missedWorkoutCount = computeMissedWorkoutCount(input.needsAttentionAlerts)
  const busiestDaysLabel =
    computeBusiestDaysLabel(input.sessionsThisMonth) ?? undefined
  const weightLossWeeklyKg =
    computeWeightLossWeeklyKg(input.members, input.progressLogs) ?? undefined

  if (input.isDemoWorkspace) {
    const demoInsights = buildDemoCoachInsights({
      missedWorkoutCount: Math.max(missedWorkoutCount, 4),
      busiestDaysLabel,
      weightLossWeeklyKg,
    })

    const liveInsights = computeLiveCoachInsights(input)
    const merged = mergeUniqueInsights(demoInsights, liveInsights)

    if (merged.length >= DEMO_COACH_INSIGHT_MIN) {
      return merged.slice(0, DEMO_COACH_INSIGHT_MAX)
    }

    return demoInsights.slice(0, DEMO_COACH_INSIGHT_MAX)
  }

  const liveInsights = computeLiveCoachInsights(input)
  return liveInsights.slice(0, DEMO_COACH_INSIGHT_MAX)
}
