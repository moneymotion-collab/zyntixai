import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { DEMO_WORKOUT_PLAN_SEEDS } from "@/lib/demo/demo-workout-plans"
import { resolveWorkoutPlansOwnerColumn } from "@/lib/demo/workout-plans-owner-column"

type DemoPlanRef = { id: string; title: string }

type ExerciseRef = { id: string; name: string }

type WorkoutPlanExerciseInsert =
  Database["public"]["Tables"]["workout_plan_exercises"]["Insert"]

const MIN_EXERCISES_PER_PLAN = 6
const MAX_EXERCISES_PER_PLAN = 8

const REP_PRESETS = [
  { sets: 3, reps: "10-12", rest_seconds: 60 },
  { sets: 4, reps: "8-10", rest_seconds: 90 },
  { sets: 3, reps: "12-15", rest_seconds: 45 },
  { sets: 3, reps: "10", rest_seconds: 45 },
] as const

const EXERCISE_NOTES =
  "Focus on controlled form and full range of motion."

const EXERCISE_NAME_ALIASES: Record<string, string> = {
  "Push Ups": "Push-Up",
  Plank: "Front Plank",
  "Shoulder Press": "Overhead Press",
  "Walking Lunges": "Barbell Lunge",
  "Bodyweight Squat": "Goblet Squat",
  "Dumbbell Press": "Dumbbell Bench Press",
  "Seated Row": "Seated Cable Row",
  "Cable Row": "Seated Cable Row",
  "Dumbbell Row": "Single-Arm Dumbbell Row",
  "Pull Ups": "Pull-Up",
  "Mountain Climbers": "Mountain Climber",
}

const FAT_LOSS_EXERCISES = [
  "Goblet Squat",
  "Walking Lunges",
  "Kettlebell Swing",
  "Push Ups",
  "Mountain Climbers",
  "Plank",
]

const MUSCLE_BUILDER_EXERCISES = [
  "Bench Press",
  "Lat Pulldown",
  "Shoulder Press",
  "Barbell Row",
  "Leg Press",
  "Romanian Deadlift",
]

const BEGINNER_STRENGTH_EXERCISES = [
  "Bodyweight Squat",
  "Dumbbell Press",
  "Seated Row",
  "Glute Bridge",
  "Dead Bug",
  "Farmer Carry",
]

