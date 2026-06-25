import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { DEMO_MEMBER_LEGACY_EMAIL_OR_FILTER } from "@/lib/demo/demo-members"
import { LOAD_DEMO_WORKOUT_PLAN_TITLES } from "@/lib/demo/load-demo-workout-plans"
import { resolveMembersOwnerColumn } from "@/lib/demo/members-owner-column"
import { resolveWorkoutPlansOwnerColumn } from "@/lib/demo/workout-plans-owner-column"

type DemoMemberRef = { id: string; full_name: string }
type DemoPlanRef = { id: string; title: string }

type WorkoutAssignmentInsert =
  Database["public"]["Tables"]["workout_assignments"]["Insert"]

const LOAD_DEMO_MEMBER_WORKOUT_ASSIGNMENTS: Record<string, string> = {
  "Sarah Johnson": "Push Day",
  "Mike Roberts": "Pull Day",
  "Emma Davis": "Leg Day",
  "James Wilson": "Push Day",
  "Olivia Brown": "Pull Day",
}

async function fetchDemoMembers(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ members: DemoMemberRef[]; error: string | null }> {
  const ownerColumn = resolveMembersOwnerColumn()

  const flagged = await supabase
    .from("members")
    .select("id, full_name")
    .eq(ownerColumn, userId)
    .eq("is_demo", true)
    .order("full_name")

  if (!flagged.error && (flagged.data?.length ?? 0) > 0) {
    return { members: flagged.data ?? [], error: null }
  }

  if (flagged.error && !flagged.error.message.includes("is_demo")) {
    return { members: [], error: flagged.error.message }
  }

  const legacy = await supabase
    .from("members")
    .select("id, full_name")
    .eq(ownerColumn, userId)
    .or(DEMO_MEMBER_LEGACY_EMAIL_OR_FILTER)
    .order("full_name")

  if (legacy.error) {
    return { members: [], error: legacy.error.message }
  }

  return { members: legacy.data ?? [], error: null }
}

async function fetchLoadDemoWorkoutPlans(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ plans: DemoPlanRef[]; error: string | null }> {
  const ownerColumn = resolveWorkoutPlansOwnerColumn()

  const flagged = await supabase
    .from("workout_plans")
    .select("id, title")
    .eq(ownerColumn, userId)
    .eq("is_demo", true)
    .in("title", LOAD_DEMO_WORKOUT_PLAN_TITLES)
    .order("title")

  if (!flagged.error && (flagged.data?.length ?? 0) > 0) {
    return { plans: flagged.data ?? [], error: null }
  }

  if (flagged.error && !flagged.error.message.includes("is_demo")) {
    return { plans: [], error: flagged.error.message }
  }

  const legacy = await supabase
    .from("workout_plans")
    .select("id, title")
    .eq(ownerColumn, userId)
    .in("title", LOAD_DEMO_WORKOUT_PLAN_TITLES)
    .order("title")

  if (legacy.error) {
    return { plans: [], error: legacy.error.message }
  }

  return { plans: legacy.data ?? [], error: null }
}

async function clearLoadDemoWorkoutAssignments(
  supabase: SupabaseClient<Database>,
  memberIds: string[],
): Promise<{ error: string | null }> {
  if (memberIds.length === 0) {
    return { error: null }
  }

  const { error: demoDeleteError } = await supabase
    .from("workout_assignments")
    .delete()
    .eq("is_demo", true)
    .in("member_id", memberIds)

  if (!demoDeleteError) {
    return { error: null }
  }

  if (!demoDeleteError.message.includes("is_demo")) {
    return { error: demoDeleteError.message }
  }

  const { error: legacyDeleteError } = await supabase
    .from("workout_assignments")
    .delete()
    .in("member_id", memberIds)

  return { error: legacyDeleteError?.message ?? null }
}

function buildLoadDemoWorkoutAssignments(
  members: DemoMemberRef[],
  plans: DemoPlanRef[],
): WorkoutAssignmentInsert[] {
  const plansByTitle = new Map(plans.map((plan) => [plan.title, plan.id]))
  const assignedAt = new Date().toISOString()

  return members.flatMap((member) => {
    const planTitle = LOAD_DEMO_MEMBER_WORKOUT_ASSIGNMENTS[member.full_name]
    const workoutPlanId = planTitle ? plansByTitle.get(planTitle) : undefined

    if (!workoutPlanId) {
      return []
    }

    return [
      {
        member_id: member.id,
        workout_plan_id: workoutPlanId,
        assigned_at: assignedAt,
        status: "active",
        completed_at: null,
        is_demo: true,
      },
    ]
  })
}

export async function loadDemoWorkoutAssignmentsForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ workoutAssignmentsCreated: number; error: string | null }> {
  const { members, error: membersError } = await fetchDemoMembers(
    supabase,
    userId,
  )

  const { plans, error: plansError } = await fetchLoadDemoWorkoutPlans(
    supabase,
    userId,
  )

  if (membersError) {
    return { workoutAssignmentsCreated: 0, error: membersError }
  }

  if (plansError) {
    return { workoutAssignmentsCreated: 0, error: plansError }
  }

  if (members.length === 0 || plans.length === 0) {
    return { workoutAssignmentsCreated: 0, error: null }
  }

  const memberIds = members.map((member) => member.id)
  const clearResult = await clearLoadDemoWorkoutAssignments(supabase, memberIds)

  if (clearResult.error) {
    return { workoutAssignmentsCreated: 0, error: clearResult.error }
  }

  const rows = buildLoadDemoWorkoutAssignments(members, plans)

  const { data, error: insertError } = await supabase
    .from("workout_assignments")
    .insert(rows)
    .select("id")

  if (insertError) {
    if (insertError.message.includes("is_demo")) {
      const legacyRows = rows.map(({ is_demo: _isDemo, ...row }) => row)
      const legacyInsert = await supabase
        .from("workout_assignments")
        .insert(legacyRows)
        .select("id")

      if (legacyInsert.error) {
        return {
          workoutAssignmentsCreated: 0,
          error: legacyInsert.error.message,
        }
      }

      return {
        workoutAssignmentsCreated: legacyInsert.data?.length ?? 0,
        error: null,
      }
    }

    return { workoutAssignmentsCreated: 0, error: insertError.message }
  }

  return { workoutAssignmentsCreated: data?.length ?? 0, error: null }
}
