import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import {
  formatCheckInDate,
  formatCheckInScore,
  formatCheckInWeight,
} from "@/lib/progress/client-checkins"

export type ClientProgressStatus = "on_track" | "needs_attention" | "monitoring"

export type ClientProgressSummary = {
  memberId: string
  memberName: string
  latestWeight: number | null
  latestEnergy: number | null
  latestSleep: number | null
  latestMotivation: number | null
  lastCheckInDate: string | null
  status: ClientProgressStatus | null
}

function compareCheckIns(a: ClientCheckInRow, b: ClientCheckInRow): number {
  const dateCompare = b.checkin_date.localeCompare(a.checkin_date)
  if (dateCompare !== 0) return dateCompare
  return b.created_at.localeCompare(a.created_at)
}

export function matchesMemberFilter(
  row: ClientCheckInRow,
  memberFilter: string,
  memberName?: string | null,
): boolean {
  if (memberFilter === "all") return true

  if (row.member_id === memberFilter) return true

  if (memberName && row.member_name.trim() === memberName.trim()) {
    return true
  }

  return false
}

export function filterCheckInsByMember(
  checkIns: ClientCheckInRow[],
  memberFilter: string,
  memberName?: string | null,
): ClientCheckInRow[] {
  if (memberFilter === "all") return checkIns
  return checkIns.filter((row) => matchesMemberFilter(row, memberFilter, memberName))
}

export function computeClientProgressStatus(
  checkIn: ClientCheckInRow | null,
): ClientProgressStatus | null {
  if (!checkIn) return null

  const { energy, sleep, motivation } = checkIn
  const scores = [energy, sleep, motivation]

  if (scores.every((value) => value == null)) return null

  if (scores.some((value) => value != null && value < 5)) {
    return "needs_attention"
  }

  if (scores.every((value) => value != null && value >= 6)) {
    return "on_track"
  }

  return "monitoring"
}

export function computeClientProgressSummary(
  checkIns: ClientCheckInRow[],
  memberFilter: string,
  memberName: string,
): ClientProgressSummary | null {
  if (memberFilter === "all") return null

  const memberCheckIns = filterCheckInsByMember(checkIns, memberFilter, memberName)
  const latest = memberCheckIns.sort(compareCheckIns)[0] ?? null

  return {
    memberId: memberFilter,
    memberName,
    latestWeight: latest?.weight ?? null,
    latestEnergy: latest?.energy ?? null,
    latestSleep: latest?.sleep ?? null,
    latestMotivation: latest?.motivation ?? null,
    lastCheckInDate: latest?.checkin_date ?? null,
    status: computeClientProgressStatus(latest),
  }
}

export function formatProgressSummaryWeight(value: number | null): string {
  return formatCheckInWeight(value)
}

export function formatProgressSummaryScore(value: number | null): string {
  return formatCheckInScore(value)
}

export function formatProgressSummaryDate(value: string | null): string {
  if (!value) return "—"
  return formatCheckInDate(value)
}

export function progressStatusLabel(status: ClientProgressStatus | null): string {
  switch (status) {
    case "on_track":
      return "On Track"
    case "needs_attention":
      return "Needs Attention"
    case "monitoring":
      return "Monitoring"
    default:
      return "No status"
  }
}
