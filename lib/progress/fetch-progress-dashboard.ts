import type { SupabaseClient } from "@supabase/supabase-js"
import { getCoachMemberIds, getCoachScope } from "@/lib/auth/coach-scope"
import type { Database } from "@/lib/database.types"
import { resolveLinkedMemberId } from "@/lib/member-link"
import {
  improvementScore,
  matchesMetricFilter,
  type MetricFilter,
} from "@/lib/progress/metrics"
import {
  formatProgressChartDate,
  parseProgressDate,
  sortByProgressDateAsc,
} from "@/lib/progress/progress-date"

type Member = Database["public"]["Tables"]["members"]["Row"]

export type ProgressLogRow = Database["public"]["Tables"]["progress_logs"]["Row"] & {
  members: Pick<Member, "full_name"> | null
}

export type ProgressOverview = {
  totalLogs: number
  averageChange: number | null
  bestImprovingMember: string | null
  needsAttentionCount: number
}

export type ProgressChartPoint = {
  updatedAt: string
  label: string
  currentValue: number
}

export type ProgressDashboardData = {
  logs: ProgressLogRow[]
  members: Member[]
}

export async function fetchProgressDashboard(
  supabase: SupabaseClient<Database>,
): Promise<{ data: ProgressDashboardData | null; error: string | null }> {
  try {
    const scope = await getCoachScope(supabase)
    let memberIds: string[] | null = null

    if (scope.isMember) {
      const memberId = await resolveLinkedMemberId(supabase)
      memberIds = memberId ? [memberId] : []
    } else if (scope.isCoach && scope.userId) {
      memberIds = await getCoachMemberIds(supabase, scope.userId)
    }

    let membersQuery = supabase
      .from("members")
      .select("*")
      .order("full_name", { ascending: true })

    if (scope.isMember && memberIds) {
      if (memberIds.length === 0) {
        return { data: { logs: [], members: [] }, error: null }
      }
      membersQuery = membersQuery.in("id", memberIds)
    } else if (scope.isCoach && scope.userId) {
      membersQuery = membersQuery.eq("coach_id", scope.userId)
    }

    let logsQuery = supabase
      .from("progress_logs")
      .select(
        `
        *,
        members (
          full_name
        )
      `,
      )
      .order("updated_at", { ascending: false })

    if (memberIds) {
      if (memberIds.length === 0) {
        const { data: members, error: membersError } = await membersQuery
        if (membersError) return { data: null, error: membersError.message }
        return { data: { logs: [], members: members ?? [] }, error: null }
      }
      logsQuery = logsQuery.in("member_id", memberIds)
    }

    const [{ data: logs, error: logsError }, { data: members, error: membersError }] =
      await Promise.all([logsQuery, membersQuery])

    if (logsError) return { data: null, error: logsError.message }
    if (membersError) return { data: null, error: membersError.message }

    return {
      data: {
        logs: (logs as ProgressLogRow[]) ?? [],
        members: members ?? [],
      },
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load progress data"
    return { data: null, error: message }
  }
}

export { filterProgressLogs } from "@/lib/progress/progress-filters"

export function computeProgressOverview(logs: ProgressLogRow[]): ProgressOverview {
  const totalLogs = logs.length

  const changes = logs
    .map((log) => log.change_value)
    .filter((v): v is number => v != null && !Number.isNaN(Number(v)))

  const averageChange =
    changes.length > 0
      ? changes.reduce((sum, value) => sum + Number(value), 0) / changes.length
      : null

  const latestByMember = new Map<string, ProgressLogRow>()
  for (const log of logs) {
    if (!log.member_id) continue
    if (!latestByMember.has(log.member_id)) {
      latestByMember.set(log.member_id, log)
    }
  }

  let bestImprovingMember: string | null = null
  let bestScore = Number.NEGATIVE_INFINITY

  for (const log of latestByMember.values()) {
    const score = improvementScore(log.metric, log.change_value)
    if (score == null) continue
    if (score > bestScore) {
      bestScore = score
      bestImprovingMember = log.members?.full_name ?? "Member"
    }
  }

  let needsAttentionCount = 0
  for (const log of latestByMember.values()) {
    const score = improvementScore(log.metric, log.change_value)
    if (score != null && score < 0) {
      needsAttentionCount += 1
    }
  }

  return {
    totalLogs,
    averageChange,
    bestImprovingMember,
    needsAttentionCount,
  }
}

export function buildChartData(logs: ProgressLogRow[]): ProgressChartPoint[] {
  const points = logs
    .filter(
      (log) =>
        log.current_value != null &&
        !Number.isNaN(Number(log.current_value)) &&
        parseProgressDate(log.updated_at) != null,
    )
    .map((log) => ({
      updatedAt: log.updated_at ?? "",
      label: formatProgressChartDate(log.updated_at),
      currentValue: Number(log.current_value),
    }))

  return sortByProgressDateAsc(points, "updatedAt")
}

export type ProgressChartDebug = {
  selected_member_id: string | null
  progress_records_found: number
  metric_names_found: string[]
  chart_data_length: number
}

export function buildProgressChartDebug(
  logs: ProgressLogRow[],
  memberId: string | null,
  metricFilter: MetricFilter = "weight",
): ProgressChartDebug {
  const scopedLogs =
    memberId == null
      ? logs
      : logs.filter((log) => log.member_id === memberId)

  const weightLogs = scopedLogs.filter(
    (log) =>
      matchesMetricFilter(log.metric, metricFilter) &&
      log.current_value != null &&
      parseProgressDate(log.updated_at) != null,
  )

  return {
    selected_member_id: memberId,
    progress_records_found: weightLogs.length,
    metric_names_found: [
      ...new Set(
        scopedLogs
          .map((log) => log.metric?.trim())
          .filter((metric): metric is string => Boolean(metric)),
      ),
    ],
    chart_data_length: buildChartData(weightLogs).length,
  }
}

export type MultiMemberChartSeries = {
  memberId: string
  memberName: string
  dataKey: string
  color: string
}

const CHART_LINE_COLORS = [
  "#22d3ee",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
  "#f472b6",
  "#60a5fa",
]

export function buildMultiMemberChart(
  logs: ProgressLogRow[],
  members: { id: string; full_name: string | null }[],
): {
  data: Record<string, string | number>[]
  series: MultiMemberChartSeries[]
} {
  const memberIds = [
    ...new Set(logs.map((log) => log.member_id).filter(Boolean)),
  ] as string[]

  const series = memberIds.map((memberId, index) => ({
    memberId,
    memberName:
      members.find((m) => m.id === memberId)?.full_name ??
      logs.find((l) => l.member_id === memberId)?.members?.full_name ??
      "Member",
    dataKey: `member_${memberId.replace(/-/g, "")}`,
    color: CHART_LINE_COLORS[index % CHART_LINE_COLORS.length],
  }))

  const rows = new Map<string, Record<string, string | number>>()

  for (const log of logs) {
    if (!log.member_id || log.current_value == null || !log.updated_at) continue
    if (parseProgressDate(log.updated_at) == null) continue

    const seriesEntry = series.find((s) => s.memberId === log.member_id)
    if (!seriesEntry) continue

    const rowKey = log.updated_at
    const row = rows.get(rowKey) ?? {
      updatedAt: log.updated_at,
      label: formatProgressChartDate(log.updated_at),
    }
    row[seriesEntry.dataKey] = Number(log.current_value)
    rows.set(rowKey, row)
  }

  const data = sortByProgressDateAsc([...rows.values()], "updatedAt")

  return { data, series }
}

export function formatValue(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "—"
  const n = Number(value)
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

export function formatChange(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "—"
  const n = Number(value)
  const text = Number.isInteger(n) ? String(n) : n.toFixed(1)
  return `${n > 0 ? "+" : ""}${text}`
}

export function formatDateTime(value: string | null | undefined) {
  const parsed = parseProgressDate(value)
  if (!parsed) return "—"

  const formatted = parsed.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  if (formatted.toLowerCase().includes("invalid")) return "—"
  return formatted
}
