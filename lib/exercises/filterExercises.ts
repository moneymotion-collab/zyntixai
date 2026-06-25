import type { Database } from "@/lib/database.types"

export type Exercise = Database["public"]["Tables"]["exercises"]["Row"]

export type ExerciseFilters = {
  search: string
  /** Primary muscle group filter (`All` or a catalog muscle). */
  muscle: string
  equipment: string
  difficulty: string
  /** Workout type category (Strength, Hypertrophy, etc.). */
  workoutCategory?: string
}

export const DEFAULT_EXERCISE_FILTERS: ExerciseFilters = {
  search: "",
  muscle: "All",
  equipment: "All",
  difficulty: "All",
  workoutCategory: "All",
}

/** Muscle groups present in the exercise catalog. */
export const EXERCISE_MUSCLE_GROUPS = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Glutes",
  "Core",
  "Cardio",
  "Mobility",
  "Olympic Lifts",
  "Calisthenics",
  "Rehab/Prehab",
] as const

export const EXERCISE_WORKOUT_CATEGORIES = [
  "All",
  "Strength",
  "Hypertrophy",
  "Mobility",
  "Conditioning",
] as const

export const EXERCISE_EQUIPMENT_GROUPS = [
  "All",
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Bodyweight",
  "Kettlebell",
  "Resistance Band",
  "Ball",
  "Plate",
  "Foam Roller",
] as const

const ARMS_MUSCLES = ["Biceps", "Triceps"] as const

const EQUIPMENT_FILTER_ALIASES: Record<string, string> = {
  "cable machine": "Cable",
  cables: "Cable",
}

const EQUIPMENT_VALUE_ALIASES: Record<string, string> = {
  dumbbells: "Dumbbell",
  "cable machine": "Cable",
  "ez-bar": "Barbell",
  "smith machine": "Machine",
  "pull-up bar": "Bodyweight",
  "dip bars": "Bodyweight",
  bench: "Bodyweight",
  "t-bar row machine": "Machine",
  "mini band": "Resistance Band",
  "weight plate": "Plate",
  plate: "Plate",
  "belt squat machine": "Machine",
  "hyperextension bench": "Machine",
  "glute-ham developer": "Machine",
  "ab wheel": "Bodyweight",
  "medicine ball": "Ball",
  ball: "Ball",
  "foam roller": "Foam Roller",
  treadmill: "Machine",
  "exercise bike": "Machine",
  "rowing machine": "Machine",
  elliptical: "Machine",
  "assault bike": "Machine",
  "stair climber": "Machine",
  "battle ropes": "Bodyweight",
  "jump rope": "Bodyweight",
  "pro sled": "Machine",
  "plyo box": "Bodyweight",
  "ski erg": "Machine",
  versaclimber: "Machine",
  none: "Bodyweight",
}

function normalizeFilterText(value: string | null | undefined): string {
  if (value == null) return ""
  const trimmed = value.trim()
  if (!trimmed) return ""
  const lowered = trimmed.toLowerCase()
  if (lowered === "null" || lowered === "undefined") return ""
  return trimmed
}

export function normalizeEquipmentValue(equipment: string): string {
  const trimmed = equipment.trim()
  if (!trimmed) return "Bodyweight"
  const key = trimmed.toLowerCase()
  return EQUIPMENT_VALUE_ALIASES[key] ?? trimmed
}

export function normalizeEquipmentFilterValue(equipment: string): string {
  const trimmed = equipment.trim()
  if (!trimmed || trimmed.toLowerCase() === "all") return "All"
  const key = trimmed.toLowerCase()
  return EQUIPMENT_FILTER_ALIASES[key] ?? normalizeEquipmentValue(trimmed)
}

function equipmentMatchesFilter(
  exerciseEquipment: string | null | undefined,
  filterEquipment: string,
): boolean {
  if (filterEquipment === "All") return true

  const normalizedFilter = normalizeEquipmentFilterValue(filterEquipment)
  const normalizedExercise = normalizeEquipmentValue(
    normalizeFilterText(exerciseEquipment) || "Bodyweight",
  )

  if (normalizedFilter === "Bodyweight") {
    return (
      normalizedExercise === "Bodyweight" ||
      !normalizeFilterText(exerciseEquipment)
    )
  }

  return normalizedExercise.toLowerCase() === normalizedFilter.toLowerCase()
}

