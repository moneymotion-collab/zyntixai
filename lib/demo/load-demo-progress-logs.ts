import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { DEMO_MEMBER_LEGACY_EMAIL_OR_FILTER } from "@/lib/demo/demo-members"
import { resolveMembersOwnerColumn } from "@/lib/demo/members-owner-column"

type DemoMemberRef = { id: string; full_name: string }

type ProgressLogInsert = Database["public"]["Tables"]["progress_logs"]["Insert"]

type LoadDemoProgressLogInsert = ProgressLogInsert & {
  is_demo?: boolean
}

export const LOAD_DEMO_PROGRESS_WEEKS = 4
export const LOAD_DEMO_WEIGHT_METRIC = "weight" as const
export const LOAD_DEMO_ENERGY_METRIC = "energy" as const

type MemberProgressSeed = {
  weight: number[]
  energy: number[]
}

const LOAD_DEMO_MEMBER_PROGRESS: Record<string, MemberProgressSeed> = {
  "Sarah Johnson": { weight: [74, 73, 72, 71], energy: [65, 72, 78, 82] },
  "Mike Roberts": { weight: [82, 83, 84, 85], energy: [70, 74, 79, 84] },
  "Emma Davis": { weight: [68, 67, 66, 65], energy: [60, 68, 75, 80] },
  "James Wilson": { weight: [90, 91, 92, 93], energy: [66, 70, 76, 81] },
  "Olivia Brown": { weight: [63, 62, 61, 60], energy: [64, 71, 77, 83] },
}

function weekUpdatedAt(week: number): string {
  const weeksAgo = LOAD_DEMO_PROGRESS_WEEKS - week
  const date = new Date()
  date.setDate(date.getDate() - weeksAgo * 7)
  date.setHours(10, 0, 0, 0)
  return date.toISOString()
}

function buildMetricLogs(
  memberId: string,
  metric: string,
  values: number[],
): LoadDemoProgressLogInsert[] {
  const startValue = values[0]

  if (startValue == null) {
    return []
  }

  return values.map((currentValue, index) => ({
    member_id: memberId,
    metric,
    start_value: startValue,
    current_value: currentValue,
    change_value: currentValue - startValue,
    updated_at: weekUpdatedAt(index + 1),
    is_demo: true,
  }))
}

function buildProgressLogsForMember(
  member: DemoMemberRef,
): LoadDemoProgressLogInsert[] {
  const seed = LOAD_DEMO_MEMBER_PROGRESS[member.full_name]

  if (!seed) {
    return []
  }

  return [
    ...buildMetricLogs(member.id, LOAD_DEMO_WEIGHT_METRIC, seed.weight),
    ...buildMetricLogs(member.id, LOAD_DEMO_ENERGY_METRIC, seed.energy),
  ]
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

async function clearLoadDemoProgressLogs(
  supabase: SupabaseClient<Database>,
  memberIds: string[],
): Promise<{ error: string | null }> {
  if (memberIds.length === 0) {
    return { error: null }
  }

  const { error: demoDeleteError } = await supabase
    .from("progress_logs")
    .delete()
    .in("member_id", memberIds)
    .filter("is_demo", "eq", true)

  if (!demoDeleteError) {
    return { error: null }
  }

  if (!demoDeleteError.message.includes("is_demo")) {
    return { error: demoDeleteError.message }
  }

  const { error: legacyDeleteError } = await supabase
    .from("progress_logs")
    .delete()
    .in("member_id", memberIds)

  return { error: legacyDeleteError?.message ?? null }
}

export async function loadDemoProgressLogsForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ progressLogsCreated: number; error: string | null }> {
  const { members, error: membersError } = await fetchDemoMembers(
    supabase,
    userId,
  )

  if (membersError) {
    return { progressLogsCreated: 0, error: membersError }
  }

  if (members.length === 0) {
    return { progressLogsCreated: 0, error: null }
  }

  const memberIds = members.map((member) => member.id)
  const clearResult = await clearLoadDemoProgressLogs(supabase, memberIds)

  if (clearResult.error) {
    return { progressLogsCreated: 0, error: clearResult.error }
  }

  const rows = members.flatMap((member) => buildProgressLogsForMember(member))

  const { data, error: insertError } = await supabase
    .from("progress_logs")
    .insert(rows as ProgressLogInsert[])
    .select("id")

  if (insertError) {
    if (insertError.message.includes("is_demo")) {
      const legacyRows = rows.map(({ is_demo: _isDemo, ...row }) => row)
      const legacyInsert = await supabase
        .from("progress_logs")
        .insert(legacyRows as ProgressLogInsert[])
        .select("id")

      if (legacyInsert.error) {
        return { progressLogsCreated: 0, error: legacyInsert.error.message }
      }

      return {
        progressLogsCreated: legacyInsert.data?.length ?? 0,
        error: null,
      }
    }

    return { progressLogsCreated: 0, error: insertError.message }
  }

  return { progressLogsCreated: data?.length ?? 0, error: null }
}
