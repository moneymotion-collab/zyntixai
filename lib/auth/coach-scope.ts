import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { normalizeRole } from "@/lib/auth/roles"
import { filterMembersForWorkspace } from "@/lib/demo/workspace-data-filter"
import type { UserRole } from "@/lib/types/roles"
import { fetchWorkspaceMode } from "@/lib/workspace/workspace-mode"

export type CoachScopeContext = {
  userId: string | null
  role: UserRole | null
  isAdmin: boolean
  isCoach: boolean
  isMember: boolean
}

export async function getCoachScope(
  supabase: SupabaseClient<Database>,
): Promise<CoachScopeContext> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id ?? null

  if (!userId) {
    return {
      userId: null,
      role: null,
      isAdmin: false,
      isCoach: false,
      isMember: false,
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  const role = normalizeRole(profile?.role)

  return {
    userId,
    role,
    isAdmin: role === "admin",
    isCoach: role === "coach",
    isMember: role === "member",
  }
}

export async function getCoachMemberIds(
  supabase: SupabaseClient<Database>,
  coachUserId: string,
): Promise<string[]> {
  const workspaceMode = await fetchWorkspaceMode(supabase, coachUserId)

  const { data } = await supabase
    .from("members")
    .select("id, email, is_demo")
    .eq("coach_id", coachUserId)

  return filterMembersForWorkspace(data ?? [], workspaceMode).map(
    (member) => member.id,
  )
}
