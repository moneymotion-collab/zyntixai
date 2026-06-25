import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"
import type {
  ClientReminder,
  ClientReminderPriority,
  ClientReminderStatus,
  ClientReminderType,
  CreateClientReminderInput,
} from "@/lib/types/client-reminders"

type ClientReminderRow = Database["public"]["Tables"]["client_reminders"]["Row"]

const REMINDER_TYPES = new Set<ClientReminderType>([
  "check_in_missing",
  "habit_inactive",
  "progress_update_needed",
  "workout_completion_missing",
  "general",
  "follow_up",
  "check_in",
  "workout",
  "nutrition",
  "progress",
  "session",
  "admin",
])

const PRIORITIES = new Set<ClientReminderPriority>(["high", "medium", "low"])
const STATUSES = new Set<ClientReminderStatus>(["open", "done"])

const PRIORITY_ORDER: Record<ClientReminderPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const STATUS_ORDER: Record<ClientReminderStatus, number> = {
  open: 0,
  done: 1,
}

type AutomaticReminderRule = {
  reminderType: ClientReminderType
  title: string
  message: string
  priority: ClientReminderPriority
  daysThreshold: number
}

export const AUTOMATIC_REMINDER_RULES: AutomaticReminderRule[] = [
  {
    reminderType: "check_in_missing",
    title: "Check-in missing",
    message:
      "No member check-in recorded in the last 7 days. Follow up to keep accountability on track.",
    priority: "high",
    daysThreshold: 7,
  },
  {
    reminderType: "habit_inactive",
    title: "Habit tracking inactive",
    message:
      "No habit log recorded in the last 3 days. Encourage the member to resume daily habit tracking.",
    priority: "high",
    daysThreshold: 3,
  },
  {
    reminderType: "progress_update_needed",
    title: "Progress update needed",
    message:
      "No progress log recorded in the last 14 days. Schedule a measurement or progress review.",
    priority: "medium",
    daysThreshold: 14,
  },
  {
    reminderType: "workout_completion_missing",
    title: "Workout completion missing",
    message:
      "No workout completion recorded in the last 7 days. Check training adherence and barriers.",
    priority: "high",
    daysThreshold: 7,
  },
]

function normalizeReminderType(value: string): ClientReminderType {
  if (REMINDER_TYPES.has(value as ClientReminderType)) {
    return value as ClientReminderType
  }
  return "general"
}

function normalizePriority(value: string): ClientReminderPriority {
  if (PRIORITIES.has(value as ClientReminderPriority)) {
    return value as ClientReminderPriority
  }
  return "medium"
}

function normalizeStatus(value: string): ClientReminderStatus {
  if (STATUSES.has(value as ClientReminderStatus)) {
    return value as ClientReminderStatus
  }
  return "open"
}

function normalizeText(value: string): string {
  return value.trim()
}

