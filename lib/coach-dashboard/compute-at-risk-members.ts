export type NextSessionInfo = {
  date: string | null
  dateLabel: string
  time: string | null
}

export function buildNextSessionByMember(
  sessions: {
    memberId: string | null
    scheduledDate: string | null
    scheduledDateLabel: string
    scheduledTime: string | null
    sortKey: string
  }[],
): Map<string, NextSessionInfo> {
  const sorted = [...sessions].sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  const map = new Map<string, NextSessionInfo>()

  for (const session of sorted) {
    if (!session.memberId || map.has(session.memberId)) continue
    map.set(session.memberId, {
      date: session.scheduledDate,
      dateLabel: session.scheduledDateLabel,
      time: session.scheduledTime,
    })
  }

  return map
}
