"use client"

import Link from "next/link"
import {
  Apple,
  Bell,
  CalendarClock,
  ClipboardList,
  Dumbbell,
  LayoutGrid,
  Leaf,
  ScrollText,
  UserPlus,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  COACH_DASHBOARD_CARD_PADDING,
  COACH_DASHBOARD_GRID_GAP,
  DashboardSectionHeader,
} from "@/components/coach-dashboard/coach-dashboard-ui"
import GlassCard from "@/components/ui/glass-card"
import type {
  DailyCoachOverview,
  DailyCoachOverviewMetric,
} from "@/lib/coach-dashboard/compute-daily-coach-overview"
import {
  buildAddMemberUrl,
  buildCreateWorkoutUrl,
  buildNutritionUrl,
  buildSessionsNewUrl,
} from "@/lib/coach-dashboard/coach-action-links"

type DailyCoachOverviewSectionProps = {
  overview: DailyCoachOverview
}

const QUICK_ACTIONS = [
  {
    href: buildAddMemberUrl(),
    label: "Add member",
    description: "Expand your roster",
    icon: UserPlus,
  },
  {
    href: buildCreateWorkoutUrl(),
    label: "Create workout",
    description: "Build a training plan",
    icon: Dumbbell,
  },
  {
    href: buildNutritionUrl(),
    label: "Create nutrition plan",
    description: "Set macros and meals",
    icon: Apple,
  },
  {
    href: buildSessionsNewUrl(),
    label: "Schedule session",
    description: "Book coaching time",
    icon: CalendarClock,
  },
  {
    href: "/coach-workspace",
    label: "Open Coach Workspace",
    description: "Tasks and quick actions",
    icon: LayoutGrid,
  },
] as const

const METRIC_ICONS: Record<DailyCoachOverviewMetric["id"], LucideIcon> = {
  sessions_today: CalendarClock,
  reminders_due_today: Bell,
  missing_check_ins: ClipboardList,
  missing_habits: Leaf,
  no_workout_7d: Dumbbell,
  no_progress_14d: ScrollText,
}

function DailyMetricCard({ metric }: { metric: DailyCoachOverviewMetric }) {
  const Icon = METRIC_ICONS[metric.id]
  const isWarning = metric.emphasis === "warning" && metric.count > 0

  return (
    <Link
      href={metric.href}
      className={`glass-panel glass-panel-hover block rounded-2xl p-5 transition duration-200 ${
        isWarning ? "border-amber-500/25 hover:border-amber-500/40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-400">{metric.label}</p>
        <Icon
          className={`h-4 w-4 shrink-0 ${isWarning ? "text-amber-400" : "text-cyan-400"}`}
          aria-hidden
        />
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums text-white">{metric.count}</p>
      <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
    </Link>
  )
}

export default function DailyCoachOverviewSection({
  overview,
}: DailyCoachOverviewSectionProps) {
  return (
    <GlassCard
      className={`relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.06] via-white/[0.02] to-indigo-500/[0.05] ${COACH_DASHBOARD_CARD_PADDING}`}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

      <DashboardSectionHeader
        eyebrow="Daily coach overview"
        title="What needs your attention today"
        description="Sessions, reminders, and client engagement gaps across your roster."
        action={
          <Link
            href="/coach-workspace"
            className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
          >
            Open workspace →
          </Link>
        }
      />

      <div className={`relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 ${COACH_DASHBOARD_GRID_GAP}`}>
        {overview.metrics.map((metric) => (
          <DailyMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {overview.remindersDueToday.length > 0 ? (
        <div className="relative mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">
            Reminders due today
          </p>
          <ul className="mt-3 space-y-2">
            {overview.remindersDueToday.slice(0, 5).map((reminder) => (
              <li key={reminder.id}>
                <Link
                  href={`/members/${reminder.memberId}`}
                  className="text-sm text-amber-100/90 transition hover:text-white"
                >
                  {reminder.title}
                </Link>
              </li>
            ))}
          </ul>
          {overview.remindersDueToday.length > 5 ? (
            <p className="mt-2 text-xs text-amber-200/70">
              +{overview.remindersDueToday.length - 5} more in workspace
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="relative mt-8 border-t border-white/10 pt-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Quick actions
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {QUICK_ACTIONS.map((action) => (
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
            </Link>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}
