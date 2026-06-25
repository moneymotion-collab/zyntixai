"use client"

import {
  AlertCircle,
  Battery,
  CalendarRange,
  ClipboardList,
  FileText,
  Moon,
  Scale,
  Sparkles,
  Target,
  User,
} from "lucide-react"
import ProgressEmptyState from "@/components/progress/ProgressEmptyState"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { PROGRESS_PRO_CARD } from "@/components/progress/progress-pro-ui"
import {
  formatWeeklyAverageScore,
  formatWeeklyWeightChange,
  type WeeklyProgressReport,
} from "@/lib/progress/compute-weekly-progress-report"

type WeeklyProgressReportCardProps = {
  report: WeeklyProgressReport
  loading?: boolean
}

function ReportMetric({
  label,
  value,
  icon: Icon,
  accent,
  loading,
}: {
  label: string
  value: string
  icon: typeof Scale
  accent: string
  loading?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1224]/50 px-4 py-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${accent}`} aria-hidden />
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {label}
        </p>
      </div>
      {loading ? (
        <div className="skeleton-shimmer mt-3 h-7 w-20 rounded-md" />
      ) : (
        <p className="mt-2 text-xl font-bold tabular-nums text-white">{value}</p>
      )}
    </div>
  )
}

export default function WeeklyProgressReportCard({
  report,
  loading = false,
}: WeeklyProgressReportCardProps) {
  return (
    <div className={`relative overflow-hidden ${PROGRESS_PRO_CARD} border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] via-white/[0.03] to-emerald-500/[0.06] p-6 sm:p-8`}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-violet-400">
            Weekly report
          </p>
          <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Weekly Progress Report
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white">
              <User className="h-4 w-4 text-violet-400" aria-hidden />
              {report.memberName}
            </span>
            <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-gray-300">
              <CalendarRange className="h-4 w-4 text-cyan-400" aria-hidden />
              Last 7 days · {report.periodLabel}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-violet-200">
            <FileText className="h-4 w-4" aria-hidden />
            Premium report
          </span>
        </div>
      </div>

      {loading ? (
        <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="skeleton-shimmer h-[88px] rounded-2xl border border-white/10"
            />
          ))}
        </div>
      ) : !report.hasData ? (
        <ProgressEmptyState
          {...SAAS_EMPTY.weeklyReport}
          description={`Log check-ins for ${report.memberName} to generate this week's summary.`}
          icon={<ClipboardList className="h-5 w-5" />}
          compact
        />
      ) : (
        <>
          <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <ReportMetric
              label="Check-ins"
              value={String(report.checkInCount)}
              icon={ClipboardList}
              accent="text-cyan-400"
            />
            <ReportMetric
              label="Weight change"
              value={formatWeeklyWeightChange(report.weightChange)}
              icon={Scale}
              accent="text-cyan-400"
            />
            <ReportMetric
              label="Avg energy"
              value={formatWeeklyAverageScore(report.averageEnergy)}
              icon={Battery}
              accent="text-emerald-400"
            />
            <ReportMetric
              label="Avg sleep"
              value={formatWeeklyAverageScore(report.averageSleep)}
              icon={Moon}
              accent="text-violet-400"
            />
            <ReportMetric
              label="Avg motivation"
              value={formatWeeklyAverageScore(report.averageMotivation)}
              icon={Sparkles}
              accent="text-pink-400"
            />
            <ReportMetric
              label="Biggest concern"
              value={report.biggestConcern ?? "—"}
              icon={AlertCircle}
              accent="text-amber-400"
            />
          </div>

          <div className="relative mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5">
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-300/80">
                  Suggested coach focus
                </p>
                <p className="mt-2 text-base font-medium text-white">
                  {report.suggestedCoachFocus}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
