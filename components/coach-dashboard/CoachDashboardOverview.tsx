"use client"

import Link from "next/link"
import {
  AlertTriangle,
  Apple,
  ArrowRight,
  BarChart3,
  Brain,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Dumbbell,
  FileDown,
  Lightbulb,
  Plus,
  ScrollText,
  TrendingDown,
  UserPlus,
} from "lucide-react"
import CoachBusinessKpiOverview from "@/components/coach-dashboard/CoachBusinessKpiOverview"
import CoachKpiCardsSection from "@/components/coach-dashboard/CoachKpiCardsSection"
import DailyCoachOverviewSection from "@/components/coach-dashboard/DailyCoachOverviewSection"
import CoachAiActivityCard from "@/components/coach-dashboard/CoachAiActivityCard"
import CoachDashboardHeader from "@/components/coach-dashboard/CoachDashboardHeader"
import {
  COACH_DASHBOARD_CARD_PADDING,
  COACH_DASHBOARD_SECTION_GAP,
  OperationsHubDivider,
  SessionStatusBadge,
} from "@/components/coach-dashboard/coach-dashboard-ui"
import MemberHealthScoresSection from "@/components/coach-dashboard/MemberHealthScoresSection"
import NeedsAttentionAlertsSection from "@/components/coach-dashboard/NeedsAttentionAlertsSection"
import RecentCheckInsWidget from "@/components/coach-dashboard/RecentCheckInsWidget"
import AtRiskMembersSection from "@/components/coach-dashboard/AtRiskMembersSection"
import CoachBusinessOverviewSection from "@/components/coach-dashboard/CoachBusinessOverviewSection"
import CoachPerformanceSection from "@/components/coach-dashboard/CoachPerformanceSection"
import CoachDashboardProTestChecklist from "@/components/coach-dashboard/CoachDashboardProTestChecklist"
import CoachSessionsOverviewSection from "@/components/coach-dashboard/CoachSessionsOverviewSection"
import CoachTasksSection from "@/components/coach-dashboard/CoachTasksSection"
import CoachRecentActivitySection from "@/components/coach-dashboard/CoachRecentActivitySection"
import TodaysFocusSection from "@/components/coach-dashboard/TodaysFocusSection"
import EmptyState from "@/components/ui/empty-state"
import GlassCard from "@/components/ui/glass-card"
import type { CoachInsight } from "@/lib/coach-dashboard/compute-coach-insights"
import type {
  AttentionMember,
  AttentionReason,
  CoachOverviewData,
  TodaySession,
} from "@/lib/coach-dashboard/types"
import { resolveCommandCenterStatus } from "@/lib/coach-dashboard/resolve-command-center-status"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"

const ATTENTION_LABELS: Record<AttentionReason, string> = {
  stale_progress: "No progress in 14+ days",
  negative_progress: "Negative progress trend",
  no_workout_plan: "No workout plan assigned",
  no_nutrition_plan: "No nutrition plan assigned",
}

const INSIGHT_STYLES: Record<CoachInsight["variant"], string> = {
  warning: "border-amber-400/25 bg-amber-500/[0.06] text-amber-100",
  success: "border-emerald-400/25 bg-emerald-500/[0.06] text-emerald-100",
  info: "border-cyan-400/25 bg-cyan-500/[0.06] text-cyan-100",
  neutral: "border-white/10 bg-white/[0.03] text-slate-300",
}

type CoachDashboardOverviewProps = {
  data: CoachOverviewData
  onSessionUpdated?: () => void
  onBusinessSettingsUpdated?: () => void
  onTaskUpdated?: () => void
  businessLoading?: boolean
  atRiskLoading?: boolean
  atRiskError?: string | null
  performanceLoading?: boolean
  performanceError?: string | null
}

