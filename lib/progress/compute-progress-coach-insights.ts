import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"
import type { MemberCoachContext } from "@/lib/progress/fetch-progress-coach-context"
import type { ClientGoalViewModel } from "@/lib/progress/client-goals"

export type ProgressCoachInsightType =
  | "plateau"
  | "fast_improvement"
  | "decline"
  | "goal_risk"
  | "completed_goal"

export type ProgressCoachInsight = {
  id: string
  memberId: string
  memberName: string
  metric: string
  insightType: ProgressCoachInsightType
  insightLabel: string
  reason: string
  recommendedAction: string
  priority: number
}

const PLATEAU_WINDOW_DAYS = 14
const PLATEAU_THRESHOLD_PERCENT = 2
const FAST_IMPROVEMENT_THRESHOLD_PERCENT = 10
const GOAL_RISK_DAYS = 7
const GOAL_RISK_PROGRESS_PERCENT = 75
const LOW_WORKOUT_COMPLETIONS = 2

const INSIGHT_LABELS: Record<ProgressCoachInsightType, string> = {
  plateau: "Plateau",
  fast_improvement: "Fast improvement",
  decline: "Decline",
  goal_risk: "Goal at risk",
  completed_goal: "Goal completed",
}

const TYPE_PRIORITY: Record<ProgressCoachInsightType, number> = {
  goal_risk: 0,
  decline: 1,
  plateau: 2,
  completed_goal: 3,
  fast_improvement: 4,
}

function daysAgo(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000
}

function memberNameFromLog(
  log: ProgressLogRow,
  members: { id: string; full_name: string | null }[],
): string {
  if (log.members?.full_name) return log.members.full_name
  const member = members.find((m) => m.id === log.member_id)
  return member?.full_name ?? "Member"
}

function metricGroupKey(memberId: string, metric: string): string {
  return `${memberId}::${(metric ?? "").toLowerCase()}`
}

function absolutePercentChange(from: number, to: number): number {
  if (from === 0) return to === 0 ? 0 : 100
  return Math.abs((to - from) / from) * 100
}

function signedPercentChange(from: number, to: number): number {
  if (from === 0) return to === 0 ? 0 : 100
  return ((to - from) / Math.abs(from)) * 100
}

function formatPercent(value: number): string {
  return `${value.toFixed(1).replace(/\.0$/, "")}%`
}

function pickLogRecommendation(
  type: "plateau" | "fast_improvement" | "decline",
  context: MemberCoachContext | undefined,
): string {
  if (type === "fast_improvement") {
    return "Celebrate milestone with member"
  }

  if (type === "plateau") {
    if (context?.hasNutritionPlan) return "Check nutrition adherence"
    if (context && context.workoutCompletions14d < LOW_WORKOUT_COMPLETIONS) {
      return "Adjust workout intensity"
    }
    return "Schedule a follow-up session"
  }

  if (context?.hasNutritionPlan) return "Check nutrition adherence"
  if (context && context.workoutCompletions14d < LOW_WORKOUT_COMPLETIONS) {
    return "Schedule a follow-up session"
  }
  return "Adjust workout intensity"
}

function pickGoalRecommendation(type: "goal_risk" | "completed_goal"): string {
  return type === "completed_goal"
    ? "Celebrate milestone with member"
    : "Schedule a follow-up session"
}

function detectLogInsights(
  logs: ProgressLogRow[],
  members: { id: string; full_name: string | null }[],
  memberContexts: Map<string, MemberCoachContext>,
  memberFilter: string,
): ProgressCoachInsight[] {
  const insights: ProgressCoachInsight[] = []
  const windowStart = daysAgo(PLATEAU_WINDOW_DAYS)
  const grouped = new Map<string, ProgressLogRow[]>()

  for (const log of logs) {
    if (!log.member_id || !log.metric) continue
    if (memberFilter !== "all" && log.member_id !== memberFilter) continue

    const key = metricGroupKey(log.member_id, log.metric)
    const bucket = grouped.get(key) ?? []
    bucket.push(log)
    grouped.set(key, bucket)
  }

  for (const [key, groupLogs] of grouped) {
    const sorted = groupLogs
      .filter((log) => log.updated_at)
      .sort(
        (a, b) =>
          new Date(a.updated_at ?? 0).getTime() - new Date(b.updated_at ?? 0).getTime(),
      )

    if (sorted.length === 0) continue

    const latest = sorted[sorted.length - 1]
    const memberId = latest.member_id ?? ""
    const memberName = memberNameFromLog(latest, members)
    const metric = latest.metric ?? "—"
    const context = memberContexts.get(memberId)

    const recentLogs = sorted.filter(
      (log) => new Date(log.updated_at ?? 0).getTime() >= windowStart,
    )

    if (recentLogs.length >= 2) {
      const earliest = recentLogs[0]
      const newest = recentLogs[recentLogs.length - 1]
      const fromValue = Number(earliest.current_value)
      const toValue = Number(newest.current_value)

      if (
        !Number.isNaN(fromValue) &&
        !Number.isNaN(toValue) &&
        absolutePercentChange(fromValue, toValue) < PLATEAU_THRESHOLD_PERCENT
      ) {
        insights.push({
          id: `coach-plateau-${key}`,
          memberId,
          memberName,
          metric,
          insightType: "plateau",
          insightLabel: INSIGHT_LABELS.plateau,
          reason: `${metric} moved only ${formatPercent(absolutePercentChange(fromValue, toValue))} over the last ${PLATEAU_WINDOW_DAYS} days.`,
          recommendedAction: pickLogRecommendation("plateau", context),
          priority: TYPE_PRIORITY.plateau,
        })
      }
    }

    const startValue = Number(latest.start_value)
    const currentValue = Number(latest.current_value)
    const changeValue = latest.change_value != null ? Number(latest.change_value) : null

    if (
      changeValue != null &&
      !Number.isNaN(changeValue) &&
      !Number.isNaN(startValue) &&
      !Number.isNaN(currentValue) &&
      changeValue > 0 &&
      signedPercentChange(startValue, currentValue) > FAST_IMPROVEMENT_THRESHOLD_PERCENT
    ) {
      insights.push({
        id: `coach-fast-${key}`,
        memberId,
        memberName,
        metric,
        insightType: "fast_improvement",
        insightLabel: INSIGHT_LABELS.fast_improvement,
        reason: `${metric} improved ${formatPercent(signedPercentChange(startValue, currentValue))} — strong momentum detected.`,
        recommendedAction: pickLogRecommendation("fast_improvement", context),
        priority: TYPE_PRIORITY.fast_improvement,
      })
    }

    if (changeValue != null && !Number.isNaN(changeValue) && changeValue < 0) {
      insights.push({
        id: `coach-decline-${key}`,
        memberId,
        memberName,
        metric,
        insightType: "decline",
        insightLabel: INSIGHT_LABELS.decline,
        reason: `${metric} declined by ${Math.abs(changeValue).toFixed(1).replace(/\.0$/, "")} since baseline.`,
        recommendedAction: pickLogRecommendation("decline", context),
        priority: TYPE_PRIORITY.decline,
      })
    }
  }

  return insights
}

