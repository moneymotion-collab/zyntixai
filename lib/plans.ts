import { parseNutritionFromText } from "@/lib/ai-coach/parse-nutrition"
import { parseWorkoutFromText } from "@/lib/ai-coach/parse-workout"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/client"
import { NUTRITION_ASSIGNMENT_STATUS } from "@/lib/types/nutrition-assignments"
import {
  insertWorkoutPlanExercisesByName,
  type WorkoutExerciseSummary,
} from "@/lib/workout-exercises"

type WorkoutPlan = Database["public"]["Tables"]["workout_plans"]["Row"]
type NutritionPlan = Database["public"]["Tables"]["nutrition_plans"]["Row"]

export type MemberPlan = {
  id: string
  member_id: string
  workout_plan: string
  nutrition_plan: string
  workoutPlanId: string | null
  nutritionPlanId: string | null
}

function formatWorkoutText(
  plan: Pick<WorkoutPlan, "title" | "goal"> | null,
  exercises: Pick<WorkoutExerciseSummary, "exercise_name" | "sets" | "reps">[],
): string {
  if (!plan) return ""

  const lines = [`# ${plan.title}`]
  if (plan.goal) lines.push(`Goal: ${plan.goal}`)
  if (exercises.length > 0) {
    lines.push("")
    for (const ex of exercises) {
      lines.push(`- ${ex.exercise_name}: ${ex.sets}x${ex.reps}`)
    }
  }
  return lines.join("\n")
}

function formatNutritionText(
  plan: Pick<
    NutritionPlan,
    "title" | "goal" | "calories" | "protein" | "carbs" | "fats" | "description"
  > | null,
): string {
  if (!plan) return ""

  const lines = [`# ${plan.title}`]
  if (plan.goal) lines.push(`Goal: ${plan.goal}`)
  if (plan.calories != null) lines.push(`Calories: ${plan.calories} kcal`)
  if (plan.protein != null) lines.push(`Protein: ${plan.protein}g`)
  if (plan.carbs != null) lines.push(`Carbs: ${plan.carbs}g`)
  if (plan.fats != null) lines.push(`Fats: ${plan.fats}g`)
  if (plan.description) {
    lines.push("")
    lines.push(plan.description)
  }
  return lines.join("\n")
}

function planErrorMessage(error: string | { message: string }) {
  return typeof error === "string" ? error : error.message
}

async function getAuthUserId() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return { userId: null, error: error?.message ?? "Not authenticated." }
  }
  return { userId: data.user.id, error: null }
}

