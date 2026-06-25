import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

export const WORKOUT_PLAN_EXERCISES_SELECT = `
  id,
  workout_plan_id,
  exercise_id,
  sets,
  reps,
  order_index,
  rest_seconds,
  notes,
  exercises ( name, category, primary_muscle, equipment, difficulty, instructions, tips )
`

export type WorkoutExerciseSummary = {
  id: string
  exercise_name: string
  sets: number
  reps: string
  rest_seconds: number
  instructions: string
  order_index: number
}

export type WorkoutPlanExerciseRow = {
  id: string
  workout_plan_id?: string
  exercise_id: string
  sets: number
  reps: string
  order_index: number
  rest_seconds: number
  notes: string
  exercises: {
    name: string
    category: string
    primary_muscle: string
    equipment: string
    difficulty: string
    instructions: string
    tips: string
  } | null
}

export function mapWorkoutPlanExercise(
  row: WorkoutPlanExerciseRow,
): WorkoutExerciseSummary {
  return {
    id: row.id,
    exercise_name: row.exercises?.name ?? "Unknown exercise",
    sets: row.sets,
    reps: row.reps,
    rest_seconds: row.rest_seconds,
    instructions: row.exercises?.instructions ?? "",
    order_index: row.order_index,
  }
}

type PlanExerciseInput = {
  name: string
  sets: number
  reps: number | string
  rest_seconds?: number
  notes?: string
}

export type WorkoutPlanExerciseInsert = {
  exerciseId: string
  sets: number
  reps: string
  restSeconds?: number
  notes?: string
}

export const DEFAULT_LIBRARY_ADD_PRESCRIPTION = {
  sets: 3,
  reps: "10-12",
  restSeconds: 60,
} as const

export async function getNextWorkoutPlanExerciseOrderIndex(
  supabase: SupabaseClient<Database>,
  workoutPlanId: string,
): Promise<{ orderIndex: number; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from("workout_plan_exercises")
    .select("order_index")
    .eq("workout_plan_id", workoutPlanId)
    .order("order_index", { ascending: false })
    .limit(1)

  if (error) {
    return { orderIndex: 0, error }
  }

  const orderIndex =
    data && data.length > 0 ? data[0].order_index + 1 : 0

  return { orderIndex, error: null }
}

export async function appendExerciseToWorkoutPlan(
  supabase: SupabaseClient<Database>,
  workoutPlanId: string,
  exerciseId: string,
  overrides: Partial<{
    sets: number
    reps: string
    restSeconds: number
    notes: string
  }> = {},
): Promise<{ orderIndex: number | null; error: { message: string } | null }> {
  const { orderIndex, error: orderError } =
    await getNextWorkoutPlanExerciseOrderIndex(supabase, workoutPlanId)

  if (orderError) {
    return { orderIndex: null, error: orderError }
  }

  const { error } = await supabase.from("workout_plan_exercises").insert({
    workout_plan_id: workoutPlanId,
    exercise_id: exerciseId,
    sets: overrides.sets ?? DEFAULT_LIBRARY_ADD_PRESCRIPTION.sets,
    reps: overrides.reps ?? DEFAULT_LIBRARY_ADD_PRESCRIPTION.reps,
    rest_seconds:
      overrides.restSeconds ?? DEFAULT_LIBRARY_ADD_PRESCRIPTION.restSeconds,
    notes: overrides.notes ?? "",
    order_index: orderIndex,
  })

  return { orderIndex, error }
}

export async function insertWorkoutPlanExercises(
  supabase: SupabaseClient<Database>,
  workoutPlanId: string,
  items: WorkoutPlanExerciseInsert[],
) {
  if (items.length === 0) {
    return { error: null }
  }

  const rows = items.map((item, index) => ({
    workout_plan_id: workoutPlanId,
    exercise_id: item.exerciseId,
    sets: item.sets,
    reps: item.reps,
    rest_seconds: item.restSeconds ?? 60,
    notes: item.notes ?? "",
    order_index: index,
  }))

  const { error } = await supabase.from("workout_plan_exercises").insert(rows)

  return { error }
}

function findExerciseIdByName(
  catalog: Pick<Database["public"]["Tables"]["exercises"]["Row"], "id" | "name">[],
  name: string,
) {
  const normalized = name.trim().toLowerCase()
  return catalog.find((exercise) => exercise.name.trim().toLowerCase() === normalized)?.id
}

