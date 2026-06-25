import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { canAccessMemberProgress } from "@/lib/progress/member-access"

export type CoachNoteRow = Database["public"]["Tables"]["coach_notes"]["Row"]

export async function fetchMemberCoachNotes(
  supabase: SupabaseClient<Database>,
  memberId: string,
  limit = 10,
): Promise<{ notes: CoachNoteRow[]; error: string | null }> {
  try {
    const allowed = await canAccessMemberProgress(supabase, memberId)
    if (!allowed) {
      return { notes: [], error: "You do not have access to this member's notes." }
    }

    const { data, error } = await supabase
      .from("coach_notes")
      .select("*")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) return { notes: [], error: error.message }
    return { notes: data ?? [], error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load coach notes"
    return { notes: [], error: message }
  }
}
