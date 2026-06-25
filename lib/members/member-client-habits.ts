import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type {
  ClientHabit,
  ClientHabitType,
  CreateClientHabitInput,
} from "@/lib/types/client-habits"

type ClientHabitRow = Database["public"]["Tables"]["client_habits"]["Row"]

const HABIT_TYPES = new Set<ClientHabitType>([
  "general",
  "nutrition",
  "sleep",
  "movement",
  "mindset",
  "recovery",
  "other",
])

function normalizeHabitType(value: string): ClientHabitType {
  if (HABIT_TYPES.has(value as ClientHabitType)) {
    return value as ClientHabitType
  }
  return "general"
}

function normalizeText(value: string): string {
  return value.trim()
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed || null
}

function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function mapClientHabitRow(row: ClientHabitRow): ClientHabit {
  return {
    id: row.id,
    coach_id: row.coach_id,
    member_id: row.member_id,
    habit_name: row.habit_name,
    habit_type: normalizeHabitType(row.habit_type),
    logged_at: row.logged_at,
    notes: row.notes,
    created_at: row.created_at,
  }
}

export async function fetchMemberClientHabits(
  supabase: SupabaseClient<Database>,
  memberId: string,
): Promise<{ habits: ClientHabit[]; error: string | null }> {
  const { data, error } = await supabase
    .from("client_habits")
    .select("*")
    .eq("member_id", memberId)
    .order("logged_at", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[client_habits] fetch failed:", error.message)
    return { habits: [], error: error.message }
  }

  return {
    habits: (data ?? []).map(mapClientHabitRow),
    error: null,
  }
}

export async function insertMemberClientHabit(
  supabase: SupabaseClient<Database>,
  coachId: string,
  input: CreateClientHabitInput,
): Promise<{ habit: ClientHabit | null; error: string | null }> {
  const habitName = normalizeText(input.habitName)
  const habitDate = input.habitDate || todayIsoDate()

  if (!habitName) {
    return { habit: null, error: "Enter a habit name." }
  }

  const { data: existing, error: existingError } = await supabase
    .from("client_habits")
    .select("id")
    .eq("member_id", input.memberId)
    .eq("logged_at", habitDate)
    .maybeSingle()

  if (existingError) {
    console.error("[client_habits] duplicate check failed:", existingError.message)
    return { habit: null, error: existingError.message }
  }

  if (existing) {
    return {
      habit: null,
      error: "A habit log already exists for this member on that date.",
    }
  }

  const { data, error } = await supabase
    .from("client_habits")
    .insert({
      coach_id: coachId,
      member_id: input.memberId,
      habit_name: habitName,
      habit_type: input.habitType,
      logged_at: habitDate,
      notes: normalizeOptionalText(input.notes),
    })
    .select()
    .single()

  if (error) {
    console.error("[client_habits] insert failed:", error.message)
    if (error.message.includes("client_habits_member_date_unique")) {
      return {
        habit: null,
        error: "A habit log already exists for this member on that date.",
      }
    }
    return { habit: null, error: error.message }
  }

  return { habit: mapClientHabitRow(data), error: null }
}

export async function deleteMemberClientHabit(
  supabase: SupabaseClient<Database>,
  habitId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("client_habits").delete().eq("id", habitId)

  if (error) {
    console.error("[client_habits] delete failed:", error.message)
    return { error: error.message }
  }

  return { error: null }
}

export function formatClientHabitDate(value: string): string {
  const parsed = new Date(`${value.trim()}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return "—"

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export const CLIENT_HABIT_TYPE_OPTIONS: {
  value: ClientHabitType
  label: string
}[] = [
  { value: "general", label: "General" },
  { value: "nutrition", label: "Nutrition" },
  { value: "sleep", label: "Sleep" },
  { value: "movement", label: "Movement" },
  { value: "mindset", label: "Mindset" },
  { value: "recovery", label: "Recovery" },
  { value: "other", label: "Other" },
]

export function clientHabitTypeLabel(type: ClientHabitType): string {
  return (
    CLIENT_HABIT_TYPE_OPTIONS.find((option) => option.value === type)?.label ??
    "General"
  )
}
