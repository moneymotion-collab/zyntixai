"use client"

import type { LucideIcon } from "lucide-react"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import GlassCard from "@/components/ui/glass-card"
import { formatGrowthPercent } from "@/lib/coach-dashboard/compute-business-overview"

export type DashboardStatTrend = {
  percent: number | null
  label?: string
  invert?: boolean
}

type DashboardStatCardProps = {
  label: string
  value: string | number
  icon?: LucideIcon
  accent?: string
  detail?: string
  helper?: string
  trend?: DashboardStatTrend
  highlight?: boolean
  loading?: boolean
}

export function KpiTrendIndicator({
  percent,
  label = "vs last month",
  invert = false,
}: DashboardStatTrend) {
  if (percent == null && !label) return null

  const hoverTransition =
    "transition-[border-color,background-color,box-shadow] duration-200 group-hover/stat:shadow-[0_0_12px_rgba(255,255,255,0.06)]"

  if (percent == null) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-400 ${hoverTransition} group-hover/stat:border-white/20 group-hover/stat:bg-white/[0.08] group-hover/stat:text-slate-300`}
      >
        {label}
      </span>
    )
  }

  const isUp = percent > 0
  const isDown = percent < 0
  const isGood = invert ? isDown : isUp
  const isBad = invert ? isUp : isDown
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${hoverTransition} ${
        isGood
          ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300 group-hover/stat:border-emerald-400/40 group-hover/stat:bg-emerald-500/[0.14] group-hover/stat:shadow-[0_0_14px_rgba(52,211,153,0.12)]"
          : isBad
            ? "border-red-400/25 bg-red-500/10 text-red-300 group-hover/stat:border-red-400/40 group-hover/stat:bg-red-500/[0.14] group-hover/stat:shadow-[0_0_14px_rgba(248,113,113,0.1)]"
            : "border-white/10 bg-white/5 text-slate-400 group-hover/stat:border-white/20 group-hover/stat:bg-white/[0.08] group-hover/stat:text-slate-300"
      }`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden />
      {formatGrowthPercent(percent)}
      {label ? (
        <span className="hidden font-medium text-slate-500 sm:inline">{label}</span>
      ) : null}
    </span>
  )
}

export default function DashboardStatCard({
  label,
  value,
  icon: Icon,
  accent = "from-indigo-500/20 to-blue-500/10 text-indigo-300",
  detail,
  helper,
  trend,
  highlight = false,
  loading = false,
}: DashboardStatCardProps) {
  return (
    <GlassCard
      hover="stat"
      className={`group/stat flex h-full flex-col p-5 sm:p-6 ${
        highlight
          ? "border-emerald-400/25 bg-gradient-to-br from-emerald-500/[0.06] to-transparent"
          : "bg-gradient-to-br from-white/[0.04] to-transparent"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium leading-snug text-slate-400 transition-colors duration-200 group-hover/stat:text-slate-300">
          {label}
        </p>
        {Icon ? (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-[border-color,transform,box-shadow] duration-200 group-hover/stat:border-white/15 group-hover/stat:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.15)] ${accent}`}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-4 h-10 w-28 animate-pulse rounded-xl bg-white/10" />
      ) : (
        <p className="mt-4 text-2xl font-bold tracking-tight tabular-nums text-white transition-colors duration-200 group-hover/stat:text-white sm:text-3xl md:text-4xl">
          {value}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-end gap-2 pt-4">
        {trend ? <KpiTrendIndicator {...trend} /> : null}
        {detail || helper ? (
          <div className="flex min-w-0 flex-col gap-0.5">
            {detail ? (
              <p className="text-xs leading-relaxed text-slate-500 transition-colors duration-200 group-hover/stat:text-slate-400">
                {detail}
              </p>
            ) : null}
            {helper ? (
              <p className="text-[11px] leading-relaxed text-slate-600 transition-colors duration-200 group-hover/stat:text-slate-500">
                {helper}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </GlassCard>
  )
}
