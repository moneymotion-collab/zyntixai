import type { SupabaseClient } from "@supabase/supabase-js"
import { getCoachScope } from "@/lib/auth/coach-scope"
import type { Database } from "@/lib/database.types"
import { filterMembersForWorkspace } from "@/lib/demo/workspace-data-filter"
import { refreshCoachMemberLinks } from "@/lib/member-link"
import { fetchWorkspaceMode } from "@/lib/workspace/workspace-mode"

export type MemberStatus = "NEEDS_ATTENTION" | "OK"

export type MemberWithPlans = Database["public"]["Tables"]["members"]["Row"] & {
  workout_assignments: { id: string }[]
  member_nutrition_assignments: { nutrition_plan_id: string }[]
}

const MEMBERS_WITH_PLANS_SELECT = `
  *,
  workout_assignments ( id ),
  member_nutrition_assignments ( nutrition_plan_id )
`

export function getMemberStatus(member: MemberWithPlans): MemberStatus {
  const hasWorkout = member.workout_assignments.length > 0
  const hasNutrition = member.member_nutrition_assignments.length > 0

  if (!hasWorkout && !hasNutrition) return "NEEDS_ATTENTION"
  return "OK"
}

export async function fetchMembersWithPlans(
  supabase: SupabaseClient<Database>,
) {
  const scope = await getCoachScope(supabase)

  if (scope.isCoach || scope.isAdmin) {
    await refreshCoachMemberLinks(supabase)
  }

  let query = supabase
    .from("members")
    .select(MEMBERS_WITH_PLANS_SELECT)
    .order("created_at", { ascending: false })

  if (scope.isCoach && scope.userId) {
    query = query.eq("coach_id", scope.userId)
  }

  const { data, error } = await query

  const workspaceMode =
    scope.userId != null
      ? await fetchWorkspaceMode(supabase, scope.userId)
      : ("live" as const)

  return {
    data: filterMembersForWorkspace(
      (data ?? []) as MemberWithPlans[],
      workspaceMode,
    ),
    error,
  }
}

export async function fetchCoachMembersList(
  supabase: SupabaseClient<Database>,
): Promise<{
  data: Database["public"]["Tables"]["members"]["Row"][]
  error: Error | null
}> {
  const scope = await getCoachScope(supabase)

  let query = supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false })

  if (scope.isCoach && scope.userId) {
    query = query.eq("coach_id", scope.userId)
  }

  const { data, error } = await query

  const workspaceMode =
    scope.userId != null
      ? await fetchWorkspaceMode(supabase, scope.userId)
      : ("live" as const)

  return {
    data: filterMembersForWorkspace(data ?? [], workspaceMode),
    error,
  }
}
