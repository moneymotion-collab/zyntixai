import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import {
  formatProgressChartDate,
  resolveProgressDateKeyFromRecord,
  sortByProgressDateAsc,
} from "@/lib/progress/progress-date"

export type WeightProgressChartPoint = {
  date: string
  value: number
  metric: string | null
  checkin_date: string
  label: string
}

export type WeightProgressChart = {
  metric: "weight"
  data: WeightProgressChartPoint[]
  hasEnoughData: boolean
}

export function buildWeightCheckInChart(
  checkIns: ClientCheckInRow[],
  memberId: string = "all",
): WeightProgressChart {
  const scoped =
    memberId === "all"
      ? checkIns
      : checkIns.filter((row) => row.member_id === memberId)

  const byDate = new Map<string, number[]>()

  for (const row of scoped) {
    if (row.weight == null || Number.isNaN(Number(row.weight))) continue

    const dateKey = resolveProgressDateKeyFromRecord(
      row as unknown as Record<string, unknown>,
    )
    if (!dateKey) continue

    const values = byDate.get(dateKey) ?? []
    values.push(Number(row.weight))
    byDate.set(dateKey, values)
  }

  const chartData = sortByProgressDateAsc(
    Array.from(byDate.entries()).map(([checkin_date, values]) => ({
      date: checkin_date,
      value: values.reduce((sum, current) => sum + current, 0) / values.length,
      metric: "weight",
      checkin_date,
      label: formatProgressChartDate(checkin_date),
    })),
    "checkin_date",
  )

  return {
    metric: "weight",
    data: chartData,
    hasEnoughData: chartData.length >= 2,
  }
}
