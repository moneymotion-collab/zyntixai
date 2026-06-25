import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { demoFilter } from "@/lib/demo/demo-query-helpers"
import { insertWithSchemaFallback } from "@/lib/demo/insert-with-schema-fallback"
import { resolveNutritionPlansOwnerColumn } from "@/lib/demo/nutrition-plans-owner-column"

export type LoadDemoNutritionPlanSeed = {
  title: string
  goal: string
  description: string
  calories: number
  protein: number
  carbs: number
  fats: number
}

export const LOAD_DEMO_NUTRITION_PLAN_SEEDS: LoadDemoNutritionPlanSeed[] = [
  {
    title: "Fat Loss Plan",
    goal: "Fat loss",
    description: "High-protein fat loss plan for steady progress.",
    calories: 2200,
    protein: 180,
    carbs: 200,
    fats: 70,
  },
  {
    title: "Muscle Gain Plan",
    goal: "Muscle gain",
    description: "Performance-focused muscle gain plan.",
    calories: 3200,
    protein: 220,
    carbs: 350,
    fats: 90,
  },
]

export const LOAD_DEMO_NUTRITION_PLAN_TITLES = LOAD_DEMO_NUTRITION_PLAN_SEEDS.map(
  (plan) => plan.title,
)

const LOAD_DEMO_NUTRITION_PLAN_LEGACY_TITLES = [
  "Fat Loss Nutrition Plan",
  "Muscle Gain Nutrition Plan",
]

const LOAD_DEMO_NUTRITION_PLAN_CLEAR_TITLES = [
  ...LOAD_DEMO_NUTRITION_PLAN_TITLES,
  ...LOAD_DEMO_NUTRITION_PLAN_LEGACY_TITLES,
]

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

async function clearLegacyLoadDemoNutritionPlans(
  supabase: SupabaseClient<Database>,
  userId: string,
  ownerColumn: ReturnType<typeof resolveNutritionPlansOwnerColumn>,
): Promise<{ plansDeleted: number; error: string | null }> {
  const { data, error } = await supabase
    .from("nutrition_plans")
    .select("id")
    .eq(ownerColumn, userId)
    .in("title", LOAD_DEMO_NUTRITION_PLAN_CLEAR_TITLES)

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

async function clearLoadDemoNutritionPlansForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ plansDeleted: number; error: string | null }> {
  const ownerColumn = resolveNutritionPlansOwnerColumn()

  const { data, error } = await demoFilter(supabase, "nutrition_plans")
    .eq(ownerColumn, userId)
    .eq("is_demo", true)
    .in("title", LOAD_DEMO_NUTRITION_PLAN_CLEAR_TITLES)
    .select("id")

  if (error) {
    if (error.message.includes("is_demo")) {
      return clearLegacyLoadDemoNutritionPlans(supabase, userId, ownerColumn)
    }

    return { plansDeleted: 0, error: error.message }
  }

  const ids =
    ((data as Array<{ id: string }> | null) ?? []).map((row) => row.id)

  if (ids.length === 0) {
    return clearLegacyLoadDemoNutritionPlans(supabase, userId, ownerColumn)
  }

  await deleteNutritionPlanDependencies(supabase, ids)

  const { error: deleteError, count } = await demoFilter(
    supabase,
    "nutrition_plans",
  )
    .delete({ count: "exact" })
    .eq(ownerColumn, userId)
    .eq("is_demo", true)
    .in("title", LOAD_DEMO_NUTRITION_PLAN_CLEAR_TITLES)
    .select()

  if (deleteError) {
    return { plansDeleted: 0, error: deleteError.message }
  }

  return { plansDeleted: count ?? ids.length, error: null }
}

export async function loadDemoNutritionPlansForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ nutritionPlansCreated: number; error: string | null }> {
  const clearResult = await clearLoadDemoNutritionPlansForCoach(supabase, userId)

  if (clearResult.error) {
    return { nutritionPlansCreated: 0, error: clearResult.error }
  }

  const rows = LOAD_DEMO_NUTRITION_PLAN_SEEDS.map((plan) => ({
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
