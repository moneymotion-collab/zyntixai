import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { DEMO_MEMBER_LEGACY_EMAIL_OR_FILTER } from "@/lib/demo/demo-members"
import { resolveMembersOwnerColumn } from "@/lib/demo/members-owner-column"

type DemoMemberRef = { id: string; full_name: string }

type WeekCheckInSeed = {
  weight: number
  energy: number
  sleep: number
  motivation: number
}

type ClientCheckInInsert = Database["public"]["Tables"]["client_checkins"]["Insert"]

export const LOAD_DEMO_CHECKIN_WEEKS = 4

const LOAD_DEMO_MEMBER_CHECKINS: Record<string, WeekCheckInSeed[]> = {
  "Sarah Johnson": [
    { weight: 74, energy: 6, sleep: 6, motivation: 7 },
    { weight: 73, energy: 7, sleep: 7, motivation: 7 },
    { weight: 72, energy: 8, sleep: 7, motivation: 8 },
    { weight: 71, energy: 8, sleep: 8, motivation: 9 },
  ],
  "Mike Roberts": [
    { weight: 82, energy: 7, sleep: 6, motivation: 6 },
    { weight: 83, energy: 7, sleep: 7, motivation: 7 },
    { weight: 84, energy: 8, sleep: 7, motivation: 8 },
    { weight: 85, energy: 8, sleep: 8, motivation: 8 },
  ],
  "Emma Davis": [
    { weight: 68, energy: 6, sleep: 5, motivation: 6 },
    { weight: 67, energy: 7, sleep: 6, motivation: 7 },
    { weight: 66, energy: 7, sleep: 7, motivation: 8 },
    { weight: 65, energy: 8, sleep: 8, motivation: 8 },
  ],
  "James Wilson": [
    { weight: 90, energy: 6, sleep: 6, motivation: 5 },
    { weight: 91, energy: 7, sleep: 6, motivation: 6 },
    { weight: 92, energy: 7, sleep: 7, motivation: 7 },
    { weight: 93, energy: 8, sleep: 7, motivation: 8 },
  ],
  "Olivia Brown": [
    { weight: 63, energy: 6, sleep: 6, motivation: 7 },
    { weight: 62, energy: 7, sleep: 7, motivation: 7 },
    { weight: 61, energy: 8, sleep: 7, motivation: 8 },
    { weight: 60, energy: 8, sleep: 8, motivation: 9 },
  ],
}

function checkinDateForWeek(week: number): string {
  const weeksAgo = LOAD_DEMO_CHECKIN_WEEKS - week
  const date = new Date()
  date.setDate(date.getDate() - weeksAgo * 7)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
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

async function clearLoadDemoClientCheckIns(
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

function buildLoadDemoClientCheckIns(
  members: DemoMemberRef[],
  coachId: string,
): ClientCheckInInsert[] {
  const rows: ClientCheckInInsert[] = []

  for (const member of members) {
    const weeks = LOAD_DEMO_MEMBER_CHECKINS[member.full_name]

    if (!weeks) {
      continue
    }

    weeks.forEach((weekData, index) => {
      rows.push({
        coach_id: coachId,
        member_id: member.id,
        member_name: member.full_name,
        checkin_date: checkinDateForWeek(index + 1),
        weight: weekData.weight,
        energy: weekData.energy,
        sleep: weekData.sleep,
        motivation: weekData.motivation,
        coach_note: null,
        action_plan: null,
      })
    })
  }

  return rows
}

export async function loadDemoClientCheckInsForCoach(
  supabase: SupabaseClient<Database>,
  coachId: string,
): Promise<{ checkInsCreated: number; error: string | null }> {
  const { members, error: membersError } = await fetchDemoMembers(
    supabase,
    coachId,
  )

  if (membersError) {
    return { checkInsCreated: 0, error: membersError }
  }

  if (members.length === 0) {
    return { checkInsCreated: 0, error: null }
  }

  const memberIds = members.map((member) => member.id)
  const clearResult = await clearLoadDemoClientCheckIns(
    supabase,
    coachId,
    memberIds,
  )

  if (clearResult.error) {
    return { checkInsCreated: 0, error: clearResult.error }
  }

  const rows = buildLoadDemoClientCheckIns(members, coachId)

  if (rows.length === 0) {
    return { checkInsCreated: 0, error: null }
  }

  const { data, error: insertError } = await supabase
    .from("client_checkins")
    .insert(rows)
    .select("id")

  if (insertError) {
    return { checkInsCreated: 0, error: insertError.message }
  }

  return { checkInsCreated: data?.length ?? 0, error: null }
}