export default function CoachDashboardOverview({
  data,
  onSessionUpdated,
  onBusinessSettingsUpdated,
  onTaskUpdated,
  businessLoading,
  atRiskLoading,
  atRiskError,
  performanceLoading,
  performanceError,
}: CoachDashboardOverviewProps) {
  const {
    stats,
    coachDisplayName,
    currentDateLabel,
    todaySessions,
    upcomingSessionList,
    attentionMembers,
    needsAttentionAlerts,
    recentActivity,
    recentCheckIns,
    memberHealthScores,
    hasMemberHealthData,
    coachTasks,
    insights,
    businessOverview,
    aiActivity,
    atRiskMembers,
    coachPerformance,
    hasDemoWorkspace,
    dailyOverview,
    coachKpiCards,
  } = data

  const commandCenterStatus = resolveCommandCenterStatus(data)
  const highPriorityTasks = coachTasks.filter((task) => task.priority === "high")

  return (
    <div className={COACH_DASHBOARD_SECTION_GAP}>
      <CoachDashboardHeader
        coachDisplayName={coachDisplayName}
        currentDateLabel={currentDateLabel}
        commandCenterStatus={commandCenterStatus}
      />

      <CoachKpiCardsSection kpis={coachKpiCards} loading={businessLoading} />

      <CoachBusinessKpiOverview
        stats={stats}
        businessOverview={businessOverview}
        isDemoWorkspace={hasDemoWorkspace}
        loading={businessLoading}
      />

      <DailyCoachOverviewSection overview={dailyOverview} />

      <CoachAiActivityCard aiActivity={aiActivity} loading={businessLoading} />

      <TodaysFocusSection
        todaySessions={todaySessions}
        highPriorityTasks={highPriorityTasks}
        topAtRiskMembers={atRiskMembers.members}
      />

      <MemberHealthScoresSection
        scores={memberHealthScores}
        hasData={hasMemberHealthData}
      />

      <AtRiskMembersSection
        atRiskMembers={atRiskMembers}
        loading={atRiskLoading}
        error={atRiskError}
      />

      <CoachPerformanceSection
        performance={coachPerformance}
        loading={performanceLoading}
        error={performanceError}
      />

      <CoachBusinessOverviewSection
        businessOverview={businessOverview}
        loading={businessLoading}
        onSettingsUpdated={onBusinessSettingsUpdated}
        showKpiStrip={false}
      />

      <QuickActionsSection />

      <OperationsHubDivider title="Operations & activity" />

      <CoachTasksSection tasks={coachTasks} onTaskUpdated={onTaskUpdated} />

      <CoachRecentActivitySection items={recentActivity} />

      <CoachSessionsOverviewSection
        todaySessions={todaySessions}
        upcomingSessions={upcomingSessionList}
        onSessionUpdated={onSessionUpdated}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-7">
        <div className="space-y-6 xl:col-span-2">
          <TodayScheduleSection sessions={todaySessions} />
          <RecentCheckInsWidget checkIns={recentCheckIns} />
          <NeedsAttentionAlertsSection alerts={needsAttentionAlerts} />
          <AttentionCenterSection members={attentionMembers} />
        </div>

        <div className="space-y-6">
          <ExtendedRosterMetricsSection stats={stats} />
          <CoachInsightsSection insights={insights} />
        </div>
      </div>

      {process.env.NEXT_PUBLIC_SHOW_DEV_QA === "true" ? (
        <CoachDashboardProTestChecklist />
      ) : null}
    </div>
  )
}

function ExtendedRosterMetricsSection({
  stats,
}: {
  stats: CoachOverviewData["stats"]
}) {
  return (
    <GlassCard className={COACH_DASHBOARD_CARD_PADDING}>
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Extended metrics
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">
          Roster & coaching activity
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Additional KPIs from your live coaching operations.
        </p>
      </div>
      <ul className="space-y-3">
        <SecondaryStatRow label="Active workout plans" value={stats.activeWorkoutPlans} />
        <SecondaryStatRow label="Active goals" value={stats.activeGoals} />
        <SecondaryStatRow label="Upcoming sessions" value={stats.upcomingSessions} />
        <SecondaryStatRow
          label="Active nutrition plans"
          value={stats.activeNutritionPlans}
        />
        <SecondaryStatRow
          label="Workouts completed this week"
          value={stats.completedWorkoutsThisWeek}
        />
      </ul>
    </GlassCard>
  )
}

function SecondaryStatRow({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <li className="glass-panel flex items-center justify-between rounded-xl px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-lg font-bold tabular-nums text-white">{value}</span>
    </li>
  )
}

