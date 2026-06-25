import { latestCheckInIdForMember } from "@/lib/coach-dashboard/check-in-lookup"
import type { TodaySession } from "@/lib/coach-dashboard/types"
import type { ClientGoalViewModel } from "@/lib/progress/client-goals"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"
import {
  parseProgressDate,
  resolveProgressDateKeyFromRecord,
} from "@/lib/progress/progress-date"

export type CoachTaskPriority = "high" | "medium" | "low"

export type CoachTaskKind =
  | "open_reminder"
  | "session_today"
  | "check_in_follow_up"
  | "progress_update"

export type CoachTaskArea =
  | "Reminders"
  | "Sessions"
  | "Check-ins"
  | "Progress"

export type CoachTask = {
  id: string
  kind: CoachTaskKind
  title: string
  memberId: string
  memberName: string
  reason: string
  priority: CoachTaskPriority
  priorityLabel: string
  suggestedAction: string
  relatedArea: CoachTaskArea
  href: string
  latestCheckInId: string | null
  reminderId: string | null
}

type MemberRef = {
  id: string
  full_name: string | null
}

type ClientReminderRef = {
  id: string
  member_id: string
  title: string
  message: string
  priority: string
  status: string
  due_date: string
  reminder_type: string
}

const CHECK_IN_REMINDER_TYPES = new Set(["check_in_missing", "check_in"])
const PROGRESS_REMINDER_TYPES = new Set(["progress_update_needed", "progress"])

const PRIORITY_LABELS: Record<CoachTaskPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
}

const PRIORITY_RANK: Record<CoachTaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const KIND_RANK: Record<CoachTaskKind, number> = {
  open_reminder: 0,
  session_today: 1,
  check_in_follow_up: 2,
  progress_update: 3,
}

const CHECK_IN_FOLLOW_UP_DAYS = 7
const PROGRESS_UPDATE_DAYS = 14

const REMINDER_PRIORITY_RANK: Record<CoachTaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

function normalizeReminderPriority(priority: string | null | undefined): CoachTaskPriority {
  const normalized = (priority ?? "").trim().toLowerCase()
  if (normalized === "high") return "high"
  if (normalized === "low") return "low"
  return "medium"
}

function isOpenReminder(status: string | null | undefined): boolean {
  return (status ?? "").trim().toLowerCase() === "open"
}

function hasOpenReminderType(
  reminders: ClientReminderRef[],
  memberId: string,
  types: Set<string>,
): boolean {
  return reminders.some(
    (reminder) =>
      reminder.member_id === memberId &&
      isOpenReminder(reminder.status) &&
      types.has((reminder.reminder_type ?? "").trim().toLowerCase()),
  )
}

function daysSinceProgressDate(value: unknown, reference = new Date()): number | null {
  const parsed = parseProgressDate(value)
  if (!parsed) return null

  const ref = new Date(reference)
  ref.setHours(12, 0, 0, 0)
  const target = new Date(parsed)
  target.setHours(12, 0, 0, 0)
  return Math.floor((ref.getTime() - target.getTime()) / (24 * 60 * 60 * 1000))
}

function latestCheckInForMember(
  checkIns: ClientCheckInRow[],
  memberId: string,
): ClientCheckInRow | null {
  const rows = checkIns
    .filter((row) => row.member_id === memberId)
    .map((row) => {
      const dateKey = resolveProgressDateKeyFromRecord(
        row as unknown as Record<string, unknown>,
      )
      const parsed = dateKey ? parseProgressDate(dateKey) : null
      return parsed ? { row, parsed } : null
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry != null)
    .sort((left, right) => right.parsed.getTime() - left.parsed.getTime())

  return rows[0]?.row ?? null
}

function latestProgressLogForMember(
  logs: ProgressLogRow[],
  memberId: string,
): ProgressLogRow | null {
  const memberLogs = logs
    .filter((log) => log.member_id === memberId)
    .map((log) => ({
      log,
      parsed: parseProgressDate(log.updated_at),
    }))
    .filter((entry): entry is { log: ProgressLogRow; parsed: Date } => entry.parsed != null)
    .sort((left, right) => right.parsed.getTime() - left.parsed.getTime())

  return memberLogs[0]?.log ?? null
}

function memberNameById(members: MemberRef[], memberId: string): string {
  return members.find((member) => member.id === memberId)?.full_name ?? "Member"
}

function buildTask(
  checkIns: ClientCheckInRow[],
  task: Omit<CoachTask, "priorityLabel" | "latestCheckInId">,
): CoachTask {
  return {
    ...task,
    priorityLabel: PRIORITY_LABELS[task.priority],
    latestCheckInId: latestCheckInIdForMember(checkIns, task.memberId),
  }
}

function sortCoachTasks(tasks: CoachTask[]): CoachTask[] {
  return [...tasks].sort((left, right) => {
    const priorityDiff = PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority]
    if (priorityDiff !== 0) return priorityDiff

    if (left.kind === "open_reminder" && right.kind === "open_reminder") {
      const leftReminderPriority = REMINDER_PRIORITY_RANK[left.priority]
      const rightReminderPriority = REMINDER_PRIORITY_RANK[right.priority]
      if (leftReminderPriority !== rightReminderPriority) {
        return leftReminderPriority - rightReminderPriority
      }
    }

    const kindDiff = KIND_RANK[left.kind] - KIND_RANK[right.kind]
    if (kindDiff !== 0) return kindDiff

    return left.memberName.localeCompare(right.memberName)
  })
}

