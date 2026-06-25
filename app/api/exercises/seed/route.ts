import { NextResponse } from "next/server"
import { getCoachScope } from "@/lib/auth/coach-scope"
import { EXERCISE_SEED_COUNT, seedExerciseCatalog } from "@/lib/exercise-seed"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()
  const scope = await getCoachScope(supabase)

  if (!scope.userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  if (!scope.isAdmin) {
    return NextResponse.json(
      { error: "Only admins can seed the exercise library" },
      { status: 403 },
    )
  }

  const result = await seedExerciseCatalog(supabase)

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    inserted: result.inserted,
    total: result.total,
    catalogSize: EXERCISE_SEED_COUNT,
    message:
      result.inserted > 0
        ? `Added ${result.inserted} exercises (${result.total} total in library).`
        : `Exercise library already seeded (${result.total} exercises).`,
  })
}
