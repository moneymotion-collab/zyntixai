import type { SupabaseClient, User } from "@supabase/supabase-js"
import type { UserRole } from "@/lib/types/roles"
import type { Database } from "@/lib/database.types"
import {
  assertMemberAccess,
  type AiCoachAuthContext,
} from "@/lib/ai-coach/access"
import {
  fetchCoachOverviewContext,
  fetchMemberContext,
  type AiCoachContext,
} from "@/lib/ai-coach/context"
import type { PlatformPageContext } from "./types"

function toCoachAuth(userId: string, role: "admin" | "coach"): AiCoachAuthContext {
  return {
    userId,
    role,
    isAdmin: role === "admin",
  }
}

export async function resolveCommandBarAiContext(
  supabase: SupabaseClient<Database>,
  user: User,
  role: UserRole,
  pageContext: PlatformPageContext,
): Promise<AiCoachContext> {
  if (role === "coach" || role === "admin") {
    const auth = toCoachAuth(user.id, role)

    if (pageContext.memberId) {
      const access = await assertMemberAccess(supabase, auth, pageContext.memberId)
      if (access.ok) {
        const memberContext = await fetchMemberContext(
          supabase,
          pageContext.memberId,
        )
        if (memberContext) return memberContext
      }
    }

    return fetchCoachOverviewContext(supabase, auth)
  }

  if (user.email) {
    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("email", user.email)
      .maybeSingle()

    if (member?.id) {
      const memberContext = await fetchMemberContext(supabase, member.id)
      if (memberContext) return memberContext
    }
  }

  return {
    scope: "overview",
    members: [],
    aggregate: {
      workoutAssignmentCount: 0,
      nutritionAssignmentCount: 0,
      progressLogCount: 0,
    },
  }
}
