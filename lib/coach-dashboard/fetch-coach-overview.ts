import type { SupabaseClient } from "@supabase/supabase-js"
import { getCoachMemberIds, getCoachScope } from "@/lib/auth/coach-scope"
import { computeAttentionMembers } from "@/lib/coach-dashboard/compute-attention-members"
import {
  computeCoachActions,
  computeFocusMembers,
} from "@/lib/coach-dashboard/compute-coach-focus"
import {
  filterDemoRowsForWorkspace,
  filterMembersForWorkspace,
} from "@/lib/demo/workspace-data-filter"
import { fetchWorkspaceMode } from "@/lib/workspace/workspace-mode"
import {
  computeMemberHealthScores,
  hasMemberHealthData as rosterHasMemberHealthData,
} from "@/lib/coach-dashboard/compute-member-health-scores"
import {
  computeBusinessOverview,
  firstDayOfCurrentMonthString,
} from "@/lib/coach-dashboard/compute-business-overview"
import {
  buildNextSessionByMember,
} from "@/lib/coach-dashboard/compute-at-risk-members"
import { computeAtRiskClientCenter } from "@/lib/coach-dashboard/compute-at-risk-client-center"
import { computeCoachPerformance } from "@/lib/coach-dashboard/compute-coach-performance"
import { fetchCoachBusinessSettings } from "@/lib/coach-dashboard/coach-business-settings"
import { defaultAiActivityStats } from "@/lib/coach-dashboard/ai-activity-stats"
import { fetchAiActivityStats } from "@/lib/coach-dashboard/fetch-ai-activity-stats"
import { computeNeedsAttentionAlerts } from "@/lib/coach-dashboard/compute-needs-attention-alerts"
import { computeCoachTasks } from "@/lib/coach-dashboard/compute-coach-tasks"
import { buildCoachRecentActivity } from "@/lib/coach-dashboard/build-coach-recent-activity"
import { computeCoachInsights } from "@/lib/coach-dashboard/compute-coach-insights"
import { computeDailyCoachOverview } from "@/lib/coach-dashboard/compute-daily-coach-overview"
import {
  computeCoachKpiCards,
  emptyCoachKpiCards,
} from "@/lib/coach-dashboard/compute-coach-kpi-cards"
import {
  formatCurrentDateLabel,
  resolveCoachDisplayName,
  startOfWeekIso,
  startOfWeekDateString,
  todayDateString,
} from "@/lib/coach-dashboard/date-utils"
import {
  mapCoachSession,
  sortSessionsByDateTime,
  tomorrowDateString,
} from "@/lib/coach-dashboard/map-coach-sessions"
import type {
  CoachOverviewData,
  CoachOverviewResult,
  RecentCheckIn,
  TodaySession,
} from "@/lib/coach-dashboard/types"
import type { Database } from "@/lib/database.types"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import { toClientGoalViewModel } from "@/lib/progress/client-goals"
import { computeProgressAlerts } from "@/lib/progress/compute-progress-alerts"
import type { ProgressLogRow } from "@/lib/progress/fetch-progress-dashboard"
import {
  parseProgressDate,
  resolveProgressDateKeyFromRecord,
} from "@/lib/progress/progress-date"

type Member = Database["public"]["Tables"]["members"]["Row"]
type SessionRow = Database["public"]["Tables"]["sessions"]["Row"] & {
  members: Pick<Member, "full_name"> | null
}

function mapClientCheckInRow(row: ClientCheckInRow): RecentCheckIn | null {
  if (!row.member_id) return null

  return {
    id: row.id,
    memberId: row.member_id,
    memberName: row.member_name,
    weightKg: row.weight != null ? Number(row.weight) : null,
    energy: row.energy,
    sleep: row.sleep,
    motivation: row.motivation,
    createdAt: row.created_at ?? row.checkin_date,
  }
}

