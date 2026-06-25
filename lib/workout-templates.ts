import type { Database } from "@/lib/database.types"
import type { WorkoutTemplateExerciseRow } from "@/lib/workout-template-exercises"

export type WorkoutExerciseInput = {
  name: string
  sets: number
  reps: number
}

export type WorkoutTemplatePreset = {
  title: string
  description: string
  exercises: WorkoutExerciseInput[]
}

export type WorkoutTemplateRow =
  Database["public"]["Tables"]["workout_templates"]["Row"]

export type WorkoutTemplateInsert =
  Database["public"]["Tables"]["workout_templates"]["Insert"]

export type WorkoutTemplate = WorkoutTemplateRow & {
  workout_template_exercises: WorkoutTemplateExerciseRow[]
}

export const PUSH_DAY_TEMPLATE: WorkoutTemplatePreset = {
  title: "Push Day",
  description:
    "Chest, shoulders, and triceps — horizontal and vertical pressing.",
  exercises: [
    { name: "Bench Press", sets: 4, reps: 8 },
    { name: "Shoulder Press", sets: 3, reps: 10 },
    { name: "Tricep Pushdown", sets: 3, reps: 12 },
  ],
}
