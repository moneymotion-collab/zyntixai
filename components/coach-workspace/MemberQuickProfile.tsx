"use client"

import Link from "next/link"
import {
  AlertTriangle,
  Apple,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Dumbbell,
  ExternalLink,
  ScrollText,
} from "lucide-react"
import EmptyState from "@/components/ui/empty-state"
import GlassCard from "@/components/ui/glass-card"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import type { AttentionReason } from "@/lib/coach-dashboard/types"
import type { WorkspaceMemberProfile } from "@/lib/coach-workspace/types"

const ATTENTION_LABELS: Record<AttentionReason, string> = {
  stale_progress: "No progress in 14+ days",
  negative_progress: "Negative progress",
  no_workout_plan: "No workout plan",
  no_nutrition_plan: "No nutrition plan",
}

type MemberQuickProfileProps = {
  member: WorkspaceMemberProfile | null
  onAssignWorkout: () => void
  onAssignNutrition: () => void
  onLogProgress: () => void
  onScheduleSession: () => void
}

export default function MemberQuickProfile({
  member,
  onAssignWorkout,
  onAssignNutrition,
  onLogProgress,
  onScheduleSession,
}: MemberQuickProfileProps) {
  if (!member) {
    return (
      <GlassCard className="flex h-full min-h-[420px] items-center justify-center p-6">
        <EmptyState
          {...SAAS_EMPTY.workspaceSelectMember}
          icon={<BarChart3 className="h-6 w-6" />}
        />
      </GlassCard>
    )
  }

  return (
    <GlassCard className="flex h-full flex-col p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-violet-400/80">
            Quick Profile
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">{member.fullName}</h2>
          <p className="mt-1 text-sm text-slate-400">{member.email}</p>
        </div>
        {member.needsAttention ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            Needs attention
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            On track
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoTile
          label="Latest progress"
          icon={ScrollText}
          value={
            member.latestProgress
              ? `${member.latestProgress.metric}: ${member.latestProgress.currentValue}${
                  member.latestProgress.changeValue != null
                    ? ` (${member.latestProgress.changeValue > 0 ? "+" : ""}${member.latestProgress.changeValue})`
                    : ""
                }`
              : "No logs yet"
          }
          sub={
            member.latestProgress
              ? formatDate(member.latestProgress.updatedAt)
              : undefined
          }
        />
        <InfoTile
          label="Active workout plan"
          icon={Dumbbell}
          value={member.activeWorkoutPlan?.title ?? "None assigned"}
        />
        <InfoTile
          label="Active nutrition plan"
          icon={Apple}
          value={member.activeNutritionPlan?.title ?? "None assigned"}
        />
        <InfoTile
          label="Upcoming sessions"
          icon={CalendarClock}
          value={
            member.upcomingSessions.length > 0
              ? `${member.upcomingSessions.length} scheduled`
              : "None scheduled"
          }
          sub={
            member.upcomingSessions[0]
              ? formatSession(member.upcomingSessions[0])
              : undefined
          }
        />
      </div>

      {member.attentionReasons.length > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/[0.06] p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-300/80">
            Attention status
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {member.attentionReasons.map((reason) => (
              <li
                key={reason}
                className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-100"
              >
                {ATTENTION_LABELS[reason]}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
          Quick actions
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <ActionButton label="Assign workout" icon={Dumbbell} onClick={onAssignWorkout} />
          <ActionButton label="Assign nutrition" icon={Apple} onClick={onAssignNutrition} />
          <ActionButton label="Log progress" icon={ScrollText} onClick={onLogProgress} />
          <ActionButton
            label="Schedule session"
            icon={CalendarClock}
            onClick={onScheduleSession}
          />
          <Link
            href={`/members/${member.id}`}
            className="glass-panel glass-panel-hover flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white sm:col-span-2 lg:col-span-1"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            View full profile
          </Link>
        </div>
      </div>
    </GlassCard>
  )
}

function InfoTile({
  label,
  icon: Icon,
  value,
  sub,
}: {
  label: string
  icon: typeof ScrollText
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Icon className="h-3.5 w-3.5 text-indigo-300" aria-hidden />
        {label}
      </div>
      <p className="mt-1.5 text-sm font-medium text-white">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-slate-500">{sub}</p> : null}
    </div>
  )
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string
  icon: typeof Dumbbell
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-panel glass-panel-hover flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white"
    >
      <Icon className="h-4 w-4 text-cyan-400" aria-hidden />
      {label}
    </button>
  )
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatSession(session: WorkspaceMemberProfile["upcomingSessions"][0]): string {
  const date = new Date(session.scheduledAt)
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}${session.sessionType ? ` · ${session.sessionType}` : ""}`
}
