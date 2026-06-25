"use client"

import {
  AlertTriangle,
  Bell,
  CalendarClock,
  DollarSign,
  Users,
  UserCheck,
} from "lucide-react"
import {
  DashboardSectionHeader,
  ExecutiveKpiCard,
  COACH_DASHBOARD_GRID_GAP,
} from "@/components/coach-dashboard/coach-dashboard-ui"
import {
  computeProjectedDemoRevenue,
  formatBusinessCurrency,
  formatProjectedMonthlyRevenue,
  growthPercent,
} from "@/lib/coach-dashboard/compute-business-overview"
import type {
  BusinessTrendPoint,
  CoachOverviewData,
} from "@/lib/coach-dashboard/types"

type CoachBusinessKpiOverviewProps = {
  stats: CoachOverviewData["stats"]
  businessOverview: CoachOverviewData["businessOverview"]
  isDemoWorkspace?: boolean
  loading?: boolean
}

function monthOverMonthGrowth(
  points: BusinessTrendPoint[],
  field: keyof Pick<
    BusinessTrendPoint,
    "memberCount" | "activeMembers" | "newMembers"
  >,
): number | null {
  if (points.length < 2) return null
  const current = points[points.length - 1]?.[field] ?? 0
  const previous = points[points.length - 2]?.[field] ?? 0
  return growthPercent(current, previous)
}

export default function CoachBusinessKpiOverview({
  stats,
  businessOverview,
  isDemoWorkspace = false,
  loading,
}: CoachBusinessKpiOverviewProps) {
  const { kpis, revenue, memberGrowthTrend } = businessOverview
  const isProjectedDemo =
    isDemoWorkspace && revenue.source === "estimated"
  const projectedMonthlyRevenue = computeProjectedDemoRevenue(kpis.activeMembers)
  const activeShare =
    kpis.totalMembers > 0
      ? Math.round((kpis.activeMembers / kpis.totalMembers) * 100)
      : 0
  const activeMemberTrend = monthOverMonthGrowth(memberGrowthTrend, "activeMembers")

  return (
    <section aria-label="Business KPI overview">
      <DashboardSectionHeader
        eyebrow="Executive snapshot"
        title="Business KPI Overview"
        description="Roster health, revenue momentum, and coaching workload — updated in real time."
      />

      <div
        className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 ${COACH_DASHBOARD_GRID_GAP}`}
      >
        <ExecutiveKpiCard
          label="Total Members"
          value={kpis.totalMembers}
          icon={Users}
          accent="from-indigo-500/25 to-blue-500/10 text-indigo-300"
          detail={`${kpis.newMembersThisMonth} new this month`}
          trend={{ percent: revenue.memberGrowthPercent, label: "vs last month" }}
          loading={loading}
        />
        <ExecutiveKpiCard
          label="Active Members"
          value={kpis.activeMembers}
          icon={UserCheck}
          accent="from-emerald-500/25 to-teal-500/10 text-emerald-300"
          detail={`${activeShare}% of roster active`}
          trend={{ percent: activeMemberTrend, label: "vs last month" }}
          loading={loading}
        />
        <ExecutiveKpiCard
          label={
            isProjectedDemo ? "Projected Monthly Revenue" : "Monthly Revenue"
          }
          value={
            loading
              ? "—"
              : isProjectedDemo
                ? formatProjectedMonthlyRevenue(
                    projectedMonthlyRevenue,
                    revenue.currency,
                  )
                : formatBusinessCurrency(
                    revenue.estimatedMonthlyRevenue,
                    revenue.currency,
                  )
          }
          icon={DollarSign}
          accent="from-violet-500/25 to-purple-500/10 text-violet-300"
          detail={
            isProjectedDemo ? "Based on active demo clients" : "Live revenue"
          }
          helper={isProjectedDemo ? "Demo pricing: $90/client" : undefined}
          trend={{ percent: revenue.revenueGrowthPercent, label: "vs last month" }}
          loading={loading}
        />
        <ExecutiveKpiCard
          label="Sessions This Month"
          value={kpis.sessionsThisMonth}
          icon={CalendarClock}
          accent="from-sky-500/25 to-cyan-500/10 text-sky-300"
          detail="Booked this calendar month"
          loading={loading}
        />
        <ExecutiveKpiCard
          label="Open Alerts"
          value={stats.openProgressAlerts}
          icon={Bell}
          accent="from-amber-500/25 to-orange-500/10 text-amber-300"
          highlight={stats.openProgressAlerts > 0}
          detail={
            stats.openProgressAlerts > 0
              ? "Review progress alerts"
              : "No open alerts"
          }
          loading={loading}
        />
        <ExecutiveKpiCard
          label="Needs Attention"
          value={stats.membersNeedingAttention}
          icon={AlertTriangle}
          accent="from-red-500/25 to-rose-500/10 text-red-300"
          highlight={stats.membersNeedingAttention > 0}
          detail={
            stats.membersNeedingAttention > 0
              ? "Members need follow-up"
              : "Roster looks healthy"
          }
          loading={loading}
        />
      </div>
    </section>
  )
}

export function CoachBusinessKpiSkeleton() {
  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
        <div className="h-9 w-72 max-w-full animate-pulse rounded-xl bg-white/10" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-white/10" />
      </div>
      <div
        className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 ${COACH_DASHBOARD_GRID_GAP}`}
      >
        {Array.from({ length: 6 }).map((_, index) => (
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