export type ComputeCoachTasksInput = {
  members: MemberRef[]
  reminders: ClientReminderRef[]
  todaySessions: TodaySession[]
  checkIns: ClientCheckInRow[]
  progressLogs: ProgressLogRow[]
  referenceDate?: Date
}

export function computeCoachTasks(input: ComputeCoachTasksInput): CoachTask[] {
  const reference = input.referenceDate ?? new Date()
  const tasks: CoachTask[] = []
  const seen = new Set<string>()

  function pushTask(key: string, task: Omit<CoachTask, "priorityLabel" | "latestCheckInId">) {
    if (seen.has(key)) return
    seen.add(key)
    tasks.push(buildTask(input.checkIns, task))
  }

  for (const reminder of input.reminders) {
    if (!isOpenReminder(reminder.status)) continue

    const memberId = reminder.member_id
    const priority = normalizeReminderPriority(reminder.priority)

    pushTask(`reminder-${reminder.id}`, {
      id: `reminder-${reminder.id}`,
      kind: "open_reminder",
      title: reminder.title,
      memberId,
      memberName: memberNameById(input.members, memberId),
      reason: reminder.message || "Open client reminder needs attention",
      priority,
      suggestedAction: "Review the reminder and follow up with the client.",
      relatedArea: "Reminders",
      href: `/members/${memberId}`,
      reminderId: reminder.id,
    })
  }

  for (const session of input.todaySessions) {
    const memberId = session.memberId ?? session.id

    pushTask(`session-${session.id}`, {
      id: `session-${session.id}`,
      kind: "session_today",
      title: "Prepare for today's session",
      memberId,
      memberName: session.memberName,
      reason: `${session.sessionType ?? "Session"} scheduled at ${session.scheduledTime ?? "today"}`,
      priority: "high",
      suggestedAction:
        "Review recent check-ins, goals, and notes before the session starts.",
      relatedArea: "Sessions",
      href: session.memberId ? `/members/${session.memberId}` : "/sessions",
      reminderId: null,
    })
  }

  for (const member of input.members) {
    const latestCheckIn = latestCheckInForMember(input.checkIns, member.id)
    const checkInDays = latestCheckIn
      ? daysSinceProgressDate(
          resolveProgressDateKeyFromRecord(
            latestCheckIn as unknown as Record<string, unknown>,
          ),
          reference,
        )
      : null

    if (
      (checkInDays == null || checkInDays > CHECK_IN_FOLLOW_UP_DAYS) &&
      !hasOpenReminderType(input.reminders, member.id, CHECK_IN_REMINDER_TYPES)
    ) {
      pushTask(`check-in-${member.id}`, {
        id: `check-in-${member.id}`,
        kind: "check_in_follow_up",
        title: "Follow up on missing check-in",
        memberId: member.id,
        memberName: member.full_name ?? "Member",
        reason:
          checkInDays == null
            ? "No client check-in recorded yet"
            : `No client check-in in ${checkInDays} days`,
        priority: "medium",
        suggestedAction:
          "Send a reminder or log a check-in during your next touchpoint.",
        relatedArea: "Check-ins",
        href: `/members/${member.id}`,
        reminderId: null,
      })
    }

    const latestLog = latestProgressLogForMember(input.progressLogs, member.id)
    const logDays = latestLog?.updated_at
      ? daysSinceProgressDate(latestLog.updated_at, reference)
      : null

    if (
      (logDays == null || logDays > PROGRESS_UPDATE_DAYS) &&
      !hasOpenReminderType(input.reminders, member.id, PROGRESS_REMINDER_TYPES)
    ) {
      pushTask(`progress-${member.id}`, {
        id: `progress-${member.id}`,
        kind: "progress_update",
        title: "Request progress update",
        memberId: member.id,
        memberName: member.full_name ?? "Member",
        reason:
          logDays == null
            ? "No progress log recorded yet"
            : `No progress log update in ${logDays} days`,
        priority: "medium",
        suggestedAction:
          "Schedule a measurement review or log a progress update with the client.",
        relatedArea: "Progress",
        href: `/members/${member.id}`,
        reminderId: null,
      })
    }
  }

  return sortCoachTasks(tasks)
}