function muscleMatchesFilter(
  exercise: Exercise,
  filterMuscle: string,
): boolean {
  if (filterMuscle === "All") return true

  const primary = normalizeFilterText(exercise.primary_muscle)
  const secondary = (exercise.secondary_muscles ?? [])
    .map((muscle) => normalizeFilterText(muscle))
    .filter(Boolean)

  if (filterMuscle === "Arms") {
    return (
      ARMS_MUSCLES.some(
        (muscle) => primary.toLowerCase() === muscle.toLowerCase(),
      ) ||
      secondary.some((muscle) =>
        ARMS_MUSCLES.some(
          (armMuscle) => muscle.toLowerCase() === armMuscle.toLowerCase(),
        ),
      )
    )
  }

  const target = filterMuscle.toLowerCase()
  if (primary.toLowerCase() === target) return true
  return secondary.some((muscle) => muscle.toLowerCase() === target)
}

export function parseExerciseSearchTerms(query: string): string[] {
  return query
    .trim()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)
}

type SearchableField = {
  value: string
  weight: number
}

function getExerciseSearchableFields(exercise: Exercise): SearchableField[] {
  const equipment = normalizeFilterText(exercise.equipment)
  const normalizedEquipment = normalizeEquipmentValue(equipment)
  const secondaryMuscles = (exercise.secondary_muscles ?? [])
    .map((muscle) => normalizeFilterText(muscle))
    .filter(Boolean)
    .join(" ")

  return [
    { value: normalizeFilterText(exercise.name), weight: 5 },
    { value: normalizeFilterText(exercise.primary_muscle), weight: 3 },
    { value: normalizeFilterText(exercise.category), weight: 3 },
    { value: secondaryMuscles, weight: 2 },
    { value: normalizedEquipment, weight: 2 },
    { value: equipment, weight: 2 },
    { value: normalizeFilterText(exercise.difficulty), weight: 1 },
    { value: normalizeFilterText(exercise.instructions), weight: 1 },
    { value: normalizeFilterText(exercise.tips), weight: 1 },
  ].filter((field) => field.value.length > 0)
}

function scoreTermAgainstField(term: string, field: SearchableField): number {
  const lowerValue = field.value.toLowerCase()
  const lowerTerm = term.toLowerCase()

  if (lowerValue === lowerTerm) return field.weight * 3
  if (lowerValue.startsWith(lowerTerm)) return field.weight * 2
  if (lowerValue.includes(lowerTerm)) return field.weight
  return 0
}

export function scoreExerciseSearch(exercise: Exercise, terms: string[]): number {
  if (terms.length === 0) return 0

  const fields = getExerciseSearchableFields(exercise)
  let totalScore = 0

  for (const term of terms) {
    let bestTermScore = 0

    for (const field of fields) {
      bestTermScore = Math.max(bestTermScore, scoreTermAgainstField(term, field))
    }

    if (bestTermScore === 0) return -1
    totalScore += bestTermScore
  }

  return totalScore
}

export function exerciseMatchesSearch(exercise: Exercise, query: string): boolean {
  const terms = parseExerciseSearchTerms(query)
  if (terms.length === 0) return true
  return scoreExerciseSearch(exercise, terms) >= 0
}

export function filterExercises(
  exercises: Exercise[],
  filters: ExerciseFilters,
): Exercise[] {
  const searchTerms = parseExerciseSearchTerms(filters.search)
  const hasSearch = searchTerms.length > 0
  const muscleFilter =
    filters.muscle === "all" || filters.muscle === "All"
      ? "All"
      : filters.muscle
  const equipmentFilter =
    filters.equipment === "all" || filters.equipment === "All"
      ? "All"
      : filters.equipment
  const difficultyFilter =
    filters.difficulty === "all" || filters.difficulty === "All"
      ? "All"
      : filters.difficulty
  const workoutCategoryFilter = filters.workoutCategory ?? "All"

  const filtered = exercises.filter((exercise) => {
    if (hasSearch && !exerciseMatchesSearch(exercise, filters.search)) {
      return false
    }

    if (!muscleMatchesFilter(exercise, muscleFilter)) {
      return false
    }

    if (!equipmentMatchesFilter(exercise.equipment, equipmentFilter)) {
      return false
    }

    if (difficultyFilter !== "All") {
      const difficulty = normalizeFilterText(exercise.difficulty)
      if (difficulty.toLowerCase() !== difficultyFilter.toLowerCase()) {
        return false
      }
    }

    if (
      workoutCategoryFilter !== "All" &&
      workoutCategoryFilter !== "all"
    ) {
      const category = normalizeFilterText(exercise.category)
      if (category.toLowerCase() !== workoutCategoryFilter.toLowerCase()) {
        return false
      }
    }

    return true
  })

  if (!hasSearch) return filtered

  return [...filtered].sort((left, right) => {
    const scoreDelta =
      scoreExerciseSearch(right, searchTerms) -
      scoreExerciseSearch(left, searchTerms)
    if (scoreDelta !== 0) return scoreDelta

    const muscleCompare = left.primary_muscle.localeCompare(right.primary_muscle)
    if (muscleCompare !== 0) return muscleCompare

    return left.name.localeCompare(right.name)
  })
}
