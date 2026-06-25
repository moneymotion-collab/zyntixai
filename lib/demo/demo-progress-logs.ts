import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { DEMO_MEMBER_LEGACY_EMAIL_OR_FILTER } from "@/lib/demo/demo-members"
import { resolveMembersOwnerColumn } from "@/lib/demo/members-owner-column"
import {
  buildProgressChartDebug,
  type ProgressChartDebug,
  type ProgressLogRow,
} from "@/lib/progress/fetch-progress-dashboard"

type DemoMemberRef = { id: string; goal: string | null; full_name?: string | null }

type ProgressLogInsert = Database["public"]["Tables"]["progress_logs"]["Insert"]

type DemoProgressLogInsert = ProgressLogInsert & {
  is_demo?: boolean
}

type MemberProgressProfile = "fat_loss" | "muscle_gain" | "strength" | "recomp" | "general"

export const DEMO_PROGRESS_METRIC = "weight" as const
export const DEMO_PROGRESS_LOGS_PER_MEMBER = 12
export const DEMO_PROGRESS_MIN_WEIGHT_LOGS = 6

const EMPTY_CHART_DEBUG: ProgressChartDebug = {
  selected_member_id: null,
  progress_records_found: 0,
  metric_names_found: [],
  chart_data_length: 0,
}

