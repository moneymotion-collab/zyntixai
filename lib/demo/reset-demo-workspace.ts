import type { SupabaseClient } from "@supabase/supabase-js"
import { enterDemoWorkspace } from "@/lib/workspace/workspace-mode"
import type { Database } from "@/lib/database.types"

export const DEMO_RESET_SCOPE = [
  "Members",
  "Workouts",
  "Nutrition",
  "Progress",
  "Sessions",
  "Marketing",
  "Video Projects",
] as const

export type DemoResetScopeItem = (typeof DEMO_RESET_SCOPE)[number]

export async function resetDemoWorkspaceForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
  userEmail: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return enterDemoWorkspace(supabase, userId, userEmail)
}
