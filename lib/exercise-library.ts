import {
  DEFAULT_EXERCISE_FILTERS,
  EXERCISE_EQUIPMENT_GROUPS,
  EXERCISE_MUSCLE_GROUPS,
  EXERCISE_WORKOUT_CATEGORIES,
  exerciseMatchesSearch,
  filterExercises,
  normalizeEquipmentFilterValue,
  normalizeEquipmentValue,
  parseExerciseSearchTerms,
  scoreExerciseSearch,
  type Exercise,
  type ExerciseFilters,
} from "@/lib/exercises/filterExercises"

export type { Exercise }

export {
  DEFAULT_EXERCISE_FILTERS,
  exerciseMatchesSearch,
  filterExercises,
  normalizeEquipmentFilterValue,
  normalizeEquipmentValue,
  parseExerciseSearchTerms,
  scoreExerciseSearch,
  type ExerciseFilters,
}

/** Primary muscle groups for exercise filters. */
export const EXERCISE_CATEGORIES = EXERCISE_MUSCLE_GROUPS

/** @deprecated Use EXERCISE_CATEGORIES */
export const MUSCLE_GROUPS = EXERCISE_CATEGORIES

export const EQUIPMENT_GROUPS = EXERCISE_EQUIPMENT_GROUPS

export const WORKOUT_CATEGORIES = EXERCISE_WORKOUT_CATEGORIES

export const DIFFICULTIES = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
] as const

export type ActiveExerciseFilter = {
  key: keyof ExerciseFilters
  label: string
  value: string
}

export function hasActiveExerciseFilters(filters: ExerciseFilters): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.muscle !== "All" ||
    filters.equipment !== "All" ||
    filters.difficulty !== "All" ||
    (filters.workoutCategory != null && filters.workoutCategory !== "All")
  )
}

export function getActiveExerciseFilters(
  filters: ExerciseFilters,
): ActiveExerciseFilter[] {
  const active: ActiveExerciseFilter[] = []

  const search = filters.search.trim()
  if (search) {
    active.push({ key: "search", label: "Search", value: search })
  }
  if (filters.muscle !== "All") {
    active.push({ key: "muscle", label: "Muscle", value: filters.muscle })
  }
  if (filters.equipment !== "All") {
    active.push({ key: "equipment", label: "Equipment", value: filters.equipment })
  }
  if (filters.difficulty !== "All") {
    active.push({
      key: "difficulty",
      label: "Difficulty",
      value: filters.difficulty,
    })
  }
  if (filters.workoutCategory && filters.workoutCategory !== "All") {
    active.push({
      key: "workoutCategory",
      label: "Category",
      value: filters.workoutCategory,
    })
  }

  return active
}

export function formatExerciseResultCount(count: number): string {
  const noun = count === 1 ? "exercise" : "exercises"
  return `${count.toLocaleString()} ${noun} found`
}

/** @deprecated Use normalizeEquipmentValue from filterExercises */
export function normalizeEquipment(equipment: string): string {
  return normalizeEquipmentValue(equipment)
}

export function truncateText(text: string, maxLength = 140): string {
  const trimmed = text.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength).trimEnd()}…`
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  )
}

export function difficultyBadgeClass(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "badge-beginner"
    case "advanced":
      return "badge-advanced"
    default:
      return "badge-intermediate"
  }
}

export function muscleBadgeClass(): string {
  return "badge-muscle"
}

export function equipmentBadgeClass(): string {
  return "badge-equipment"
}
