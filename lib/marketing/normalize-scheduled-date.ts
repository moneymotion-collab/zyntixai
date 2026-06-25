export function minutesFromNow(minutes: number): string {
  const date = new Date()
  date.setMinutes(date.getMinutes() + minutes)
  return date.toISOString()
}

function parseRelativeMinutes(value: string): number | null {
  const match = value.match(
    /^(?:in\s+)?(\d+)\s*min(?:uut|uten|utes?)?(?:\s+in\s+(?:de\s+)?toekomst|\s+in\s+(?:the\s+)?future)?$/,
  )

  if (!match) return null

  const minutes = Number(match[1])
  return Number.isFinite(minutes) && minutes >= 0 ? minutes : null
}

export function normalizeScheduledDate(value: string | null): string | null {
  if (!value) return null

  const trimmed = value.trim()
  const lower = trimmed.toLowerCase()
  const now = new Date()

  const relativeMinutes = parseRelativeMinutes(lower)
  if (relativeMinutes !== null) {
    return minutesFromNow(relativeMinutes)
  }

  if (lower === "tomorrow" || lower === "morgen") {
    const date = new Date(now)
    date.setDate(date.getDate() + 1)
    date.setHours(18, 0, 0, 0)
    return date.toISOString()
  }

  if (lower === "today" || lower === "vandaag") {
    const date = new Date(now)
    date.setHours(18, 0, 0, 0)
    if (date.getTime() <= now.getTime()) {
      date.setDate(date.getDate() + 1)
    }
    return date.toISOString()
  }

  if (lower === "this week" || lower === "deze week") {
    const date = new Date(now)
    date.setDate(date.getDate() + 3)
    date.setHours(18, 0, 0, 0)
    return date.toISOString()
  }

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}
