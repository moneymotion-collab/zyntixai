import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { DEMO_MEMBER_LEGACY_EMAIL_OR_FILTER } from "@/lib/demo/demo-members"
import { demoFilter } from "@/lib/demo/demo-query-helpers"
import { insertWithSchemaFallback } from "@/lib/demo/insert-with-schema-fallback"
import { resolveMembersOwnerColumn } from "@/lib/demo/members-owner-column"

export const DEMO_SESSIONS_IS_DEMO_MIGRATION_SQL =
  "alter table sessions add column if not exists is_demo boolean default false;"

const SESSION_TYPES = [
  { session_type: "Personal Training", duration: 60 },
  { session_type: "Progress Check-in", duration: 30 },
  { session_type: "Nutrition Review", duration: 45 },
  { session_type: "Online Coaching Call", duration: 30 },
  { session_type: "Technique Review", duration: 45 },
] as const

const SESSION_TIMES = [
  "08:30",
  "09:00",
  "10:30",
  "11:00",
  "13:00",
  "14:30",
  "16:00",
  "17:30",
  "18:00",
  "19:00",
]

const DEMO_SESSION_COUNT = 20

type DemoMemberRef = { id: string; full_name: string }

type DemoSessionInsert = Database["public"]["Tables"]["sessions"]["Insert"] & {
  is_demo?: boolean
}

export type GenerateDemoSessionsResult = {
  sessionsCreated: number
  error: string | null
}

function dateString(offsetDays: number): string {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function buildScheduledAt(scheduledDate: string, scheduledTime: string): string {
  return new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()
}

function hoursAgo(hours: number): string {
  const date = new Date()
  date.setHours(date.getHours() - hours)
  return date.toISOString()
}

function createdAtForSession(
  member: DemoMemberRef,
  status: string,
  index: number,
): string | undefined {
  if (status !== "gepland") {
    return undefined
  }

  if (member.full_name === "Emma Davis") {
    return hoursAgo(9)
  }

  return hoursAgo(12 + index * 4)
}

function buildDemoSessionStatuses(): string[] {
  return [
    ...Array(8).fill("voltooid"),
    ...Array(8).fill("gepland"),
    ...Array(4).fill("geannuleerd"),
  ]
}

function dayOffsetForStatus(status: string, index: number): number {
  if (status === "voltooid") {
    return -((index % 8) * 3 + 1)
  }

  if (status === "gepland") {
    return index % 8
  }

  return index % 2 === 0 ? -(index + 2) : index + 3
}

function buildDemoSessions(
  members: DemoMemberRef[],
  coachName: string,
): DemoSessionInsert[] {
  const statuses = buildDemoSessionStatuses()

  return statuses.map((status, index) => {
    const emmaIndex = members.findIndex(
      (member) => member.full_name === "Emma Davis",
    )
    const member =
      status === "gepland" && index === 8 && emmaIndex >= 0
        ? members[emmaIndex]
        : members[index % members.length]
    const typeConfig = SESSION_TYPES[index % SESSION_TYPES.length]
    const scheduledDate = dateString(dayOffsetForStatus(status, index))
    const scheduledTime = SESSION_TIMES[index % SESSION_TIMES.length]

    return {
      member_id: member.id,
      coach: coachName,
      session_type: typeConfig.session_type,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      scheduled_at: buildScheduledAt(scheduledDate, scheduledTime),
      duration: typeConfig.duration,
      status,
      created_at: createdAtForSession(member, status, index),
      is_demo: true,
    }
  })
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

async function clearDemoSessions(
  supabase: SupabaseClient<Database>,
  memberIds: string[],
): Promise<{ error: string | null }> {
  if (memberIds.length === 0) {
    return { error: null }
  }

  const { error: demoDeleteError } = await demoFilter(supabase, "sessions")
    .delete()
    .eq("is_demo", true)
    .in("member_id", memberIds)
    .select()

  if (!demoDeleteError) {
    return { error: null }
  }

  if (!demoDeleteError.message.includes("is_demo")) {
    return { error: demoDeleteError.message }
  }

  const { error: legacyDeleteError } = await supabase
    .from("sessions")
    .delete()
    .in("member_id", memberIds)

  return { error: legacyDeleteError?.message ?? null }
}

export async function clearDemoSessionsForCoach(
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
  return clearDemoSessions(supabase, memberIds)
}

export async function generateDemoSessionsForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
  options?: { coachName?: string },
): Promise<GenerateDemoSessionsResult> {
  const { members, error: membersError } = await fetchDemoMembers(
    supabase,
    userId,
  )

  console.log("[demo/generate] session members found:", members.length)

  if (membersError) {
    console.error("[demo/generate] session members fetch error:", membersError)
    return { sessionsCreated: 0, error: membersError }
  }

  if (members.length === 0) {
    return { sessionsCreated: 0, error: null }
  }

  const memberIds = members.map((member) => member.id)
  const clearResult = await clearDemoSessions(supabase, memberIds)

  if (clearResult.error) {
    console.error(
      "[demo/generate] clear sessions error:",
      clearResult.error,
    )
    return { sessionsCreated: 0, error: clearResult.error }
  }

  const coachName = options?.coachName?.trim() || "Coach"
  const rows = buildDemoSessions(members, coachName).slice(0, DEMO_SESSION_COUNT)

  const insertResult = await insertWithSchemaFallback(
    supabase,
    "sessions",
    rows as Array<Record<string, unknown>>,
    { select: "id" },
  )

  if (insertResult.error) {
    console.error(
      "[demo/generate] sessions insert error:",
      insertResult.error.message,
    )
    return { sessionsCreated: 0, error: insertResult.error.message }
  }

  const created = insertResult.data?.length ?? 0
  console.log("[demo/generate] sessions created:", created)

  return { sessionsCreated: created, error: null }
}
