import type { Database } from "@/lib/database.types"

type NutritionPlansRow = Database["public"]["Tables"]["nutrition_plans"]["Row"]

export type NutritionPlansOwnerColumn = Extract<
  keyof NutritionPlansRow,
  "created_by"
>

const NUTRITION_PLANS_ROW_COLUMN_KEYS = new Set<string>(
  Object.keys({
    created_by: true,
    title: true,
    goal: true,
    calories: true,
    protein: true,
    carbs: true,
    fats: true,
    description: true,
  } satisfies Partial<Record<keyof NutritionPlansRow, true>>),
)

export function resolveNutritionPlansOwnerColumn(): NutritionPlansOwnerColumn {
  if (NUTRITION_PLANS_ROW_COLUMN_KEYS.has("created_by")) {
    return "created_by"
  }

  return "created_by"
}
