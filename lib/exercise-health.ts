import type { Exercise } from "@/lib/exercise-library"
import { parseCoachTips } from "@/lib/exercise-metadata"

export type ExerciseLibraryHealthStats = {
  total: number
  missingInstructions: number
  missingTips: number
  missingCategories: number
  missingDifficulty: number
  missingEquipment: number
}

function isBlank(value: string | null | undefined): boolean {
  return !value?.trim()
}

function hasTips(exercise: Exercise): boolean {
  if (exercise.tips?.trim()) return true
  return parseCoachTips(exercise.coach_tips).length > 0
}

export function computeExerciseLibraryHealth(
  exercises: Exercise[],
): ExerciseLibraryHealthStats {
  return {
    total: exercises.length,
    missingInstructions: exercises.filter((exercise) =>
      isBlank(exercise.instructions),
    ).length,
    missingTips: exercises.filter((exercise) => !hasTips(exercise)).length,
    missingCategories: exercises.filter((exercise) => isBlank(exercise.category))
      .length,
    missingDifficulty: exercises.filter((exercise) => isBlank(exercise.difficulty))
      .length,
    missingEquipment: exercises.filter((exercise) => isBlank(exercise.equipment))
      .length,
  }
}
