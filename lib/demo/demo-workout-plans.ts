import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { resolveWorkoutPlansOwnerColumn } from "@/lib/demo/workout-plans-owner-column"

export type DemoWorkoutPlanSeed = {
  title: string
  goal: string
  weeks: number
}

export const DEMO_WORKOUT_PLAN_SEEDS: DemoWorkoutPlanSeed[] = [
  {
    title: "12 Week Fat Loss Program",
    goal: "Sustainable fat loss with progressive strength training and conditioning.",
    weeks: 12,
  },
  {
    title: "Beginner Strength Foundation",
    goal: "Learn compound lifts, improve technique, and build a solid strength base.",
    weeks: 8,
  },
  {
    title: "Lean Muscle Builder",
    goal: "Hypertrophy-focused training split designed for lean muscle gain.",
    weeks: 10,
  },
  {
    title: "Glute & Lower Body Focus",
    goal: "Target glutes, hamstrings, and quads with hip stability and progressive overload.",
    weeks: 8,
  },
  {
    title: "Upper Body Hypertrophy",
    goal: "High-volume chest, back, shoulder, and arm work for upper body development.",
    weeks: 8,
  },
  {
    title: "Full Body Online Coaching Plan",
    goal: "Flexible 3-day full body program built for remote coaching clients.",
    weeks: 6,
  },
  {
    title: "Summer Shred Program",
    goal: "Metabolic conditioning and muscle retention for a lean summer physique.",
    weeks: 10,
  },
  {
    title: "Athletic Performance Plan",
    goal: "Power, speed, agility, and sport-specific conditioning for athletes.",
    weeks: 12,
  },
  {
    title: "Mobility & Core Stability",
    goal: "Improve movement quality, core strength, and injury resilience.",
    weeks: 6,
  },
  {
    title: "Advanced Push Pull Legs",
    goal: "High-volume push/pull/legs split for experienced lifters chasing hypertrophy.",
    weeks: 12,
  },
]

const DEMO_WORKOUT_PLAN_TITLES = DEMO_WORKOUT_PLAN_SEEDS.map((plan) => plan.title)

async function deleteWorkoutPlanDependencies(
  supabase: SupabaseClient<Database>,
  planIds: string[],
) {
  if (planIds.length === 0) return

  await supabase
    .from("workout_assignments")
    .delete()
    .in("workout_plan_id", planIds)
}

export async function clearDemoWorkoutPlansForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ plansDeleted: number; error: string | null }> {
  const ownerColumn = resolveWorkoutPlansOwnerColumn()

  const { data, error } = await supabase
    .from("workout_plans")
    .select("id")
    .eq(ownerColumn, userId)
    .eq("is_demo", true)

  if (error) {
    if (error.message.includes("is_demo")) {
      return clearLegacyDemoWorkoutPlans(supabase, userId, ownerColumn)
    }

    return { plansDeleted: 0, error: error.message }
  }

  const ids = data?.map((row) => row.id) ?? []

  if (ids.length === 0) {
    const legacy = await clearLegacyDemoWorkoutPlans(supabase, userId, ownerColumn)
    return legacy
  }

  await deleteWorkoutPlanDependencies(supabase, ids)

  const { error: deleteError, count } = await supabase
    .from("workout_plans")
    .delete({ count: "exact" })
    .eq(ownerColumn, userId)
    .eq("is_demo", true)

  if (deleteError) {
    return { plansDeleted: 0, error: deleteError.message }
  }

  return { plansDeleted: count ?? ids.length, error: null }
}

async function clearLegacyDemoWorkoutPlans(
  supabase: SupabaseClient<Database>,
  userId: string,
  ownerColumn: ReturnType<typeof resolveWorkoutPlansOwnerColumn>,
): Promise<{ plansDeleted: number; error: string | null }> {
  const { data, error } = await supabase
    .from("workout_plans")
    .select("id")
    .eq(ownerColumn, userId)
    .in("title", DEMO_WORKOUT_PLAN_TITLES)

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

export async function generateDemoWorkoutPlansForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ workoutPlansCreated: number; error: string | null }> {
  const clearResult = await clearDemoWorkoutPlansForCoach(supabase, userId)

  if (clearResult.error) {
    return { workoutPlansCreated: 0, error: clearResult.error }
  }

  const ownerColumn = resolveWorkoutPlansOwnerColumn()

  const rows = DEMO_WORKOUT_PLAN_SEEDS.map((plan) => ({
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
      const legacyRows = DEMO_WORKOUT_PLAN_SEEDS.map((plan) => ({
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
