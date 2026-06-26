"use client"

import { Activity, AlertTriangle, CalendarDays, Sparkles } from "lucide-react"
import { FitCoreLogoMark } from "@/components/brand/FitCoreLogo"
import { CommandCenterStatusBadge } from "@/components/coach-dashboard/coach-dashboard-ui"
import type { CommandCenterStatus } from "@/lib/coach-dashboard/resolve-command-center-status"

type CoachDashboardHeaderProps = {
  coachDisplayName: string
  currentDateLabel: string
  commandCenterStatus: CommandCenterStatus
}

const STATUS_ICONS = {
  success: Activity,
  warning: AlertTriangle,
  info: CalendarDays,
  neutral: Sparkles,
} as const

export default function CoachDashboardHeader({
  coachDisplayName,
  currentDateLabel,
  commandCenterStatus,
}: CoachDashboardHeaderProps) {
  const StatusIcon = STATUS_ICONS[commandCenterStatus.variant]

  return (
    <header
      data-tour="dashboard-overview"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/[0.08] via-white/[0.03] to-violet-500/[0.08] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)] sm:p-8"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2.5">
            <FitCoreLogoMark size="xs" />
          </div>
          <h1 className="mt-2.5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            Welcome back, {coachDisplayName}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-[15px]">
            Your executive coaching command center — business KPIs, member health,
            at-risk intervention, and performance insights in one place.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          <CommandCenterStatusBadge
            label={commandCenterStatus.label}
            variant={commandCenterStatus.variant}
            icon={StatusIcon}
          />
          <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-slate-300">
            <CalendarDays className="h-4 w-4 text-cyan-400" aria-hidden />
            {currentDateLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-2xl border border-violet-500/20 bg-violet-500/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-violet-200/90">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Coach Command Center
          </span>
        </div>
      </div>
    </header>
  )
}
