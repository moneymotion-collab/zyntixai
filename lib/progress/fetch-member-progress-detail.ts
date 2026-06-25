import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type { ClientGoalViewModel } from "@/lib/progress/client-goals"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import { fetchProgressGoalsData } from "@/lib/progress/fetch-progress-goals-data"
import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"
import { canAccessMemberProgress } from "@/lib/progress/member-access"

type Member = Database["public"]["Tables"]["members"]["Row"]

export type MemberProgressDetailData = {
  member: Member
  logs: ProgressLogRow[]
  checkIns: ClientCheckInRow[]
  goals: ClientGoalViewModel[]
}

export async function fetchMemberProgressDetail(
  supabase: SupabaseClient<Database>,
  memberId: string,
): Promise<{ data: MemberProgressDetailData | null; error: string | null }> {
  try {
    const allowed = await canAccessMemberProgress(supabase, memberId)
    if (!allowed) {
      return { data: null, error: "You do not have access to this member's progress." }
    }

    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("*")
      .eq("id", memberId)
      .maybeSingle()

    if (memberError) return { data: null, error: memberError.message }
    if (!member) return { data: null, error: "Member not found." }

    const { data: logs, error: logsError } = await supabase
      .from("progress_logs")
      .select(
        `
        *,
        members (
          full_name
        )
      `,
      )
      .eq("member_id", memberId)
      .order("updated_at", { ascending: false })

    if (logsError) return { data: null, error: logsError.message }

    const progressLogs = (logs as ProgressLogRow[]) ?? []

    const goalsDataResult = await fetchProgressGoalsData(supabase, { memberId })
    if (goalsDataResult.error) {
      return { data: null, error: goalsDataResult.error }
    }

    return {
      data: {
        member,
        logs: progressLogs,
        checkIns: goalsDataResult.data.checkIns,
        goals: goalsDataResult.data.goals,
      },
      error: null,
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load member progress detail"
    return { data: null, error: message }
  }
}
