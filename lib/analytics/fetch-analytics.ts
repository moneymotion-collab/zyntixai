import type { SupabaseClient } from "@supabase/supabase-js"
import { getCoachMemberIds, getCoachScope } from "@/lib/auth/coach-scope"
import type { Database } from "@/lib/database.types"

export type AnalyticsKpis = {
  totalMembers: number
  activeMembers: number
  workoutsThisWeek: number
  completedWorkouts: number
  activeNutritionPlans: number
  sessionsThisWeek: number
}

export type WeightTrendPoint = { date: string; weight: number }
export type CompletionPoint = { week: string; count: number }
export type NewMembersPoint = { month: string; count: number }

export type AnalyticsData = {
  kpis: AnalyticsKpis
  weightTrend: WeightTrendPoint[]
  workoutCompletions: CompletionPoint[]
  newMembersPerMonth: NewMembersPoint[]
}

function startOfWeekIso() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function isWeightMetric(metric: string | null) {
  const m = (metric ?? "").toLowerCase()
  return m.includes("weight") || m.includes("gewicht") || m === "body weight (kg)"
}

export async function fetchAnalytics(
  supabase: SupabaseClient<Database>,
): Promise<{ data: AnalyticsData | null; error: string | null }> {
  try {
    const scope = await getCoachScope(supabase)
    const weekStart = startOfWeekIso()

    let memberIds: string[] | null = null

    if (scope.isCoach && scope.userId) {
      memberIds = await getCoachMemberIds(supabase, scope.userId)
      if (memberIds.length === 0) {
        return {
          data: {
            kpis: {
              totalMembers: 0,
              activeMembers: 0,
              workoutsThisWeek: 0,
              completedWorkouts: 0,
              activeNutritionPlans: 0,
              sessionsThisWeek: 0,
            },
            weightTrend: [],
            workoutCompletions: [],
            newMembersPerMonth: [],
          },
          error: null,
        }
      }
    }

    let membersQuery = supabase.from("members").select("id, status, created_at")
    if (memberIds) membersQuery = membersQuery.in("id", memberIds)

    const { data: members } = await membersQuery
    const ids = (members ?? []).map((m) => m.id)

    const totalMembers = ids.length
    const activeMembers =
      members?.filter((m) => (m.status ?? "").toLowerCase() === "active").length ?? 0

    let assignmentsQuery = supabase
      .from("workout_assignments")
      .select("id, status, assigned_at, member_id")
    if (memberIds) assignmentsQuery = assignmentsQuery.in("member_id", memberIds)

    const { data: assignments } = await assignmentsQuery

    const weekAssignments =
      assignments?.filter((a) => a.assigned_at >= weekStart) ?? []
    const completedWorkouts =
      assignments?.filter((a) => a.status === "completed").length ?? 0

    let nutritionQuery = supabase
      .from("member_nutrition_assignments")
      .select("member_id", { count: "exact", head: true })
    if (memberIds) nutritionQuery = nutritionQuery.in("member_id", memberIds)
    const { count: activeNutritionPlans } = await nutritionQuery

    let sessionsQuery = supabase
      .from("sessions")
      .select("id, scheduled_date, member_id")
    if (memberIds) sessionsQuery = sessionsQuery.in("member_id", memberIds)
    const { data: sessions } = await sessionsQuery

    const sessionsThisWeek =
      sessions?.filter((s) => s.scheduled_date && s.scheduled_date >= weekStart.split("T")[0])
        .length ?? 0

    let progressQuery = supabase
      .from("progress_logs")
      .select("metric, current_value, updated_at, member_id")
      .order("updated_at", { ascending: true })
    if (memberIds) progressQuery = progressQuery.in("member_id", memberIds)
    const { data: progressLogs } = await progressQuery

    const weightTrend: WeightTrendPoint[] = (progressLogs ?? [])
      .filter((l) => isWeightMetric(l.metric) && l.current_value != null)
      .slice(-30)
      .map((l) => ({
        date: new Date(l.updated_at ?? "").toLocaleDateString(),
        weight: Number(l.current_value),
      }))

    const completionMap = new Map<string, number>()
    for (const a of assignments ?? []) {
      if (a.status !== "completed") continue
      const week = new Date(a.assigned_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
      completionMap.set(week, (completionMap.get(week) ?? 0) + 1)
    }
    const workoutCompletions = Array.from(completionMap.entries())
      .slice(-8)
      .map(([week, count]) => ({ week, count }))

    const monthMap = new Map<string, number>()
    for (const m of members ?? []) {
      if (!m.created_at) continue
      const month = new Date(m.created_at).toLocaleDateString(undefined, {
        month: "short",
        year: "2-digit",
      })
      monthMap.set(month, (monthMap.get(month) ?? 0) + 1)
    }
    const newMembersPerMonth = Array.from(monthMap.entries()).map(
      ([month, count]) => ({ month, count }),
    )

    return {
      data: {
        kpis: {
          totalMembers,
          activeMembers,
          workoutsThisWeek: weekAssignments.length,
          completedWorkouts,
          activeNutritionPlans: activeNutritionPlans ?? 0,
          sessionsThisWeek,
        },
        weightTrend,
        workoutCompletions,
        newMembersPerMonth,
      },
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to load analytics.",
    }
  }
}