function emptyBusinessOverview(): CoachOverviewData["businessOverview"] {
  return computeBusinessOverview({
    members: [],
    activeWorkoutPlans: 0,
    activeNutritionPlans: 0,
    sessionsThisMonth: 0,
    settings: {
      revenuePerMember: 150,
      currency: "USD",
      stripeAccountId: null,
      stripeConnected: false,
    },
  })
}

function emptyCoachPerformance(): CoachOverviewData["coachPerformance"] {
  return computeCoachPerformance({
    members: [],
    goals: [],
    checkIns: [],
    sessionsThisMonth: [],
    workoutAssignments: [],
  })
}

function emptyAtRiskMembers(): CoachOverviewData["atRiskMembers"] {
  return {
    summary: {
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      totalAtRisk: 0,
    },
    members: [],
  }
}

function emptyDailyOverview(): CoachOverviewData["dailyOverview"] {
  return computeDailyCoachOverview({
    members: [],
    todaySessions: [],
    reminders: [],
    checkIns: [],
    habits: [],
    completions: [],
    assignments: [],
    progressLogs: [],
  })
}

function emptyOverview(coachDisplayName = "Coach"): CoachOverviewData {
  return {
    stats: {
      memberCount: 0,
      activeWorkoutPlans: 0,
      activeGoals: 0,
      openProgressAlerts: 0,
      upcomingSessions: 0,
      membersNeedingAttention: 0,
      activeNutritionPlans: 0,
      completedWorkoutsThisWeek: 0,
    },
    coachDisplayName,
    currentDateLabel: formatCurrentDateLabel(),
    todaySessions: [],
    upcomingSessionList: [],
    attentionMembers: [],
    focusMembers: [],
    coachActions: [],
    needsAttentionAlerts: [],
    recentActivity: [],
    recentCheckIns: [],
    memberHealthScores: [],
    hasMemberHealthData: false,
    coachTasks: [],
    insights: [],
    completedGoalsCount: 0,
    businessOverview: emptyBusinessOverview(),
    aiActivity: defaultAiActivityStats(),
    atRiskMembers: emptyAtRiskMembers(),
    coachPerformance: emptyCoachPerformance(),
    hasDemoWorkspace: false,
    dailyOverview: emptyDailyOverview(),
    coachKpiCards: emptyCoachKpiCards(),
  }
}

