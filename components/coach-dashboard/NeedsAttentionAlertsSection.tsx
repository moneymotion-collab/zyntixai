"use client"

import Link from "next/link"
import {
  AlertTriangle,
  Apple,
  CalendarClock,
  Dumbbell,
  TrendingDown,
} from "lucide-react"
import { COACH_DASHBOARD_CARD_PADDING } from "@/components/coach-dashboard/coach-dashboard-ui"
import EmptyState from "@/components/ui/empty-state"
import GlassCard from "@/components/ui/glass-card"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { getAlertSeverityLabel } from "@/lib/progress/compute-progress-alerts"
import type {
  NeedsAttentionAlert,
  NeedsAttentionAlertType,
} from "@/lib/coach-dashboard/types"

type NeedsAttentionAlertsSectionProps = {
  alerts: NeedsAttentionAlert[]
}

const ALERT_ICONS: Record<NeedsAttentionAlertType, typeof Dumbbell> = {
  missed_workout: Dumbbell,
  upcoming_session: CalendarClock,
  progress_stalled: TrendingDown,
  nutrition_adherence_low: Apple,
}

const SEVERITY_STYLES = {
  high: "border-red-500/30 bg-red-500/10 text-red-200",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  low: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
} as const

export default function NeedsAttentionAlertsSection({
  alerts,
}: NeedsAttentionAlertsSectionProps) {
  return (
    <GlassCard className={COACH_DASHBOARD_CARD_PADDING}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-rose-400/80">
            Needs attention
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Coaching Alerts
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Workouts, sessions, progress, and nutrition signals that need a
            coach touchpoint.
          </p>
        </div>
        <Link
          href="/progress"
          className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
        >
          Review all →
        </Link>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          {...SAAS_EMPTY.alerts}
          icon={<AlertTriangle className="h-6 w-6" />}
        />
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => {
            const Icon = ALERT_ICONS[alert.alertType]
            return (
              <li key={alert.id}>
                <Link
                  href={alert.href}
                  className="glass-panel glass-panel-hover block rounded-xl px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-rose-300">
                        <Icon className="h-4 w-4" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white">
                          {alert.memberName}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-rose-200/90">
                          {alert.alertTypeLabel}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                          {alert.reason}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${SEVERITY_STYLES[alert.severity]}`}
                    >
                      {getAlertSeverityLabel(alert.severity)}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </GlassCard>
  )
}
