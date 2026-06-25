import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type {
  ClientCheckIn,
  ClientCheckInTrendSummary,
  CreateClientCheckInInput,
} from "@/lib/types/client-check-ins"

type ClientCheckInRow = Database["public"]["Tables"]["client_checkins"]["Row"]

function normalizeOptionalNumber(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(Number(value))) return null
  return Number(value)
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

export function mapClientCheckInRow(row: ClientCheckInRow): ClientCheckIn {
  return {
    id: row.id,
    coach_id: row.coach_id,
    member_id: row.member_id,
    check_in_date: row.checkin_date,
    weight: row.weight,
    energy: row.energy,
    sleep_quality: row.sleep_quality ?? row.sleep,
    stress: row.stress,
    hunger: row.hunger,
    mood: row.mood,
    wins: row.wins,
    struggles: row.struggles,
    notes: row.notes,
    created_at: row.created_at,
  }
}

function average(values: number[]): number | null {
  if (values.length === 0) return null
  const total = values.reduce((sum, value) => sum + value, 0)
  return Math.round((total / values.length) * 10) / 10
}

export function computeClientCheckInTrendSummary(
  checkIns: ClientCheckIn[],
): ClientCheckInTrendSummary {
  const latestWeight =
    checkIns.find((checkIn) => checkIn.weight != null)?.weight ?? null

  const energyValues = checkIns
    .map((checkIn) => checkIn.energy)
    .filter((value): value is number => value != null)
  const sleepValues = checkIns
    .map((checkIn) => checkIn.sleep_quality)
    .filter((value): value is number => value != null)
  const stressValues = checkIns
    .map((checkIn) => checkIn.stress)
    .filter((value): value is number => value != null)

  return {
    latestWeight,
    averageEnergy: average(energyValues),
    averageSleep: average(sleepValues),
    averageStress: average(stressValues),
  }
}

export async function fetchMemberClientCheckIns(
  supabase: SupabaseClient<Database>,
  memberId: string,
): Promise<{ checkIns: ClientCheckIn[]; error: string | null }> {
  const { data, error } = await supabase
    .from("client_checkins")
    .select("*")
    .eq("member_id", memberId)
    .order("checkin_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    return { checkIns: [], error: error.message }
  }

  return {
    checkIns: (data ?? []).map(mapClientCheckInRow),
    error: null,
  }
}

function buildClientCheckInFields(input: CreateClientCheckInInput) {
  const sleepQuality = normalizeOptionalNumber(input.sleepQuality)

  return {
    member_name: input.memberName.trim(),
    checkin_date: input.checkInDate ?? todayIsoDate(),
    weight: normalizeOptionalNumber(input.weight),
    energy: normalizeOptionalNumber(input.energy),
    sleep_quality: sleepQuality,
    sleep: sleepQuality,
    stress: normalizeOptionalNumber(input.stress),
    hunger: normalizeOptionalNumber(input.hunger),
    mood: normalizeOptionalText(input.mood),
    wins: normalizeOptionalText(input.wins),
    struggles: normalizeOptionalText(input.struggles),
    notes: normalizeOptionalText(input.notes),
  }
}

export async function insertMemberClientCheckIn(
  supabase: SupabaseClient<Database>,
  coachId: string,
  input: CreateClientCheckInInput,
): Promise<{ checkIn: ClientCheckIn | null; error: string | null }> {
  const { data, error } = await supabase
    .from("client_checkins")
    .insert({
      coach_id: coachId,
      member_id: input.memberId,
      ...buildClientCheckInFields(input),
    })
    .select()
    .single()

  if (error) {
    return { checkIn: null, error: error.message }
  }

  return { checkIn: mapClientCheckInRow(data), error: null }
}

export async function upsertMemberSelfCheckIn(
  supabase: SupabaseClient<Database>,
  coachId: string,
  input: CreateClientCheckInInput,
): Promise<{
  checkIn: ClientCheckIn | null
  error: string | null
  updated: boolean
}> {
  if (!coachId) {
    return {
      checkIn: null,
      error: "Your account is not linked to a coach yet.",
      updated: false,
    }
  }

  const fields = buildClientCheckInFields(input)

  const { data: existing, error: lookupError } = await supabase
    .from("client_checkins")
    .select("id")
    .eq("member_id", input.memberId)
    .eq("checkin_date", fields.checkin_date)
    .maybeSingle()

  if (lookupError) {
    return { checkIn: null, error: lookupError.message, updated: false }
  }

  if (existing?.id) {
    const { data, error } = await supabase
      .from("client_checkins")
      .update(fields)
      .eq("id", existing.id)
      .select()
      .single()

    if (error) {
      return { checkIn: null, error: error.message, updated: false }
    }

    return { checkIn: mapClientCheckInRow(data), error: null, updated: true }
  }

  const { data, error } = await supabase
    .from("client_checkins")
    .insert({
      coach_id: coachId,
      member_id: input.memberId,
      ...fields,
    })
    .select()
    .single()

  if (error) {
    return { checkIn: null, error: error.message, updated: false }
  }

  return { checkIn: mapClientCheckInRow(data), error: null, updated: false }
}

export function getTodayIsoDate(): string {
  return todayIsoDate()
}

export function formatCheckInDate(value: string): string {
  const trimmed = value?.trim()
  if (!trimmed) return "—"

  const parsed = trimmed.includes("T")
    ? new Date(trimmed)
    : new Date(`${trimmed}T12:00:00`)

  if (Number.isNaN(parsed.getTime())) return "—"

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatCheckInWeight(value: number | null): string {
  if (value == null || Number.isNaN(Number(value))) return "—"
  const numeric = Number(value)
  return Number.isInteger(numeric) ? `${numeric} kg` : `${numeric.toFixed(1)} kg`
}

export function formatCheckInScore(value: number | null): string {
  if (value == null || Number.isNaN(Number(value))) return "—"
  return `${value}/10`
}
