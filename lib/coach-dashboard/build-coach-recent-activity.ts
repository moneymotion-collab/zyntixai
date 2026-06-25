import type { RecentActivityItem, TodaySession } from "@/lib/coach-dashboard/types"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"
import {
  parseProgressDate,
  resolveProgressDateKeyFromRecord,
} from "@/lib/progress/progress-date"

type WorkoutCompletionRef = {
  id: string
  member_id: string | null
  completed_at: string
  members?: { full_name: string | null } | null
  workout_plans?: { title: string } | null
}

type NutritionAssignmentRef = {
  member_id: string | null
  assigned_at: string | null
  nutrition_plan_id: string | null
  members?: { full_name: string | null } | null
  nutrition_plans?: { title: string } | null
}

type SessionActivityRef = {
  id: string
  member_id: string | null
  created_at: string | null
  scheduled_date: string | null
  session_type: string | null
  members?: { full_name: string | null } | null
}

const RECENT_ACTIVITY_LIMIT = 20

function activityTimestamp(value: unknown, fallback?: string): string {
  const parsed = parseProgressDate(value)
  if (parsed) return parsed.toISOString()
  if (fallback && parseProgressDate(fallback)) {
    return parseProgressDate(fallback)!.toISOString()
  }
  return new Date().toISOString()
}

function sessionActivityTimestamp(session: TodaySession): string {
  if (session.scheduledDate) {
    const time = session.scheduledTime && session.scheduledTime !== "—"
      ? session.scheduledTime
      : "12:00:00"
    return activityTimestamp(`${session.scheduledDate}T${time}`)
  }
  return activityTimestamp(session.sortKey)
}

function compareActivityNewestFirst(left: RecentActivityItem, right: RecentActivityItem): number {
  const leftTime = parseProgressDate(left.timestamp)?.getTime() ?? 0
  const rightTime = parseProgressDate(right.timestamp)?.getTime() ?? 0
  return rightTime - leftTime
}

type GoalActivityRef = {
  id: string
  memberId: string
  memberName: string
  title: string
  trackingStatus: string
  updatedAt: string
}

export type BuildCoachRecentActivityInput = {
  checkIns: ClientCheckInRow[]
  completions: WorkoutCompletionRef[]
  nutritionAssignments: NutritionAssignmentRef[]
  progressLogs: ProgressLogRow[]
  goals: GoalActivityRef[]
  sessions: TodaySession[]
  recentSessions: SessionActivityRef[]
}

export function buildCoachRecentActivity(
  input: BuildCoachRecentActivityInput,
): RecentActivityItem[] {
  const items: RecentActivityItem[] = []

  for (const checkIn of input.checkIns) {
    if (!checkIn.member_id) continue

    const dateKey = resolveProgressDateKeyFromRecord(
      checkIn as unknown as Record<string, unknown>,
    )
    const timestamp = activityTimestamp(dateKey, checkIn.created_at ?? checkIn.checkin_date)

    items.push({
      id: `checkin-${checkIn.id}`,
      type: "client_checkin",
      title: `${checkIn.member_name ?? "Member"} logged a check-in`,
      subtitle: "Client check-in",
      timestamp,
      href: `/members/${checkIn.member_id}`,
    })
  }

  for (const completion of input.completions) {
    if (!completion.member_id || !completion.completed_at) continue

    const memberName =
      completion.members?.full_name ?? "Member"
    const planTitle = completion.workout_plans?.title ?? "Workout"

    items.push({
      id: `completion-${completion.id}`,
      type: "workout_completion",
      title: `${memberName} completed ${planTitle}`,
      subtitle: "Workout completion",
      timestamp: activityTimestamp(completion.completed_at),
      href: `/members/${completion.member_id}`,
    })
  }

  for (const assignment of input.nutritionAssignments) {
    if (!assignment.member_id || !assignment.assigned_at) continue

    const memberName = assignment.members?.full_name ?? "Member"

    items.push({
      id: `nutrition-assignment-${assignment.member_id}-${assignment.nutrition_plan_id}`,
      type: "nutrition_assignment",
      title: `${memberName} started nutrition plan`,
      subtitle:
        assignment.nutrition_plans?.title ?? "Nutrition assignment",
      timestamp: activityTimestamp(assignment.assigned_at),
      href: `/members/${assignment.member_id}`,
    })
  }

  for (const log of input.progressLogs) {
    if (!log.member_id) continue

    const memberName =
      (log.members as { full_name: string | null } | null)?.full_name ?? "Member"

    items.push({
      id: `progress-${log.id}`,
      type: "progress_log",
      title: `${memberName} logged ${log.metric ?? "progress"}`,
      subtitle: "Progress log",
      timestamp: activityTimestamp(log.updated_at),
      href: `/members/${log.member_id}`,
    })
  }

  for (const goal of input.goals) {
    const isCompleted = goal.trackingStatus === "completed"
    const actionLabel = isCompleted ? "Goal completed" : "Goal updated"
    const timestamp = activityTimestamp(goal.updatedAt)

    items.push({
      id: `goal-${goal.id}`,
      type: "goal_update",
      title: `${goal.memberName}: ${goal.title}`,
      subtitle: actionLabel,
      timestamp,
      href: `/members/${goal.memberId}`,
    })
  }

  for (const session of input.sessions) {
    if (!session.memberId) continue

    items.push({
      id: `session-scheduled-${session.id}`,
      type: "session",
      title: `${session.memberName} session scheduled`,
      subtitle: session.sessionType ?? "Coaching session",
      timestamp: sessionActivityTimestamp(session),
      href: `/members/${session.memberId}`,
    })
  }

  for (const session of input.recentSessions) {
    if (!session.member_id) continue

    const memberName = session.members?.full_name ?? "Member"
    const timestamp = activityTimestamp(
      session.created_at ?? undefined,
      session.scheduled_date ?? undefined,
    )

    items.push({
      id: `session-booked-${session.id}`,
      type: "session",
      title: `${memberName} booked a session`,
      subtitle: session.session_type ?? "Session booking",
      timestamp,
      href: `/members/${session.member_id}`,
    })
  }

  const deduped = new Map<string, RecentActivityItem>()
  for (const item of items.sort(compareActivityNewestFirst)) {
    if (!deduped.has(item.id)) {
      deduped.set(item.id, item)
    }
  }

  return [...deduped.values()]
    .sort(compareActivityNewestFirst)
    .slice(0, RECENT_ACTIVITY_LIMIT)
}

export function formatCoachActivityRelativeTime(value: string): string {
  const date = parseProgressDate(value)
  if (!date) return "Recently"

  const diffMs = Date.now() - date.getTime()

  if (diffMs < 60_000) return "Just now"
  if (diffMs < 3_600_000) {
    const mins = Math.floor(diffMs / 60_000)
    return `${mins}m ago`
  }
  if (diffMs < 86_400_000) {
    const hours = Math.floor(diffMs / 3_600_000)
    return `${hours}h ago`
  }
  if (diffMs < 604_800_000) {
    const days = Math.floor(diffMs / 86_400_000)
    return `${days}d ago`
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}
