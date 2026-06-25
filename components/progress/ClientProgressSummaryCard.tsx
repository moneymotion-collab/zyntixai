"use client"

import {
  AlertTriangle,
  Battery,
  CalendarCheck,
  CheckCircle2,
  Moon,
  Scale,
  Sparkles,
  User,
} from "lucide-react"
import { PROGRESS_PRO_CARD } from "@/components/progress/progress-pro-ui"
import {
  formatProgressSummaryDate,
  formatProgressSummaryScore,
  formatProgressSummaryWeight,
  progressStatusLabel,
  type ClientProgressSummary,
} from "@/lib/progress/client-checkin-member-view"

type ClientProgressSummaryCardProps = {
  summary: ClientProgressSummary
  loading?: boolean
}

function SummaryMetric({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  icon: typeof Scale
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1224]/50 px-4 py-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${accent}`} aria-hidden />
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {label}
        </p>
      </div>
      <p className="mt-2 text-xl font-bold tabular-nums text-white">{value}</p>
    </div>
  )
}

function StatusBadge({
  status,
}: {
  status: ClientProgressSummary["status"]
}) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-gray-400">
        No wellness scores yet
      </span>
    )
  }

  if (status === "on_track") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        {progressStatusLabel(status)}
      </span>
    )
  }

  if (status === "needs_attention") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
        {progressStatusLabel(status)}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">
      {progressStatusLabel(status)}
    </span>
  )
}

export default function ClientProgressSummaryCard({
  summary,
  loading = false,
}: ClientProgressSummaryCardProps) {
  return (
    <div className={`relative overflow-hidden ${PROGRESS_PRO_CARD} border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.08] via-white/[0.03] to-violet-500/[0.06] p-6 sm:p-8`}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-400">
            Individual client view
          </p>
          <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Client Progress Summary
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white">
              <User className="h-4 w-4 text-cyan-400" aria-hidden />
              {summary.memberName}
            </span>
            <StatusBadge status={loading ? null : summary.status} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
          <p className="text-xs uppercase tracking-wider text-gray-500">Last check-in</p>
          {loading ? (
            <div className="skeleton-shimmer mt-2 h-6 w-28 rounded-md" />
          ) : (
            <p className="mt-1 inline-flex items-center gap-1.5 font-medium text-white">
              <CalendarCheck className="h-4 w-4 text-violet-400" aria-hidden />
              {formatProgressSummaryDate(summary.lastCheckInDate)}
            </p>
          )}
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="skeleton-shimmer h-[88px] rounded-2xl border border-white/10"
            />
          ))
        ) : (
          <>
            <SummaryMetric
              label="Latest weight"
              value={formatProgressSummaryWeight(summary.latestWeight)}
              icon={Scale}
              accent="text-cyan-400"
            />
            <SummaryMetric
              label="Latest energy"
              value={formatProgressSummaryScore(summary.latestEnergy)}
              icon={Battery}
              accent="text-emerald-400"
            />
            <SummaryMetric
              label="Latest sleep"
              value={formatProgressSummaryScore(summary.latestSleep)}
              icon={Moon}
              accent="text-violet-400"
            />
            <SummaryMetric
              label="Latest motivation"
              value={formatProgressSummaryScore(summary.latestMotivation)}
              icon={Sparkles}
              accent="text-pink-400"
            />
          </>
        )}
      </div>
    </div>
  )
}
