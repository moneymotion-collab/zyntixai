import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import {
  resolveMembersOwnerColumn,
  type ClearDemoMembersResult,
} from "@/lib/demo/members-owner-column"

export { resolveMembersOwnerColumn, type ClearDemoMembersResult }

export const DEMO_MEMBER_EMAIL_DOMAIN = "demo.com"

export const DEMO_MEMBER_LEGACY_EMAIL_OR_FILTER =
  "email.like.%@demo.com,email.like.%@demo.fitai.local,email.like.%@demo.local"

export type DemoMemberSeed = {
  full_name: string
  email: string
  goal: string
  plan: string
  status: string
}

export const DEMO_MEMBER_SEEDS: DemoMemberSeed[] = [
  {
    full_name: "Sarah Johnson",
    email: "sarah@demo.com",
    goal: "Fat Loss",
    plan: "Pro",
    status: "Active",
  },
  {
    full_name: "Mike Roberts",
    email: "mike@demo.com",
    goal: "Muscle Gain",
    plan: "Elite",
    status: "Active",
  },
  {
    full_name: "Emma Davis",
    email: "emma@demo.com",
    goal: "Online Coaching",
    plan: "Pro",
    status: "Active",
  },
  {
    full_name: "James Wilson",
    email: "james@demo.com",
    goal: "Strength",
    plan: "Elite",
    status: "Active",
  },
  {
    full_name: "Olivia Brown",
    email: "olivia@demo.com",
    goal: "Weight Loss",
    plan: "Basic",
    status: "Active",
  },
]

async function deleteMemberAssignments(
  supabase: SupabaseClient<Database>,
  memberIds: string[],
) {
  if (memberIds.length === 0) return

  await supabase
    .from("progress_logs")
    .delete()
    .in("member_id", memberIds)

  await supabase
    .from("workout_assignments")
    .delete()
    .in("member_id", memberIds)

  await supabase
    .from("member_nutrition_assignments")
    .delete()
    .in("member_id", memberIds)
}

export async function clearDemoMembersForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ClearDemoMembersResult> {
  const ownerColumn = resolveMembersOwnerColumn()
  const filterUsed = `${ownerColumn}=${userId}, is_demo=true`

  const { data, error } = await supabase
    .from("members")
    .select("id")
    .eq(ownerColumn, userId)
    .eq("is_demo", true)

  if (error) {
    if (error.message.includes("is_demo")) {
      return clearLegacyDemoMembersByEmail(supabase, userId, ownerColumn)
    }

    return { membersDeleted: 0, filterUsed, error: error.message }
  }

  let ids = data?.map((row) => row.id) ?? []

  if (ids.length === 0) {
    const legacy = await clearLegacyDemoMembersByEmail(
      supabase,
      userId,
      ownerColumn,
    )

    if (legacy.membersDeleted > 0 || legacy.error) {
      return legacy
    }

    return { membersDeleted: 0, filterUsed, error: null }
  }

  await deleteMemberAssignments(supabase, ids)

  const { error: deleteError, count } = await supabase
    .from("members")
    .delete({ count: "exact" })
    .eq(ownerColumn, userId)
    .eq("is_demo", true)

  if (deleteError) {
    return { membersDeleted: 0, filterUsed, error: deleteError.message }
  }

  return {
    membersDeleted: count ?? ids.length,
    filterUsed,
    error: null,
  }
}

async function clearLegacyDemoMembersByEmail(
  supabase: SupabaseClient<Database>,
  userId: string,
  ownerColumn: ReturnType<typeof resolveMembersOwnerColumn>,
): Promise<ClearDemoMembersResult> {
  const filterUsed = `${ownerColumn}=${userId}, email=@demo.com|@demo.fitai.local|@demo.local`

  const { data, error } = await supabase
    .from("members")
    .select("id")
    .eq(ownerColumn, userId)
    .or(DEMO_MEMBER_LEGACY_EMAIL_OR_FILTER)

  if (error) {
    return { membersDeleted: 0, filterUsed, error: error.message }
  }

  const ids = data?.map((row) => row.id) ?? []

  if (ids.length === 0) {
    return { membersDeleted: 0, filterUsed, error: null }
  }

  await deleteMemberAssignments(supabase, ids)

  const { error: deleteError, count } = await supabase
    .from("members")
    .delete({ count: "exact" })
    .in("id", ids)
    .eq(ownerColumn, userId)

  if (deleteError) {
    return { membersDeleted: 0, filterUsed, error: deleteError.message }
  }

  return {
    membersDeleted: count ?? ids.length,
    filterUsed,
    error: null,
  }
}

export async function generateDemoMembersForCoach(
  supabase: SupabaseClient<Database>,
  coachId: string,
): Promise<{ membersCreated: number; error: string | null }> {
  const clearResult = await clearDemoMembersForCoach(supabase, coachId)

  if (clearResult.error) {
    return { membersCreated: 0, error: clearResult.error }
  }

  const rows = DEMO_MEMBER_SEEDS.map((member) => ({
    ...member,
    coach_id: coachId,
    is_demo: true,
  }))

  const { data, error } = await supabase
    .from("members")
    .insert(rows)
    .select("id")

  if (error) {
    if (error.message.includes("is_demo")) {
      const legacyRows = DEMO_MEMBER_SEEDS.map((member) => ({
        full_name: member.full_name,
        email: member.email,
        goal: member.goal,
        plan: member.plan,
        status: member.status,
        coach_id: coachId,
      }))

      const legacyInsert = await supabase
        .from("members")
        .insert(legacyRows)
        .select("id")

      if (legacyInsert.error) {
        return { membersCreated: 0, error: legacyInsert.error.message }
      }

      return {
        membersCreated: legacyInsert.data?.length ?? 0,
        error: null,
      }
    }

    return { membersCreated: 0, error: error.message }
  }

  return { membersCreated: data?.length ?? 0, error: null }
}
