import type { SupabaseClient } from "@supabase/supabase-js"
import { getCoachMemberIds, getCoachScope } from "@/lib/auth/coach-scope"
import { computeAttentionMembers } from "@/lib/coach-dashboard/compute-attention-members"
import { generateTodayTasks } from "@/lib/coach-workspace/generate-today-tasks"
import type {
  ActivePlan,
  CoachWorkspaceData,
  CoachWorkspaceResult,
  LatestProgress,
  UpcomingSession,
  WorkspaceMemberProfile,
} from "@/lib/coach-workspace/types"
import type { Database } from "@/lib/database.types"
import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"

function startOfTodayIso(): string {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

function emptyWorkspace(): CoachWorkspaceData {
  return {
    members: [],
    tasks: [],
    workoutPlans: [],
    nutritionPlans: [],
  }
}

export async function fetchCoachWorkspace(
  supabase: SupabaseClient<Database>,
): Promise<CoachWorkspaceResult> {
  try {
    const scope = await getCoachScope(supabase)
    const isAdmin = scope.isAdmin
    const coachUserId = scope.userId
    const todayStart = startOfTodayIso()

    let memberIds: string[] | null = null

    if (scope.isCoach && coachUserId) {
      memberIds = await getCoachMemberIds(supabase, coachUserId)
      if (memberIds.length === 0) {
        return { data: emptyWorkspace(), error: null }
      }
    }

    let membersQuery = supabase
      .from("members")
      .select("id, full_name, email")
      .order("full_name", { ascending: true })

    let progressLogsQuery = supabase
      .from("progress_logs")
      .select("*")
      .order("updated_at", { ascending: false })

    let workoutAssignmentsQuery = supabase
      .from("workout_assignments")
      .select(
        `
        member_id,
        workout_plans ( id, title )
      `,
      )
      .eq("status", "active")

    let nutritionAssignmentsQuery = supabase
      .from("member_nutrition_assignments")
      .select(
        `
        member_id,
        nutrition_plans ( id, title )
      `,
      )
      .eq("status", "active")

    let sessionsQuery = supabase
      .from("sessions")
      .select("id, member_id, session_type, scheduled_at, status")
      .gte("scheduled_at", todayStart)
      .neq("status", "geannuleerd")
      .order("scheduled_at", { ascending: true })

    let workoutPlansQuery = supabase
      .from("workout_plans")
      .select("id, title, goal")
      .order("title", { ascending: true })

    let nutritionPlansQuery = supabase
      .from("nutrition_plans")
      .select("id, title, goal")
      .order("title", { ascending: true })

    if (!isAdmin && coachUserId) {
      membersQuery = membersQuery.eq("coach_id", coachUserId)
      progressLogsQuery = progressLogsQuery.in("member_id", memberIds!)
      workoutAssignmentsQuery = workoutAssignmentsQuery.in(
        "member_id",
        memberIds!,
      )
      nutritionAssignmentsQuery = nutritionAssignmentsQuery.in(
        "member_id",
        memberIds!,
      )
      sessionsQuery = sessionsQuery.in("member_id", memberIds!)
      workoutPlansQuery = workoutPlansQuery.eq("created_by", coachUserId)
      nutritionPlansQuery = nutritionPlansQuery.eq("created_by", coachUserId)
    }

    const [
      { data: membersRaw, error: membersError },
      { data: logsRaw, error: logsError },
      { data: workoutAssignments, error: workoutError },
      { data: nutritionAssignments, error: nutritionError },
      { data: sessionsRaw, error: sessionsError },
      { data: workoutPlans, error: workoutPlansError },
      { data: nutritionPlans, error: nutritionPlansError },
    ] = await Promise.all([
      membersQuery,
      progressLogsQuery,
      workoutAssignmentsQuery,
      nutritionAssignmentsQuery,
      sessionsQuery,
      workoutPlansQuery,
      nutritionPlansQuery,
    ])

    if (membersError) return { data: null, error: membersError.message }
    if (logsError) return { data: null, error: logsError.message }
    if (workoutError) return { data: null, error: workoutError.message }
    if (nutritionError) return { data: null, error: nutritionError.message }
    if (sessionsError) return { data: null, error: sessionsError.message }
    if (workoutPlansError) return { data: null, error: workoutPlansError.message }
    if (nutritionPlansError) {
      return { data: null, error: nutritionPlansError.message }
    }

    const members = membersRaw ?? []
    const logs = (logsRaw ?? []) as ProgressLogRow[]

    const latestProgressByMember = new Map<string, LatestProgress>()
    for (const log of logs) {
      if (!log.member_id || latestProgressByMember.has(log.member_id)) continue
      if (log.current_value == null || !log.updated_at) continue
      latestProgressByMember.set(log.member_id, {
        metric: log.metric ?? "Progress",
        currentValue: Number(log.current_value),
        changeValue: log.change_value != null ? Number(log.change_value) : null,
        updatedAt: log.updated_at,
      })
    }

    const workoutPlanByMember = new Map<string, ActivePlan>()
    for (const row of workoutAssignments ?? []) {
      const plan = row.workout_plans as { id: string; title: string } | null
      if (plan && !workoutPlanByMember.has(row.member_id)) {
        workoutPlanByMember.set(row.member_id, {
          id: plan.id,
          title: plan.title,
        })
      }
    }

    const nutritionPlanByMember = new Map<string, ActivePlan>()
    for (const row of nutritionAssignments ?? []) {
      const plan = row.nutrition_plans as { id: string; title: string } | null
      if (plan && !nutritionPlanByMember.has(row.member_id)) {
        nutritionPlanByMember.set(row.member_id, {
          id: plan.id,
          title: plan.title,
        })
      }
    }

    const sessionsByMember = new Map<string, UpcomingSession[]>()
    for (const session of sessionsRaw ?? []) {
      if (!session.member_id || !session.scheduled_at) continue
      const list = sessionsByMember.get(session.member_id) ?? []
      list.push({
        id: session.id,
        sessionType: session.session_type,
        scheduledAt: session.scheduled_at,
        status: session.status,
      })
      sessionsByMember.set(session.member_id, list)
    }

    const activeWorkoutMemberIds = new Set(workoutPlanByMember.keys())
    const activeNutritionMemberIds = new Set(nutritionPlanByMember.keys())
    const attentionMembers = computeAttentionMembers(
      members.map((m) => ({ id: m.id, full_name: m.full_name })),
      logs,
      activeWorkoutMemberIds,
      activeNutritionMemberIds,
    )

    const attentionByMember = new Map(
      attentionMembers.map((entry) => [entry.memberId, entry.reasons]),
    )

    const memberProfiles: WorkspaceMemberProfile[] = members.map((member) => {
      const reasons = attentionByMember.get(member.id) ?? []
      return {
        id: member.id,
        fullName: member.full_name,
        email: member.email,
        latestProgress: latestProgressByMember.get(member.id) ?? null,
        activeWorkoutPlan: workoutPlanByMember.get(member.id) ?? null,
        activeNutritionPlan: nutritionPlanByMember.get(member.id) ?? null,
        upcomingSessions: sessionsByMember.get(member.id) ?? [],
        attentionReasons: reasons,
        needsAttention: reasons.length > 0,
      }
    })

    return {
      data: {
        members: memberProfiles,
        tasks: generateTodayTasks(attentionMembers),
        workoutPlans: workoutPlans ?? [],
        nutritionPlans: nutritionPlans ?? [],
      },
      error: null,
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load coach workspace."
    return { data: null, error: message }
  }
}
