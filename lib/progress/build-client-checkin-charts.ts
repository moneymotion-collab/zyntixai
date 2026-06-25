import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import { buildWeightCheckInChart } from "@/lib/progress/build-weight-progress-chart"
import {
  formatProgressChartDate,
  resolveProgressDateKeyFromRecord,
  sortByProgressDateAsc,
} from "@/lib/progress/progress-date"

export type CheckInMetricKey = "weight" | "energy" | "sleep" | "motivation"

export type CheckInChartPoint = {
  checkin_date: string
  label: string
  value: number
}

export type CheckInMetricChart = {
  metric: CheckInMetricKey
  data: CheckInChartPoint[]
  hasEnoughData: boolean
}

export type ClientCheckInChartData = Record<CheckInMetricKey, CheckInMetricChart>

const METRIC_KEYS: CheckInMetricKey[] = [
  "weight",
  "energy",
  "sleep",
  "motivation",
]

function readMetricValue(
  row: ClientCheckInRow,
  metric: CheckInMetricKey,
): number | null {
  const value = row[metric]
  if (value == null || Number.isNaN(Number(value))) return null
  return Number(value)
}

export function buildMetricTrend(
  checkIns: ClientCheckInRow[],
  metric: CheckInMetricKey,
): CheckInMetricChart {
  if (metric === "weight") {
    const weightChart = buildWeightCheckInChart(checkIns)
    return {
      metric,
      data: weightChart.data.map((point) => ({
        checkin_date: point.checkin_date,
        label: point.label,
        value: point.value,
      })),
      hasEnoughData: weightChart.hasEnoughData,
    }
  }

  const byDate = new Map<string, number[]>()

  for (const row of checkIns) {
    const value = readMetricValue(row, metric)
    if (value == null) continue

    const dateKey = resolveProgressDateKeyFromRecord(
      row as unknown as Record<string, unknown>,
    )
    if (!dateKey) continue

    const values = byDate.get(dateKey) ?? []
    values.push(value)
    byDate.set(dateKey, values)
  }

  const data = sortByProgressDateAsc(
    Array.from(byDate.entries()).map(([checkin_date, values]) => ({
      checkin_date,
      label: formatProgressChartDate(checkin_date),
      value: values.reduce((sum, current) => sum + current, 0) / values.length,
    })),
    "checkin_date",
  )

  return {
    metric,
    data,
    hasEnoughData: data.length >= 2,
  }
}

export function buildClientCheckInCharts(
  checkIns: ClientCheckInRow[],
): ClientCheckInChartData {
  return METRIC_KEYS.reduce((charts, metric) => {
    charts[metric] = buildMetricTrend(checkIns, metric)
    return charts
  }, {} as ClientCheckInChartData)
}

export function formatChartMetricValue(
  metric: CheckInMetricKey,
  value: number,
): string {
  if (metric === "weight") {
    return Number.isInteger(value) ? `${value} kg` : `${value.toFixed(1)} kg`
  }
  return `${value.toFixed(1)}/10`
}