const PLAN_EXERCISES_BY_TITLE: Record<string, string[]> = {
  "12 Week Fat Loss Program": FAT_LOSS_EXERCISES,
  "Summer Shred Program": FAT_LOSS_EXERCISES,
  "Lean Muscle Builder": MUSCLE_BUILDER_EXERCISES,
  "Beginner Strength Foundation": BEGINNER_STRENGTH_EXERCISES,
  "Glute & Lower Body Focus": [
    "Barbell Hip Thrust",
    "Bulgarian Split Squat",
    "Romanian Deadlift",
    "Walking Lunges",
    "Cable Kickback",
    "Glute Bridge",
    "Leg Press",
    "Plank",
  ],
  "Upper Body Hypertrophy": [
    "Bench Press",
    "Incline Dumbbell Press",
    "Lat Pulldown",
    "Cable Row",
    "Lateral Raise",
    "Barbell Curl",
    "Tricep Pushdown",
    "Face Pull",
  ],
  "Full Body Online Coaching Plan": [
    "Goblet Squat",
    "Push Ups",
    "Dumbbell Row",
    "Glute Bridge",
    "Shoulder Press",
    "Dead Bug",
    "Kettlebell Swing",
    "Plank",
  ],
  "Athletic Performance Plan": [
    "Front Squat",
    "Box Jump",
    "Push Press",
    "Pull Ups",
    "Romanian Deadlift",
    "Farmer Carry",
    "Plank",
    "Mountain Climbers",
  ],
  "Mobility & Core Stability": [
    "Bodyweight Squat",
    "Glute Bridge",
    "Dead Bug",
    "Side Plank",
    "Bird Dog",
    "Walking Lunges",
    "Plank",
    "Farmer Carry",
  ],
  "Advanced Push Pull Legs": [
    "Bench Press",
    "Barbell Row",
    "Shoulder Press",
    "Lat Pulldown",
    "Leg Press",
    "Romanian Deadlift",
    "Barbell Curl",
    "Tricep Pushdown",
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

function preferredNamesForPlan(title: string): string[] {
  return PLAN_EXERCISES_BY_TITLE[title] ?? BEGINNER_STRENGTH_EXERCISES
}

function pickExercisesForPlan(
  title: string,
  catalog: ExerciseRef[],
): ExerciseRef[] {
  const picked: ExerciseRef[] = []
  const pickedIds = new Set<string>()

  for (const preferredName of preferredNamesForPlan(title)) {
    if (picked.length >= MAX_EXERCISES_PER_PLAN) break

    const exerciseId = resolveExerciseId(catalog, preferredName)
    if (!exerciseId || pickedIds.has(exerciseId)) continue

    const exercise = catalog.find((item) => item.id === exerciseId)
    if (!exercise) continue

    pickedIds.add(exerciseId)
    picked.push(exercise)
  }

  if (picked.length < MIN_EXERCISES_PER_PLAN) {
    for (const exercise of catalog) {
      if (picked.length >= MIN_EXERCISES_PER_PLAN) break
      if (pickedIds.has(exercise.id)) continue

      pickedIds.add(exercise.id)
      picked.push(exercise)
    }
  }

  return picked.slice(0, MAX_EXERCISES_PER_PLAN)
}

async function fetchDemoWorkoutPlansWithTitles(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ plans: DemoPlanRef[]; error: string | null }> {
  const ownerColumn = resolveWorkoutPlansOwnerColumn()
  const demoTitles = DEMO_WORKOUT_PLAN_SEEDS.map((plan) => plan.title)

  const flagged = await supabase
    .from("workout_plans")
    .select("id, title")
    .eq(ownerColumn, userId)
    .eq("is_demo", true)
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
    .in("title", demoTitles)
    .order("title")

  if (legacy.error) {
    return { plans: [], error: legacy.error.message }
  }

  return { plans: legacy.data ?? [], error: null }
}

async function clearWorkoutPlanExercisesForPlans(
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

export async function clearDemoWorkoutExercisesForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ error: string | null }> {
  const { plans, error: plansError } = await fetchDemoWorkoutPlansWithTitles(
    supabase,
    userId,
  )

  if (plansError) {
    return { error: plansError }
  }

  const planIds = plans.map((plan) => plan.id)
  return clearWorkoutPlanExercisesForPlans(supabase, planIds)
}

function buildWorkoutPlanExerciseRows(
  plans: DemoPlanRef[],
  catalog: ExerciseRef[],
): WorkoutPlanExerciseInsert[] {
  const rows: WorkoutPlanExerciseInsert[] = []

  for (const plan of plans) {
    const exercises = pickExercisesForPlan(plan.title, catalog)

    exercises.forEach((exercise, index) => {
      const preset = REP_PRESETS[index % REP_PRESETS.length]

      rows.push({
        workout_plan_id: plan.id,
        exercise_id: exercise.id,
        sets: preset.sets,
        reps: preset.reps,
        rest_seconds: preset.rest_seconds,
        notes: EXERCISE_NOTES,
        order_index: index + 1,
      })
    })
  }

  return rows
}

export async function generateDemoWorkoutExercisesForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ workoutPlanExercisesCreated: number; error: string | null }> {
  const { plans, error: plansError } = await fetchDemoWorkoutPlansWithTitles(
    supabase,
    userId,
  )

  console.log("[demo/generate] demo plans found:", plans.length)

  if (plansError) {
    console.error("[demo/generate] demo plans fetch error:", plansError)
    return { workoutPlanExercisesCreated: 0, error: plansError }
  }

  if (plans.length === 0) {
    return { workoutPlanExercisesCreated: 0, error: null }
  }

  const { data: catalog, error: catalogError } = await supabase
    .from("exercises")
    .select("id, name")
    .order("name")

  if (catalogError) {
    console.error("[demo/generate] exercises fetch error:", catalogError.message)
    return { workoutPlanExercisesCreated: 0, error: catalogError.message }
  }

  const exercises = catalog ?? []
  console.log("[demo/generate] exercises found:", exercises.length)

  if (exercises.length === 0) {
    return {
      workoutPlanExercisesCreated: 0,
      error: "No exercises found in catalog.",
    }
  }

  const planIds = plans.map((plan) => plan.id)
  const clearResult = await clearWorkoutPlanExercisesForPlans(supabase, planIds)

  if (clearResult.error) {
    console.error(
      "[demo/generate] clear workout_plan_exercises error:",
      clearResult.error,
    )
    return { workoutPlanExercisesCreated: 0, error: clearResult.error }
  }

  const rows = buildWorkoutPlanExerciseRows(plans, exercises)

  if (rows.length === 0) {
    return { workoutPlanExercisesCreated: 0, error: null }
  }

  console.log("[demo/generate] workout_plan_exercises payload example:", rows[0])

  const { data, error: insertError } = await supabase
    .from("workout_plan_exercises")
    .insert(rows)
    .select("id")

  if (insertError) {
    console.error(
      "[demo/generate] workout_plan_exercises insert error:",
      insertError.message,
    )
    return { workoutPlanExercisesCreated: 0, error: insertError.message }
  }

  const created = data?.length ?? 0
  console.log("[demo/generate] workout_plan_exercises created:", created)

  return { workoutPlanExercisesCreated: created, error: null }
}
