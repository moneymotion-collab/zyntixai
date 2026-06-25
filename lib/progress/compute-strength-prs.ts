import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"
import { matchesMetricFilter } from "@/lib/progress/metrics"

export type StrengthPrEntry = {
  memberId: string
  memberName: string
  metric: string
  startValue: number | null
  currentPr: number
  improvement: number | null
  lastUpdated: string | null
  isNewPr: boolean
}

function memberNameFromLog(
  log: ProgressLogRow,
  members: { id: string; full_name: string | null }[],
): string {
  if (log.members?.full_name) return log.members.full_name
  const member = members.find((m) => m.id === log.member_id)
  return member?.full_name ?? "Member"
}

function pickPrLog(logs: ProgressLogRow[]): ProgressLogRow | null {
  let best: ProgressLogRow | null = null

  for (const log of logs) {
    if (log.current_value == null || Number.isNaN(Number(log.current_value))) continue

    if (!best) {
      best = log
      continue
    }

    const current = Number(log.current_value)
    const bestValue = Number(best.current_value)

    if (current > bestValue) {
      best = log
      continue
    }

    if (current === bestValue) {
      const logTime = new Date(log.updated_at ?? 0).getTime()
      const bestTime = new Date(best.updated_at ?? 0).getTime()
      if (logTime > bestTime) best = log
    }
  }

  return best
}

function latestStrengthLog(logs: ProgressLogRow[]): ProgressLogRow | null {
  return (
    logs
      .slice()
      .sort(
        (a, b) =>
          new Date(b.updated_at ?? 0).getTime() -
          new Date(a.updated_at ?? 0).getTime(),
      )[0] ?? null
  )
}

export function filterStrengthLogs(
  logs: ProgressLogRow[],
  memberFilter: string,
): ProgressLogRow[] {
  return logs.filter((log) => {
    if (!matchesMetricFilter(log.metric, "strength")) return false
    if (memberFilter !== "all" && log.member_id !== memberFilter) return false
    return true
  })
}

export function computeStrengthPrs(
  logs: ProgressLogRow[],
  members: { id: string; full_name: string | null }[],
  memberFilter: string,
): StrengthPrEntry[] {
  const strengthLogs = filterStrengthLogs(logs, memberFilter)
  const logsByMember = new Map<string, ProgressLogRow[]>()

  for (const log of strengthLogs) {
    if (!log.member_id) continue
    const existing = logsByMember.get(log.member_id) ?? []
    existing.push(log)
    logsByMember.set(log.member_id, existing)
  }

  const entries: StrengthPrEntry[] = []

  for (const [memberId, memberLogs] of logsByMember) {
    const prLog = pickPrLog(memberLogs)
    if (!prLog || prLog.current_value == null) continue

    const maxCurrent = Math.max(
      ...memberLogs
        .map((log) => log.current_value)
        .filter((value): value is number => value != null && !Number.isNaN(Number(value)))
        .map(Number),
    )

    const latestLog = latestStrengthLog(memberLogs)
    const isNewPr =
      latestLog?.current_value != null &&
      Number(latestLog.current_value) === maxCurrent

    entries.push({
      memberId,
      memberName: memberNameFromLog(prLog, members),
      metric: prLog.metric ?? "Strength",
      startValue: prLog.start_value,
      currentPr: Number(prLog.current_value),
      improvement: prLog.change_value,
      lastUpdated: prLog.updated_at,
      isNewPr,
    })
  }

  return entries.sort((a, b) => b.currentPr - a.currentPr)
}
