import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { resolveWorkoutPlansOwnerColumn } from "@/lib/demo/workout-plans-owner-column"

export type LoadDemoWorkoutPlanSeed = {
  title: string
  goal: string
  weeks: number
}

export const LOAD_DEMO_WORKOUT_PLAN_SEEDS: LoadDemoWorkoutPlanSeed[] = [
  {
    title: "Push Day",
    goal: "Chest, shoulders, and triceps hypertrophy.",
    weeks: 4,
  },
  {
    title: "Pull Day",
    goal: "Back and biceps strength and size.",
    weeks: 4,
  },
  {
    title: "Leg Day",
    goal: "Quads, hamstrings, and glutes development.",
    weeks: 4,
  },
]

export const LOAD_DEMO_WORKOUT_PLAN_TITLES = LOAD_DEMO_WORKOUT_PLAN_SEEDS.map(
  (plan) => plan.title,
)

async function deleteWorkoutPlanDependencies(
  supabase: SupabaseClient<Database>,
  planIds: string[],
) {
  if (planIds.length === 0) return

  await supabase
    .from("workout_assignments")
    .delete()
    .in("workout_plan_id", planIds)

  await supabase
    .from("workout_plan_exercises")
    .delete()
    .in("workout_plan_id", planIds)
}

async function clearLegacyLoadDemoWorkoutPlans(
  supabase: SupabaseClient<Database>,
  userId: string,
  ownerColumn: ReturnType<typeof resolveWorkoutPlansOwnerColumn>,
): Promise<{ plansDeleted: number; error: string | null }> {
  const { data, error } = await supabase
    .from("workout_plans")
    .select("id")
    .eq(ownerColumn, userId)
    .in("title", LOAD_DEMO_WORKOUT_PLAN_TITLES)

  if (error) {
    return { plansDeleted: 0, error: error.message }
  }

  const ids = data?.map((row) => row.id) ?? []

  if (ids.length === 0) {
    return { plansDeleted: 0, error: null }
  }

  await deleteWorkoutPlanDependencies(supabase, ids)

  const { error: deleteError, count } = await supabase
    .from("workout_plans")
    .delete({ count: "exact" })
    .in("id", ids)
    .eq(ownerColumn, userId)

  if (deleteError) {
    return { plansDeleted: 0, error: deleteError.message }
  }

  return { plansDeleted: count ?? ids.length, error: null }
}

async function clearLoadDemoWorkoutPlansForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ plansDeleted: number; error: string | null }> {
  const ownerColumn = resolveWorkoutPlansOwnerColumn()

  const { data, error } = await supabase
    .from("workout_plans")
    .select("id")
    .eq(ownerColumn, userId)
    .eq("is_demo", true)
    .in("title", LOAD_DEMO_WORKOUT_PLAN_TITLES)

  if (error) {
    if (error.message.includes("is_demo")) {
      return clearLegacyLoadDemoWorkoutPlans(supabase, userId, ownerColumn)
    }

    return { plansDeleted: 0, error: error.message }
  }

  const ids = data?.map((row) => row.id) ?? []

  if (ids.length === 0) {
    return clearLegacyLoadDemoWorkoutPlans(supabase, userId, ownerColumn)
  }

  await deleteWorkoutPlanDependencies(supabase, ids)

  const { error: deleteError, count } = await supabase
    .from("workout_plans")
    .delete({ count: "exact" })
    .eq(ownerColumn, userId)
    .eq("is_demo", true)
    .in("title", LOAD_DEMO_WORKOUT_PLAN_TITLES)

  if (deleteError) {
    return { plansDeleted: 0, error: deleteError.message }
  }

  return { plansDeleted: count ?? ids.length, error: null }
}

export async function loadDemoWorkoutPlansForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ workoutPlansCreated: number; error: string | null }> {
  const clearResult = await clearLoadDemoWorkoutPlansForCoach(supabase, userId)

  if (clearResult.error) {
    return { workoutPlansCreated: 0, error: clearResult.error }
  }

  const ownerColumn = resolveWorkoutPlansOwnerColumn()

  const rows = LOAD_DEMO_WORKOUT_PLAN_SEEDS.map((plan) => ({
    title: plan.title,
    goal: plan.goal,
    weeks: plan.weeks,
    assigned_members: 0,
    is_demo: true,
    [ownerColumn]: userId,
  }))

  const { data, error } = await supabase
    .from("workout_plans")
    .insert(rows)
    .select("id")

  if (error) {
    if (error.message.includes("is_demo")) {
      const legacyRows = LOAD_DEMO_WORKOUT_PLAN_SEEDS.map((plan) => ({
        title: plan.title,
        goal: plan.goal,
        weeks: plan.weeks,
        assigned_members: 0,
        [ownerColumn]: userId,
      }))

      const legacyInsert = await supabase
        .from("workout_plans")
        .insert(legacyRows)
        .select("id")

      if (legacyInsert.error) {
        return { workoutPlansCreated: 0, error: legacyInsert.error.message }
      }

      return {
        workoutPlansCreated: legacyInsert.data?.length ?? 0,
        error: null,
      }
    }

    return { workoutPlansCreated: 0, error: error.message }
  }

  return { workoutPlansCreated: data?.length ?? 0, error: null }
}
