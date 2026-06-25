import type { ClientCheckInRow } from "@/lib/progress/client-checkins"

export type ClientCheckInInsights = {
  averageWeightChange: number | null
  averageEnergy: number | null
  averageSleep: number | null
  averageMotivation: number | null
  membersNeedingAttention: number
}

function memberKey(row: ClientCheckInRow): string {
  return row.member_id ?? row.member_name
}

function compareCheckIns(a: ClientCheckInRow, b: ClientCheckInRow): number {
  const dateCompare = b.checkin_date.localeCompare(a.checkin_date)
  if (dateCompare !== 0) return dateCompare
  return b.created_at.localeCompare(a.created_at)
}

function average(values: (number | null | undefined)[]): number | null {
  const valid = values.filter(
    (value): value is number =>
      value != null && !Number.isNaN(Number(value)),
  )
  if (valid.length === 0) return null
  return valid.reduce((sum, value) => sum + value, 0) / valid.length
}

function latestCheckInByMember(
  checkIns: ClientCheckInRow[],
): Map<string, ClientCheckInRow> {
  const sorted = [...checkIns].sort(compareCheckIns)
  const latest = new Map<string, ClientCheckInRow>()

  for (const row of sorted) {
    const key = memberKey(row)
    if (!latest.has(key)) {
      latest.set(key, row)
    }
  }

  return latest
}

function needsAttention(checkIn: ClientCheckInRow): boolean {
  const isLow = (value: number | null) => value != null && value < 5
  return (
    isLow(checkIn.energy) || isLow(checkIn.sleep) || isLow(checkIn.motivation)
  )
}

export function computeClientCheckInInsights(
  checkIns: ClientCheckInRow[],
): ClientCheckInInsights {
  const latestByMember = latestCheckInByMember(checkIns)
  const latestRows = Array.from(latestByMember.values())

  const weightChanges: number[] = []
  const byMember = new Map<string, ClientCheckInRow[]>()

  for (const row of checkIns) {
    const key = memberKey(row)
    const rows = byMember.get(key) ?? []
    rows.push(row)
    byMember.set(key, rows)
  }

  for (const rows of byMember.values()) {
    const withWeight = rows
      .filter((row) => row.weight != null && !Number.isNaN(Number(row.weight)))
      .sort(compareCheckIns)

    if (withWeight.length >= 2) {
      const latestWeight = Number(withWeight[0].weight)
      const previousWeight = Number(withWeight[1].weight)
      weightChanges.push(latestWeight - previousWeight)
    }
  }

  return {
    averageWeightChange: average(weightChanges),
    averageEnergy: average(latestRows.map((row) => row.energy)),
    averageSleep: average(latestRows.map((row) => row.sleep)),
    averageMotivation: average(latestRows.map((row) => row.motivation)),
    membersNeedingAttention: latestRows.filter(needsAttention).length,
  }
}

export function formatAverageWeightChange(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—"
  const rounded = Math.abs(value) >= 10 ? value.toFixed(0) : value.toFixed(1)
  const prefix = value > 0 ? "+" : value < 0 ? "" : ""
  return `${prefix}${rounded} kg`
}

export function formatAverageScore(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—"
  return `${value.toFixed(1)}/10`
}
