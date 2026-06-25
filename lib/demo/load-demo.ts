import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { loadDemoWorkspaceForCoach } from "@/lib/demo/load-demo-workspace"

export type LoadDemoResult = { ok: true } | { ok: false; error: string }

/** @deprecated Use loadDemoWorkspaceForCoach — kept for /api/demo/load compatibility. */
export async function loadDemoForCoach(
  supabase: SupabaseClient<Database>,
  coachId: string,
  coachEmail: string | null,
): Promise<LoadDemoResult> {
  const result = await loadDemoWorkspaceForCoach(supabase, coachId, coachEmail)

  if (!result.ok) {
    return result
  }

  return { ok: true }
}
