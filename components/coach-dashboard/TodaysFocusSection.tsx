"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  ListTodo,
  ShieldAlert,
} from "lucide-react"
import { DashboardSectionHeader } from "@/components/coach-dashboard/coach-dashboard-ui"
import CoachMemberActionButtons from "@/components/coach-dashboard/CoachMemberActionButtons"
import EmptyState from "@/components/ui/empty-state"
import GlassCard from "@/components/ui/glass-card"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import type { CoachTask } from "@/lib/coach-dashboard/compute-coach-tasks"
import type { AtRiskMember, TodaySession } from "@/lib/coach-dashboard/types"

type TodaysFocusSectionProps = {
  todaySessions: TodaySession[]
  highPriorityTasks: CoachTask[]
  topAtRiskMembers: AtRiskMember[]
}

const TASK_PRIORITY_STYLES = {
  high: "border-red-500/30 bg-red-500/10 text-red-200",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  low: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
} as const

const RISK_BADGE_STYLES = {
  high: "border-red-500/30 bg-red-500/10 text-red-200",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  low: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
} as const

export default function TodaysFocusSection({
  todaySessions,
  highPriorityTasks,
  topAtRiskMembers,
}: TodaysFocusSectionProps) {
  const previewSessions = todaySessions.slice(0, 4)
  const previewTasks = highPriorityTasks.slice(0, 4)
  const previewAtRisk = topAtRiskMembers.slice(0, 3)

  return (
    <GlassCard className="relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.06] via-white/[0.02] to-amber-500/[0.05] p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

      <DashboardSectionHeader
        eyebrow="Daily priorities"
        title="Today's Focus"
        description="Sessions on your calendar, high-priority tasks, and members who need intervention first."
        action={
          <Link
            href="/sessions"
            className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
          >
            Open sessions →
          </Link>
        }
      />

      <div className="relative grid grid-cols-1 gap-6 xl:grid-cols-3">
        <FocusColumn
          title="Today's sessions"
          icon={CalendarClock}
          isEmpty={previewSessions.length === 0}
          emptyTitle={SAAS_EMPTY.sessionsToday.title}
          emptyDescription={SAAS_EMPTY.sessionsToday.description}
          emptyIcon={<CalendarClock className="h-6 w-6" />}
          emptyAction={
            <Link href="/sessions?new=1" className="btn-gradient">
              Schedule Session
            </Link>
          }
          footer={
            todaySessions.length > 4 ? (
              <Link
                href="/sessions"
                className="mt-3 inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300"
              >
                +{todaySessions.length - 4} more sessions
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : null
          }
        >
          <ul className="space-y-3">
            {previewSessions.map((session) => (
              <li key={session.id}>
                <Link
                  href={
                    session.memberId
                      ? `/members/${session.memberId}`
                      : "/sessions"
                  }
                  className="glass-panel glass-panel-hover block rounded-xl px-4 py-3 transition duration-200"
                >
                  <p className="font-medium text-white">{session.memberName}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {session.sessionType ?? "Session"}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" aria-hidden />
                    {session.scheduledTime ?? "—"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </FocusColumn>

        <FocusColumn
          title="High-priority coach tasks"
          icon={ListTodo}
          isEmpty={previewTasks.length === 0}
          emptyTitle={SAAS_EMPTY.coachTasks.title}
          emptyDescription={SAAS_EMPTY.coachTasks.description}
          emptyIcon={<CheckCircle2 className="h-6 w-6" />}
          footer={
            highPriorityTasks.length > 4 ? (
              <p className="mt-3 text-sm text-slate-500">
                +{highPriorityTasks.length - 4} more high-priority tasks below
              </p>
            ) : null
          }
        >
          <ul className="space-y-3">
            {previewTasks.map((task) => (
              <li key={task.id}>
                <div className="glass-panel rounded-xl px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-white">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {task.memberName}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {task.reason}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TASK_PRIORITY_STYLES[task.priority]}`}
                    >
                      {task.priorityLabel}
                    </span>
                  </div>
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <CoachMemberActionButtons
                      memberId={task.memberId}
                      memberName={task.memberName}
                      latestCheckInId={task.latestCheckInId}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </FocusColumn>

        <FocusColumn
          title="Top at-risk members"
          icon={ShieldAlert}
          isEmpty={previewAtRisk.length === 0}
          emptyTitle={SAAS_EMPTY.atRisk.title}
          emptyDescription={SAAS_EMPTY.atRisk.description}
          emptyIcon={<CheckCircle2 className="h-6 w-6" />}
          footer={
            topAtRiskMembers.length > 3 ? (
              <Link
                href="#coach-at-risk-members"
                className="mt-3 inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300"
              >
                View all at-risk members
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : null
          }
        >
          <ul className="space-y-3">
            {previewAtRisk.map((member) => (
              <li key={member.memberId}>
                <Link
                  href={`/members/${member.memberId}`}
                  className="glass-panel glass-panel-hover block rounded-xl px-4 py-3 transition duration-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {member.memberName}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                        {member.mainRiskReason}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${RISK_BADGE_STYLES[member.riskLevel]}`}
                    >
                      {member.riskLevelLabel}
                    </span>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <AlertTriangle className="h-3 w-3 text-amber-400" aria-hidden />
                    {member.riskReasons.length} risk signal
                    {member.riskReasons.length === 1 ? "" : "s"} · Last activity{" "}
                    {member.lastActivityDateLabel}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </FocusColumn>
      </div>
    </GlassCard>
  )
}

function FocusColumn({
  title,
  icon: Icon,
  isEmpty,
  children,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
  footer,
}: {
  title: string
  icon: typeof CalendarClock
  isEmpty: boolean
  children: ReactNode
  emptyTitle: string
  emptyDescription: string
  emptyIcon: ReactNode
  emptyAction?: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1224]/40 p-4 transition hover:border-white/15 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-cyan-400" aria-hidden />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          {title}
        </h3>
      </div>

      {isEmpty ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={emptyIcon}
          action={emptyAction}
          compact
        />
      ) : (
        <>
          {children}
          {footer}
        </>
      )}
    </div>
  )
}
