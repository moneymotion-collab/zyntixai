import type { SupabaseClient } from "@supabase/supabase-js"
import { getCoachMemberIds, getCoachScope } from "@/lib/auth/coach-scope"
import type { Database } from "@/lib/database.types"

export type AiCoachThreadRow =
  Database["public"]["Tables"]["ai_coach_threads"]["Row"] & {
    members: Pick<
      Database["public"]["Tables"]["members"]["Row"],
      "full_name" | "coach_id"
    > | null
  }

export async function fetchAiCoachThreads(
  supabase: SupabaseClient<Database>,
): Promise<{ data: AiCoachThreadRow[]; error: string | null }> {
  const scope = await getCoachScope(supabase)

  let query = supabase
    .from("ai_coach_threads")
    .select(
      `
      *,
      members (
        full_name,
        coach_id
      )
    `,
    )
    .order("last_active", { ascending: false })

  if (scope.isCoach && scope.userId) {
    const memberIds = await getCoachMemberIds(supabase, scope.userId)

    if (memberIds.length === 0) {
      return { data: [], error: null }
    }

    query = query.in("member_id", memberIds)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data as AiCoachThreadRow[]) ?? [], error: null }
}
