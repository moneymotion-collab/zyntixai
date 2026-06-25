import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"
import type { Database } from "@/lib/database.types"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import {
  fetchWorkoutTemplatesWithExercises,
  insertWorkoutTemplateExercises,
  type WorkoutTemplateExerciseInput,
} from "@/lib/workout-template-exercises"

export async function GET() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { templates, error } = await fetchWorkoutTemplatesWithExercises(
    supabase,
    user.id,
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ templates })
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
    category?: string | null
    exercises?: WorkoutTemplateExerciseInput[]
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const { title, goal, category, exercises } = body

  if (!title?.trim() || !exercises || exercises.length === 0) {
    return NextResponse.json(
      { error: "Title and exercises are required" },
      { status: 400 },
    )
  }

  const writeClient = (process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminClient()
    : supabase) as SupabaseClient<Database>

  const { data: template, error: templateError } = await writeClient
    .from("workout_templates")
    .insert({
      title: title.trim(),
      goal: goal ?? null,
      category: category ?? null,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (templateError || !template) {
    return NextResponse.json(
      { error: templateError?.message ?? "Could not save template." },
      { status: 500 },
    )
  }

  const { error: exercisesError } = await insertWorkoutTemplateExercises(
    writeClient,
    template.id,
    exercises,
  )

  if (exercisesError) {
    await writeClient.from("workout_templates").delete().eq("id", template.id)

    return NextResponse.json(
      { error: exercisesError.message },
      { status: 500 },
    )
  }

  return NextResponse.json({
    success: true,
    template_id: template.id,
  })
}
