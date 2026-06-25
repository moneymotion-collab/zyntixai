import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

export async function completeWorkoutAssignment(
  supabase: SupabaseClient<Database>,
  assignmentId: string,
) {
  const { data: assignment, error: fetchError } = await supabase
    .from("workout_assignments")
    .select("id, member_id, workout_plan_id")
    .eq("id", assignmentId)
    .single()

  if (fetchError) {
    return { error: fetchError }
  }

  const completedAt = new Date().toISOString()

  const { error: statusError } = await supabase
    .from("workout_assignments")
    .update({ status: "completed", completed_at: completedAt })
    .eq("id", assignmentId)

  if (statusError) {
    return { error: statusError }
  }

  const { error: completionError } = await supabase
    .from("workout_completions")
    .insert({
      member_id: assignment.member_id,
      workout_plan_id: assignment.workout_plan_id,
      completed_at: completedAt,
    })

  return { error: completionError }
}
