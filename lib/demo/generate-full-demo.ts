import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { generateDemoCheckInsForCoach } from "@/lib/demo/demo-check-ins"
import { generateDemoMarketingForCoach } from "@/lib/demo/demo-marketing"
import { generateDemoMembersForCoach } from "@/lib/demo/demo-members"
import { generateDemoNeedsAttentionForCoach } from "@/lib/demo/demo-needs-attention"
import { generateDemoNutritionAssignmentsForCoach } from "@/lib/demo/demo-nutrition-assignments"
import { generateDemoNutritionPlansForCoach } from "@/lib/demo/demo-nutrition-plans"
import { generateDemoProgressLogsForCoach } from "@/lib/demo/demo-progress-logs"
import { generateDemoSessionsForCoach } from "@/lib/demo/demo-sessions"
import { generateDemoVideoProjectsForCoach } from "@/lib/demo/demo-video-projects"
import { generateDemoWorkoutAssignmentsForCoach } from "@/lib/demo/demo-workout-assignments"
import { generateDemoWorkoutCompletionsForCoach } from "@/lib/demo/demo-workout-completions"
import { generateDemoWorkoutExercisesForCoach } from "@/lib/demo/demo-workout-exercises"
import { generateDemoWorkoutPlansForCoach } from "@/lib/demo/demo-workout-plans"

export type GenerateFullDemoResult =
  | { ok: true; membersCreated: number }
  | { ok: false; error: string }

export async function generateFullDemoForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
  userEmail: string | null,
): Promise<GenerateFullDemoResult> {
  const { error: membersError } = await generateDemoMembersForCoach(
    supabase,
    userId,
  )

  if (membersError) {
    return { ok: false, error: membersError }
  }

  const { error: plansError } = await generateDemoWorkoutPlansForCoach(
    supabase,
    userId,
  )

  if (plansError) {
    return { ok: false, error: plansError }
  }

  const { error: nutritionPlansError } =
    await generateDemoNutritionPlansForCoach(supabase, userId)

  if (nutritionPlansError) {
    return { ok: false, error: nutritionPlansError }
  }

  const { error: assignmentsError } =
    await generateDemoWorkoutAssignmentsForCoach(supabase, userId)

  if (assignmentsError) {
    return { ok: false, error: assignmentsError }
  }

  const { error: nutritionAssignmentsError } =
    await generateDemoNutritionAssignmentsForCoach(supabase, userId)

  if (nutritionAssignmentsError) {
    return { ok: false, error: nutritionAssignmentsError }
  }

  const { error: exercisesError } = await generateDemoWorkoutExercisesForCoach(
    supabase,
    userId,
  )

  if (exercisesError) {
    return { ok: false, error: exercisesError }
  }

  const { demoMembersFound, error: progressLogsError } =
    await generateDemoProgressLogsForCoach(supabase, userId)

  if (progressLogsError) {
    return { ok: false, error: progressLogsError }
  }

  const coachName =
    userEmail?.split("@")[0]?.replace(/\./g, " ") ?? "Coach"

  const { error: sessionsError } = await generateDemoSessionsForCoach(
    supabase,
    userId,
    { coachName },
  )

  if (sessionsError) {
    return { ok: false, error: sessionsError }
  }

  const { error: completionsError } =
    await generateDemoWorkoutCompletionsForCoach(supabase, userId)

  if (completionsError) {
    return { ok: false, error: completionsError }
  }

  const { error: checkInsError } = await generateDemoCheckInsForCoach(
    supabase,
    userId,
  )

  if (checkInsError) {
    return { ok: false, error: checkInsError }
  }

  const { error: needsAttentionError } =
    await generateDemoNeedsAttentionForCoach(supabase, userId, { coachName })

  if (needsAttentionError) {
    return { ok: false, error: needsAttentionError }
  }

  const { error: marketingError } = await generateDemoMarketingForCoach(
    supabase,
    userId,
  )

  if (marketingError) {
    return { ok: false, error: marketingError }
  }

  const { error: videoError } = await generateDemoVideoProjectsForCoach(
    supabase,
    userId,
  )

  if (videoError) {
    return { ok: false, error: videoError }
  }

  return { ok: true, membersCreated: demoMembersFound }
}
