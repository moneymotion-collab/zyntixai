import type { Database } from "@/lib/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export type EnsureProfileParams = {
  email?: string | null
  role?: "member" | "coach" | string
}

/**
 * Creates or updates the authenticated user's profile row via RPC.
 * Defaults: member and coach = trial + 7 days; coach = auto-approved.
 * Matches `buildNewProfileFields` in `@/lib/profile-defaults`.
 * Prefer this over direct `profiles` inserts (RLS + id must match auth.uid()).
 */
export async function ensureUserProfile(
  supabase: SupabaseClient<Database>,
  { email = null, role = "member" }: EnsureProfileParams = {},
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.rpc("ensure_profile", {
    p_email: email,
    p_role: role,
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
