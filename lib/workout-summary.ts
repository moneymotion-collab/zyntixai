export type WorkoutExercise = {
  name?: string | null
  exercise_name?: string | null
  sets?: number | null
  reps?: string | number | null
  primary_muscle?: string | null
  primaryMuscle?: string | null
  exercises?: {
    name?: string | null
    primary_muscle?: string | null
  } | null
}

export type WorkoutSummary = {
  totalExercises: number
  totalSets: number
  estimatedMinutes: number
  muscles: string[]
}

function getPrimaryMuscle(exercise: WorkoutExercise): string | null | undefined {
  return (
    exercise.primary_muscle ??
    exercise.primaryMuscle ??
    exercise.exercises?.primary_muscle
  )
}

export function calculateWorkoutSummary(exercises: WorkoutExercise[]): WorkoutSummary {
  const totalExercises = exercises.length

  const totalSets = exercises.reduce((sum, exercise) => {
    return sum + Number(exercise.sets || 0)
  }, 0)

  const estimatedMinutes = Math.max(15, totalSets * 3)

  const muscles = Array.from(
    new Set(
      exercises
        .map((exercise) => getPrimaryMuscle(exercise))
        .filter((muscle): muscle is string => Boolean(muscle)),
    ),
  )

  return {
    totalExercises,
    totalSets,
    estimatedMinutes,
    muscles,
  }
}

export function formatWorkoutDuration(minutes: number): string {
  if (minutes < 60) return `~${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (remainder === 0) return `~${hours} hr`
  return `~${hours} hr ${remainder} min`
}
