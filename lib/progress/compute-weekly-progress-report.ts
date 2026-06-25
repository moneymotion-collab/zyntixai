import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import { formatCheckInDate } from "@/lib/progress/client-checkins"
import { filterCheckInsByMember } from "@/lib/progress/client-checkin-member-view"

export type WellnessMetricKey = "energy" | "sleep" | "motivation"

export type WeeklyProgressReport = {
  memberName: string
  periodLabel: string
  periodStart: string
  periodEnd: string
  checkInCount: number
  weightChange: number | null
  averageEnergy: number | null
  averageSleep: number | null
  averageMotivation: number | null
  biggestConcern: string | null
  suggestedCoachFocus: string
  hasData: boolean
}

type MetricAverage = {
  key: WellnessMetricKey
  label: string
  value: number
}

function isoDateFromDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function getWeeklyReportPeriod(referenceDate = new Date()): {
  start: string
  end: string
  label: string
} {
  const end = new Date(referenceDate)
  const start = new Date(referenceDate)
  start.setDate(end.getDate() - 6)

  const startIso = isoDateFromDate(start)
  const endIso = isoDateFromDate(end)

  return {
    start: startIso,
    end: endIso,
    label: `${formatCheckInDate(startIso)} – ${formatCheckInDate(endIso)}`,
  }
}

function average(values: (number | null | undefined)[]): number | null {
  const valid = values.filter(
    (value): value is number =>
      value != null && !Number.isNaN(Number(value)),
  )
  if (valid.length === 0) return null
  return valid.reduce((sum, value) => sum + value, 0) / valid.length
}

function compareByDateAsc(a: ClientCheckInRow, b: ClientCheckInRow): number {
  const dateCompare = a.checkin_date.localeCompare(b.checkin_date)
  if (dateCompare !== 0) return dateCompare
  return a.created_at.localeCompare(b.created_at)
}

function computeWeightChangeThisWeek(
  weekCheckIns: ClientCheckInRow[],
): number | null {
  const withWeight = weekCheckIns
    .filter((row) => row.weight != null && !Number.isNaN(Number(row.weight)))
    .sort(compareByDateAsc)

  if (withWeight.length < 2) return null

  const earliest = Number(withWeight[0].weight)
  const latest = Number(withWeight[withWeight.length - 1].weight)
  return latest - earliest
}

function getMetricAverages(weekCheckIns: ClientCheckInRow[]): {
  energy: number | null
  sleep: number | null
  motivation: number | null
} {
  return {
    energy: average(weekCheckIns.map((row) => row.energy)),
    sleep: average(weekCheckIns.map((row) => row.sleep)),
    motivation: average(weekCheckIns.map((row) => row.motivation)),
  }
}

function pickLowestMetric(averages: {
  energy: number | null
  sleep: number | null
  motivation: number | null
}): MetricAverage | null {
  const metrics: MetricAverage[] = []

  if (averages.energy != null && !Number.isNaN(averages.energy)) {
    metrics.push({ key: "energy", label: "Energy", value: averages.energy })
  }
  if (averages.sleep != null && !Number.isNaN(averages.sleep)) {
    metrics.push({ key: "sleep", label: "Sleep", value: averages.sleep })
  }
  if (averages.motivation != null && !Number.isNaN(averages.motivation)) {
    metrics.push({
      key: "motivation",
      label: "Motivation",
      value: averages.motivation,
    })
  }

  if (metrics.length === 0) return null

  return metrics.reduce((lowest, metric) =>
    metric.value < lowest.value ? metric : lowest,
  )
}

function buildSuggestedCoachFocus(averages: {
  energy: number | null
  sleep: number | null
  motivation: number | null
}): string {
  const { energy, sleep, motivation } = averages

  if (
    energy != null &&
    sleep != null &&
    motivation != null &&
    energy >= 7 &&
    sleep >= 7 &&
    motivation >= 7
  ) {
    return "Member is progressing well"
  }

  const lowest = pickLowestMetric(averages)
  if (!lowest) return "Collect more wellness scores to guide coaching focus"

  switch (lowest.key) {
    case "energy":
      return "Review training load and nutrition"
    case "sleep":
      return "Improve recovery and sleep routine"
    case "motivation":
      return "Adjust goals and accountability"
    default:
      return "Review recent check-in trends with the member"
  }
}

function buildBiggestConcern(lowest: MetricAverage | null): string | null {
  if (!lowest) return null
  return `${lowest.label} (${lowest.value.toFixed(1)}/10)`
}

export function computeWeeklyProgressReport(
  checkIns: ClientCheckInRow[],
  memberFilter: string,
  memberName: string,
  referenceDate = new Date(),
): WeeklyProgressReport | null {
  if (memberFilter === "all") return null

  const period = getWeeklyReportPeriod(referenceDate)
  const memberCheckIns = filterCheckInsByMember(checkIns, memberFilter, memberName)
  const weekCheckIns = memberCheckIns.filter(
    (row) =>
      row.checkin_date >= period.start && row.checkin_date <= period.end,
  )

  const averages = getMetricAverages(weekCheckIns)
  const lowestMetric = pickLowestMetric(averages)

  return {
    memberName,
    periodLabel: period.label,
    periodStart: period.start,
    periodEnd: period.end,
    checkInCount: weekCheckIns.length,
    weightChange: computeWeightChangeThisWeek(weekCheckIns),
    averageEnergy: averages.energy,
    averageSleep: averages.sleep,
    averageMotivation: averages.motivation,
    biggestConcern: buildBiggestConcern(lowestMetric),
    suggestedCoachFocus: buildSuggestedCoachFocus(averages),
    hasData: weekCheckIns.length > 0,
  }
}

export function formatWeeklyWeightChange(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—"
  const rounded = Math.abs(value) >= 10 ? value.toFixed(0) : value.toFixed(1)
  const prefix = value > 0 ? "+" : value < 0 ? "" : ""
  return `${prefix}${rounded} kg`
}

export function formatWeeklyAverageScore(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—"
  return `${value.toFixed(1)}/10`
}
