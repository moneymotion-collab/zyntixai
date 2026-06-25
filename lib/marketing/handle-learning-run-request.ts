import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { runLearningEngine } from "@/lib/marketing/learning/run-learning-engine"
import { createClient } from "@/lib/supabase/server"

export async function handleLearningRunRequest() {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    )
  }

  const result = await runLearningEngine({
    supabase,
    userId: authResult.auth.userId,
    isAdmin: authResult.auth.isAdmin,
  })

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 500 },
    )
  }

  if (result.message) {
    return NextResponse.json({
      message: result.message,
      learning_profile: result.learning_profile,
      insights: result.insights,
      recommendations: result.recommendations,
      next_actions: result.next_actions,
    })
  }

  return NextResponse.json({
    learning_profile: result.learning_profile,
    insights: result.insights,
    recommendations: result.recommendations,
    next_actions: result.next_actions,
  })
}
