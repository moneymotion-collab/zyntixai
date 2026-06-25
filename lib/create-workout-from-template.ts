import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type { WorkoutTemplateExerciseRow } from "@/lib/workout-template-exercises"

const TEMPLATE_EXERCISES_SELECT = `
  id,
  template_id,
  exercise_id,
  sets,
  reps,
  rest_seconds,
  notes,
  order_index,
  created_at,
  exercises (
    id,
    name,
    primary_muscle,
    equipment,
    difficulty
  )
` as const

function findExerciseIdByName(
  catalog: { id: string; name: string }[],
  name: string,
) {
  const normalized = name.trim().toLowerCase()
  return catalog.find(
    (exercise) => exercise.name.trim().toLowerCase() === normalized,
  )?.id
}

function resolveExerciseId(
  catalog: { id: string; name: string }[],
  item: WorkoutTemplateExerciseRow,
): string | null {
  const catalogIds = new Set(catalog.map((exercise) => exercise.id))

  if (item.exercise_id && catalogIds.has(item.exercise_id)) {
    return item.exercise_id
  }

  const exerciseName = item.exercises?.name?.trim()
  if (exerciseName) {
    return findExerciseIdByName(catalog, exerciseName) ?? null
  }

  return null
}

async function insertWorkoutPlanExercisesFromTemplate(
  supabase: SupabaseClient<Database>,
  workoutPlanId: string,
  templateExercises: WorkoutTemplateExerciseRow[],
) {
  if (templateExercises.length === 0) {
    return { exerciseCount: 0, error: null }
  }

  const { data: catalog, error: catalogError } = await supabase
    .from("exercises")
    .select("id, name")

  if (catalogError) {
    return { exerciseCount: 0, error: catalogError }
  }

  const sorted = [...templateExercises].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
  )

  const rows: Array<{
    workout_plan_id: string
    exercise_id: string
    sets: number
    reps: string
    rest_seconds: number
    notes: string
    order_index: number
  }> = []

  for (let index = 0; index < sorted.length; index++) {
    const item = sorted[index]
    const exerciseId = resolveExerciseId(catalog ?? [], item)

    if (!exerciseId) {
      const label = item.exercises?.name ?? item.exercise_id ?? "Unknown exercise"
      return {
        exerciseCount: 0,
        error: { message: `Exercise not found in catalog: ${label}` },
      }
    }

    rows.push({
      workout_plan_id: workoutPlanId,
      exercise_id: exerciseId,
      sets: item.sets,
      reps: item.reps,
      rest_seconds: item.rest_seconds,
      notes: item.notes ?? "",
      order_index: item.order_index ?? index,
    })
  }

  const { error } = await supabase.from("workout_plan_exercises").insert(rows)

  if (error) {
    return { exerciseCount: 0, error }
  }

  return { exerciseCount: rows.length, error: null }
}

export async function createWorkoutPlanFromTemplate(
  supabase: SupabaseClient<Database>,
  templateId: string,
  userId: string,
): Promise<{
  workoutPlanId: string | null
  exerciseCount: number
  error: { message: string } | null
}> {
  const { data: template, error: templateError } = await supabase
    .from("workout_templates")
    .select("id, title, goal, created_by")
    .eq("id", templateId)
    .maybeSingle()

  if (templateError) {
    return { workoutPlanId: null, exerciseCount: 0, error: templateError }
  }

  if (!template) {
    return {
      workoutPlanId: null,
      exerciseCount: 0,
      error: { message: "Template not found." },
    }
  }

  const { data: templateExercises, error: exercisesError } = await supabase
    .from("workout_template_exercises")
    .select(TEMPLATE_EXERCISES_SELECT)
    .eq("template_id", templateId)
    .order("order_index", { ascending: true })

  if (exercisesError) {
    return { workoutPlanId: null, exerciseCount: 0, error: exercisesError }
  }

  const { data: newPlan, error: planError } = await supabase
    .from("workout_plans")
    .insert({
      title: template.title,
      goal: template.goal,
      weeks: 4,
      assigned_members: 0,
      created_by: userId,
    })
    .select()
    .single()

  if (planError || !newPlan) {
    return {
      workoutPlanId: null,
      exerciseCount: 0,
      error: planError ?? { message: "Could not create workout plan." },
    }
  }

  const { exerciseCount, error: insertError } =
    await insertWorkoutPlanExercisesFromTemplate(
      supabase,
      newPlan.id,
      (templateExercises ?? []) as WorkoutTemplateExerciseRow[],
    )

  if (insertError) {
    await supabase.from("workout_plans").delete().eq("id", newPlan.id)
    return { workoutPlanId: null, exerciseCount: 0, error: insertError }
  }

  return { workoutPlanId: newPlan.id, exerciseCount, error: null }
}
