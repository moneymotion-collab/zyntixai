import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"

export type ProgressInsightType =
  | "best_progress"
  | "needs_attention"
  | "consistency"

export type ProgressInsight = {
  id: string
  memberId: string
  memberName: string
  metric: string
  insightType: ProgressInsightType
  insightLabel: string
  recommendation: string
  changeValue?: number | null
}

const STALE_DAYS = 14

const INSIGHT_LABELS: Record<ProgressInsightType, string> = {
  best_progress: "Best progress",
  needs_attention: "Needs attention",
  consistency: "Consistency",
}

function daysSince(value: string): number {
  return (Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24)
}

function memberNameFromLog(
  log: ProgressLogRow,
  members: { id: string; full_name: string | null }[],
): string {
  if (log.members?.full_name) return log.members.full_name
  const member = members.find((m) => m.id === log.member_id)
  return member?.full_name ?? "Member"
}

export function computeProgressInsights(
  logs: ProgressLogRow[],
  members: { id: string; full_name: string | null }[],
  memberFilter: string,
): ProgressInsight[] {
  const insights: ProgressInsight[] = []

  const positiveLogs = logs.filter(
    (log) => log.change_value != null && Number(log.change_value) > 0,
  )

  if (positiveLogs.length > 0) {
    const best = positiveLogs.reduce((currentBest, log) =>
      Number(log.change_value) > Number(currentBest.change_value) ? log : currentBest,
    )

    insights.push({
      id: `best-${best.id}`,
      memberId: best.member_id ?? "",
      memberName: memberNameFromLog(best, members),
      metric: best.metric ?? "—",
      insightType: "best_progress",
      insightLabel: INSIGHT_LABELS.best_progress,
      recommendation: "Member is improving well",
      changeValue: best.change_value,
    })
  }

  const latestByMember = new Map<string, ProgressLogRow>()
  for (const log of logs) {
    if (!log.member_id || latestByMember.has(log.member_id)) continue
    latestByMember.set(log.member_id, log)
  }

  for (const [memberId, log] of latestByMember) {
    if (log.change_value != null && Number(log.change_value) < 0) {
      insights.push({
        id: `declining-${memberId}-${log.id}`,
        memberId,
        memberName: memberNameFromLog(log, members),
        metric: log.metric ?? "—",
        insightType: "needs_attention",
        insightLabel: INSIGHT_LABELS.needs_attention,
        recommendation: "Progress is declining, check workout/nutrition plan",
        changeValue: log.change_value,
      })
    }
  }

  const scopedMembers =
    memberFilter === "all"
      ? members
      : members.filter((member) => member.id === memberFilter)

  for (const member of scopedMembers) {
    const latest = latestByMember.get(member.id)
    const isStale =
      !latest?.updated_at || daysSince(latest.updated_at) > STALE_DAYS

    if (isStale) {
      insights.push({
        id: `stale-${member.id}`,
        memberId: member.id,
        memberName: member.full_name ?? "Member",
        metric: latest?.metric ?? "No recent entries",
        insightType: "needs_attention",
        insightLabel: INSIGHT_LABELS.needs_attention,
        recommendation: "No recent progress update, follow up with member",
        changeValue: latest?.change_value ?? null,
      })
    }
  }

  const logCountByMember = new Map<string, number>()
  for (const log of logs) {
    if (!log.member_id) continue
    logCountByMember.set(
      log.member_id,
      (logCountByMember.get(log.member_id) ?? 0) + 1,
    )
  }

  for (const [memberId, count] of logCountByMember) {
    if (count < 3) continue

    const latest = latestByMember.get(memberId)
    const member =
      members.find((m) => m.id === memberId) ??
      (latest ? { id: memberId, full_name: latest.members?.full_name ?? null } : null)

    if (!member) continue

    insights.push({
      id: `consistency-${memberId}`,
      memberId,
      memberName: member.full_name ?? "Member",
      metric: latest?.metric ?? "Multiple metrics",
      insightType: "consistency",
      insightLabel: INSIGHT_LABELS.consistency,
      recommendation: "Member is improving well",
      changeValue: latest?.change_value ?? null,
    })
  }

  const typeOrder: Record<ProgressInsightType, number> = {
    best_progress: 0,
    needs_attention: 1,
    consistency: 2,
  }

  return insights.sort((a, b) => {
    const typeDiff = typeOrder[a.insightType] - typeOrder[b.insightType]
    if (typeDiff !== 0) return typeDiff
    return a.memberName.localeCompare(b.memberName)
  })
}
