import type { Database } from "@/lib/database.types"

type WorkoutPlansRow = Database["public"]["Tables"]["workout_plans"]["Row"]

export type WorkoutPlansOwnerColumn = Extract<
  keyof WorkoutPlansRow,
  "created_by"
>

const WORKOUT_PLANS_ROW_COLUMN_KEYS = new Set<string>(
  Object.keys({
    created_by: true,
    title: true,
    goal: true,
    weeks: true,
    is_demo: true,
  } satisfies Partial<Record<keyof WorkoutPlansRow, true>>),
)

export function resolveWorkoutPlansOwnerColumn(): WorkoutPlansOwnerColumn {
  if (WORKOUT_PLANS_ROW_COLUMN_KEYS.has("created_by")) {
    return "created_by"
  }

  return "created_by"
}