export type GenerateDemoProgressLogsResult = {
  demoMembersFound: number
  progressLogsCreated: number
  chartDebug: ProgressChartDebug
  error: string | null
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function classifyMemberGoal(goal: string | null): MemberProgressProfile {
  const g = (goal ?? "").toLowerCase()

  if (
    g.includes("fat loss") ||
    g.includes("weight loss") ||
    g.includes("glp-1") ||
    g.includes("contest prep") ||
    g.includes("nutrition focus")
  ) {
    return "fat_loss"
  }

  if (
    g.includes("muscle gain") ||
    g.includes("hypertrophy") ||
    g.includes("lean muscle")
  ) {
    return "muscle_gain"
  }

  if (
    g.includes("strength") ||
    g.includes("powerlifting") ||
    g.includes("crossfit") ||
    g.includes("athletic performance") ||
    g.includes("calisthenics")
  ) {
    return "strength"
  }

  if (g.includes("recomposition") || g.includes("recomp")) {
    return "recomp"
  }

  return "general"
}

function hashMemberSeed(memberId: string): number {
  let hash = 0
  for (let i = 0; i < memberId.length; i += 1) {
    hash = (hash * 31 + memberId.charCodeAt(i)) >>> 0
  }
  return hash
}

function weightRangeForProfile(
  profile: MemberProgressProfile,
  seed: number,
): { startWeight: number; endWeight: number } {
  const base = 68 + (seed % 18)

  switch (profile) {
    case "fat_loss":
      return {
        startWeight: round1(78 + (seed % 8)),
        endWeight: round1(70 + (seed % 6)),
      }
    case "muscle_gain":
      return {
        startWeight: round1(68 + (seed % 8)),
        endWeight: round1(74 + (seed % 8)),
      }
    case "strength":
      return {
        startWeight: round1(base),
        endWeight: round1(base + 1 + (seed % 4)),
      }
    case "recomp":
      return {
        startWeight: round1(74 + (seed % 10)),
        endWeight: round1(72 + (seed % 8)),
      }
    default:
      return {
        startWeight: round1(base),
        endWeight: round1(base + ((seed % 5) - 2)),
      }
  }
}

function weightAtWeek(
  startWeight: number,
  endWeight: number,
  week: number,
): number {
  const progress = (week - 1) / (DEMO_PROGRESS_LOGS_PER_MEMBER - 1)
  const weeklyNoise =
    week === 1 || week === DEMO_PROGRESS_LOGS_PER_MEMBER
      ? 0
      : ((week * 17) % 5) * 0.1 - 0.2

  return round1(startWeight + (endWeight - startWeight) * progress + weeklyNoise)
}

function hoursAgo(hours: number): string {
  const date = new Date()
  date.setHours(date.getHours() - hours)
  return date.toISOString()
}

function weekUpdatedAt(week: number, member?: DemoMemberRef): string {
  if (week === DEMO_PROGRESS_LOGS_PER_MEMBER && member?.full_name === "Mike Roberts") {
    return hoursAgo(6)
  }

  const weeksAgo = DEMO_PROGRESS_LOGS_PER_MEMBER - week
  const date = new Date()
  date.setDate(date.getDate() - weeksAgo * 7)
  date.setHours(10, 0, 0, 0)
  return date.toISOString()
}

function buildProgressLogsForMember(member: DemoMemberRef): DemoProgressLogInsert[] {
  const profile = classifyMemberGoal(member.goal)
  const seed = hashMemberSeed(member.id)
  const { startWeight, endWeight } = weightRangeForProfile(profile, seed)
  const rows: DemoProgressLogInsert[] = []

  for (let week = 1; week <= DEMO_PROGRESS_LOGS_PER_MEMBER; week += 1) {
    const currentValue = weightAtWeek(startWeight, endWeight, week)

    rows.push({
      member_id: member.id,
      metric: DEMO_PROGRESS_METRIC,
      start_value: startWeight,
      current_value: currentValue,
      change_value: round1(currentValue - startWeight),
      updated_at: weekUpdatedAt(week, member),
      is_demo: true,
    })
  }

  return rows
}

function toChartDebugRows(rows: DemoProgressLogInsert[]): ProgressLogRow[] {
  return rows.map((row) => ({
    id: "",
    member_id: row.member_id ?? null,
    metric: row.metric ?? null,
    start_value: row.start_value ?? null,
    current_value: row.current_value ?? null,
    change_value: row.change_value ?? null,
    updated_at: row.updated_at ?? null,
    members: null,
  }))
}

function buildDemoChartDebug(
  members: DemoMemberRef[],
  rows: DemoProgressLogInsert[],
): ProgressChartDebug {
  const selectedMemberId = members[0]?.id ?? null

  if (!selectedMemberId) {
    return {
      selected_member_id: null,
      progress_records_found: 0,
      metric_names_found: [],
      chart_data_length: 0,
    }
  }

  return buildProgressChartDebug(toChartDebugRows(rows), selectedMemberId, "weight")
}

async function fetchDemoMembers(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ members: DemoMemberRef[]; error: string | null }> {
  const ownerColumn = resolveMembersOwnerColumn() as "coach_id"

  const flagged = await supabase
    .from("members")
    .select("id, goal, full_name")
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
    .select("id, goal, full_name")
    .eq(ownerColumn, userId)
    .or(DEMO_MEMBER_LEGACY_EMAIL_OR_FILTER)
    .order("full_name")

  if (legacy.error) {
    return { members: [], error: legacy.error.message }
  }

  return { members: legacy.data ?? [], error: null }
}

async function clearDemoProgressLogs(
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

export async function clearDemoProgressLogsForCoach(
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
  return clearDemoProgressLogs(supabase, memberIds)
}

export async function generateDemoProgressLogsForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<GenerateDemoProgressLogsResult> {
  const { members, error: membersError } = await fetchDemoMembers(supabase, userId)

  if (membersError) {
    return {
      demoMembersFound: 0,
      progressLogsCreated: 0,
      chartDebug: EMPTY_CHART_DEBUG,
      error: membersError,
    }
  }

  if (members.length === 0) {
    return {
      demoMembersFound: 0,
      progressLogsCreated: 0,
      chartDebug: EMPTY_CHART_DEBUG,
      error: null,
    }
  }

  const memberIds = members.map((member) => member.id)
  const clearResult = await clearDemoProgressLogs(supabase, memberIds)

  if (clearResult.error) {
    return {
      demoMembersFound: members.length,
      progressLogsCreated: 0,
      chartDebug: EMPTY_CHART_DEBUG,
      error: clearResult.error,
    }
  }

  const rows = members.flatMap((member) => buildProgressLogsForMember(member))
  const chartDebug = buildDemoChartDebug(members, rows)

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
        return {
          demoMembersFound: members.length,
          progressLogsCreated: 0,
          chartDebug,
          error: legacyInsert.error.message,
        }
      }

      return {
        demoMembersFound: members.length,
        progressLogsCreated: legacyInsert.data?.length ?? 0,
        chartDebug,
        error: null,
      }
    }

    return {
      demoMembersFound: members.length,
      progressLogsCreated: 0,
      chartDebug,
      error: insertError.message,
    }
  }

  return {
    demoMembersFound: members.length,
    progressLogsCreated: data?.length ?? 0,
    chartDebug,
    error: null,
  }
}
