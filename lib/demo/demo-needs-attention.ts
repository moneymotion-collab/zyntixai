import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { startOfWeekIso } from "@/lib/coach-dashboard/date-utils"
import { DEMO_MEMBER_EMAIL_DOMAIN } from "@/lib/demo/demo-members"
import { insertWithSchemaFallback } from "@/lib/demo/insert-with-schema-fallback"
import { resolveMembersOwnerColumn } from "@/lib/demo/members-owner-column"
import { resolveWorkoutPlansOwnerColumn } from "@/lib/demo/workout-plans-owner-column"

type DemoMemberRef = { id: string; full_name: string }

export type GenerateDemoNeedsAttentionResult = {
  needsAttentionConfigured: number
  error: string | null
}

function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function daysAgoIso(days: number, hour = 10): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

function tomorrowDateString(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function findMember(
  members: DemoMemberRef[],
  fullName: string,
): DemoMemberRef | undefined {
  return members.find((member) => member.full_name === fullName)
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

async function fetchDemoWorkoutPlanId(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ planId: string | null; error: string | null }> {
  const ownerColumn = resolveWorkoutPlansOwnerColumn()

  const { data, error } = await supabase
    .from("workout_plans")
    .select("id")
    .eq(ownerColumn, userId)
    .order("title")
    .limit(1)
    .maybeSingle()

  if (error) {
    return { planId: null, error: error.message }
  }

  return { planId: data?.id ?? null, error: null }
}

async function configureMissedWorkoutAlerts(
  supabase: SupabaseClient<Database>,
  members: DemoMemberRef[],
  planId: string,
): Promise<{ configured: number; error: string | null }> {
  const weekStart = startOfWeekIso()
  const missedWorkoutMembers = [
    findMember(members, "Lisa Johnson"),
    findMember(members, "Sophie Miller"),
  ].filter((member): member is DemoMemberRef => Boolean(member))

  let configured = 0

  for (const member of missedWorkoutMembers) {
    const { error: deleteError } = await supabase
      .from("workout_completions")
      .delete()
      .eq("member_id", member.id)
      .gte("completed_at", weekStart)

    if (deleteError) {
      return { configured, error: deleteError.message }
    }

    const { data: existingOld } = await supabase
      .from("workout_completions")
      .select("id")
      .eq("member_id", member.id)
      .lt("completed_at", weekStart)
      .limit(1)

    if ((existingOld?.length ?? 0) === 0) {
      const { error: insertError } = await supabase
        .from("workout_completions")
        .insert({
          member_id: member.id,
          workout_plan_id: planId,
          completed_at: daysAgoIso(10, 16),
        })

      if (insertError) {
        return { configured, error: insertError.message }
      }
    }

    configured += 1
  }

  return { configured, error: null }
}

async function configureUpcomingSessionAlert(
  supabase: SupabaseClient<Database>,
  emma: DemoMemberRef,
  coachName: string,
): Promise<{ configured: number; error: string | null }> {
  const scheduledDate = tomorrowDateString()

  const { data: existing } = await supabase
    .from("sessions")
    .select("id")
    .eq("member_id", emma.id)
    .eq("status", "gepland")
    .eq("scheduled_date", scheduledDate)
    .limit(1)

  if ((existing?.length ?? 0) > 0) {
    return { configured: 1, error: null }
  }

  const sessionRow = {
    member_id: emma.id,
    coach: coachName,
    session_type: "Personal Training",
    scheduled_date: scheduledDate,
    scheduled_time: "10:00",
    scheduled_at: new Date(`${scheduledDate}T10:00:00`).toISOString(),
    duration: 60,
    status: "gepland",
  }

  const insertResult = await insertWithSchemaFallback(supabase, "sessions", [
    sessionRow,
  ])

  if (insertResult.error) {
    return { configured: 0, error: insertResult.error.message }
  }

  return { configured: 1, error: null }
}

async function configureProgressStalledAlert(
  supabase: SupabaseClient<Database>,
  mark: DemoMemberRef,
  coachId: string,
): Promise<{ configured: number; error: string | null }> {
  const { data: logs, error: logsError } = await supabase
    .from("progress_logs")
    .select("id")
    .eq("member_id", mark.id)
    .order("updated_at", { ascending: false })
    .limit(3)

  if (logsError) {
    return { configured: 0, error: logsError.message }
  }

  for (const [index, log] of (logs ?? []).entries()) {
    const { error } = await supabase
      .from("progress_logs")
      .update({
        change_value: index === 0 ? 0.1 : index === 1 ? -0.1 : 0,
        updated_at: daysAgoIso(index * 3, 9),
      })
      .eq("id", log.id)

    if (error) {
      return { configured: 0, error: error.message }
    }
  }

  await supabase
    .from("client_checkins")
    .delete()
    .eq("coach_id", coachId)
    .eq("member_id", mark.id)

  const plateauWeights = [82.4, 82.3, 82.5]
  const rows = plateauWeights.map((weight, index) => ({
    coach_id: coachId,
    member_id: mark.id,
    member_name: mark.full_name,
    checkin_date: daysAgo(index * 4),
    weight,
    energy: 7,
    sleep: 7,
    motivation: 6,
  }))

  const { error: insertError } = await supabase
    .from("client_checkins")
    .insert(rows)

  if (insertError) {
    return { configured: 0, error: insertError.message }
  }

  return { configured: 1, error: null }
}

async function configureNutritionAdherenceAlert(
  supabase: SupabaseClient<Database>,
  ryan: DemoMemberRef,
  coachId: string,
): Promise<{ configured: number; error: string | null }> {
  const { data: latest, error: fetchError } = await supabase
    .from("client_checkins")
    .select("id")
    .eq("coach_id", coachId)
    .eq("member_id", ryan.id)
    .order("checkin_date", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError) {
    return { configured: 0, error: fetchError.message }
  }

  if (latest?.id) {
    const { error } = await supabase
      .from("client_checkins")
      .update({
        motivation: 3,
        energy: 4,
        checkin_date: daysAgo(1),
      })
      .eq("id", latest.id)

    if (error) {
      return { configured: 0, error: error.message }
    }

    return { configured: 1, error: null }
  }

  const { error: insertError } = await supabase.from("client_checkins").insert({
    coach_id: coachId,
    member_id: ryan.id,
    member_name: ryan.full_name,
    checkin_date: daysAgo(1),
    weight: 88.1,
    energy: 4,
    sleep: 6,
    motivation: 3,
  })

  if (insertError) {
    return { configured: 0, error: insertError.message }
  }

  return { configured: 1, error: null }
}

export async function generateDemoNeedsAttentionForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
  options?: { coachName?: string },
): Promise<GenerateDemoNeedsAttentionResult> {
  const { members, error: membersError } = await fetchDemoMembers(
    supabase,
    userId,
  )

  if (membersError) {
    return { needsAttentionConfigured: 0, error: membersError }
  }

  if (members.length === 0) {
    return { needsAttentionConfigured: 0, error: null }
  }

  const { planId, error: planError } = await fetchDemoWorkoutPlanId(
    supabase,
    userId,
  )

  if (planError) {
    return { needsAttentionConfigured: 0, error: planError }
  }

  if (!planId) {
    return {
      needsAttentionConfigured: 0,
      error: "No demo workout plan found for needs-attention seeding.",
    }
  }

  const emma = findMember(members, "Emma Wilson")
  const mark = findMember(members, "Mark Davis")
  const ryan = findMember(members, "Ryan Clark")

  let configured = 0

  const missed = await configureMissedWorkoutAlerts(supabase, members, planId)
  if (missed.error) {
    return { needsAttentionConfigured: configured, error: missed.error }
  }
  configured += missed.configured

  if (emma) {
    const upcoming = await configureUpcomingSessionAlert(
      supabase,
      emma,
      options?.coachName?.trim() || "Coach",
    )
    if (upcoming.error) {
      return { needsAttentionConfigured: configured, error: upcoming.error }
    }
    configured += upcoming.configured
  }

  if (mark) {
    const stalled = await configureProgressStalledAlert(
      supabase,
      mark,
      userId,
    )
    if (stalled.error) {
      return { needsAttentionConfigured: configured, error: stalled.error }
    }
    configured += stalled.configured
  }

  if (ryan) {
    const nutrition = await configureNutritionAdherenceAlert(
      supabase,
      ryan,
      userId,
    )
    if (nutrition.error) {
      return { needsAttentionConfigured: configured, error: nutrition.error }
    }
    configured += nutrition.configured
  }

  return { needsAttentionConfigured: configured, error: null }
}
