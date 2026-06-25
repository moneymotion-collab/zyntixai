import type { CalendarPost } from "@/lib/marketing/calendar-types"

export type CalendarCell = {
  date: Date
  inMonth: boolean
  isToday: boolean
  posts: CalendarPost[]
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function parseScheduledDate(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null

  const normalized = value.includes("T") ? value : value.replace(" ", "T")
  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function groupPostsByDay(posts: CalendarPost[]): Map<string, CalendarPost[]> {
  const grouped = new Map<string, CalendarPost[]>()

  for (const post of posts) {
    const scheduled = parseScheduledDate(post.scheduled_date)
    if (!scheduled) continue

    const key = toDateKey(scheduled)
    const existing = grouped.get(key) ?? []
    existing.push(post)
    grouped.set(key, existing)
  }

  for (const [key, dayPosts] of grouped) {
    dayPosts.sort((a, b) => {
      const aTime = parseScheduledDate(a.scheduled_date)?.getTime() ?? 0
      const bTime = parseScheduledDate(b.scheduled_date)?.getTime() ?? 0
      return aTime - bTime
    })
    grouped.set(key, dayPosts)
  }

  return grouped
}

export function buildMonthGrid(
  month: Date,
  postsByDay: Map<string, CalendarPost[]>,
): CalendarCell[] {
  const firstOfMonth = startOfMonth(month)
  const startOffset = (firstOfMonth.getDay() + 6) % 7
  const gridStart = new Date(firstOfMonth)
  gridStart.setDate(firstOfMonth.getDate() - startOffset)

  const today = new Date()
  const cells: CalendarCell[] = []

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)

    cells.push({
      date,
      inMonth: date.getMonth() === month.getMonth(),
      isToday: isSameDay(date, today),
      posts: postsByDay.get(toDateKey(date)) ?? [],
    })
  }

  return cells
}