function TodayScheduleSection({ sessions }: { sessions: TodaySession[] }) {
  return (
    <GlassCard className={COACH_DASHBOARD_CARD_PADDING}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-cyan-400/80">
            Schedule
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Today&apos;s Schedule
          </h2>
        </div>
        <Link
          href="/sessions"
          className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
        >
          View all →
        </Link>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          {...SAAS_EMPTY.sessionsToday}
          icon={<CalendarClock className="h-6 w-6" />}
          action={
            <Link href="/sessions" className="btn-gradient">
              Schedule Session
            </Link>
          }
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Member</th>
                  <th className="pb-3 pr-4 font-medium">Time</th>
                  <th className="pb-3 pr-4 font-medium">Session Type</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="group transition hover:bg-white/[0.03]"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={
                          session.memberId
                            ? `/members/${session.memberId}`
                            : "/sessions"
                        }
                        className="font-medium text-white group-hover:text-cyan-300"
                      >
                        {session.memberName}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-cyan-400" aria-hidden />
                        {session.scheduledTime}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {session.sessionType ?? "Session"}
                    </td>
                    <td className="py-3">
                      <SessionStatusBadge
                        status={session.status}
                        label={session.statusLabel}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {sessions.map((session) => (
              <li key={session.id}>
                <Link
                  href={
                    session.memberId
                      ? `/members/${session.memberId}`
                      : "/sessions"
                  }
                  className="glass-panel glass-panel-hover block rounded-xl px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {session.memberName}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {session.sessionType ?? "Session"}
                      </p>
                    </div>
                    <SessionStatusBadge
                      status={session.status}
                      label={session.statusLabel}
                    />
                  </div>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" aria-hidden />
                    {session.scheduledTime}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </GlassCard>
  )
}

function AttentionCenterSection({ members }: { members: AttentionMember[] }) {
  return (
    <GlassCard className={COACH_DASHBOARD_CARD_PADDING}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-amber-400/80">
            Attention
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Attention Center
          </h2>
        </div>
        <Link
          href="/progress"
          className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
        >
          Review progress →
        </Link>
      </div>

      {members.length === 0 ? (
        <EmptyState
          {...SAAS_EMPTY.progressAllClear}
          icon={<CheckCircle2 className="h-6 w-6" />}
          action={
            <Link href="/members" className="btn-gradient">
              Review roster
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {members.map((member) => (
            <li key={member.memberId}>
              <Link
                href={`/members/${member.memberId}`}
                className="glass-panel glass-panel-hover block rounded-xl px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-white">{member.memberName}</p>
                  <TrendingDown
                    className="h-4 w-4 shrink-0 text-amber-400"
                    aria-hidden
                  />
                </div>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {member.reasons.map((reason) => (
                    <li
                      key={reason}
                      className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-200"
                    >
                      {ATTENTION_LABELS[reason]}
                    </li>
                  ))}
                </ul>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}

function QuickActionsSection() {
  const actions = [
    {
      href: "/members",
      label: "Add Member",
      description: "Expand your roster",
      icon: UserPlus,
    },
    {
      href: "/workouts/new",
      label: "Create Workout Plan",
      description: "Build and assign training",
      icon: Dumbbell,
    },
    {
      href: "/nutrition",
      label: "Create Nutrition Plan",
      description: "Set macros and goals",
      icon: Apple,
    },
    {
      href: "/sessions",
      label: "Schedule Session",
      description: "Book 1-on-1 time",
      icon: CalendarClock,
    },
    {
      href: "/progress",
      label: "Review Progress",
      description: "Track check-ins and alerts",
      icon: BarChart3,
    },
    {
      href: "/progress",
      label: "Generate Report",
      description: "Export PDF progress report",
      icon: FileDown,
    },
  ] as const

  return (
    <GlassCard className={`${COACH_DASHBOARD_CARD_PADDING} transition hover:border-white/15 sm:p-8`}>
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-violet-400">
          Shortcuts
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
          Quick Actions
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Jump straight into the workflows you use most.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="glass-panel group flex items-center gap-3 rounded-xl px-4 py-3.5 transition duration-200 hover:border-white/15 hover:bg-white/[0.05]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-indigo-500/10 text-indigo-300 transition group-hover:scale-105">
              <action.icon className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">{action.label}</p>
              <p className="text-xs text-slate-400">{action.description}</p>
            </div>
            <Plus className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
          </Link>
        ))}
      </div>
    </GlassCard>
  )
}

function CoachInsightsSection({ insights }: { insights: CoachInsight[] }) {
  return (
    <GlassCard className={COACH_DASHBOARD_CARD_PADDING}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 text-indigo-300">
          <Brain className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-violet-400/80">
            AI Insights
          </p>
          <h2 className="text-xl font-semibold text-white">Coach Insights</h2>
          <p className="text-xs text-slate-500">
            Actionable insights from your coaching data
          </p>
        </div>
      </div>

      {insights.length === 0 ? (
        <EmptyState
          {...SAAS_EMPTY.coachInsights}
          icon={<Lightbulb className="h-6 w-6" />}
          action={
            <Link href="/members" className="btn-gradient">
              Add Member
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {insights.map((insight) => (
            <li
              key={insight.id}
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${INSIGHT_STYLES[insight.variant]}`}
            >
              {insight.message}
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}