function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseDateValue(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null
  const parsed = value.includes("T")
    ? new Date(value)
    : new Date(`${value.trim()}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function daysSince(value: string | null | undefined): number | null {
  const parsed = parseDateValue(value)
  if (!parsed) return null
  const diffMs = Date.now() - parsed.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export function mapClientReminderRow(row: ClientReminderRow): ClientReminder {
  return {
    id: row.id,
    coach_id: row.coach_id,
    member_id: row.member_id,
    reminder_type: normalizeReminderType(row.reminder_type),
    title: row.title,
    message: row.message,
    due_date: row.due_date,
    priority: normalizePriority(row.priority),
    status: normalizeStatus(row.status),
    is_automatic: row.is_automatic,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function sortClientReminders(reminders: ClientReminder[]): ClientReminder[] {
  return [...reminders].sort((a, b) => {
    if (a.status !== b.status) {
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    }
    if (a.priority !== b.priority) {
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    }
    return (
      new Date(`${a.due_date}T12:00:00`).getTime() -
      new Date(`${b.due_date}T12:00:00`).getTime()
    )
  })
}

export async function fetchMemberClientReminders(
  supabase: SupabaseClient<Database>,
  memberId: string,
): Promise<{ reminders: ClientReminder[]; error: string | null }> {
  const { data, error } = await supabase
    .from("client_reminders")
    .select("*")
    .eq("member_id", memberId)

  if (error) {
    return { reminders: [], error: error.message }
  }

  return {
    reminders: sortClientReminders((data ?? []).map(mapClientReminderRow)),
    error: null,
  }
}

export async function insertMemberClientReminder(
  supabase: SupabaseClient<Database>,
  coachId: string,
  input: CreateClientReminderInput,
  options?: { isAutomatic?: boolean },
): Promise<{ reminder: ClientReminder | null; error: string | null }> {
  const title = normalizeText(input.title)
  const message = normalizeText(input.message)

  if (!title) {
    return { reminder: null, error: "Enter a reminder title." }
  }

  if (!message) {
    return { reminder: null, error: "Enter a reminder message." }
  }

  if (!input.dueDate) {
    return { reminder: null, error: "Select a due date." }
  }

  if (!options?.isAutomatic) {
    const { data: existing, error: existingError } = await supabase
      .from("client_reminders")
      .select("id")
      .eq("member_id", input.memberId)
      .eq("reminder_type", input.reminderType)
      .eq("status", "open")
      .maybeSingle()

    if (existingError) {
      console.error("[client_reminders] duplicate check failed:", existingError.message)
      return { reminder: null, error: existingError.message }
    }

    if (existing) {
      return {
        reminder: null,
        error: "An open reminder of this type already exists for this member.",
      }
    }
  }

  const { data, error } = await supabase
    .from("client_reminders")
    .insert({
      coach_id: coachId,
      member_id: input.memberId,
      reminder_type: input.reminderType,
      title,
      message,
      due_date: input.dueDate,
      priority: input.priority,
      status: "open",
      is_automatic: options?.isAutomatic ?? false,
    })
    .select()
    .single()

  if (error) {
    console.error("[client_reminders] insert failed:", error.message)
    if (error.message.includes("client_reminders_open_type_unique")) {
      return {
        reminder: null,
        error: "An open reminder of this type already exists for this member.",
      }
    }
    return { reminder: null, error: error.message }
  }

  return { reminder: mapClientReminderRow(data), error: null }
}

export async function updateMemberClientReminderStatus(
  supabase: SupabaseClient<Database>,
  reminderId: string,
  status: ClientReminderStatus,
): Promise<{ reminder: ClientReminder | null; error: string | null }> {
  const { data, error } = await supabase
    .from("client_reminders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reminderId)
    .select()
    .single()

  if (error) {
    console.error("[client_reminders] update failed:", error.message)
    if (error.message.includes("client_reminders_open_type_unique")) {
      return {
        reminder: null,
        error: "An open reminder of this type already exists for this member.",
      }
    }
    return { reminder: null, error: error.message }
  }

  return { reminder: mapClientReminderRow(data), error: null }
}

export async function deleteMemberClientReminder(
  supabase: SupabaseClient<Database>,
  reminderId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("client_reminders")
    .delete()
    .eq("id", reminderId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

type LatestDateResult = {
  value: string | null
  error: string | null
}

async function getLatestCheckInDate(
  supabase: SupabaseClient<Database>,
  memberId: string,
): Promise<LatestDateResult> {
  const { data, error } = await supabase
    .from("client_checkins")
    .select("checkin_date")
    .eq("member_id", memberId)
    .order("checkin_date", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return {
      value: null,
      error: reportSupabaseError(
        "[client_reminders] latest check-in date failed",
        error,
        { fallbackMessage: "Failed to load latest check-in date." },
      ),
    }
  }

  return { value: data?.checkin_date ?? null, error: null }
}

async function getLatestHabitLogDate(
  supabase: SupabaseClient<Database>,
  memberId: string,
): Promise<LatestDateResult> {
  const { data, error } = await supabase
    .from("client_habits")
    .select("logged_at")
    .eq("member_id", memberId)
    .order("logged_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return {
      value: null,
      error: reportSupabaseError(
        "[client_reminders] latest habit log date failed",
        error,
        { fallbackMessage: "Failed to load latest habit log date." },
      ),
    }
  }

  return { value: data?.logged_at ?? null, error: null }
}

async function getLatestProgressLogDate(
  supabase: SupabaseClient<Database>,
  memberId: string,
): Promise<LatestDateResult> {
  const { data, error } = await supabase
    .from("progress_logs")
    .select("updated_at")
    .eq("member_id", memberId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return {
      value: null,
      error: reportSupabaseError(
        "[client_reminders] latest progress log date failed",
        error,
        { fallbackMessage: "Failed to load latest progress log date." },
      ),
    }
  }

  return { value: data?.updated_at ?? null, error: null }
}

async function getLatestWorkoutCompletionDate(
  supabase: SupabaseClient<Database>,
  memberId: string,
): Promise<LatestDateResult> {
  const { data, error } = await supabase
    .from("workout_completions")
    .select("completed_at")
    .eq("member_id", memberId)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return {
      value: null,
      error: reportSupabaseError(
        "[client_reminders] latest workout completion date failed",
        error,
        { fallbackMessage: "Failed to load latest workout completion date." },
      ),
    }
  }

  return { value: data?.completed_at ?? null, error: null }
}

function isThresholdExceeded(
  latestValue: string | null,
  daysThreshold: number,
): boolean {
  if (!latestValue) return true
  const elapsed = daysSince(latestValue)
  if (elapsed == null) return true
  return elapsed >= daysThreshold
}

export async function syncAutomaticClientReminders(
  supabase: SupabaseClient<Database>,
  coachId: string,
  memberId: string,
): Promise<{ error: string | null }> {
  const [
    checkInResult,
    habitResult,
    progressResult,
    workoutResult,
    existingResult,
  ] = await Promise.all([
    getLatestCheckInDate(supabase, memberId),
    getLatestHabitLogDate(supabase, memberId),
    getLatestProgressLogDate(supabase, memberId),
    getLatestWorkoutCompletionDate(supabase, memberId),
    fetchMemberClientReminders(supabase, memberId),
  ])

  const metricErrors = [
    checkInResult.error,
    habitResult.error,
    progressResult.error,
    workoutResult.error,
  ].filter((message): message is string => message != null)

  if (metricErrors.length > 0) {
    return { error: metricErrors[0] }
  }

  if (existingResult.error) {
    return { error: existingResult.error }
  }

  const openTypes = new Set(
    existingResult.reminders
      .filter((reminder) => reminder.status === "open")
      .map((reminder) => reminder.reminder_type),
  )

  const latestByRule: Record<string, string | null> = {
    check_in_missing: checkInResult.value,
    habit_inactive: habitResult.value,
    progress_update_needed: progressResult.value,
    workout_completion_missing: workoutResult.value,
  }

  for (const rule of AUTOMATIC_REMINDER_RULES) {
    if (openTypes.has(rule.reminderType)) continue

    const latestValue = latestByRule[rule.reminderType] ?? null
    if (!isThresholdExceeded(latestValue, rule.daysThreshold)) continue

    const result = await insertMemberClientReminder(
      supabase,
      coachId,
      {
        memberId,
        reminderType: rule.reminderType,
        title: rule.title,
        message: rule.message,
        dueDate: todayIsoDate(),
        priority: rule.priority,
      },
      { isAutomatic: true },
    )

    if (result.error) {
      if (result.error.includes("client_reminders_open_type_unique")) {
        continue
      }
      return { error: result.error }
    }
  }

  return { error: null }
}

export function formatClientReminderDate(value: string): string {
  const parsed = parseDateValue(value)
  if (!parsed) return "—"

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export const CLIENT_REMINDER_TYPE_OPTIONS: {
  value: ClientReminderType
  label: string
}[] = [
  { value: "general", label: "General" },
  { value: "follow_up", label: "Follow-up" },
  { value: "check_in", label: "Check-in" },
  { value: "workout", label: "Workout" },
  { value: "nutrition", label: "Nutrition" },
  { value: "progress", label: "Progress" },
  { value: "session", label: "Session" },
  { value: "admin", label: "Admin" },
]

export const CLIENT_REMINDER_PRIORITY_OPTIONS: {
  value: ClientReminderPriority
  label: string
}[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

export function clientReminderTypeLabel(type: ClientReminderType): string {
  const automatic = AUTOMATIC_REMINDER_RULES.find(
    (rule) => rule.reminderType === type,
  )
  if (automatic) return automatic.title

  return (
    CLIENT_REMINDER_TYPE_OPTIONS.find((option) => option.value === type)?.label ??
    "Reminder"
  )
}

export function clientReminderPriorityLabel(
  priority: ClientReminderPriority,
): string {
  return (
    CLIENT_REMINDER_PRIORITY_OPTIONS.find((option) => option.value === priority)
      ?.label ?? priority
  )
}
