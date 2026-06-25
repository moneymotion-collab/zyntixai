import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

export async function markSessionCompleted(
  supabase: SupabaseClient<Database>,
  sessionId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("sessions")
    .update({ status: "voltooid" })
    .eq("id", sessionId)

  return { error: error?.message ?? null }
}

export async function updateSessionNotes(
  supabase: SupabaseClient<Database>,
  sessionId: string,
  notes: string,
): Promise<{ error: string | null }> {
  const trimmed = notes.trim()
  const { error } = await supabase
    .from("sessions")
    .update({ notes: trimmed || null })
    .eq("id", sessionId)

  return { error: error?.message ?? null }
}

export async function rescheduleSession(
  supabase: SupabaseClient<Database>,
  sessionId: string,
  input: { scheduledDate: string; scheduledTime: string },
): Promise<{ error: string | null }> {
  const scheduledAt = `${input.scheduledDate}T${input.scheduledTime}:00`

  const { error } = await supabase
    .from("sessions")
    .update({
      scheduled_date: input.scheduledDate,
      scheduled_time: input.scheduledTime,
      scheduled_at: scheduledAt,
      status: "gepland",
    })
    .eq("id", sessionId)

  return { error: error?.message ?? null }
}

export function buildViewSessionUrl(sessionId: string): string {
  return `/sessions?session=${encodeURIComponent(sessionId)}`
}

export function buildRescheduleSessionUrl(
  sessionId: string,
  memberId: string | null,
): string {
  const params = new URLSearchParams({ session: sessionId, reschedule: "1" })
  if (memberId) params.set("member", memberId)
  return `/sessions?${params.toString()}`
}
