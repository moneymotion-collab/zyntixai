import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

type WorkoutBuilderExerciseInput = {
  exercise_id: string
  sets?: number
  reps?: string | number
  rest_seconds?: number
  notes?: string | null
}

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  let body: {
    title?: string
    goal?: string | null
    weeks?: number | string | null
    exercises?: WorkoutBuilderExerciseInput[]
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const { title, goal, weeks, exercises } = body

  if (!title || !exercises || exercises.length === 0) {
    return NextResponse.json(
      { error: "Title and exercises are required" },
      { status: 400 },
    )
  }

  const { data: workoutPlan, error: planError } = await supabase
    .from("workout_plans")
    .insert({
      title,
      goal,
      weeks: Number(weeks || 4),
      assigned_members: 0,
      created_by: user.id,
    })
    .select()
    .single()

  if (planError) {
    return NextResponse.json({ error: planError.message }, { status: 500 })
  }

  const workoutExercises = exercises.map((exercise, index) => ({
    workout_plan_id: workoutPlan.id,
    exercise_id: exercise.exercise_id,
    sets: Number(exercise.sets || 3),
    reps: String(exercise.reps || "10"),
    rest_seconds: Number(exercise.rest_seconds || 60),
    notes: exercise.notes ?? "",
    order_index: index,
  }))

  const { error: exercisesError } = await supabase
    .from("workout_plan_exercises")
    .insert(workoutExercises)

  if (exercisesError) {
    return NextResponse.json({ error: exercisesError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    workout_plan_id: workoutPlan.id,
  })
}
