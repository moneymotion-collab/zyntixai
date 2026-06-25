export type PickedWorkoutExercise = {
  id: string
  exerciseId: string
  name: string
  category: string
  primaryMuscle: string
  equipment: string
  difficulty: string
  sets: number
  reps: string
  restSeconds: number
  notes: string
}

function createClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `picked-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function ensurePickedExerciseIds(
  items: PickedWorkoutExercise[],
): PickedWorkoutExercise[] {
  return items.map((item) =>
    item.id ? item : { ...item, id: createClientId() },
  )
}

export function createPickedExercise(
  exercise: {
    id: string
    name: string
    category: string
    primary_muscle: string
    equipment: string
    difficulty: string
  },
  overrides?: Partial<
    Pick<PickedWorkoutExercise, "sets" | "reps" | "restSeconds" | "notes">
  >,
): PickedWorkoutExercise {
  return {
    id: createClientId(),
    exerciseId: exercise.id,
    name: exercise.name,
    category: exercise.category,
    primaryMuscle: exercise.primary_muscle,
    equipment: exercise.equipment,
    difficulty: exercise.difficulty,
    sets: overrides?.sets ?? 3,
    reps: overrides?.reps ?? "10",
    restSeconds: overrides?.restSeconds ?? 60,
    notes: overrides?.notes ?? "",
  }
}

export function duplicatePickedExercise(
  item: PickedWorkoutExercise,
): PickedWorkoutExercise {
  return {
    ...item,
    id: createClientId(),
  }
}

export function mapPlanRowToPicked(row: {
  id: string
  exercise_id: string
  sets: number
  reps: string
  rest_seconds: number
  notes?: string | null
  exercises: {
    name: string
    category: string
    primary_muscle: string
    equipment: string
    difficulty: string
  } | null
}): PickedWorkoutExercise {
  return {
    id: row.id,
    exerciseId: row.exercise_id,
    name: row.exercises?.name ?? "Unknown exercise",
    category: row.exercises?.category ?? "",
    primaryMuscle: row.exercises?.primary_muscle ?? "General",
    equipment: row.exercises?.equipment ?? "Varies",
    difficulty: row.exercises?.difficulty ?? "Intermediate",
    sets: row.sets,
    reps: row.reps,
    restSeconds: row.rest_seconds,
    notes: row.notes ?? "",
  }
}

export function reorderPickedExercises(
  items: PickedWorkoutExercise[],
  fromIndex: number,
  toIndex: number,
): PickedWorkoutExercise[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items
  }

  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

export function removePickedExercise(
  items: PickedWorkoutExercise[],
  id: string,
): PickedWorkoutExercise[] {
  return items.filter((item) => item.id !== id)
}

export function updatePickedExercise(
  items: PickedWorkoutExercise[],
  id: string,
  patch: Partial<
    Pick<PickedWorkoutExercise, "sets" | "reps" | "restSeconds" | "notes">
  >,
): PickedWorkoutExercise[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

export function duplicatePickedExerciseAt(
  items: PickedWorkoutExercise[],
  id: string,
): PickedWorkoutExercise[] {
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) return items

  const duplicate = duplicatePickedExercise(items[index])
  const next = [...items]
  next.splice(index + 1, 0, duplicate)
  return next
}

export function mapTemplateExercisesToPicked(
  rows: Array<{
    exercise_id: string
    sets: number
    reps: string
    rest_seconds: number
    notes?: string | null
  }>,
  catalog: Array<{
    id: string
    name: string
    category: string
    primary_muscle: string
    equipment: string
    difficulty: string
  }>,
): PickedWorkoutExercise[] {
  return rows
    .map((row) => {
      const exercise = catalog.find((item) => item.id === row.exercise_id)
      if (!exercise) return null

      return createPickedExercise(exercise, {
        sets: row.sets,
        reps: row.reps,
        restSeconds: row.rest_seconds,
        notes: row.notes ?? "",
      })
    })
    .filter((item): item is PickedWorkoutExercise => item !== null)
}
