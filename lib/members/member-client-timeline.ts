import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type {
  ClientTimelineFilter,
  ClientTimelineItem,
} from "@/lib/types/client-timeline"

const TIMELINE_PAGE_SIZE = 30

const FILTER_TYPE_MAP: Record<Exclude<ClientTimelineFilter, "all">, string[]> = {
  workouts: ["workout_assignment", "workout_completion"],
  nutrition: ["nutrition_assignment"],
  progress: ["progress_log"],
  "check-ins": ["check_in"],
  photos: ["progress_photo"],
  notes: ["note"],
  habits: ["habit"],
  reminders: ["reminder"],
  sessions: ["session"],
  goals: ["goal"],
}

function toIsoDate(
  value: string | null | undefined,
  fallback?: string | null,
): string {
  const candidate = value ?? fallback
  if (!candidate?.trim()) return new Date(0).toISOString()

  const parsed = candidate.includes("T")
    ? new Date(candidate)
    : new Date(`${candidate.trim()}T12:00:00`)

  return Number.isNaN(parsed.getTime())
    ? new Date(0).toISOString()
    : parsed.toISOString()
}

function truncate(value: string | null | undefined, max = 160): string {
  if (!value?.trim()) return ""
  const trimmed = value.trim()
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed
}

export function sortTimelineItems(items: ClientTimelineItem[]): ClientTimelineItem[] {
  return [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

export function filterTimelineItems(
  items: ClientTimelineItem[],
  filter: ClientTimelineFilter,
): ClientTimelineItem[] {
  if (filter === "all") return items
  const allowed = new Set(FILTER_TYPE_MAP[filter])
  return items.filter((item) => allowed.has(item.type))
}

export function paginateTimelineItems(
  items: ClientTimelineItem[],
  visibleCount: number,
): { visible: ClientTimelineItem[]; hasMore: boolean } {
  return {
    visible: items.slice(0, visibleCount),
    hasMore: items.length > visibleCount,
  }
}

export const TIMELINE_DEFAULT_LIMIT = TIMELINE_PAGE_SIZE

export const CLIENT_TIMELINE_FILTER_OPTIONS: {
  value: ClientTimelineFilter
  label: string
}[] = [
  { value: "all", label: "All" },
  { value: "workouts", label: "Workouts" },
  { value: "nutrition", label: "Nutrition" },
  { value: "progress", label: "Progress" },
  { value: "check-ins", label: "Check-ins" },
  { value: "photos", label: "Photos" },
  { value: "notes", label: "Notes" },
  { value: "habits", label: "Habits" },
  { value: "reminders", label: "Reminders" },
  { value: "sessions", label: "Sessions" },
  { value: "goals", label: "Goals" },
]

export function clientTimelineTypeLabel(type: string): string {
  switch (type) {
    case "workout_assignment":
      return "Workout assigned"
    case "workout_completion":
      return "Workout completed"
    case "nutrition_assignment":
      return "Nutrition assigned"
    case "progress_log":
      return "Progress log"
    case "goal":
      return "Goal"
    case "check_in":
      return "Check-in"
    case "progress_photo":
      return "Progress photo"
    case "note":
      return "Coach note"
    case "habit":
      return "Habit log"
    case "reminder":
      return "Reminder"
    case "session":
      return "Session"
    default:
      return "Activity"
  }
}

export async function fetchMemberClientTimeline(
  supabase: SupabaseClient<Database>,
  memberId: string,
): Promise<{ items: ClientTimelineItem[]; error: string | null }> {
  const [
    workoutAssignments,
    workoutCompletions,
    nutritionAssignments,
    progressLogs,
    goals,
    checkIns,
    photos,
    notes,
    habits,
    reminders,
    sessions,
  ] = await Promise.all([
    supabase
      .from("workout_assignments")
      .select("id, assigned_at, status, workout_plans ( title )")
      .eq("member_id", memberId),
    supabase
      .from("workout_completions")
      .select("id, completed_at, workout_plans ( title )")
      .eq("member_id", memberId),
    supabase
      .from("member_nutrition_assignments")
      .select("member_id, assigned_at, status, nutrition_plans ( title )")
      .eq("member_id", memberId),
    supabase.from("progress_logs").select("*").eq("member_id", memberId),
    supabase.from("client_goals").select("*").eq("member_id", memberId),
    supabase.from("client_checkins").select("*").eq("member_id", memberId),
    supabase.from("client_progress_photos").select("*").eq("member_id", memberId),
    supabase.from("client_notes").select("*").eq("member_id", memberId),
    supabase.from("client_habits").select("*").eq("member_id", memberId),
    supabase.from("client_reminders").select("*").eq("member_id", memberId),
    supabase.from("sessions").select("*").eq("member_id", memberId),
  ])

  const errors = [
    workoutAssignments.error,
    workoutCompletions.error,
    nutritionAssignments.error,
    progressLogs.error,
    goals.error,
    checkIns.error,
    photos.error,
    notes.error,
    habits.error,
    reminders.error,
    sessions.error,
  ].filter(Boolean)

  if (errors.length > 0) {
    console.error("[client_timeline] fetch failed:", errors[0]!.message)
    return { items: [], error: errors[0]!.message }
  }

  const items: ClientTimelineItem[] = []

  for (const row of workoutAssignments.data ?? []) {
    const planTitle =
      (row.workout_plans as { title?: string } | null)?.title ?? "Workout plan"
    items.push({
      id: `workout_assignment:${row.id}`,
      type: "workout_assignment",
      title: `Workout assigned: ${planTitle}`,
      description: `Training plan linked to this member.`,
      date: toIsoDate(row.assigned_at),
      status: row.status ?? undefined,
    })
  }

  for (const row of workoutCompletions.data ?? []) {
    const planTitle =
      (row.workout_plans as { title?: string } | null)?.title ?? "Workout plan"
    items.push({
      id: `workout_completion:${row.id}`,
      type: "workout_completion",
      title: `Workout completed: ${planTitle}`,
      description: "Member marked a workout as complete.",
      date: toIsoDate(row.completed_at),
      status: "completed",
    })
  }

  for (const row of nutritionAssignments.data ?? []) {
    const planTitle =
      (row.nutrition_plans as { title?: string } | null)?.title ??
      "Nutrition plan"
    items.push({
      id: `nutrition_assignment:${row.member_id}:${row.assigned_at}`,
      type: "nutrition_assignment",
      title: `Nutrition assigned: ${planTitle}`,
      description: "Nutrition plan linked to this member.",
      date: toIsoDate(row.assigned_at),
      status: row.status ?? undefined,
    })
  }

  for (const row of progressLogs.data ?? []) {
    items.push({
      id: `progress_log:${row.id}`,
      type: "progress_log",
      title: `Progress logged: ${row.metric ?? "Metric"}`,
      description:
        row.current_value != null
          ? `Current value ${row.current_value}${
              row.change_value != null ? ` (${row.change_value >= 0 ? "+" : ""}${row.change_value})` : ""
            }`
          : "Progress entry recorded.",
      date: toIsoDate(row.updated_at),
    })
  }

  for (const row of goals.data ?? []) {
    items.push({
      id: `goal:${row.id}`,
      type: "goal",
      title: row.title,
      description: truncate(
        row.notes ??
          `Target ${row.target_value}${row.unit ? ` ${row.unit}` : ""} by ${row.target_date}`,
      ),
      date: toIsoDate(row.created_at, row.updated_at),
      status: row.status ?? undefined,
    })
  }

  for (const row of checkIns.data ?? []) {
    items.push({
      id: `check_in:${row.id}`,
      type: "check_in",
      title: "Member check-in",
      description: truncate(
        row.notes ??
          [
            row.weight != null ? `Weight ${row.weight} kg` : null,
            row.energy != null ? `Energy ${row.energy}/10` : null,
            row.wins,
          ]
            .filter(Boolean)
            .join(" · "),
      ),
      date: toIsoDate(row.checkin_date, row.created_at),
    })
  }

  for (const row of photos.data ?? []) {
    items.push({
      id: `progress_photo:${row.id}`,
      type: "progress_photo",
      title: `Progress photo (${row.photo_type})`,
      description: truncate(row.notes ?? "Transformation photo uploaded."),
      date: toIsoDate(row.taken_at, row.created_at),
    })
  }

  for (const row of notes.data ?? []) {
    items.push({
      id: `note:${row.id}`,
      type: "note",
      title: row.title,
      description: truncate(row.content),
      date: toIsoDate(row.created_at, row.updated_at),
      status: row.is_pinned ? "pinned" : undefined,
    })
  }

  for (const row of habits.data ?? []) {
    items.push({
      id: `habit:${row.id}`,
      type: "habit",
      title: `Habit logged: ${row.habit_name}`,
      description: truncate(row.notes ?? `${row.habit_type} habit entry.`),
      date: toIsoDate(row.logged_at, row.created_at),
    })
  }

  for (const row of reminders.data ?? []) {
    items.push({
      id: `reminder:${row.id}`,
      type: "reminder",
      title: row.title,
      description: truncate(row.message),
      date: toIsoDate(row.due_date, row.created_at),
      status: row.status ?? undefined,
    })
  }

  for (const row of sessions.data ?? []) {
    const sessionDate =
      row.scheduled_at ??
      (row.scheduled_date
        ? `${row.scheduled_date}${row.scheduled_time ? `T${row.scheduled_time}` : "T12:00:00"}`
        : null)

    items.push({
      id: `session:${row.id}`,
      type: "session",
      title: row.session_type
        ? `${row.session_type} session`
        : "Coaching session",
      description: truncate(row.notes ?? "Session scheduled with member."),
      date: toIsoDate(sessionDate, row.created_at),
      status: row.status ?? undefined,
    })
  }

  return { items: sortTimelineItems(items), error: null }
}

export function formatTimelineDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "—"

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
