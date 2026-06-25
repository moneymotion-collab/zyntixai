import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { DEMO_MEMBER_EMAIL_DOMAIN } from "@/lib/demo/demo-members"
import { resolveMembersOwnerColumn } from "@/lib/demo/members-owner-column"

type DemoMemberRef = { id: string; full_name: string }

type ClientCheckInInsert = Database["public"]["Tables"]["client_checkins"]["Insert"]

export const DEMO_CHECK_INS_COUNT = 12

export type GenerateDemoCheckInsResult = {
  checkInsCreated: number
  error: string | null
}

function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function hoursAgo(hours: number): string {
  const date = new Date()
  date.setHours(date.getHours() - hours)
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

async function clearDemoCheckIns(
  supabase: SupabaseClient<Database>,
  coachId: string,
  memberIds: string[],
): Promise<{ error: string | null }> {
  if (memberIds.length === 0) {
    return { error: null }
  }

  const { error } = await supabase
    .from("client_checkins")
    .delete()
    .eq("coach_id", coachId)
    .in("member_id", memberIds)

  return { error: error?.message ?? null }
}

export async function clearDemoCheckInsForCoach(
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
  return clearDemoCheckIns(supabase, userId, memberIds)
}

function buildDemoCheckIns(
  members: DemoMemberRef[],
  coachId: string,
): ClientCheckInInsert[] {
  const mark = members.find((member) => member.full_name === "Mark Davis")
  const rows: ClientCheckInInsert[] = []

  const templates = [
    { member: mark, days: 0, hours: 4, weight: 82.4, energy: 8, sleep: 7, motivation: 8 },
    { member: members.find((m) => m.full_name === "Lisa Johnson"), days: 1, weight: 68.2, energy: 9, sleep: 8, motivation: 9 },
    { member: members.find((m) => m.full_name === "Emma Wilson"), days: 2, weight: 61.5, energy: 7, sleep: 6, motivation: 7 },
    { member: members.find((m) => m.full_name === "Ryan Clark"), days: 3, weight: 88.1, energy: 8, sleep: 7, motivation: 8 },
    { member: members.find((m) => m.full_name === "Sophie Miller"), days: 4, weight: 64.0, energy: 6, sleep: 5, motivation: 6 },
    { member: members.find((m) => m.full_name === "James Anderson"), days: 5, weight: 79.3, energy: 8, sleep: 7, motivation: 7 },
    { member: members.find((m) => m.full_name === "Olivia Brown"), days: 6, weight: 72.8, energy: 7, sleep: 8, motivation: 8 },
    { member: members.find((m) => m.full_name === "Ava Martinez"), days: 7, weight: 58.6, energy: 9, sleep: 8, motivation: 9 },
    { member: members.find((m) => m.full_name === "Liam Thompson"), days: 8, weight: 91.2, energy: 7, sleep: 6, motivation: 7 },
    { member: members.find((m) => m.full_name === "Mia Garcia"), days: 9, weight: 66.4, energy: 8, sleep: 7, motivation: 8 },
    { member: members.find((m) => m.full_name === "Noah Taylor"), days: 10, weight: 75.0, energy: 6, sleep: 6, motivation: 5 },
    { member: members.find((m) => m.full_name === "James Anderson"), days: 11, weight: 78.9, energy: 8, sleep: 7, motivation: 8 },
  ]

  for (const template of templates) {
    if (!template.member) continue

    rows.push({
      coach_id: coachId,
      member_id: template.member.id,
      member_name: template.member.full_name,
      checkin_date: daysAgo(template.days),
      created_at:
        template.hours != null ? hoursAgo(template.hours) : undefined,
      weight: template.weight,
      energy: template.energy,
      sleep: template.sleep,
      motivation: template.motivation,
    })
  }

  return rows.slice(0, DEMO_CHECK_INS_COUNT)
}

export async function generateDemoCheckInsForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<GenerateDemoCheckInsResult> {
  const { members, error: membersError } = await fetchDemoMembers(
    supabase,
    userId,
  )

  if (membersError) {
    return { checkInsCreated: 0, error: membersError }
  }

  if (members.length === 0) {
    return { checkInsCreated: 0, error: null }
  }

  const memberIds = members.map((member) => member.id)
  const clearResult = await clearDemoCheckIns(supabase, userId, memberIds)

  if (clearResult.error) {
    return { checkInsCreated: 0, error: clearResult.error }
  }

  const rows = buildDemoCheckIns(members, userId)

  const { data, error: insertError } = await supabase
    .from("client_checkins")
    .insert(rows)
    .select("id")

  if (insertError) {
    return { checkInsCreated: 0, error: insertError.message }
  }

  return {
    checkInsCreated: data?.length ?? 0,
    error: null,
  }
}
