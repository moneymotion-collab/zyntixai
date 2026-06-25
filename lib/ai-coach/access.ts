import type { SupabaseClient } from "@supabase/supabase-js"
import { getCoachMemberIds } from "@/lib/auth/coach-scope"
import { normalizeRole } from "@/lib/auth/roles"
import type { Database } from "@/lib/database.types"

export type AiCoachAuthContext = {
  userId: string
  role: "admin" | "coach"
  isAdmin: boolean
}

export async function getAiCoachAuth(
  supabase: SupabaseClient<Database>,
): Promise<
  | { ok: true; auth: AiCoachAuthContext }
  | { ok: false; status: number; error: string }
> {
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData.user) {
    return { ok: false, status: 401, error: "Not authenticated." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle()

  if (profileError) {
    return { ok: false, status: 500, error: profileError.message }
  }

  const role = normalizeRole(profile?.role)

  if (role !== "admin" && role !== "coach") {
    return { ok: false, status: 403, error: "AI Coach is only available to coaches and admins." }
  }

  return {
    ok: true,
    auth: {
      userId: userData.user.id,
      role,
      isAdmin: role === "admin",
    },
  }
}

export async function assertMemberAccess(
  supabase: SupabaseClient<Database>,
  auth: AiCoachAuthContext,
  memberId: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (auth.isAdmin) return { ok: true }

  const allowedIds = await getCoachMemberIds(supabase, auth.userId)

  if (!allowedIds.includes(memberId)) {
    return { ok: false, status: 403, error: "You do not have access to this member." }
  }

  return { ok: true }
}
