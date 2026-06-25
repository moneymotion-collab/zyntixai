import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type { AiCoachAuthContext } from "./access"

export type MemberAiContext = {
  scope: "member"
  member: Database["public"]["Tables"]["members"]["Row"]
  workoutAssignments: unknown[]
  nutritionAssignments: unknown[]
  progressLogs: Database["public"]["Tables"]["progress_logs"]["Row"][]
}

export type CoachOverviewContext = {
  scope: "overview"
  members: Pick<
    Database["public"]["Tables"]["members"]["Row"],
    "id" | "full_name" | "email" | "goal" | "plan" | "status"
  >[]
  aggregate: {
    workoutAssignmentCount: number
    nutritionAssignmentCount: number
    progressLogCount: number
  }
}

export type AiCoachContext = MemberAiContext | CoachOverviewContext

export async function fetchMemberContext(
  supabase: SupabaseClient<Database>,
  memberId: string,
): Promise<MemberAiContext | null> {
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("*")
    .eq("id", memberId)
    .maybeSingle()

  if (memberError || !member) return null

  const [
    { data: workoutAssignments },
    { data: nutritionAssignments },
    { data: progressLogs },
  ] = await Promise.all([
    supabase
      .from("workout_assignments")
      .select(
        `
        id,
        status,
        assigned_at,
        workout_plans (
          title,
          goal,
          weeks,
          workout_plan_exercises (
            order_index,
            sets,
            reps,
            exercises ( name )
          )
        )
      `,
      )
      .eq("member_id", memberId)
      .order("assigned_at", { ascending: false }),
    supabase
      .from("member_nutrition_assignments")
      .select(
        `
        assigned_at,
        nutrition_plans (
          title,
          goal,
          calories,
          protein,
          carbs,
          fats,
          description
        )
      `,
      )
      .eq("member_id", memberId)
      .order("assigned_at", { ascending: false }),
    supabase
      .from("progress_logs")
      .select("*")
      .eq("member_id", memberId)
      .order("updated_at", { ascending: false })
      .limit(25),
  ])

  return {
    scope: "member",
    member,
    workoutAssignments: workoutAssignments ?? [],
    nutritionAssignments: nutritionAssignments ?? [],
    progressLogs: progressLogs ?? [],
  }
}

export async function fetchCoachOverviewContext(
  supabase: SupabaseClient<Database>,
  auth: AiCoachAuthContext,
): Promise<CoachOverviewContext> {
  let membersQuery = supabase
    .from("members")
    .select("id, full_name, email, goal, plan, status")
    .order("created_at", { ascending: false })
    .limit(20)

  if (!auth.isAdmin) {
    membersQuery = membersQuery.eq("coach_id", auth.userId)
  }

  const { data: members } = await membersQuery
  const memberList = members ?? []
  const memberIds = memberList.map((m) => m.id)

  if (memberIds.length === 0) {
    return {
      scope: "overview",
      members: [],
      aggregate: {
        workoutAssignmentCount: 0,
        nutritionAssignmentCount: 0,
        progressLogCount: 0,
      },
    }
  }

  const [
    { count: workoutAssignmentCount },
    { count: nutritionAssignmentCount },
    { count: progressLogCount },
  ] = await Promise.all([
    supabase
      .from("workout_assignments")
      .select("*", { count: "exact", head: true })
      .in("member_id", memberIds),
    supabase
      .from("member_nutrition_assignments")
      .select("*", { count: "exact", head: true })
      .in("member_id", memberIds),
    supabase
      .from("progress_logs")
      .select("*", { count: "exact", head: true })
      .in("member_id", memberIds),
  ])

  return {
    scope: "overview",
    members: memberList,
    aggregate: {
      workoutAssignmentCount: workoutAssignmentCount ?? 0,
      nutritionAssignmentCount: nutritionAssignmentCount ?? 0,
      progressLogCount: progressLogCount ?? 0,
    },
  }
}

export async function resolveAiContext(
  supabase: SupabaseClient<Database>,
  auth: AiCoachAuthContext,
  memberId: string | undefined,
): Promise<AiCoachContext> {
  if (memberId) {
    const memberContext = await fetchMemberContext(supabase, memberId)
    if (memberContext) return memberContext
  }

  return fetchCoachOverviewContext(supabase, auth)
}
