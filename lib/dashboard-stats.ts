import type { SupabaseClient } from "@supabase/supabase-js"
import { normalizeRole } from "@/lib/auth/roles"
import { getCoachMemberIds } from "@/lib/auth/coach-scope"
import type { Database } from "@/lib/database.types"
import { resolveLinkedMemberId } from "@/lib/member-link"
import type {
  CoachDashboardStats,
  DashboardStatsResult,
  MemberDashboardStats,
} from "@/lib/types/dashboard-stats"

function sevenDaysAgoIso(): string {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  return date.toISOString()
}

async function resolveMemberId(
  supabase: SupabaseClient<Database>,
): Promise<string | null> {
  return resolveLinkedMemberId(supabase)
}

async function fetchCoachStats(
  supabase: SupabaseClient<Database>,
  coachUserId: string | null,
  isAdmin: boolean,
): Promise<CoachDashboardStats> {
  let memberQuery = supabase
    .from("members")
    .select("*", { count: "exact", head: true })
  let planQuery = supabase
    .from("workout_plans")
    .select("*", { count: "exact", head: true })
  let assignmentQuery = supabase
    .from("workout_assignments")
    .select("*", { count: "exact", head: true })
  let activeQuery = supabase
    .from("workout_assignments")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
  let completedQuery = supabase
    .from("workout_completions")
    .select("*", { count: "exact", head: true })
    .gte("completed_at", sevenDaysAgoIso())
  let nutritionQuery = supabase
    .from("member_nutrition_assignments")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  if (!isAdmin && coachUserId) {
    memberQuery = memberQuery.eq("coach_id", coachUserId)
    planQuery = planQuery.eq("created_by", coachUserId)

    const memberIds = await getCoachMemberIds(supabase, coachUserId)
    if (memberIds.length === 0) {
      return {
        kind: "coach",
        memberCount: 0,
        workoutPlanCount: 0,
        assignmentsTotal: 0,
        assignmentsPending: 0,
        assignmentsCompleted: 0,
        nutritionPlans: 0,
      }
    }

    assignmentQuery = assignmentQuery.in("member_id", memberIds)
    activeQuery = activeQuery.in("member_id", memberIds)
    completedQuery = completedQuery.in("member_id", memberIds)
    nutritionQuery = nutritionQuery.in("member_id", memberIds)
  }

  const [
    { count: memberCount },
    { count: workoutPlanCount },
    { count: assignmentsTotal },
    { count: assignmentsActive },
    { count: assignmentsCompleted },
    { count: nutritionPlans },
  ] = await Promise.all([
    memberQuery,
    planQuery,
    assignmentQuery,
    activeQuery,
    completedQuery,
    nutritionQuery,
  ])

  return {
    kind: "coach",
    memberCount: memberCount ?? 0,
    workoutPlanCount: workoutPlanCount ?? 0,
    assignmentsTotal: assignmentsTotal ?? 0,
    assignmentsPending: assignmentsActive ?? 0,
    assignmentsCompleted: assignmentsCompleted ?? 0,
    nutritionPlans: nutritionPlans ?? 0,
  }
}

async function fetchMemberStats(
  supabase: SupabaseClient<Database>,
  memberId: string,
): Promise<MemberDashboardStats> {
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const twoWeeksAgo = new Date(now)
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const [
    { count: assignedTotal },
    { count: assignedPending },
    { count: assignedCompleted },
    { count: completedLastWeek },
    { count: completedPreviousWeek },
  ] = await Promise.all([
    supabase
      .from("workout_assignments")
      .select("*", { count: "exact", head: true })
      .eq("member_id", memberId),
    supabase
      .from("workout_assignments")
      .select("*", { count: "exact", head: true })
      .eq("member_id", memberId)
      .eq("status", "active"),
    supabase
      .from("workout_assignments")
      .select("*", { count: "exact", head: true })
      .eq("member_id", memberId)
      .eq("status", "completed"),
    supabase
      .from("workout_completions")
      .select("*", { count: "exact", head: true })
      .eq("member_id", memberId)
      .gte("completed_at", weekAgo.toISOString()),
    supabase
      .from("workout_completions")
      .select("*", { count: "exact", head: true })
      .eq("member_id", memberId)
      .gte("completed_at", twoWeeksAgo.toISOString())
      .lt("completed_at", weekAgo.toISOString()),
  ])

  const total = assignedTotal ?? 0
  const completed = assignedCompleted ?? 0
  const lastWeek = completedLastWeek ?? 0
  const previousWeek = completedPreviousWeek ?? 0

  return {
    kind: "member",
    assignedTotal: total,
    assignedPending: assignedPending ?? 0,
    assignedCompleted: completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    completedTrendPercent:
      lastWeek === 0 && previousWeek === 0
        ? null
        : previousWeek === 0
          ? 100
          : Math.round(((lastWeek - previousWeek) / previousWeek) * 100),
  }
}

export async function fetchDashboardStats(
  supabase: SupabaseClient<Database>,
  role: string,
): Promise<DashboardStatsResult> {
  try {
    const normalized = normalizeRole(role)

    if (normalized === "member") {
      const memberId = await resolveMemberId(supabase)
      if (!memberId) {
        return {
          stats: {
            kind: "member",
            assignedTotal: 0,
            assignedPending: 0,
            assignedCompleted: 0,
            completionRate: 0,
            completedTrendPercent: null,
          },
          error: null,
        }
      }

      return {
        stats: await fetchMemberStats(supabase, memberId),
        error: null,
      }
    }

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id ?? null

    return {
      stats: await fetchCoachStats(
        supabase,
        userId,
        normalized === "admin",
      ),
      error: null,
    }
  } catch (err) {
    return {
      stats: null,
      error: err instanceof Error ? err.message : "Failed to load dashboard stats.",
    }
  }
}
