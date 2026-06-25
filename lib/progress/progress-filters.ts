import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"
import { type MetricFilter, matchesMetricFilter } from "@/lib/progress/metrics"
import { parseProgressDate } from "@/lib/progress/progress-date"

export type DateRangeFilter = "7d" | "30d" | "90d" | "all"

export const DATE_RANGE_OPTIONS: { value: DateRangeFilter; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
]

const RANGE_DAYS: Record<Exclude<DateRangeFilter, "all">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
}

export function matchesDateRange(
  updatedAt: string | null | undefined,
  range: DateRangeFilter,
): boolean {
  if (range === "all") return true
  if (!updatedAt) return false

  const parsed = parseProgressDate(updatedAt)
  if (!parsed) return false

  const cutoff = Date.now() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000
  return parsed.getTime() >= cutoff
}

export function filterProgressLogs(
  logs: ProgressLogRow[],
  memberId: string,
  metricFilter: MetricFilter,
  dateRange: DateRangeFilter = "all",
): ProgressLogRow[] {
  return logs.filter((log) => {
    if (memberId !== "all" && log.member_id !== memberId) return false
    if (!matchesMetricFilter(log.metric, metricFilter)) return false
    if (!matchesDateRange(log.updated_at, dateRange)) return false
    return true
  })
}

export function dateRangeLabel(range: DateRangeFilter): string {
  return DATE_RANGE_OPTIONS.find((option) => option.value === range)?.label ?? "All time"
}
