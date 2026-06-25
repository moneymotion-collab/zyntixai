import { NextResponse } from "next/server"
import { assertMemberAccess, getAiCoachAuth } from "@/lib/ai-coach/access"
import { parseNutritionFromText } from "@/lib/ai-coach/parse-nutrition"
import { NUTRITION_ASSIGNMENT_STATUS } from "@/lib/types/nutrition-assignments"
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

  const parsed = parseNutritionFromText(content)
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
    .from("nutrition_plans")
    .insert({
      title: parsed.title,
      calories: parsed.calories,
      protein: parsed.protein,
      carbs: parsed.carbs,
      fats: parsed.fats,
      description: parsed.description,
      goal: parsed.goal,
      created_by: authResult.auth.userId,
    })
    .select("id, title")
    .single()

  if (planError) {
    return NextResponse.json({ error: planError.message }, { status: 500 })
  }

  const { error: assignError } = await supabase
    .from("member_nutrition_assignments")
    .insert({
      member_id: memberId,
      nutrition_plan_id: plan.id,
      status: NUTRITION_ASSIGNMENT_STATUS.active,
    })

  if (assignError) {
    return NextResponse.json({ error: assignError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    nutritionPlanId: plan.id,
    title: plan.title,
  })
}
