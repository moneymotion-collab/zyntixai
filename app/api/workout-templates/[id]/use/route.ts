import { NextResponse } from "next/server"
import { createWorkoutPlanFromTemplate } from "@/lib/create-workout-from-template"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(_req: Request, context: RouteContext) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { id: templateId } = await context.params

  if (!templateId?.trim()) {
    return NextResponse.json({ error: "Template id is required." }, { status: 400 })
  }

  const { workoutPlanId, exerciseCount, error } =
    await createWorkoutPlanFromTemplate(supabase, templateId, user.id)

  if (error || !workoutPlanId) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create workout from template." },
      { status: error?.message === "Template not found." ? 404 : 500 },
    )
  }

  return NextResponse.json({
    success: true,
    workout_plan_id: workoutPlanId,
    exercise_count: exerciseCount,
  })
}
