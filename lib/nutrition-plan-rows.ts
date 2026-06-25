export type NutritionPlanRowSource = {
  title: string
  goal?: string | null
  calories?: number | null
  protein?: number | null
  carbs?: number | null
  fats?: number | null
}

export type NutritionPlanRow = {
  label: string
  value: string
}

export function buildNutritionPlanRows(
  plan: NutritionPlanRowSource,
  options?: { assignedCount?: number },
): NutritionPlanRow[] {
  const assignedCount = options?.assignedCount
  const rows: NutritionPlanRow[] = [
    { label: "📋 Title", value: plan.title },
    { label: "🎯 Goal", value: plan.goal?.trim() || "—" },
    {
      label: "🔥 Calories",
      value: plan.calories != null ? `${plan.calories} kcal` : "—",
    },
    {
      label: "💪 Protein",
      value: plan.protein != null ? `${plan.protein}g` : "—",
    },
    {
      label: "🍚 Carbs",
      value: plan.carbs != null ? `${plan.carbs}g` : "—",
    },
    {
      label: "🥑 Fats",
      value: plan.fats != null ? `${plan.fats}g` : "—",
    },
  ]

  if (assignedCount !== undefined) {
    rows.push({
      label: "👥 Members",
      value:
        assignedCount > 0
          ? `${assignedCount} assigned ${
              assignedCount === 1 ? "member" : "members"
            }`
          : "Not assigned yet",
    })
  }

  return rows
}
