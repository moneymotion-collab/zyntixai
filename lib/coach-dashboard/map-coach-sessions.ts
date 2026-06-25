import type { TodaySession } from "@/lib/coach-dashboard/types"

type SessionRowLike = {
  id: string
  member_id: string | null
  session_type: string | null
  scheduled_date: string | null
  scheduled_time: string | null
  scheduled_at: string | null
  duration: number | null
  status: string | null
  notes?: string | null
  members?: { full_name: string | null } | null
}

export const SESSION_STATUS_LABELS: Record<string, string> = {
  gepland: "Scheduled",
  voltooid: "Completed",
  geannuleerd: "Cancelled",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const SESSION_STATUS_STYLES: Record<string, string> = {
  gepland: "border-blue-400/25 bg-blue-500/15 text-blue-200",
  voltooid: "border-emerald-400/25 bg-emerald-500/15 text-emerald-200",
  geannuleerd: "border-red-400/25 bg-red-500/15 text-red-200",
  scheduled: "border-blue-400/25 bg-blue-500/15 text-blue-200",
  completed: "border-emerald-400/25 bg-emerald-500/15 text-emerald-200",
  cancelled: "border-red-400/25 bg-red-500/15 text-red-200",
}

export function resolveSessionStatusLabel(status: string | null | undefined): string {
  if (!status) return SESSION_STATUS_LABELS.gepland
  return SESSION_STATUS_LABELS[status] ?? "Scheduled"
}

export function resolveSessionStatusStyle(status: string | null | undefined): string {
  const key = status ?? "gepland"
  return (
    SESSION_STATUS_STYLES[key] ??
    "border-white/10 bg-white/10 text-slate-300"
  )
}

export function isSessionCompleted(status: string | null | undefined): boolean {
  return status === "voltooid" || status === "completed"
}

export function formatSessionTime(value: string | null | undefined): string {
  if (!value) return "—"
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5)
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatSessionDateLabel(value: string | null | undefined): string {
  if (!value) return "—"
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function sessionSortKey(
  scheduledDate: string | null | undefined,
  scheduledTime: string | null | undefined,
  scheduledAt: string | null | undefined,
): string {
  if (scheduledDate) {
    const time = scheduledTime?.slice(0, 5) ?? "00:00"
    return `${scheduledDate}T${time}`
  }
  if (scheduledAt) return scheduledAt
  return "9999-12-31T23:59"
}

export function mapCoachSession(row: SessionRowLike): TodaySession {
  const scheduledDate = row.scheduled_date
  const scheduledTime = row.scheduled_time ?? row.scheduled_at

  return {
    id: row.id,
    memberId: row.member_id,
    memberName: row.members?.full_name ?? "Member",
    sessionType: row.session_type,
    scheduledDate,
    scheduledDateLabel: formatSessionDateLabel(scheduledDate),
    scheduledTime: formatSessionTime(scheduledTime),
    duration: row.duration,
    status: row.status,
    statusLabel: resolveSessionStatusLabel(row.status),
    notes: row.notes ?? null,
    sortKey: sessionSortKey(scheduledDate, row.scheduled_time, row.scheduled_at),
  }
}

export function sortSessionsByDateTime(sessions: TodaySession[]): TodaySession[] {
  return [...sessions].sort((a, b) => a.sortKey.localeCompare(b.sortKey))
}

export function tomorrowDateString(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}
