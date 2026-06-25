import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { LOAD_DEMO_WORKOUT_PLAN_TITLES } from "@/lib/demo/load-demo-workout-plans"
import { resolveWorkoutPlansOwnerColumn } from "@/lib/demo/workout-plans-owner-column"

type DemoPlanRef = { id: string; title: string }
type ExerciseRef = { id: string; name: string }

type LoadDemoWorkoutExerciseSeed = {
  exercise_name: string
  sets: number
  reps: number
}

type WorkoutPlanExerciseInsert =
  Database["public"]["Tables"]["workout_plan_exercises"]["Insert"]

const DEFAULT_REST_SECONDS = 60

const EXERCISE_NAME_ALIASES: Record<string, string> = {
  "Incline DB Press": "Incline Dumbbell Press",
  "Shoulder Press": "Overhead Press",
  Squat: "Barbell Squat",
}

const LOAD_DEMO_WORKOUT_EXERCISES_BY_PLAN: Record<
  string,
  LoadDemoWorkoutExerciseSeed[]
> = {
  "Push Day": [
    { exercise_name: "Bench Press", sets: 3, reps: 10 },
    { exercise_name: "Incline DB Press", sets: 3, reps: 12 },
    { exercise_name: "Shoulder Press", sets: 3, reps: 10 },
  ],
  "Pull Day": [
    { exercise_name: "Lat Pulldown", sets: 3, reps: 12 },
    { exercise_name: "Barbell Row", sets: 3, reps: 10 },
    { exercise_name: "Face Pull", sets: 3, reps: 15 },
  ],
  "Leg Day": [
    { exercise_name: "Squat", sets: 3, reps: 10 },
    { exercise_name: "Leg Press", sets: 3, reps: 12 },
    { exercise_name: "Romanian Deadlift", sets: 3, reps: 10 },
  ],
}

function normalizeExerciseName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function resolveExerciseId(
  catalog: ExerciseRef[],
  preferredName: string,
): string | null {
  const candidates = [
    preferredName,
    EXERCISE_NAME_ALIASES[preferredName] ?? preferredName,
  ]

  for (const term of candidates) {
    const exact = catalog.find(
      (exercise) =>
        exercise.name.trim().toLowerCase() === term.trim().toLowerCase(),
    )
    if (exact) return exact.id
  }

  const normalizedPreferred = normalizeExerciseName(
    EXERCISE_NAME_ALIASES[preferredName] ?? preferredName,
  )

  const normalizedExact = catalog.find(
    (exercise) => normalizeExerciseName(exercise.name) === normalizedPreferred,
  )
  if (normalizedExact) return normalizedExact.id

  const partialMatches = catalog.filter((exercise) => {
    const normalizedCatalog = normalizeExerciseName(exercise.name)
    return (
      normalizedCatalog.includes(normalizedPreferred) ||
      normalizedPreferred.includes(normalizedCatalog)
    )
  })

  if (partialMatches.length === 0) {
    return null
  }

  partialMatches.sort((a, b) => a.name.length - b.name.length)
  return partialMatches[0]!.id
}

async function fetchLoadDemoWorkoutPlans(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ plans: DemoPlanRef[]; error: string | null }> {
  const ownerColumn = resolveWorkoutPlansOwnerColumn()

  const flagged = await supabase
    .from("workout_plans")
    .select("id, title")
    .eq(ownerColumn, userId)
    .eq("is_demo", true)
    .in("title", LOAD_DEMO_WORKOUT_PLAN_TITLES)
    .order("title")

  if (!flagged.error && (flagged.data?.length ?? 0) > 0) {
    return { plans: flagged.data ?? [], error: null }
  }

  if (flagged.error && !flagged.error.message.includes("is_demo")) {
    return { plans: [], error: flagged.error.message }
  }

  const legacy = await supabase
    .from("workout_plans")
    .select("id, title")
    .eq(ownerColumn, userId)
    .in("title", LOAD_DEMO_WORKOUT_PLAN_TITLES)
    .order("title")

  if (legacy.error) {
    return { plans: [], error: legacy.error.message }
  }

  return { plans: legacy.data ?? [], error: null }
}

async function clearLoadDemoWorkoutExercises(
  supabase: SupabaseClient<Database>,
  planIds: string[],
): Promise<{ error: string | null }> {
  if (planIds.length === 0) {
    return { error: null }
  }

  const { error } = await supabase
    .from("workout_plan_exercises")
    .delete()
    .in("workout_plan_id", planIds)

  return { error: error?.message ?? null }
}

function buildLoadDemoWorkoutExerciseRows(
  plans: DemoPlanRef[],
  catalog: ExerciseRef[],
): { rows: WorkoutPlanExerciseInsert[]; missing: string[] } {
  const rows: WorkoutPlanExerciseInsert[] = []
  const missing: string[] = []

  for (const plan of plans) {
    const exercises = LOAD_DEMO_WORKOUT_EXERCISES_BY_PLAN[plan.title] ?? []

    exercises.forEach((exercise, index) => {
      const exerciseId = resolveExerciseId(catalog, exercise.exercise_name)

      if (!exerciseId) {
        missing.push(`${plan.title}: ${exercise.exercise_name}`)
        return
      }

      rows.push({
        workout_plan_id: plan.id,
        exercise_id: exerciseId,
        sets: exercise.sets,
        reps: String(exercise.reps),
        rest_seconds: DEFAULT_REST_SECONDS,
        notes: "",
        order_index: index + 1,
      })
    })
  }

  return { rows, missing }
}

export async function loadDemoWorkoutExercisesForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ workoutExercisesCreated: number; error: string | null }> {
  const { plans, error: plansError } = await fetchLoadDemoWorkoutPlans(
    supabase,
    userId,
  )

  if (plansError) {
    return { workoutExercisesCreated: 0, error: plansError }
  }

  if (plans.length === 0) {
    return { workoutExercisesCreated: 0, error: null }
  }

  const { data: catalog, error: catalogError } = await supabase
    .from("exercises")
    .select("id, name")
    .order("name")

  if (catalogError) {
    return { workoutExercisesCreated: 0, error: catalogError.message }
  }

  if ((catalog?.length ?? 0) === 0) {
    return {
      workoutExercisesCreated: 0,
      error: "No exercises found in catalog. Seed the exercise library first.",
    }
  }

  const planIds = plans.map((plan) => plan.id)
  const clearResult = await clearLoadDemoWorkoutExercises(supabase, planIds)

  if (clearResult.error) {
    return { workoutExercisesCreated: 0, error: clearResult.error }
  }

  const { rows, missing } = buildLoadDemoWorkoutExerciseRows(
    plans,
    catalog ?? [],
  )

  if (missing.length > 0) {
    return {
      workoutExercisesCreated: 0,
      error: `Exercise not found in catalog: ${missing.join(", ")}`,
    }
  }

  if (rows.length === 0) {
    return { workoutExercisesCreated: 0, error: null }
  }

  const { data, error: insertError } = await supabase
    .from("workout_plan_exercises")
    .insert(rows)
    .select("id")

  if (insertError) {
    return { workoutExercisesCreated: 0, error: insertError.message }
  }

  return { workoutExercisesCreated: data?.length ?? 0, error: null }
}
