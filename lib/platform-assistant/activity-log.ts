import type { ActivityLogEntry } from "./types"

const STORAGE_KEY = "zyntix-platform-assistant-activity"
const MAX_ENTRIES = 50

export function readActivityLog(): ActivityLogEntry[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ActivityLogEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function appendActivityLog(entry: ActivityLogEntry): ActivityLogEntry[] {
  if (typeof window === "undefined") return [entry]

  const next = [entry, ...readActivityLog()].slice(0, MAX_ENTRIES)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function clearActivityLog(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(STORAGE_KEY)
}
