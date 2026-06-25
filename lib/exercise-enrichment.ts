import enrichmentCatalog from "@/lib/exercise-seed-enrichment.json"
import type { CoachTip, CommonMistake, FormStep } from "@/lib/exercise-metadata"

export type ExerciseEnrichmentContent = {
  form_steps: FormStep[]
  common_mistakes: CommonMistake[]
  coach_tips: CoachTip[]
}

export const EXERCISE_SEED_ENRICHMENT = enrichmentCatalog as Record<
  string,
  ExerciseEnrichmentContent
>

export const ENRICHED_EXERCISE_COUNT = Object.keys(EXERCISE_SEED_ENRICHMENT).length

export function getExerciseEnrichment(
  name: string,
): ExerciseEnrichmentContent | null {
  return EXERCISE_SEED_ENRICHMENT[name] ?? null
}

export function mergeExerciseEnrichment<
  T extends {
    name: string
    form_steps?: unknown
    common_mistakes?: unknown
    coach_tips?: unknown
  },
>(exercise: T): T {
  const enrichment = getExerciseEnrichment(exercise.name)
  if (!enrichment) return exercise

  return {
    ...exercise,
    form_steps: enrichment.form_steps,
    common_mistakes: enrichment.common_mistakes,
    coach_tips: enrichment.coach_tips,
  }
}

export function mergeCatalogEnrichment<T extends { name: string }>(
  exercises: T[],
): T[] {
  return exercises.map((exercise) => mergeExerciseEnrichment(exercise))
}
