import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { demoFilter } from "@/lib/demo/demo-query-helpers"
import { insertWithSchemaFallback } from "@/lib/demo/insert-with-schema-fallback"
import { resolveNutritionPlansOwnerColumn } from "@/lib/demo/nutrition-plans-owner-column"

export const DEMO_NUTRITION_IS_DEMO_MIGRATION_SQL = `
alter table nutrition_plans add column if not exists is_demo boolean default false;
alter table member_nutrition_assignments add column if not exists is_demo boolean default false;
`.trim()

export type DemoNutritionPlanSeed = {
  title: string
  goal: string
  description: string
  calories: number
  protein: number
  carbs: number
  fats: number
}

export const DEMO_NUTRITION_PLAN_SEEDS: DemoNutritionPlanSeed[] = [
  {
    title: "Fat Loss Nutrition Plan",
    goal: "Fat Loss",
    description:
      "Moderate calorie deficit with high protein to preserve lean mass while losing body fat.",
    calories: 1850,
    protein: 190,
    carbs: 150,
    fats: 55,
  },
  {
    title: "Lean Bulk Nutrition Plan",
    goal: "Muscle Gain",
    description:
      "Controlled calorie surplus with balanced macros to support lean muscle gain.",
    calories: 2900,
    protein: 210,
    carbs: 330,
    fats: 75,
  },
  {
    title: "Performance Athlete Plan",
    goal: "Athletic Performance",
    description:
      "Carb-forward fueling to support intense training, recovery, and peak performance.",
    calories: 2700,
    protein: 175,
    carbs: 350,
    fats: 65,
  },
  {
    title: "Balanced Lifestyle Plan",
    goal: "Maintenance",
    description:
      "Flexible, sustainable macros for energy, health, and long-term adherence.",
    calories: 2300,
    protein: 150,
    carbs: 250,
    fats: 70,
  },
  {
    title: "High Protein Coaching Plan",
    goal: "High Protein",
    description:
      "Protein-prioritized plan for satiety, body composition, and regular coaching check-ins.",
    calories: 2100,
    protein: 220,
    carbs: 180,
    fats: 60,
  },
]

const DEMO_NUTRITION_PLAN_TITLES = DEMO_NUTRITION_PLAN_SEEDS.map(
  (plan) => plan.title,
)

async function deleteNutritionPlanDependencies(
  supabase: SupabaseClient<Database>,
  planIds: string[],
) {
  if (planIds.length === 0) return

  await supabase
    .from("member_nutrition_assignments")
    .delete()
    .in("nutrition_plan_id", planIds)
}

export async function clearDemoNutritionPlansForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ plansDeleted: number; error: string | null }> {
  const ownerColumn = resolveNutritionPlansOwnerColumn()

  const { data, error } = await demoFilter(supabase, "nutrition_plans")
    .eq(ownerColumn, userId)
    .eq("is_demo", true)
    .select("id")

  if (error) {
    if (error.message.includes("is_demo")) {
      return clearLegacyDemoNutritionPlans(supabase, userId, ownerColumn)
    }

    return { plansDeleted: 0, error: error.message }
  }

  const ids =
    ((data as Array<{ id: string }> | null) ?? []).map((row) => row.id)

  if (ids.length === 0) {
    const legacy = await clearLegacyDemoNutritionPlans(
      supabase,
      userId,
      ownerColumn,
    )
    return legacy
  }

  await deleteNutritionPlanDependencies(supabase, ids)

  const { error: deleteError, count } = await demoFilter(
    supabase,
    "nutrition_plans",
  )
    .delete({ count: "exact" })
    .eq(ownerColumn, userId)
    .eq("is_demo", true)
    .select()

  if (deleteError) {
    return { plansDeleted: 0, error: deleteError.message }
  }

  return { plansDeleted: count ?? ids.length, error: null }
}

async function clearLegacyDemoNutritionPlans(
  supabase: SupabaseClient<Database>,
  userId: string,
  ownerColumn: ReturnType<typeof resolveNutritionPlansOwnerColumn>,
): Promise<{ plansDeleted: number; error: string | null }> {
  const { data, error } = await supabase
    .from("nutrition_plans")
    .select("id")
    .eq(ownerColumn, userId)
    .in("title", DEMO_NUTRITION_PLAN_TITLES)

  if (error) {
    return { plansDeleted: 0, error: error.message }
  }

  const ids = data?.map((row) => row.id) ?? []

  if (ids.length === 0) {
    return { plansDeleted: 0, error: null }
  }

  await deleteNutritionPlanDependencies(supabase, ids)

  const { error: deleteError, count } = await supabase
    .from("nutrition_plans")
    .delete({ count: "exact" })
    .in("id", ids)
    .eq(ownerColumn, userId)

  if (deleteError) {
    return { plansDeleted: 0, error: deleteError.message }
  }

  return { plansDeleted: count ?? ids.length, error: null }
}

export async function generateDemoNutritionPlansForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ nutritionPlansCreated: number; error: string | null }> {
  const clearResult = await clearDemoNutritionPlansForCoach(supabase, userId)

  if (clearResult.error) {
    return { nutritionPlansCreated: 0, error: clearResult.error }
  }

  const rows = DEMO_NUTRITION_PLAN_SEEDS.map((plan) => ({
    title: plan.title,
    goal: plan.goal,
    description: plan.description,
    calories: plan.calories,
    protein: plan.protein,
    carbs: plan.carbs,
    fats: plan.fats,
    assigned_members: 0,
    created_by: userId,
  }))

  const insertResult = await insertWithSchemaFallback(
    supabase,
    "nutrition_plans",
    rows,
  )

  if (insertResult.error) {
    return { nutritionPlansCreated: 0, error: insertResult.error.message }
  }

  return { nutritionPlansCreated: insertResult.data?.length ?? 0, error: null }
}
