import { NextResponse } from "next/server"
import { assertMemberAccess, getAiCoachAuth } from "@/lib/ai-coach/access"
import { parseWorkoutFromText } from "@/lib/ai-coach/parse-workout"
import { insertWorkoutPlanExercisesByName } from "@/lib/workout-exercises"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(request: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  let body: { memberId?: string; content?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 })
  }

  const memberId = body.memberId
  const content = body.content?.trim()

  if (!memberId || !content) {
    return NextResponse.json(
      { error: "memberId and content are required." },
      { status: 400 },
    )
  }

  const parsed = parseWorkoutFromText(content)
  if (!parsed) {
    return NextResponse.json(
      {
        error:
          "Could not recognize exercises. Use format: Exercise 4x8 or Exercise: 4 sets x 8 reps.",
      },
      { status: 422 },
    )
  }

  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    )
  }

  const memberAccess = await assertMemberAccess(supabase, authResult.auth, memberId)
  if (!memberAccess.ok) {
    return NextResponse.json({ error: memberAccess.error }, { status: memberAccess.status })
  }

  const { data: plan, error: planError } = await supabase
    .from("workout_plans")
    .insert({
      title: parsed.title,
      goal: parsed.goal,
      weeks: parsed.weeks,
      created_by: authResult.auth.userId,
    })
    .select("id, title")
    .single()

  if (planError) {
    return NextResponse.json({ error: planError.message }, { status: 500 })
  }

  const { error: exercisesError } = await insertWorkoutPlanExercisesByName(
    supabase,
    plan.id,
    parsed.exercises,
  )

  if (exercisesError) {
    return NextResponse.json({ error: exercisesError.message }, { status: 500 })
  }

  const { error: assignError } = await supabase.from("workout_assignments").insert({
    member_id: memberId,
    workout_plan_id: plan.id,
    status: "active",
  })

  if (assignError) {
    return NextResponse.json({ error: assignError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    workoutPlanId: plan.id,
    title: plan.title,
    exerciseCount: parsed.exercises.length,
  })
}