function daysUntilTargetDate(targetDate: string): number {
  const target = new Date(`${targetDate}T23:59:59`).getTime()
  return Math.ceil((target - Date.now()) / (24 * 60 * 60 * 1000))
}

function detectGoalInsights(
  goals: ClientGoalViewModel[],
  memberContexts: Map<string, MemberCoachContext>,
  memberFilter: string,
): ProgressCoachInsight[] {
  const insights: ProgressCoachInsight[] = []

  for (const goal of goals) {
    if (memberFilter !== "all" && goal.memberId !== memberFilter) continue

    const context = memberContexts.get(goal.memberId)

    if (goal.status === "completed") {
      insights.push({
        id: `coach-goal-completed-${goal.id}`,
        memberId: goal.memberId,
        memberName: goal.memberName,
        metric: goal.goalTypeLabel,
        insightType: "completed_goal",
        insightLabel: INSIGHT_LABELS.completed_goal,
        reason: `${goal.title} target reached at ${goal.currentValue}.`,
        recommendedAction: pickGoalRecommendation("completed_goal"),
        priority: TYPE_PRIORITY.completed_goal,
      })
      continue
    }

    const daysRemaining = daysUntilTargetDate(goal.targetDate)

    if (
      goal.status === "behind_schedule" ||
      (daysRemaining >= 0 &&
        daysRemaining <= GOAL_RISK_DAYS &&
        goal.progressPercent < GOAL_RISK_PROGRESS_PERCENT)
    ) {
      const nutritionHint = context?.hasNutritionPlan
        ? ` Nutrition plan${context.nutritionPlanTitle ? ` (${context.nutritionPlanTitle})` : ""} is assigned.`
        : ""

      insights.push({
        id: `coach-goal-risk-${goal.id}`,
        memberId: goal.memberId,
        memberName: goal.memberName,
        metric: goal.goalTypeLabel,
        insightType: "goal_risk",
        insightLabel: INSIGHT_LABELS.goal_risk,
        reason: `${goal.title} is ${goal.progressPercent}% complete with ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left.${nutritionHint}`,
        recommendedAction: pickGoalRecommendation("goal_risk"),
        priority: TYPE_PRIORITY.goal_risk,
      })
    }
  }

  return insights
}

export function computeProgressCoachInsights(
  logs: ProgressLogRow[],
  goals: ClientGoalViewModel[],
  members: { id: string; full_name: string | null }[],
  memberContexts: Map<string, MemberCoachContext>,
  memberFilter: string,
): ProgressCoachInsight[] {
  const logInsights = detectLogInsights(logs, members, memberContexts, memberFilter)
  const goalInsights = detectGoalInsights(goals, memberContexts, memberFilter)

  const deduped = new Map<string, ProgressCoachInsight>()

  for (const insight of [...logInsights, ...goalInsights]) {
    deduped.set(insight.id, insight)
  }

  return [...deduped.values()].sort((a, b) => {
    const priorityDiff = a.priority - b.priority
    if (priorityDiff !== 0) return priorityDiff
    return a.memberName.localeCompare(b.memberName)
  })
}

export function summarizeCoachContext(
  memberContexts: Map<string, MemberCoachContext>,
  memberId: string,
): string | null {
  const context = memberContexts.get(memberId)
  if (!context) return null

  const parts: string[] = []
  if (context.hasNutritionPlan) {
    parts.push(
      context.nutritionPlanTitle
        ? `Nutrition: ${context.nutritionPlanTitle}`
        : "Nutrition plan assigned",
    )
  }
  parts.push(`${context.workoutCompletions14d} workouts completed (14d)`)
  return parts.join(" · ")
}