export async function fetchCoachOverview(
  supabase: SupabaseClient<Database>,
): Promise<CoachOverviewResult> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const coachDisplayName = resolveCoachDisplayName(
      user?.user_metadata as Record<string, unknown> | undefined,
      user?.email,
    )

    const scope = await getCoachScope(supabase)
    const isAdmin = scope.isAdmin
    const coachUserId = scope.userId
    const settingsOwnerId = coachUserId ?? user?.id ?? null
    const workspaceMode =
      settingsOwnerId != null
        ? await fetchWorkspaceMode(supabase, settingsOwnerId)
        : ("live" as const)
    const isDemoWorkspace = workspaceMode === "demo"
    const today = todayDateString()
    const weekStart = startOfWeekIso()
    const aiActivityPromise = fetchAiActivityStats(
      supabase,
      settingsOwnerId,
      isAdmin,
    )

    let memberIds: string[] | null = null

    if (scope.isCoach && coachUserId) {
      memberIds = await getCoachMemberIds(supabase, coachUserId)
      if (memberIds.length === 0) {
        return {
          data: {
            ...emptyOverview(coachDisplayName),
            aiActivity: await aiActivityPromise,
          },
          error: null,
        }
      }
    }

    let membersQuery = supabase
      .from("members")
      .select("id, full_name, email, created_at, status, goal, is_demo")
      .order("full_name", { ascending: true })

    if (scope.isCoach && coachUserId) {
      membersQuery = membersQuery.eq("coach_id", coachUserId)
    }

    let activeWorkoutQuery = supabase
      .from("workout_assignments")
      .select("member_id, workout_plan_id")
      .eq("status", "active")

    let upcomingSessionsCountQuery = supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("status", "gepland")
      .gte("scheduled_date", today)

    let todaySessionsQuery = supabase
      .from("sessions")
      .select(`*, members ( full_name )`)
      .eq("scheduled_date", today)
      .neq("status", "geannuleerd")
      .order("scheduled_time", { ascending: true })

    let upcomingSessionListQuery = supabase
      .from("sessions")
      .select(`*, members ( full_name )`)
      .eq("status", "gepland")
      .gte("scheduled_date", tomorrowDateString())
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time", { ascending: true })
      .limit(5)

    let completionsWeekQuery = supabase
      .from("workout_completions")
      .select("*", { count: "exact", head: true })
      .gte("completed_at", weekStart)

    let recentCompletionsQuery = supabase
      .from("workout_completions")
      .select(
        `
        id,
        completed_at,
        member_id,
        workout_plan_id,
        members ( full_name ),
        workout_plans ( title )
      `,
      )
      .order("completed_at", { ascending: false })
      .limit(12)

    let allWorkoutCompletionsQuery = supabase
      .from("workout_completions")
      .select("member_id, completed_at")
      .order("completed_at", { ascending: false })

    let recentSessionsActivityQuery = supabase
      .from("sessions")
      .select(
        `
        id,
        created_at,
        scheduled_date,
        session_type,
        member_id,
        status,
        members ( full_name )
      `,
      )
      .eq("status", "gepland")
      .order("created_at", { ascending: false })
      .limit(8)

    let recentNutritionAssignmentsActivityQuery = supabase
      .from("member_nutrition_assignments")
      .select(
        `
        member_id,
        assigned_at,
        nutrition_plan_id,
        members ( full_name ),
        nutrition_plans ( title )
      `,
      )
      .eq("status", "active")
      .order("assigned_at", { ascending: false })
      .limit(8)

    let progressLogsQuery = supabase
      .from("progress_logs")
      .select(
        `
        *,
        members ( full_name )
      `,
      )
      .order("updated_at", { ascending: false })

    let recentProgressQuery = supabase
      .from("progress_logs")
      .select(
        `
        id,
        metric,
        current_value,
        change_value,
        updated_at,
        member_id,
        members ( full_name )
      `,
      )
      .order("updated_at", { ascending: false })
      .limit(12)

    let activeNutritionQuery = supabase
      .from("member_nutrition_assignments")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")

    let activeNutritionAssignmentsQuery = supabase
      .from("member_nutrition_assignments")
      .select("member_id")
      .eq("status", "active")

    let workoutPlansQuery = supabase
      .from("workout_plans")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(8)

    let nutritionPlansQuery = supabase
      .from("nutrition_plans")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(8)

    let clientCheckInsQuery = supabase
      .from("client_checkins")
      .select("*")
      .order("checkin_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50)

    let clientGoalsQuery = supabase
      .from("client_goals")
      .select("*")
      .order("created_at", { ascending: false })

    let upcomingSessionMembersQuery = supabase
      .from("sessions")
      .select("member_id")
      .eq("status", "gepland")
      .gte("scheduled_date", today)

    const monthStart = firstDayOfCurrentMonthString()
    const weekStartDate = startOfWeekDateString()

    let sessionsThisMonthDetailsQuery = supabase
      .from("sessions")
      .select("id, status, member_id, scheduled_date")
      .gte("scheduled_date", monthStart)
      .neq("status", "geannuleerd")

    let sessionsThisWeekQuery = supabase
      .from("sessions")
      .select("scheduled_date, status")
      .gte("scheduled_date", weekStartDate)
      .neq("status", "geannuleerd")

    let workoutAssignmentsQuery = supabase
      .from("workout_assignments")
      .select("id, status, member_id")

    let performanceCheckInsQuery = supabase
      .from("client_checkins")
      .select("*")
      .order("checkin_date", { ascending: false })
      .order("created_at", { ascending: false })

    let clientRemindersQuery = supabase
      .from("client_reminders")
      .select(
        "id, member_id, title, due_date, status, priority, message, reminder_type",
      )
      .eq("status", "open")

    let clientHabitsQuery = supabase
      .from("client_habits")
      .select("member_id, logged_at, created_at")

    let plannedSessionsQuery = supabase
      .from("sessions")
      .select(`*, members ( full_name )`)
      .eq("status", "gepland")
      .gte("scheduled_date", today)
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time", { ascending: true })

    if (!isAdmin && coachUserId) {
      activeWorkoutQuery = activeWorkoutQuery.in("member_id", memberIds!)
      activeNutritionQuery = activeNutritionQuery.in("member_id", memberIds!)
      upcomingSessionsCountQuery = upcomingSessionsCountQuery.in("member_id", memberIds!)
      todaySessionsQuery = todaySessionsQuery.in("member_id", memberIds!)
      upcomingSessionListQuery = upcomingSessionListQuery.in("member_id", memberIds!)
      completionsWeekQuery = completionsWeekQuery.in("member_id", memberIds!)
      recentCompletionsQuery = recentCompletionsQuery.in("member_id", memberIds!)
      allWorkoutCompletionsQuery = allWorkoutCompletionsQuery.in(
        "member_id",
        memberIds!,
      )
      recentSessionsActivityQuery = recentSessionsActivityQuery.in(
        "member_id",
        memberIds!,
      )
      recentNutritionAssignmentsActivityQuery =
        recentNutritionAssignmentsActivityQuery.in("member_id", memberIds!)
      progressLogsQuery = progressLogsQuery.in("member_id", memberIds!)
      recentProgressQuery = recentProgressQuery.in("member_id", memberIds!)
      activeNutritionAssignmentsQuery = activeNutritionAssignmentsQuery.in(
        "member_id",
        memberIds!,
      )
      workoutPlansQuery = workoutPlansQuery.eq("created_by", coachUserId)
      nutritionPlansQuery = nutritionPlansQuery.eq("created_by", coachUserId)
      clientCheckInsQuery = clientCheckInsQuery.eq("coach_id", coachUserId)
      clientGoalsQuery = clientGoalsQuery.eq("coach_id", coachUserId)
      upcomingSessionMembersQuery = upcomingSessionMembersQuery.in(
        "member_id",
        memberIds!,
      )
      sessionsThisMonthDetailsQuery = sessionsThisMonthDetailsQuery.in(
        "member_id",
        memberIds!,
      )
      sessionsThisWeekQuery = sessionsThisWeekQuery.in("member_id", memberIds!)
      workoutAssignmentsQuery = workoutAssignmentsQuery.in("member_id", memberIds!)
      performanceCheckInsQuery = performanceCheckInsQuery.eq(
        "coach_id",
        coachUserId!,
      )
      clientRemindersQuery = clientRemindersQuery.eq("coach_id", coachUserId!)
      clientHabitsQuery = clientHabitsQuery.eq("coach_id", coachUserId!)
      plannedSessionsQuery = plannedSessionsQuery.in("member_id", memberIds!)
    }

    const settingsOwnerIdForBusiness = coachUserId ?? user?.id ?? null

    const businessSettingsPromise = settingsOwnerIdForBusiness
      ? fetchCoachBusinessSettings(supabase, settingsOwnerIdForBusiness)
      : Promise.resolve(emptyBusinessOverview().settings)

    const [
      { data: members, error: membersError },
      { data: activeWorkoutAssignments },
      { count: activeNutritionPlans },
      { count: upcomingSessionsCount },
      { data: todaySessionsRaw, error: todaySessionsError },
      { data: upcomingSessionListRaw },
      { count: completedWorkoutsThisWeek },
      { data: recentCompletions },
      { data: allWorkoutCompletions },
      { data: recentSessionsActivity },
      { data: recentNutritionAssignmentsActivity },
      { data: progressLogsRaw, error: progressLogsError },
      { data: recentProgress },
      { data: activeNutritionAssignments },
      { data: recentWorkoutPlans },
      { data: recentNutritionPlans },
      { data: clientCheckInsRaw, error: clientCheckInsError },
      { data: clientGoalsRaw, error: clientGoalsError },
      { data: upcomingSessionMembersRaw },
      { data: sessionsThisMonthDetails },
      { data: sessionsThisWeekRaw },
      { data: workoutAssignmentsRaw },
      { data: performanceCheckInsRaw },
      { data: clientRemindersRaw, error: clientRemindersError },
      { data: clientHabitsRaw, error: clientHabitsError },
      { data: plannedSessionsRaw },
      businessSettings,
    ] = await Promise.all([
      membersQuery,
      activeWorkoutQuery,
      activeNutritionQuery,
      upcomingSessionsCountQuery,
      todaySessionsQuery,
      upcomingSessionListQuery,
      completionsWeekQuery,
      recentCompletionsQuery,
      allWorkoutCompletionsQuery,
      recentSessionsActivityQuery,
      recentNutritionAssignmentsActivityQuery,
      progressLogsQuery,
      recentProgressQuery,
      activeNutritionAssignmentsQuery,
      workoutPlansQuery,
      nutritionPlansQuery,
      clientCheckInsQuery,
      clientGoalsQuery,
      upcomingSessionMembersQuery,
      sessionsThisMonthDetailsQuery,
      sessionsThisWeekQuery,
      workoutAssignmentsQuery,
      performanceCheckInsQuery,
      clientRemindersQuery,
      clientHabitsQuery,
      plannedSessionsQuery,
      businessSettingsPromise,
    ])

    if (membersError) return { data: null, error: membersError.message }
    if (todaySessionsError) return { data: null, error: todaySessionsError.message }
    if (progressLogsError) return { data: null, error: progressLogsError.message }
    if (clientCheckInsError) return { data: null, error: clientCheckInsError.message }
    if (clientGoalsError) return { data: null, error: clientGoalsError.message }
    if (clientRemindersError) {
      return { data: null, error: clientRemindersError.message }
    }
    if (clientHabitsError) return { data: null, error: clientHabitsError.message }

    const memberList = filterMembersForWorkspace(members ?? [], workspaceMode)
    const activeWorkoutMemberIds = new Set(
      (activeWorkoutAssignments ?? []).map((row) => row.member_id),
    )
    const activeNutritionMemberIds = new Set(
      (activeNutritionAssignments ?? []).map((row) => row.member_id),
    )

    const progressLogs = (progressLogsRaw ?? []) as ProgressLogRow[]
    const attentionMembers = computeAttentionMembers(
      memberList,
      progressLogs,
      activeWorkoutMemberIds,
      activeNutritionMemberIds,
    )

    const clientCheckIns = (clientCheckInsRaw ?? []) as ClientCheckInRow[]
    const clientGoalViewModels = (clientGoalsRaw ?? []).map((row) =>
      toClientGoalViewModel(row, clientCheckIns),
    )
    const activeGoals = clientGoalViewModels.filter(
      (goal) => goal.status !== "completed",
    ).length

    const progressAlerts = computeProgressAlerts(
      memberList,
      clientCheckIns,
      clientGoalViewModels,
    )

    const focusMembers = computeFocusMembers(attentionMembers, progressAlerts)
    const coachActions = computeCoachActions(progressAlerts, attentionMembers)

    const recentWorkoutCompletionMemberIds = new Set(
      (recentCompletions ?? [])
        .filter((row) => row.completed_at >= weekStart)
        .map((row) => row.member_id)
        .filter((id): id is string => Boolean(id)),
    )
    const upcomingSessionMemberIds = new Set(
      (upcomingSessionMembersRaw ?? [])
        .map((row) => row.member_id)
        .filter((id): id is string => Boolean(id)),
    )

    const memberHealthScores = computeMemberHealthScores(
      memberList,
      clientCheckIns,
      {
        goals: clientGoalViewModels,
        activeWorkoutMemberIds,
        progressAlerts,
        upcomingSessionMemberIds,
        recentWorkoutCompletionMemberIds,
      },
    )
    const hasMemberHealthData = rosterHasMemberHealthData(
      memberList,
      clientCheckIns,
    )

    const todaySessions = sortSessionsByDateTime(
      ((todaySessionsRaw ?? []) as SessionRow[]).map(mapCoachSession),
    )
    const upcomingSessionList = sortSessionsByDateTime(
      ((upcomingSessionListRaw ?? []) as SessionRow[]).map(mapCoachSession),
    )

    const needsAttentionAlerts = computeNeedsAttentionAlerts({
      members: memberList,
      checkIns: clientCheckIns,
      progressLogs,
      activeWorkoutMemberIds,
      activeNutritionMemberIds,
      workoutCompletions: allWorkoutCompletions ?? [],
      upcomingSessions: [...todaySessions, ...upcomingSessionList],
    })

    const membersNeedingAttention = new Set([
      ...attentionMembers.map((member) => member.memberId),
      ...progressAlerts.map((alert) => alert.memberId),
      ...needsAttentionAlerts.map((alert) => alert.memberId),
    ]).size

    const plannedSessions = sortSessionsByDateTime(
      ((plannedSessionsRaw ?? []) as SessionRow[]).map(mapCoachSession),
    )
    const nextSessionByMember = buildNextSessionByMember([
      ...todaySessions,
      ...plannedSessions,
    ])

    const activeWorkoutPlanIds = new Set(
      (activeWorkoutAssignments ?? []).map((row) => row.workout_plan_id),
    )
    const activeWorkoutPlans = activeWorkoutPlanIds.size

    const stats = {
      memberCount: memberList.length,
      activeWorkoutPlans,
      activeGoals,
      openProgressAlerts: progressAlerts.length + needsAttentionAlerts.length,
      upcomingSessions: upcomingSessionsCount ?? 0,
      membersNeedingAttention,
      activeNutritionPlans: activeNutritionPlans ?? 0,
      completedWorkoutsThisWeek: completedWorkoutsThisWeek ?? 0,
    }

    const sessionsThisMonth = sessionsThisMonthDetails ?? []
    const memberIdSet = new Set(memberList.map((member) => member.id))
    const scopedPerformanceCheckIns = (performanceCheckInsRaw ?? []).filter(
      (row) => row.member_id != null && memberIdSet.has(row.member_id),
    ) as ClientCheckInRow[]
    const scopedReminders = (clientRemindersRaw ?? []).filter((row) =>
      memberIdSet.has(row.member_id),
    )
    const scopedHabits = (clientHabitsRaw ?? []).filter((row) =>
      memberIdSet.has(row.member_id),
    )

    const atRiskMembers = computeAtRiskClientCenter({
      members: memberList,
      checkIns: scopedPerformanceCheckIns,
      habits: scopedHabits,
      completions: allWorkoutCompletions ?? [],
      assignments: workoutAssignmentsRaw ?? [],
      progressLogs,
      goals: clientGoalViewModels,
      reminders: scopedReminders,
      nextSessionByMember,
    })

    const coachTasks = computeCoachTasks({
      members: memberList,
      reminders: scopedReminders,
      todaySessions,
      checkIns: scopedPerformanceCheckIns,
      progressLogs,
    })

    const recentActivity = buildCoachRecentActivity({
      checkIns: [...scopedPerformanceCheckIns]
        .sort((left, right) => {
          const leftKey = resolveProgressDateKeyFromRecord(
            left as unknown as Record<string, unknown>,
          )
          const rightKey = resolveProgressDateKeyFromRecord(
            right as unknown as Record<string, unknown>,
          )
          const leftTime = parseProgressDate(leftKey)?.getTime() ?? 0
          const rightTime = parseProgressDate(rightKey)?.getTime() ?? 0
          return rightTime - leftTime
        })
        .slice(0, 12),
      completions: recentCompletions ?? [],
      nutritionAssignments: recentNutritionAssignmentsActivity ?? [],
      progressLogs: (recentProgress ?? []) as ProgressLogRow[],
      goals: [...(clientGoalsRaw ?? [])]
        .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
        .slice(0, 12)
        .map((goal) => ({
          id: goal.id,
          memberId: goal.member_id,
          memberName: goal.member_name,
          title: goal.title,
          trackingStatus:
            clientGoalViewModels.find((viewModel) => viewModel.id === goal.id)
              ?.status ?? "on_track",
          updatedAt: goal.updated_at,
        })),
      sessions: [...todaySessions, ...upcomingSessionList].slice(0, 8),
      recentSessions: recentSessionsActivity ?? [],
    })

    const businessOverview = computeBusinessOverview({
      members: memberList,
      activeWorkoutPlans,
      activeNutritionPlans: activeNutritionPlans ?? 0,
      sessionsThisMonth: sessionsThisMonth.length,
      settings: businessSettings,
    })

    const coachPerformance = computeCoachPerformance({
      members: memberList,
      goals: clientGoalViewModels,
      checkIns: scopedPerformanceCheckIns,
      sessionsThisMonth,
      workoutAssignments: workoutAssignmentsRaw ?? [],
    })

    const goalsCompleted = clientGoalViewModels.filter(
      (goal) => goal.status === "completed",
    ).length

    const recentCheckIns = clientCheckIns
      .slice(0, 5)
      .map(mapClientCheckInRow)
      .filter((row): row is RecentCheckIn => row != null)

    const dailyOverview = computeDailyCoachOverview({
      members: memberList,
      todaySessions,
      reminders: scopedReminders,
      checkIns: scopedPerformanceCheckIns,
      habits: scopedHabits,
      completions: allWorkoutCompletions ?? [],
      assignments: workoutAssignmentsRaw ?? [],
      progressLogs,
    })

    const coachKpiCards = computeCoachKpiCards({
      members: memberList,
      checkIns: scopedPerformanceCheckIns,
      habits: scopedHabits,
      completions: allWorkoutCompletions ?? [],
      assignments: workoutAssignmentsRaw ?? [],
      reminders: scopedReminders,
      sessions: sessionsThisWeekRaw ?? [],
      goals: clientGoalViewModels,
      goalRows: clientGoalsRaw ?? [],
      clientsAtRisk: atRiskMembers.summary.totalAtRisk,
    })

    return {
      data: {
        stats,
        coachDisplayName,
        currentDateLabel: formatCurrentDateLabel(),
        todaySessions,
        upcomingSessionList,
        attentionMembers,
        focusMembers,
        coachActions,
        needsAttentionAlerts,
        recentActivity,
        recentCheckIns,
        memberHealthScores,
        hasMemberHealthData,
        coachTasks,
        insights: computeCoachInsights({
          stats,
          todaySessions,
          completedGoalsCount: goalsCompleted,
          needsAttentionAlerts,
          members: memberList,
          progressLogs,
          activeNutritionMemberIds,
          sessionsThisMonth: sessionsThisMonth,
          isDemoWorkspace,
        }),
        completedGoalsCount: goalsCompleted,
        businessOverview,
        aiActivity: await aiActivityPromise,
        atRiskMembers,
        coachPerformance,
        coachKpiCards,
        hasDemoWorkspace: isDemoWorkspace,
        dailyOverview,
      },
      error: null,
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load coach overview."
    return { data: null, error: message }
  }
}
