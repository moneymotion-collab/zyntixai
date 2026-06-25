import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { generateFullDemoForCoach } from "@/lib/demo/generate-full-demo"
import { setDemoWorkspaceFlag } from "@/lib/workspace/workspace-mode"

export type LoadDemoWorkspaceResult =
  | { ok: true; membersCreated: number }
  | { ok: false; error: string }

/** Canonical demo population: full showcase data scoped to the current coach. */
export async function loadDemoWorkspaceForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
  userEmail: string | null,
): Promise<LoadDemoWorkspaceResult> {
  const result = await generateFullDemoForCoach(supabase, userId, userEmail)

  if (!result.ok) {
    return result
  }

  await setDemoWorkspaceFlag(supabase, userId, true)

  return { ok: true, membersCreated: result.membersCreated }
}
