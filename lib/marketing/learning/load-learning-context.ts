import type { Database } from "@/lib/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { buildLearningContextBlock } from "@/lib/marketing/learning/build-learning-context"
import { loadLatestLearningProfile } from "@/lib/marketing/learning/load-latest-learning-profile"

export async function loadLearningContextBlock(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ context: string | null; error: string | null }> {
  const { data, error } = await loadLatestLearningProfile(supabase, userId)

  if (error) {
    return { context: null, error }
  }

  if (!data) {
    return { context: null, error: null }
  }

  return {
    context: buildLearningContextBlock(data.profile),
    error: null,
  }
}
