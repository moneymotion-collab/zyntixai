import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { DEMO_MEMBER_EMAIL_DOMAIN } from "@/lib/demo/demo-members"
import { resolveMembersOwnerColumn } from "@/lib/demo/members-owner-column"
import { resolveWorkoutPlansOwnerColumn } from "@/lib/demo/workout-plans-owner-column"

type DemoMemberRef = { id: string; full_name: string }
type DemoPlanRef = { id: string; title: string }

type WorkoutCompletionInsert =
  Database["public"]["Tables"]["workout_completions"]["Insert"]

export const DEMO_WORKOUT_COMPLETIONS_COUNT = 18

export type GenerateDemoWorkoutCompletionsResult = {
  workoutCompletionsCreated: number
  error: string | null
}

function hoursAgo(hours: number): string {
  const date = new Date()
  date.setHours(date.getHours() - hours)
  return date.toISOString()
}

function daysAgo(days: number, hour = 10): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
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
    .or(`email.like.%@${DEMO_MEMBER_EMAIL_DOMAIN},email.like.%@demo.local`)
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

  const flagged = await supabase
    .from("workout_plans")
    .select("id, title")
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
    .select("id, title")
    .eq(ownerColumn, userId)
    .order("title")

  if (legacy.error) {
    return { plans: [], error: legacy.error.message }
  }

  return { plans: legacy.data ?? [], error: null }
}

async function clearDemoWorkoutCompletions(
  supabase: SupabaseClient<Database>,
  memberIds: string[],
): Promise<{ error: string | null }> {
  if (memberIds.length === 0) {
    return { error: null }
  }

  const { error } = await supabase
    .from("workout_completions")
    .delete()
    .in("member_id", memberIds)

  return { error: error?.message ?? null }
}

export async function clearDemoWorkoutCompletionsForCoach(
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
  return clearDemoWorkoutCompletions(supabase, memberIds)
}

function buildDemoWorkoutCompletions(
  members: DemoMemberRef[],
  plans: DemoPlanRef[],
): WorkoutCompletionInsert[] {
  const lisa = members.find((member) => member.full_name === "Lisa Johnson")
  const featuredIds = new Set(
    [
      lisa?.id,
      members.find((member) => member.full_name === "Mark Davis")?.id,
      members.find((member) => member.full_name === "Emma Wilson")?.id,
      members.find((member) => member.full_name === "Ryan Clark")?.id,
    ].filter(Boolean),
  )

  const rows: WorkoutCompletionInsert[] = []
  const pool = members.filter((member) => member.id !== lisa?.id)

  if (lisa && plans.length > 0) {
    rows.push({
      member_id: lisa.id,
      workout_plan_id: plans[0].id,
      completed_at: hoursAgo(2),
    })
  }

  const completionSchedule = [
    hoursAgo(5),
    hoursAgo(8),
    hoursAgo(12),
    hoursAgo(18),
    hoursAgo(26),
    daysAgo(1, 17),
    daysAgo(1, 9),
    daysAgo(2, 16),
    daysAgo(2, 11),
    daysAgo(3, 15),
    daysAgo(3, 8),
    daysAgo(4, 14),
    daysAgo(5, 10),
    daysAgo(6, 16),
    daysAgo(6, 9),
    daysAgo(7, 11),
    daysAgo(7, 18),
  ]

  for (let index = 0; index < completionSchedule.length; index += 1) {
    const member = pool[index % pool.length]
    if (!member) continue

    rows.push({
      member_id: member.id,
      workout_plan_id: plans[(index + 1) % plans.length].id,
      completed_at: completionSchedule[index],
    })
  }

  for (const member of members) {
    if (!featuredIds.has(member.id)) continue
    if (member.id === lisa?.id) continue

    rows.push({
      member_id: member.id,
      workout_plan_id: plans[rows.length % plans.length].id,
      completed_at: hoursAgo(20 + featuredIds.size),
    })
  }

  return rows.slice(0, DEMO_WORKOUT_COMPLETIONS_COUNT)
}

export async function generateDemoWorkoutCompletionsForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<GenerateDemoWorkoutCompletionsResult> {
  const { members, error: membersError } = await fetchDemoMembers(
    supabase,
    userId,
  )
  const { plans, error: plansError } = await fetchDemoWorkoutPlans(
    supabase,
    userId,
  )

  if (membersError) {
    return { workoutCompletionsCreated: 0, error: membersError }
  }

  if (plansError) {
    return { workoutCompletionsCreated: 0, error: plansError }
  }

  if (members.length === 0 || plans.length === 0) {
    return { workoutCompletionsCreated: 0, error: null }
  }

  const memberIds = members.map((member) => member.id)
  const clearResult = await clearDemoWorkoutCompletions(supabase, memberIds)

  if (clearResult.error) {
    return { workoutCompletionsCreated: 0, error: clearResult.error }
  }

  const rows = buildDemoWorkoutCompletions(members, plans)

  const { data, error: insertError } = await supabase
    .from("workout_completions")
    .insert(rows)
    .select("id")

  if (insertError) {
    return { workoutCompletionsCreated: 0, error: insertError.message }
  }

  return {
    workoutCompletionsCreated: data?.length ?? 0,
    error: null,
  }
}
