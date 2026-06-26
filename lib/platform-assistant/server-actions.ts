import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { getCoachMemberIds } from "@/lib/auth/coach-scope"
import { assignWorkoutToMember } from "@/lib/workout-assignments"
import type { PlatformActionKind } from "./types"

export type MemberRow = Pick<
  Database["public"]["Tables"]["members"]["Row"],
  "id" | "full_name" | "email" | "coach_id"
>

export async function fetchScopedMembers(
  supabase: SupabaseClient<Database>,
  userId: string,
  isAdmin: boolean,
): Promise<MemberRow[]> {
  let query = supabase
    .from("members")
    .select("id, full_name, email, coach_id")
    .order("full_name", { ascending: true })

  if (!isAdmin) {
    const memberIds = await getCoachMemberIds(supabase, userId)
    if (memberIds.length === 0) return []
    query = query.in("id", memberIds)
  }

  const { data } = await query
  return data ?? []
}

export function resolveMemberByQuery(
  members: MemberRow[],
  query?: string,
  fallbackId?: string,
): MemberRow | null {
  if (!query && fallbackId) {
    return members.find((m) => m.id === fallbackId) ?? null
  }
  if (!query) return null

  const q = query.toLowerCase().trim()
  const exact = members.find(
    (m) => m.full_name?.toLowerCase() === q || m.email?.toLowerCase() === q,
  )
  if (exact) return exact

  return (
    members.find(
      (m) =>
        m.full_name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q),
    ) ?? null
  )
}

export function parseScheduleDateTime(when?: string): {
  scheduledAt: string
  label: string
} {
  const now = new Date()
  const base = new Date(now)

  if (!when || /today/i.test(when)) {
    base.setHours(15, 0, 0, 0)
    if (base < now) base.setDate(base.getDate() + 1)
  } else if (/tomorrow/i.test(when)) {
    base.setDate(base.getDate() + 1)
    base.setHours(15, 0, 0, 0)
  } else {
    base.setDate(base.getDate() + 1)
    base.setHours(15, 0, 0, 0)
  }

  const timeMatch = when?.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (timeMatch) {
    let hours = Number(timeMatch[1])
    const minutes = timeMatch[2] ? Number(timeMatch[2]) : 0
    const meridiem = timeMatch[3]?.toLowerCase()
    if (meridiem === "pm" && hours < 12) hours += 12
    if (meridiem === "am" && hours === 12) hours = 0
    base.setHours(hours, minutes, 0, 0)
  }

  return {
    scheduledAt: base.toISOString(),
    label: base.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  }
}

export async function executePlatformAction(
  supabase: SupabaseClient<Database>,
  kind: PlatformActionKind,
  payload: Record<string, unknown>,
  coachName: string,
): Promise<{ ok: true; detail: string; href?: string } | { ok: false; error: string }> {
  if (kind === "schedule_session") {
    const memberId = String(payload.memberId ?? "")
    const scheduledAt = String(payload.scheduledAt ?? "")
    if (!memberId || !scheduledAt) {
      return { ok: false, error: "Missing session details." }
    }

    const { error } = await supabase.from("sessions").insert({
      member_id: memberId,
      coach: coachName,
      session_type: "Personal Training",
      scheduled_at: scheduledAt,
      duration: 60,
      status: "gepland",
    })

    if (error) return { ok: false, error: error.message }
    return {
      ok: true,
      detail: "Session scheduled.",
      href: `/sessions?member=${memberId}`,
    }
  }

  if (kind === "assign_workout") {
    const memberId = String(payload.memberId ?? "")
    const workoutPlanId = String(payload.workoutPlanId ?? "")
    if (!memberId || !workoutPlanId) {
      return { ok: false, error: "Missing assignment details." }
    }

    const result = await assignWorkoutToMember(supabase, {
      memberId,
      workoutPlanId,
    })

    if (!result.success) return { ok: false, error: result.message }
    return {
      ok: true,
      detail: "Workout assigned.",
      href: `/members/${memberId}#member-workouts`,
    }
  }

  return { ok: false, error: "Unknown action." }
}
