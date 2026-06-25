"use client"

import {
  AlertTriangle,
  Bell,
  CalendarClock,
  ClipboardList,
  Dumbbell,
  Leaf,
  Target,
  Users,
} from "lucide-react"
import {
  COACH_DASHBOARD_GRID_GAP,
  DashboardSectionHeader,
  ExecutiveKpiCard,
} from "@/components/coach-dashboard/coach-dashboard-ui"
import type { CoachKpiCards } from "@/lib/coach-dashboard/compute-coach-kpi-cards"

type CoachKpiCardsSectionProps = {
  kpis: CoachKpiCards
  loading?: boolean
}

function formatRate(value: number | null): string {
  if (value == null) return "—"
  return `${value}%`
}

export default function CoachKpiCardsSection({
  kpis,
  loading,
}: CoachKpiCardsSectionProps) {
  return (
    <section aria-label="Coach KPI cards">
      <DashboardSectionHeader
        eyebrow="Coaching operations"
        title="Coach KPI Cards"
        description="Roster engagement, adherence, reminders, sessions, and goal outcomes from live coaching data."
      />

      <div
        className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8 ${COACH_DASHBOARD_GRID_GAP}`}
      >
        <ExecutiveKpiCard
          label="Active clients"
          value={kpis.activeClients}
          icon={Users}
          accent="from-indigo-500/25 to-blue-500/10 text-indigo-300"
          detail="Clients on your roster"
          loading={loading}
        />
        <ExecutiveKpiCard
          label="Clients at risk"
          value={kpis.clientsAtRisk}
          icon={AlertTriangle}
          accent="from-red-500/25 to-rose-500/10 text-red-300"
          highlight={kpis.clientsAtRisk > 0}
          detail={
            kpis.clientsAtRisk > 0
              ? "Need coaching follow-up"
              : "No at-risk clients"
          }
          loading={loading}
        />
        <ExecutiveKpiCard
          label="Check-in rate (7d)"
          value={formatRate(kpis.checkInRate7d)}
          icon={ClipboardList}
          accent="from-cyan-500/25 to-sky-500/10 text-cyan-300"
          detail="Clients with a check-in this week"
          loading={loading}
        />
        <ExecutiveKpiCard
          label="Workout completion (7d)"
          value={formatRate(kpis.workoutCompletionRate7d)}
          icon={Dumbbell}
          accent="from-violet-500/25 to-purple-500/10 text-violet-300"
          detail="Assigned clients completing workouts"
          loading={loading}
        />
        <ExecutiveKpiCard
          label="Habit adherence (7d)"
          value={formatRate(kpis.habitAdherenceAvg7d)}
          icon={Leaf}
          accent="from-emerald-500/25 to-teal-500/10 text-emerald-300"
          detail="Average daily habit logging"
          loading={loading}
        />
        <ExecutiveKpiCard
          label="Open reminders"
          value={kpis.openReminders}
          icon={Bell}
          accent="from-amber-500/25 to-orange-500/10 text-amber-300"
          highlight={kpis.openReminders > 0}
          detail={
            kpis.openReminders > 0
              ? "Client reminders to action"
              : "Reminder queue clear"
          }
          loading={loading}
        />
        <ExecutiveKpiCard
          label="Sessions this week"
          value={kpis.sessionsThisWeek}
          icon={CalendarClock}
          accent="from-sky-500/25 to-cyan-500/10 text-sky-300"
          detail="Scheduled coaching sessions"
          loading={loading}
        />
        <ExecutiveKpiCard
          label="Goals completed (month)"
          value={kpis.goalsCompletedThisMonth}
          icon={Target}
          accent="from-fuchsia-500/25 to-pink-500/10 text-fuchsia-300"
          detail="Client goals finished this month"
          loading={loading}
        />
      </div>
    </section>
  )
}

export function CoachKpiCardsSkeleton() {
  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
        <div className="h-9 w-72 max-w-full animate-pulse rounded-xl bg-white/10" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-white/10" />
      </div>
      <div
        className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8 ${COACH_DASHBOARD_GRID_GAP}`}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="glass-panel space-y-4 bg-gradient-to-br from-white/[0.04] to-transparent p-5 sm:p-6"
          >
            <div className="flex justify-between gap-3">
              <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-10 w-10 animate-pulse rounded-xl bg-white/10" />
            </div>
            <div className="h-10 w-20 animate-pulse rounded-xl bg-white/10" />
            <div className="h-5 w-28 animate-pulse rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  )
}
