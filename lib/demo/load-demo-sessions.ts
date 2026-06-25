import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { DEMO_MEMBER_LEGACY_EMAIL_OR_FILTER } from "@/lib/demo/demo-members"
import { demoFilter } from "@/lib/demo/demo-query-helpers"
import { insertWithSchemaFallback } from "@/lib/demo/insert-with-schema-fallback"
import { resolveMembersOwnerColumn } from "@/lib/demo/members-owner-column"

export const LOAD_DEMO_SESSION_COUNT = 8

const DEMO_SESSION_CONFIG = [
  {
    memberName: "Sarah Johnson",
    dayOffset: 0,
    scheduledTime: "10:00",
    session_type: "Personal Training",
    duration: 60,
  },
  {
    memberName: "Mike Roberts",
    dayOffset: 0,
    scheduledTime: "13:00",
    session_type: "Check-in",
    duration: 30,
  },
  {
    memberName: "Emma Davis",
    dayOffset: 0,
    scheduledTime: "16:00",
    session_type: "Progress Review",
    duration: 30,
  },
  {
    memberName: "Sarah Johnson",
    dayOffset: 1,
    scheduledTime: "10:00",
    session_type: "Personal Training",
    duration: 60,
  },
  {
    memberName: "Mike Roberts",
    dayOffset: 1,
    scheduledTime: "13:00",
    session_type: "Check-in",
    duration: 30,
  },
  {
    memberName: "Emma Davis",
    dayOffset: 2,
    scheduledTime: "09:00",
    session_type: "Personal Training",
    duration: 60,
  },
  {
    memberName: "James Wilson",
    dayOffset: 2,
    scheduledTime: "14:00",
    session_type: "Nutrition Review",
    duration: 45,
  },
  {
    memberName: "Olivia Brown",
    dayOffset: 3,
    scheduledTime: "11:00",
    session_type: "Progress Review",
    duration: 30,
  },
] as const

type DemoMemberRef = { id: string; full_name: string }

type LoadDemoSessionInsert = Database["public"]["Tables"]["sessions"]["Insert"] & {
  is_demo?: boolean
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

function buildDemoSessions(
  members: DemoMemberRef[],
  coachName: string,
): LoadDemoSessionInsert[] {
  const membersByName = new Map(members.map((member) => [member.full_name, member]))
  const seen = new Set<string>()

  return DEMO_SESSION_CONFIG.flatMap((config) => {
    const member = membersByName.get(config.memberName)

    if (!member) {
      return []
    }

    const scheduledDate = dateString(config.dayOffset)
    const dedupeKey = `${member.id}|${scheduledDate}|${config.scheduledTime}`

    if (seen.has(dedupeKey)) {
      return []
    }

    seen.add(dedupeKey)

    return [
      {
        member_id: member.id,
        coach: coachName,
        session_type: config.session_type,
        scheduled_date: scheduledDate,
        scheduled_time: config.scheduledTime,
        scheduled_at: buildScheduledAt(scheduledDate, config.scheduledTime),
        duration: config.duration,
        status: "gepland",
        is_demo: true,
      },
    ]
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

async function clearLoadDemoSessions(
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

export async function loadDemoSessionsForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
  options?: { coachName?: string },
): Promise<{ sessionsCreated: number; error: string | null }> {
  const { members, error: membersError } = await fetchDemoMembers(
    supabase,
    userId,
  )

  if (membersError) {
    return { sessionsCreated: 0, error: membersError }
  }

  if (members.length === 0) {
    return { sessionsCreated: 0, error: null }
  }

  const memberIds = members.map((member) => member.id)
  const clearResult = await clearLoadDemoSessions(supabase, memberIds)

  if (clearResult.error) {
    return { sessionsCreated: 0, error: clearResult.error }
  }

  const coachName = options?.coachName?.trim() || "Coach"
  const rows = buildDemoSessions(members, coachName)

  const insertResult = await insertWithSchemaFallback(
    supabase,
    "sessions",
    rows as Array<Record<string, unknown>>,
    { select: "id" },
  )

  if (insertResult.error) {
    return { sessionsCreated: 0, error: insertResult.error.message }
  }

  return { sessionsCreated: insertResult.data?.length ?? 0, error: null }
}
