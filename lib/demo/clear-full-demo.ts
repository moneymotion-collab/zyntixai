import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { clearDemoCheckInsForCoach } from "@/lib/demo/demo-check-ins"
import { clearDemoMarketingDataForCoach } from "@/lib/demo/demo-marketing"
import { clearDemoMembersForCoach } from "@/lib/demo/demo-members"
import { clearDemoNutritionAssignmentsForCoach } from "@/lib/demo/demo-nutrition-assignments"
import { clearDemoNutritionPlansForCoach } from "@/lib/demo/demo-nutrition-plans"
import { clearDemoProgressLogsForCoach } from "@/lib/demo/demo-progress-logs"
import { clearDemoSessionsForCoach } from "@/lib/demo/demo-sessions"
import { clearDemoVideoProjectsForCoach } from "@/lib/demo/demo-video-projects"
import { clearDemoWorkoutAssignmentsForCoach } from "@/lib/demo/demo-workout-assignments"
import { clearDemoWorkoutCompletionsForCoach } from "@/lib/demo/demo-workout-completions"
import { clearDemoWorkoutExercisesForCoach } from "@/lib/demo/demo-workout-exercises"
import { clearDemoWorkoutPlansForCoach } from "@/lib/demo/demo-workout-plans"

export type ClearFullDemoResult = {
  ok: true
  membersDeleted: number
} | {
  ok: false
  error: string
  membersDeleted: number
}

type ClearStep = {
  label: string
  run: () => Promise<{ error: string | null }>
}

export async function clearFullDemoForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ClearFullDemoResult> {
  const steps: ClearStep[] = [
    {
      label: "marketing",
      run: () => clearDemoMarketingDataForCoach(supabase, userId),
    },
    {
      label: "video projects",
      run: () => clearDemoVideoProjectsForCoach(supabase, userId),
    },
    {
      label: "sessions",
      run: () => clearDemoSessionsForCoach(supabase, userId),
    },
    {
      label: "workout completions",
      run: () => clearDemoWorkoutCompletionsForCoach(supabase, userId),
    },
    {
      label: "check-ins",
      run: () => clearDemoCheckInsForCoach(supabase, userId),
    },
    {
      label: "progress logs",
      run: () => clearDemoProgressLogsForCoach(supabase, userId),
    },
    {
      label: "workout assignments",
      run: () => clearDemoWorkoutAssignmentsForCoach(supabase, userId),
    },
    {
      label: "nutrition assignments",
      run: () => clearDemoNutritionAssignmentsForCoach(supabase, userId),
    },
    {
      label: "workout plan exercises",
      run: () => clearDemoWorkoutExercisesForCoach(supabase, userId),
    },
    {
      label: "workout plans",
      run: async () => {
        const result = await clearDemoWorkoutPlansForCoach(supabase, userId)
        return { error: result.error }
      },
    },
    {
      label: "nutrition plans",
      run: async () => {
        const result = await clearDemoNutritionPlansForCoach(supabase, userId)
        return { error: result.error }
      },
    },
  ]

  for (const step of steps) {
    const { error } = await step.run()

    if (error) {
      console.error(`[demo/clear] failed clearing ${step.label}:`, error)
      return {
        ok: false,
        error: `Failed to clear demo ${step.label}: ${error}`,
        membersDeleted: 0,
      }
    }
  }

  const { membersDeleted, error: membersError } = await clearDemoMembersForCoach(
    supabase,
    userId,
  )

  if (membersError) {
    console.error("[demo/clear] failed clearing members:", membersError)
    return {
      ok: false,
      error: `Failed to clear demo members: ${membersError}`,
      membersDeleted: 0,
    }
  }

  return { ok: true, membersDeleted }
}
