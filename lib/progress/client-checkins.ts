import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { parseProgressDate } from "@/lib/progress/progress-date"

export type ClientCheckInRow = Database["public"]["Tables"]["client_checkins"]["Row"]

export type ClientCheckInInput = {
  memberId: string
  memberName: string
  weight: number | null
  energy: number | null
  sleep: number | null
  motivation: number | null
  checkInDate: string
}

function normalizeOptionalNumber(value: number | null): number | null {
  if (value == null || Number.isNaN(Number(value))) return null
  return Number(value)
}

export async function fetchClientCheckins(
  supabase: SupabaseClient<Database>,
  limit?: number,
): Promise<{ data: ClientCheckInRow[]; error: string | null }> {
  let query = supabase
    .from("client_checkins")
    .select("*")
    .order("checkin_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (limit != null) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data ?? [], error: null }
}

export async function insertClientCheckin(
  supabase: SupabaseClient<Database>,
  coachId: string,
  input: ClientCheckInInput,
): Promise<{ data: ClientCheckInRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("client_checkins")
    .insert({
      coach_id: coachId,
      member_id: input.memberId,
      member_name: input.memberName.trim(),
      weight: normalizeOptionalNumber(input.weight),
      energy: normalizeOptionalNumber(input.energy),
      sleep: normalizeOptionalNumber(input.sleep),
      motivation: normalizeOptionalNumber(input.motivation),
      checkin_date: input.checkInDate,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export type ClientCheckInCoachNotesInput = {
  coachNote: string | null
  actionPlan: string | null
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed || null
}

export async function updateClientCheckinCoachNotes(
  supabase: SupabaseClient<Database>,
  checkInId: string,
  input: ClientCheckInCoachNotesInput,
): Promise<{ data: ClientCheckInRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("client_checkins")
    .update({
      coach_note: normalizeOptionalText(input.coachNote),
      action_plan: normalizeOptionalText(input.actionPlan),
    })
    .eq("id", checkInId)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
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

export function formatCheckInDate(value: string): string {
  const parsed = parseProgressDate(value)
  if (!parsed) return "—"

  const formatted = parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  if (formatted.toLowerCase().includes("invalid")) return "—"
  return formatted
}
