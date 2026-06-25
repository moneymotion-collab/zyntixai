import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"
import {
  classifyMetric,
  formatMetricLabel,
  improvementScore,
  type MetricCategory,
} from "@/lib/progress/metrics"
import type { ClientGoalViewModel } from "@/lib/progress/client-goals"

export type MemberProgressSummary = {
  totalLogs: number
  bestMetricImprovement: {
    metric: string
    category: MetricCategory
    score: number
    changeValue: number
  } | null
  activeGoals: number
  completedGoals: number
  latestUpdateDate: string | null
}

export type MemberOverviewRow = {
  memberId: string
  memberName: string
  email: string | null
  totalLogs: number
  activeGoals: number
  latestUpdateDate: string | null
  bestMetricLabel: string | null
}

export function computeMemberProgressSummary(
  logs: ProgressLogRow[],
  goals: ClientGoalViewModel[],
): MemberProgressSummary {
  const totalLogs = logs.length

  let bestMetricImprovement: MemberProgressSummary["bestMetricImprovement"] = null
  let bestScore = Number.NEGATIVE_INFINITY

  const latestByMetric = new Map<string, ProgressLogRow>()
  for (const log of logs) {
    if (!log.metric) continue
    const key = log.metric.toLowerCase()
    const existing = latestByMetric.get(key)
    if (
      !existing ||
      new Date(log.updated_at ?? 0).getTime() >
        new Date(existing.updated_at ?? 0).getTime()
    ) {
      latestByMetric.set(key, log)
    }
  }

  for (const log of latestByMetric.values()) {
    const score = improvementScore(log.metric, log.change_value)
    if (score == null || score <= bestScore) continue

    bestScore = score
    bestMetricImprovement = {
      metric: log.metric ?? "—",
      category: classifyMetric(log.metric),
      score,
      changeValue: Number(log.change_value),
    }
  }

  const activeGoals = goals.filter((goal) => goal.status !== "completed").length
  const completedGoals = goals.filter((goal) => goal.status === "completed").length

  const latestUpdateDate =
    logs.length > 0
      ? logs.reduce((latest, log) => {
          if (!log.updated_at) return latest
          if (!latest) return log.updated_at
          return new Date(log.updated_at).getTime() > new Date(latest).getTime()
            ? log.updated_at
            : latest
        }, null as string | null)
      : null

  return {
    totalLogs,
    bestMetricImprovement,
    activeGoals,
    completedGoals,
    latestUpdateDate,
  }
}


export function computeMemberOverviewRows(
  members: { id: string; full_name: string | null; email?: string | null }[],
  logs: ProgressLogRow[],
  goals: ClientGoalViewModel[],
): MemberOverviewRow[] {
  return members.map((member) => {
    const memberLogs = logs.filter((log) => log.member_id === member.id)
    const memberGoals = goals.filter((goal) => goal.memberId === member.id)
    const summary = computeMemberProgressSummary(memberLogs, memberGoals)

    return {
      memberId: member.id,
      memberName: member.full_name ?? "Member",
      email: member.email ?? null,
      totalLogs: summary.totalLogs,
      activeGoals: summary.activeGoals,
      latestUpdateDate: summary.latestUpdateDate,
      bestMetricLabel: summary.bestMetricImprovement
        ? `${summary.bestMetricImprovement.metric} (${formatMetricLabel(summary.bestMetricImprovement.category)})`
        : null,
    }
  })
}