export async function getPlan(memberId: string) {
  const supabase = createClient()

  const [workoutResult, nutritionResult] = await Promise.all([
    supabase
      .from("workout_assignments")
      .select(
        `
        workout_plan_id,
        workout_plans (
          id,
          title,
          goal,
          workout_plan_exercises (
            order_index,
            sets,
            reps,
            exercises ( name )
          )
        )
      `,
      )
      .eq("member_id", memberId)
      .order("assigned_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("member_nutrition_assignments")
      .select(
        `
        nutrition_plan_id,
        nutrition_plans (
          id,
          title,
          goal,
          calories,
          protein,
          carbs,
          fats,
          description
        )
      `,
      )
      .eq("member_id", memberId)
      .order("assigned_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const error = workoutResult.error ?? nutritionResult.error
  if (error) {
    return { data: null, error }
  }

  const workoutPlan = workoutResult.data?.workout_plans ?? null
  const nutritionPlan = nutritionResult.data?.nutrition_plans ?? null

  if (!workoutPlan && !nutritionPlan) {
    return { data: null, error: null }
  }

  const exercises =
    workoutPlan && "workout_plan_exercises" in workoutPlan
      ? (workoutPlan.workout_plan_exercises ?? []).map((row) => ({
          exercise_name: row.exercises?.name ?? "Unknown exercise",
          sets: row.sets,
          reps: row.reps,
        }))
      : []

  const data: MemberPlan = {
    id: memberId,
    member_id: memberId,
    workout_plan: formatWorkoutText(workoutPlan, exercises),
    nutrition_plan: formatNutritionText(nutritionPlan),
    workoutPlanId: workoutPlan?.id ?? null,
    nutritionPlanId: nutritionPlan?.id ?? null,
  }

  return { data, error: null }
}

async function saveWorkoutPlan(
  memberId: string,
  text: string,
  existingPlanId: string | null,
) {
  const supabase = createClient()
  const { userId, error: authError } = await getAuthUserId()
  if (authError || !userId) {
    return { error: authError ?? "Not authenticated." }
  }

  const parsed = parseWorkoutFromText(text)
  const title = parsed?.title ?? "Workout Plan"
  const goal = parsed?.goal ?? (text.trim().slice(0, 500) || null)

  if (existingPlanId) {
    const { error: planError } = await supabase
      .from("workout_plans")
      .update({ title, goal, weeks: parsed?.weeks ?? 4 })
      .eq("id", existingPlanId)

    if (planError) return { error: planError }

    await supabase
      .from("workout_plan_exercises")
      .delete()
      .eq("workout_plan_id", existingPlanId)

    if (parsed?.exercises.length) {
      const { error: exercisesError } = await insertWorkoutPlanExercisesByName(
        supabase,
        existingPlanId,
        parsed.exercises,
      )

      if (exercisesError) return { error: exercisesError }
    }

    return { error: null, workoutPlanId: existingPlanId }
  }

  const { data: plan, error: planError } = await supabase
    .from("workout_plans")
    .insert({
      title,
      goal,
      weeks: parsed?.weeks ?? 4,
      created_by: userId,
    })
    .select("id")
    .single()

  if (planError) return { error: planError }

  if (parsed?.exercises.length) {
    const { error: exercisesError } = await insertWorkoutPlanExercisesByName(
      supabase,
      plan.id,
      parsed.exercises,
    )

    if (exercisesError) return { error: exercisesError }
  }

  const { error: assignError } = await supabase.from("workout_assignments").insert({
    member_id: memberId,
    workout_plan_id: plan.id,
    status: "active",
  })

  if (assignError) return { error: assignError }

  return { error: null, workoutPlanId: plan.id }
}

async function saveNutritionPlan(
  memberId: string,
  text: string,
  existingPlanId: string | null,
) {
  const supabase = createClient()
  const { userId, error: authError } = await getAuthUserId()
  if (authError || !userId) {
    return { error: authError ?? "Not authenticated." }
  }

  const parsed = parseNutritionFromText(text)

  if (existingPlanId) {
    const { error } = await supabase
      .from("nutrition_plans")
      .update({
        title: parsed.title,
        goal: parsed.goal,
        calories: parsed.calories,
        protein: parsed.protein,
        carbs: parsed.carbs,
        fats: parsed.fats,
        description: parsed.description,
      })
      .eq("id", existingPlanId)

    if (error) return { error }
    return { error: null, nutritionPlanId: existingPlanId }
  }

  const { data: plan, error: planError } = await supabase
    .from("nutrition_plans")
    .insert({
      title: parsed.title,
      goal: parsed.goal,
      calories: parsed.calories,
      protein: parsed.protein,
      carbs: parsed.carbs,
      fats: parsed.fats,
      description: parsed.description,
      created_by: userId,
    })
    .select("id")
    .single()

  if (planError) return { error: planError }

  const { error: assignError } = await supabase
    .from("member_nutrition_assignments")
    .insert({
      member_id: memberId,
      nutrition_plan_id: plan.id,
      status: NUTRITION_ASSIGNMENT_STATUS.active,
    })

  if (assignError) return { error: assignError }

  return { error: null, nutritionPlanId: plan.id }
}

export async function createPlan(
  memberId: string,
  workout: string,
  nutrition: string,
) {
  const workoutResult = workout.trim()
    ? await saveWorkoutPlan(memberId, workout, null)
    : { error: null }
  if (workoutResult.error) {
    return { data: null, error: planErrorMessage(workoutResult.error) }
  }

  const nutritionResult = nutrition.trim()
    ? await saveNutritionPlan(memberId, nutrition, null)
    : { error: null }
  if (nutritionResult.error) {
    return { data: null, error: planErrorMessage(nutritionResult.error) }
  }

  return getPlan(memberId)
}

export async function updatePlan(
  memberId: string,
  workout: string,
  nutrition: string,
) {
  const { data: current, error: loadError } = await getPlan(memberId)
  if (loadError) {
    return { data: null, error: loadError }
  }

  const workoutResult = workout.trim()
    ? await saveWorkoutPlan(
        memberId,
        workout,
        current?.workoutPlanId ?? null,
      )
    : { error: null }
  if (workoutResult.error) {
    return { data: null, error: planErrorMessage(workoutResult.error) }
  }

  const nutritionResult = nutrition.trim()
    ? await saveNutritionPlan(
        memberId,
        nutrition,
        current?.nutritionPlanId ?? null,
      )
    : { error: null }
  if (nutritionResult.error) {
    return { data: null, error: planErrorMessage(nutritionResult.error) }
  }

  return getPlan(memberId)
}
