import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import exerciseCatalog from "@/lib/exercise-seed-catalog.json"
import { getExerciseEnrichment } from "@/lib/exercise-enrichment"

export type ExerciseSeedRow = {
  name: string
  category: string
  primary_muscle: string
  secondary_muscles: string[]
  equipment: string
  difficulty: string
  instructions: string
  tips: string
  image_url: null
  video_url: null
}

export const EXERCISE_SEED_CATALOG = exerciseCatalog as ExerciseSeedRow[]

export const EXERCISE_SEED_COUNT = EXERCISE_SEED_CATALOG.length

const BATCH_SIZE = 40

export async function seedExerciseCatalog(
  supabase: SupabaseClient<Database>,
): Promise<{ inserted: number; total: number; error: string | null }> {
  const { count: beforeCount, error: beforeError } = await supabase
    .from("exercises")
    .select("*", { count: "exact", head: true })

  if (beforeError) {
    return { inserted: 0, total: 0, error: beforeError.message }
  }

  for (let index = 0; index < EXERCISE_SEED_CATALOG.length; index += BATCH_SIZE) {
    const batch = EXERCISE_SEED_CATALOG.slice(index, index + BATCH_SIZE).map((row) => {
      const enrichment = getExerciseEnrichment(row.name)

      return {
        ...row,
        is_custom: false,
        form_steps: enrichment?.form_steps ?? [],
        common_mistakes: enrichment?.common_mistakes ?? [],
        coach_tips: enrichment?.coach_tips ?? [],
        image_urls: [],
      }
    })
    const { error } = await supabase.from("exercises").upsert(batch, {
      onConflict: "name",
      ignoreDuplicates: true,
    })

    if (error) {
      return {
        inserted: 0,
        total: beforeCount ?? 0,
        error: error.message,
      }
    }
  }

  const { count: afterCount, error: afterError } = await supabase
    .from("exercises")
    .select("*", { count: "exact", head: true })

  if (afterError) {
    return { inserted: 0, total: beforeCount ?? 0, error: afterError.message }
  }

  return {
    inserted: Math.max(0, (afterCount ?? 0) - (beforeCount ?? 0)),
    total: afterCount ?? 0,
    error: null,
  }
}
