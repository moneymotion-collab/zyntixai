"use client"

import Link from "next/link"
import {
  Activity,
  Award,
  BarChart3,
  CalendarCheck,
  ClipboardCheck,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
} from "lucide-react"
import EmptyState from "@/components/ui/empty-state"
import GlassCard from "@/components/ui/glass-card"
import { Skeleton } from "@/components/ui/skeleton"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { getPerformanceStatusStyles } from "@/lib/coach-dashboard/compute-coach-performance"
import type {
  CoachPerformanceCenter,
  CoachPerformanceKpi,
  CoachPerformanceStatus,
} from "@/lib/coach-dashboard/types"

type CoachPerformanceSectionProps = {
  performance: CoachPerformanceCenter
  loading?: boolean
  error?: string | null
}

const KPI_ICONS: Record<string, typeof Users> = {
  client_retention: Users,
  goal_completion: Target,
  check_in_engagement: ClipboardCheck,
  session_completion: CalendarCheck,
  workout_completion: Activity,
  members_improved: TrendingUp,
}

const KPI_ACCENTS: Record<string, string> = {
  client_retention: "from-indigo-500/20 to-blue-500/10 text-indigo-300",
  goal_completion: "from-emerald-500/20 to-teal-500/10 text-emerald-300",
  check_in_engagement: "from-violet-500/20 to-purple-500/10 text-violet-300",
  session_completion: "from-sky-500/20 to-cyan-500/10 text-sky-300",
  workout_completion: "from-rose-500/20 to-pink-500/10 text-rose-300",
  members_improved: "from-lime-500/20 to-green-500/10 text-lime-300",
}

function kpiStatus(value: number | null): CoachPerformanceStatus | null {
  if (value == null) return null
  if (value >= 80) return "excellent"
  if (value >= 60) return "good"
  return "needs_work"
}

function PerformanceKpiCard({
  kpi,
  loading,
}: {
  kpi: CoachPerformanceKpi
  loading?: boolean
}) {
  const Icon = KPI_ICONS[kpi.id] ?? BarChart3
  const accent = KPI_ACCENTS[kpi.id] ?? "from-slate-500/20 to-slate-500/10 text-slate-300"
  const status = kpiStatus(kpi.valuePercent)
  const statusStyles = status ? getPerformanceStatusStyles(status) : null

  return (
    <GlassCard className="p-5 sm:p-6" hover>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-400">{kpi.label}</p>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${accent}`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </div>

      {loading ? (
        <Skeleton className="mt-3 h-9 w-20" />
      ) : (
        <p className="mt-3 text-3xl font-bold tabular-nums text-white sm:text-4xl">
          {kpi.hasData ? kpi.displayValue : "—"}
        </p>
      )}

      <p className="mt-2 text-xs text-slate-500">
        {kpi.hasData ? kpi.detail : SAAS_EMPTY.performanceKpiEmpty.description}
      </p>

      {status && statusStyles && kpi.hasData ? (
        <span
          className={`mt-3 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles.badge}`}
        >
          {status === "excellent"
            ? "Excellent"
            : status === "good"
              ? "Good"
              : "Needs work"}
        </span>
      ) : null}
    </GlassCard>
  )
}

export function CoachPerformanceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="glass-panel space-y-3 p-5 sm:p-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-3xl" />
    </div>
  )
}

export default function CoachPerformanceSection({
  performance,
  loading,
  error,
}: CoachPerformanceSectionProps) {
  const { overallScore, overallStatus, overallStatusLabel, kpis, insight, hasEnoughData } =
    performance

  const statusStyles =
    overallStatus != null ? getPerformanceStatusStyles(overallStatus) : null

  return (
    <section aria-label="Coach performance" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-400">
            Performance center
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Coach Performance
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            How effectively you retain clients, drive engagement, and deliver
            outcomes — based on your roster KPIs.
          </p>
        </div>
        {overallStatus && statusStyles ? (
          <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${statusStyles.ring}`}
            >
              <Award className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Overall status
              </p>
              <p className="text-lg font-bold text-white">
                {overallStatusLabel}
                {overallScore != null ? (
                  <span className="ml-2 text-sm font-medium text-slate-400">
                    ({overallScore}%)
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {!hasEnoughData && !loading ? (
        <GlassCard className="p-6 sm:p-8">
          <EmptyState
            {...SAAS_EMPTY.coachPerformance}
            icon={<BarChart3 className="h-6 w-6" />}
            action={
              <Link href="/members" className="btn-gradient">
                Add Member
              </Link>
            }
          />
        </GlassCard>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {kpis.map((kpi) => (
              <PerformanceKpiCard key={kpi.id} kpi={kpi} loading={loading} />
            ))}
          </div>

          <GlassCard className="relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.06] via-white/[0.02] to-indigo-500/[0.05] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative mb-5 flex items-start gap-3">
              <Lightbulb className="mt-0.5 h-5 w-5 text-cyan-400" aria-hidden />
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-400">
                  Performance insights
                </p>
                <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                  Coach Insights
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Your biggest strength and priority improvement area based on
                  current KPIs.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="relative grid grid-cols-1 gap-4 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 rounded-2xl" />
                ))}
              </div>
            ) : insight ? (
              <div className="relative grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="glass-panel rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-wider text-emerald-400/80">
                    Biggest strength
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {insight.biggestStrength}
                  </p>
                </div>
                <div className="glass-panel rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-wider text-amber-400/80">
                    Biggest improvement area
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {insight.biggestImprovementArea}
                  </p>
                </div>
                <div className="glass-panel rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-wider text-cyan-400/80">
                    Suggested next action
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {insight.suggestedNextAction}
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState
                {...SAAS_EMPTY.coachPerformanceInsights}
                icon={<Lightbulb className="h-6 w-6" />}
                action={
                  <Link href="/progress" className="btn-gradient">
                    Add Check-in
                  </Link>
                }
              />
            )}
          </GlassCard>
        </>
      )}
    </section>
  )
}
