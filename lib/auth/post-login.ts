import type { SupabaseClient } from "@supabase/supabase-js"
import {
  resolveRouteAfterAccessSync,
  syncProfileAccess,
} from "@/lib/auth/sync-profile-access"
import type { Database } from "@/lib/database.types"

export async function resolvePostLoginRoute(
  supabase: SupabaseClient<Database>,
): Promise<string> {
  const profile = await syncProfileAccess(supabase)
  return resolveRouteAfterAccessSync(supabase, profile)
}
