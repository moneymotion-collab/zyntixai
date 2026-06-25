import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { DEMO_MEMBER_LEGACY_EMAIL_OR_FILTER } from "@/lib/demo/demo-members"
import { DEMO_WORKOUT_PLAN_SEEDS } from "@/lib/demo/demo-workout-plans"
import { resolveMembersOwnerColumn } from "@/lib/demo/members-owner-column"
import { resolveWorkoutPlansOwnerColumn } from "@/lib/demo/workout-plans-owner-column"

type DemoMemberRef = { id: string }
type DemoPlanRef = { id: string }

type DemoWorkoutAssignmentInsert =
  Database["public"]["Tables"]["workout_assignments"]["Insert"]

export type GenerateDemoWorkoutAssignmentsResult = {
  workoutAssignmentsCreated: number
  error: string | null
}

async function fetchDemoMembers(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ members: DemoMemberRef[]; error: string | null }> {
  const ownerColumn = resolveMembersOwnerColumn()

  const flagged = await supabase
    .from("members")
    .select("id")
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
    .select("id")
    .eq(ownerColumn, userId)
    .or(DEMO_MEMBER_LEGACY_EMAIL_OR_FILTER)
    .order("full_name")

  if (legacy.error) {
    return { members: [], error: legacy.error.message }
  }

  return { members: legacy.data ?? [], error: null }
}

async function fetchDemoWorkoutPlans(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ plans: DemoPlanRef[]; error: string | null }> {
  const ownerColumn = resolveWorkoutPlansOwnerColumn()
  const demoTitles = DEMO_WORKOUT_PLAN_SEEDS.map((plan) => plan.title)

  const flagged = await supabase
    .from("workout_plans")
    .select("id")
    .eq(ownerColumn, userId)
    .eq("is_demo", true)
    .order("title")

  if (!flagged.error && (flagged.data?.length ?? 0) > 0) {
    return { plans: flagged.data ?? [], error: null }
  }

  if (flagged.error && !flagged.error.message.includes("is_demo")) {
    return { plans: [], error: flagged.error.message }
  }

  const legacy = await supabase
    .from("workout_plans")
    .select("id")
    .eq(ownerColumn, userId)
    .in("title", demoTitles)
    .order("title")

  if (legacy.error) {
    return { plans: [], error: legacy.error.message }
  }

  return { plans: legacy.data ?? [], error: null }
}

async function clearDemoWorkoutAssignments(
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

export async function clearDemoWorkoutAssignmentsForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ error: string | null }> {
  const { members, error: membersError } = await fetchDemoMembers(
    supabase,
    userId,
  )

  if (membersError) {
    return { error: membersError }
  }

  const memberIds = members.map((member) => member.id)
  return clearDemoWorkoutAssignments(supabase, memberIds)
}

function buildDemoWorkoutAssignments(
  members: DemoMemberRef[],
  plans: DemoPlanRef[],
): DemoWorkoutAssignmentInsert[] {
  const assignedAt = new Date().toISOString()

  return members.map((member, index) => ({
    member_id: member.id,
    workout_plan_id: plans[index % plans.length].id,
    assigned_at: assignedAt,
    status: "active",
    completed_at: null,
    is_demo: true,
  }))
}

export async function generateDemoWorkoutAssignmentsForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<GenerateDemoWorkoutAssignmentsResult> {
  const { members, error: membersError } = await fetchDemoMembers(
    supabase,
    userId,
  )

  const { plans, error: plansError } = await fetchDemoWorkoutPlans(
    supabase,
    userId,
  )

  console.log("[demo/generate] members found:", members.length)
  console.log("[demo/generate] workout plans found:", plans.length)

  if (membersError) {
    console.error("[demo/generate] members fetch error:", membersError)
    return { workoutAssignmentsCreated: 0, error: membersError }
  }

  if (plansError) {
    console.error("[demo/generate] workout plans fetch error:", plansError)
    return { workoutAssignmentsCreated: 0, error: plansError }
  }

  if (members.length === 0 || plans.length === 0) {
    return { workoutAssignmentsCreated: 0, error: null }
  }

  const memberIds = members.map((member) => member.id)
  const clearResult = await clearDemoWorkoutAssignments(supabase, memberIds)

  if (clearResult.error) {
    console.error(
      "[demo/generate] clear assignments error:",
      clearResult.error,
    )
    return { workoutAssignmentsCreated: 0, error: clearResult.error }
  }

  const rows = buildDemoWorkoutAssignments(members, plans)

  const { data, error: insertError } = await supabase
    .from("workout_assignments")
    .insert(rows)
    .select("id")

  if (insertError) {
    console.error("[demo/generate] insert error:", insertError.message)

    if (insertError.message.includes("is_demo")) {
      const legacyRows = rows.map(({ is_demo: _isDemo, ...row }) => row)
      const legacyInsert = await supabase
        .from("workout_assignments")
        .insert(legacyRows)
        .select("id")

      if (legacyInsert.error) {
        console.error(
          "[demo/generate] legacy insert error:",
          legacyInsert.error.message,
        )
        return {
          workoutAssignmentsCreated: 0,
          error: legacyInsert.error.message,
        }
      }

      const created = legacyInsert.data?.length ?? 0
      console.log("[demo/generate] assignments created:", created)
      return { workoutAssignmentsCreated: created, error: null }
    }

    return { workoutAssignmentsCreated: 0, error: insertError.message }
  }

  const created = data?.length ?? 0
  console.log("[demo/generate] assignments created:", created)

  return { workoutAssignmentsCreated: created, error: null }
}
