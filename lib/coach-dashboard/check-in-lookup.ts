import type { ClientCheckInRow } from "@/lib/progress/client-checkins"

function compareCheckInsDesc(a: ClientCheckInRow, b: ClientCheckInRow): number {
  const dateCompare = b.checkin_date.localeCompare(a.checkin_date)
  if (dateCompare !== 0) return dateCompare
  return b.created_at.localeCompare(a.created_at)
}

export function buildLatestCheckInIdMap(
  checkIns: ClientCheckInRow[],
): Map<string, string> {
  const map = new Map<string, string>()

  for (const row of [...checkIns].sort(compareCheckInsDesc)) {
    if (!row.member_id || map.has(row.member_id)) continue
    map.set(row.member_id, row.id)
  }

  return map
}

export function latestCheckInIdForMember(
  checkIns: ClientCheckInRow[],
  memberId: string,
): string | null {
  return (
    [...checkIns]
      .filter((row) => row.member_id === memberId)
      .sort(compareCheckInsDesc)[0]?.id ?? null
  )
}
