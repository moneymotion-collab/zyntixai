/** Shared progress date parsing and chart formatting. */

export const PROGRESS_DATE_FIELDS = [
  "checkin_date",
  "check_in_date",
  "habit_date",
  "completed_at",
  "updated_at",
  "created_at",
] as const

export type ProgressDateField = (typeof PROGRESS_DATE_FIELDS)[number]

export function isValidProgressDate(value: unknown): boolean {
  return parseProgressDate(value) !== null
}

export function parseProgressDate(value: unknown): Date | null {
  if (value == null) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime())
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const fromNumber = new Date(value)
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber
  }

  const trimmed = String(value).trim()
  if (!trimmed) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split("-").map(Number)
    const parsed = new Date(year, month - 1, day, 12, 0, 0, 0)
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null
    }
    return parsed
  }

  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function toProgressDateKey(value: unknown): string | null {
  const parsed = parseProgressDate(value)
  if (!parsed) return null

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, "0")
  const day = String(parsed.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function resolveProgressDateFromRecord(
  record: Record<string, unknown>,
): Date | null {
  for (const field of PROGRESS_DATE_FIELDS) {
    const parsed = parseProgressDate(record[field])
    if (parsed) return parsed
  }
  return null
}

export function resolveProgressDateKeyFromRecord(
  record: Record<string, unknown>,
): string | null {
  const parsed = resolveProgressDateFromRecord(record)
  return parsed ? toProgressDateKey(parsed) : null
}

export function formatProgressChartDate(value: unknown): string {
  const parsed = parseProgressDate(value)
  if (!parsed) return "—"

  const formatted = parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  if (formatted.toLowerCase().includes("invalid")) return "—"
  return formatted
}

export function sortByProgressDateAsc<T>(
  items: T[],
  dateKey: keyof T | ((item: T) => unknown),
): T[] {
  const readTime = (item: T): number => {
    const raw =
      typeof dateKey === "function" ? dateKey(item) : item[dateKey]
    return parseProgressDate(raw)?.getTime() ?? Number.POSITIVE_INFINITY
  }

  return items.slice().sort((left, right) => readTime(left) - readTime(right))
}
