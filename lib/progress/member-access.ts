import type { SupabaseClient } from "@supabase/supabase-js"
import { getCoachMemberIds, getCoachScope } from "@/lib/auth/coach-scope"
import type { Database } from "@/lib/database.types"
import { resolveLinkedMemberId } from "@/lib/member-link"

export async function canAccessMemberProgress(
  supabase: SupabaseClient<Database>,
  memberId: string,
): Promise<boolean> {
  const scope = await getCoachScope(supabase)

  if (!scope.userId) return false
  if (scope.isAdmin) return true

  if (scope.isMember) {
    const linkedId = await resolveLinkedMemberId(supabase)
    return linkedId === memberId
  }

  if (scope.isCoach) {
    const coachMemberIds = await getCoachMemberIds(supabase, scope.userId)
    return coachMemberIds.includes(memberId)
  }

  return false
}
