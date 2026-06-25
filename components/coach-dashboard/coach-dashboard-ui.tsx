"use client"

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import type { CommandCenterStatusVariant } from "@/lib/coach-dashboard/resolve-command-center-status"
import {
  resolveSessionStatusLabel,
  resolveSessionStatusStyle,
} from "@/lib/coach-dashboard/map-coach-sessions"
import DashboardStatCard, {
  KpiTrendIndicator,
  type DashboardStatTrend,
} from "@/components/ui/dashboard-stat-card"

export const COACH_DASHBOARD_SECTION_GAP = "space-y-12"
export const COACH_DASHBOARD_GRID_GAP = "gap-5 sm:gap-6"
export const COACH_DASHBOARD_CARD_PADDING = "p-6 sm:p-8"
export const COACH_DASHBOARD_PANEL_RADIUS = "rounded-2xl"

export type { CommandCenterStatusVariant, DashboardStatTrend }
export { KpiTrendIndicator }

const STATUS_STYLES: Record<
  CommandCenterStatusVariant,
  string
> = {
  success:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
  neutral: "border-white/10 bg-white/[0.04] text-slate-300",
}

export function DashboardSectionHeader({
  eyebrow,
  title,
  description,
  action,
  badge,
}: {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
  badge?: ReactNode
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/90">
          {eyebrow}
        </p>
        <h2 className="mt-2.5 text-2xl font-bold tracking-tight text-white sm:text-[1.75rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400/95">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {badge}
        {action}
      </div>
    </div>
  )
}

export function CommandCenterStatusBadge({
  label,
  variant,
  icon: Icon,
}: {
  label: string
  variant: CommandCenterStatusVariant
  icon: LucideIcon
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-wider ${STATUS_STYLES[variant]}`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </span>
  )
}

export function ExecutiveKpiCard({
  label,
  value,
  icon: Icon,
  accent,
  highlight = false,
  detail,
  helper,
  trend,
  loading,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  accent: string
  highlight?: boolean
  detail?: string
  helper?: string
  trend?: DashboardStatTrend
  loading?: boolean
}) {
  return (
    <DashboardStatCard
      label={label}
      value={value}
      icon={Icon}
      accent={accent}
      detail={detail}
      helper={helper}
      trend={trend}
      highlight={highlight}
      loading={loading}
    />
  )
}

export function OperationsHubDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 pt-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <p className="shrink-0 text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
        {title}
      </p>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

export function SessionStatusBadge({
  label,
  status,
}: {
  label: string
  status?: string | null
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${resolveSessionStatusStyle(status)}`}
    >
      {label || resolveSessionStatusLabel(status)}
    </span>
  )
}