export async function insertWorkoutPlanExercisesByName(
  supabase: SupabaseClient<Database>,
  workoutPlanId: string,
  items: PlanExerciseInput[],
) {
  if (items.length === 0) {
    return { error: null }
  }

  const { data: catalog, error: catalogError } = await supabase
    .from("exercises")
    .select("id, name")

  if (catalogError) {
    return { error: catalogError }
  }

  const rows = items.map((item, index) => {
    const exerciseId = findExerciseIdByName(catalog ?? [], item.name)
    if (!exerciseId) {
      return null
    }

    return {
      workout_plan_id: workoutPlanId,
      exercise_id: exerciseId,
      sets: item.sets,
      reps: String(item.reps),
      rest_seconds: item.rest_seconds ?? 60,
      notes: item.notes ?? "",
      order_index: index,
    }
  })

  if (rows.some((row) => row === null)) {
    const missing = items
      .filter((item) => !findExerciseIdByName(catalog ?? [], item.name))
      .map((item) => item.name)

    return {
      error: {
        message: `Exercise not found in catalog: ${missing.join(", ")}`,
      },
    }
  }

  const { error } = await insertWorkoutPlanExercises(
    supabase,
    workoutPlanId,
    rows.map((row) => ({
      exerciseId: row!.exercise_id,
      sets: row!.sets,
      reps: row!.reps,
      restSeconds: row!.rest_seconds,
      notes: row!.notes,
    })),
  )

  return { error }
}

export function isWorkoutPlanExercisesSchemaError(message: string): boolean {
  const normalized = message.toLowerCase()
  return (
    normalized.includes("workout_plan_exercises") &&
    (normalized.includes("relationship") ||
      normalized.includes("schema cache") ||
      normalized.includes("does not exist") ||
      normalized.includes("could not find"))
  )
}

export const WORKOUT_PLAN_EXERCISES_MIGRATION_HINT =
  "The exercise library migration has not been applied to your database yet. Run: npx supabase db push --linked"

export async function fetchExercisesByPlanIds(
  supabase: SupabaseClient<Database>,
  planIds: string[],
): Promise<{ rows: WorkoutPlanExerciseRow[]; error: { message: string } | null }> {
  if (planIds.length === 0) {
    return { rows: [], error: null }
  }

  const { data, error } = await supabase
    .from("workout_plan_exercises")
    .select(WORKOUT_PLAN_EXERCISES_SELECT)
    .in("workout_plan_id", planIds)
    .order("order_index", { ascending: true })

  if (error) {
    return { rows: [], error }
  }

  return { rows: (data ?? []) as WorkoutPlanExerciseRow[], error: null }
}

export function groupExercisesByPlanId(
  rows: WorkoutPlanExerciseRow[],
): Map<string, WorkoutPlanExerciseRow[]> {
  const map = new Map<string, WorkoutPlanExerciseRow[]>()

  for (const row of rows) {
    const planId = row.workout_plan_id
    if (!planId) continue
    const list = map.get(planId) ?? []
    list.push(row)
    map.set(planId, list)
  }

  return map
}

export async function fetchWorkoutPlansWithExercises(
  supabase: SupabaseClient<Database>,
  options: { coachUserId?: string | null } = {},
): Promise<{
  plans: Array<
    Database["public"]["Tables"]["workout_plans"]["Row"] & {
      workout_plan_exercises: WorkoutExerciseSummary[]
    }
  >
  error: { message: string } | null
  schemaMissing: boolean
}> {
  let query = supabase
    .from("workout_plans")
    .select(`*, workout_plan_exercises ( ${WORKOUT_PLAN_EXERCISES_SELECT} )`)
    .order("created_at", { ascending: false })

  if (options.coachUserId) {
    query = query.eq("created_by", options.coachUserId)
  }

  const { data, error } = await query

  if (!error) {
    const plans = ((data ?? []) as Array<
      Database["public"]["Tables"]["workout_plans"]["Row"] & {
        workout_plan_exercises: WorkoutPlanExerciseRow[] | null
      }
    >).map((plan) => ({
      ...plan,
      workout_plan_exercises: (plan.workout_plan_exercises ?? []).map(
        mapWorkoutPlanExercise,
      ),
    }))

    return { plans, error: null, schemaMissing: false }
  }

  if (!isWorkoutPlanExercisesSchemaError(error.message)) {
    return { plans: [], error, schemaMissing: false }
  }

  let plainQuery = supabase
    .from("workout_plans")
    .select("*")
    .order("created_at", { ascending: false })

  if (options.coachUserId) {
    plainQuery = plainQuery.eq("created_by", options.coachUserId)
  }

  const { data: plainPlans, error: plainError } = await plainQuery

  if (plainError) {
    return { plans: [], error: plainError, schemaMissing: true }
  }

  const planRows = plainPlans ?? []
  const { rows, error: exercisesError } = await fetchExercisesByPlanIds(
    supabase,
    planRows.map((plan) => plan.id),
  )

  if (exercisesError) {
    return {
      plans: planRows.map((plan) => ({
        ...plan,
        workout_plan_exercises: [],
      })),
      error: exercisesError,
      schemaMissing: isWorkoutPlanExercisesSchemaError(exercisesError.message),
    }
  }

  const grouped = groupExercisesByPlanId(rows)

  return {
    plans: planRows.map((plan) => ({
      ...plan,
      workout_plan_exercises: (grouped.get(plan.id) ?? []).map(mapWorkoutPlanExercise),
    })),
    error: null,
    schemaMissing: false,
  }
}
