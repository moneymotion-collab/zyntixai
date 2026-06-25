import type { TaskStatus } from "@/lib/coach-workspace/types"

const STORAGE_PREFIX = "coach-workspace-tasks"

function storageKey(coachUserId: string): string {
  return `${STORAGE_PREFIX}:${coachUserId}`
}

export function readTaskStatuses(
  coachUserId: string,
): Record<string, TaskStatus> {
  if (typeof window === "undefined") return {}

  try {
    const raw = localStorage.getItem(storageKey(coachUserId))
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, TaskStatus>
  } catch {
    return {}
  }
}

export function writeTaskStatus(
  coachUserId: string,
  taskId: string,
  status: TaskStatus,
): Record<string, TaskStatus> {
  const current = readTaskStatuses(coachUserId)
  const next = { ...current, [taskId]: status }

  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey(coachUserId), JSON.stringify(next))
  }

  return next
}

export function clearDoneTasksForDay(
  coachUserId: string,
  taskIds: string[],
): Record<string, TaskStatus> {
  const current = readTaskStatuses(coachUserId)
  const next = { ...current }

  for (const taskId of taskIds) {
    if (next[taskId] === "done") {
      delete next[taskId]
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey(coachUserId), JSON.stringify(next))
  }

  return next
}
