"use client"

import {
  AlertTriangle,
  Battery,
  Bell,
  CalendarX,
  Moon,
  Scale,
  Sparkles,
  Target,
} from "lucide-react"
import ProgressEmptyState from "@/components/progress/ProgressEmptyState"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { Skeleton } from "@/components/ui/skeleton"
import { PROGRESS_PRO_CARD } from "@/components/progress/progress-pro-ui"
import {
  getAlertSeverityLabel,
  type AlertSeverity,
  type ProgressAlert,
  type ProgressAlertType,
} from "@/lib/progress/compute-progress-alerts"

type ProgressAlertsCenterProps = {
  alerts: ProgressAlert[]
  loading?: boolean
  memberFilterLabel?: string
}

const ALERT_ICONS: Record<
  ProgressAlertType,
  typeof AlertTriangle
> = {
  low_energy: Battery,
  poor_sleep: Moon,
  low_motivation: Sparkles,
  weight_plateau: Scale,
  missing_check_ins: CalendarX,
  goal_behind_schedule: Target,
}

const SEVERITY_STYLES: Record<
  AlertSeverity,
  { badge: string; border: string; glow: string }
> = {
  high: {
    badge: "border-red-500/30 bg-red-500/10 text-red-200",
    border: "border-red-500/20 hover:border-red-500/35",
    glow: "from-red-500/[0.08]",
  },
  medium: {
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    border: "border-amber-500/20 hover:border-amber-500/35",
    glow: "from-amber-500/[0.06]",
  },
  low: {
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
    border: "border-cyan-500/20 hover:border-cyan-500/35",
    glow: "from-cyan-500/[0.05]",
  },
}

export default function ProgressAlertsCenter({
  alerts,
  loading = false,
  memberFilterLabel = "All members",
}: ProgressAlertsCenterProps) {
  const highCount = alerts.filter((alert) => alert.severity === "high").length

  return (
    <section className={`relative overflow-hidden ${PROGRESS_PRO_CARD} p-6 sm:p-8`}>
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-amber-400">
            Alerts center
          </p>
          <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Progress Alerts
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            {memberFilterLabel === "All members"
              ? "Urgent signals from check-ins and goals across your roster."
              : `Alerts for ${memberFilterLabel} based on check-ins and goals.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-gray-300">
            <Bell className="h-4 w-4 text-amber-400" aria-hidden />
            {alerts.length} {alerts.length === 1 ? "alert" : "alerts"}
          </span>
          {highCount > 0 ? (
            <span className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-200">
              {highCount} high priority
            </span>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="relative grid grid-cols-1 gap-4 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <ProgressEmptyState
          {...SAAS_EMPTY.alerts}
          icon={<Bell className="h-5 w-5 text-emerald-400" />}
          compact
        />
      ) : (
        <div className="relative grid grid-cols-1 gap-4 xl:grid-cols-2">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </section>
  )
}

function AlertCard({ alert }: { alert: ProgressAlert }) {
  const Icon = ALERT_ICONS[alert.alertType]
  const styles = SEVERITY_STYLES[alert.severity]

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${styles.glow} via-white/[0.02] to-transparent p-5 transition ${styles.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20">
            <Icon className="h-4 w-4 text-cyan-400" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-white">{alert.memberName}</p>
            <p className="mt-1 text-sm font-medium text-violet-200">
              {alert.alertTypeLabel}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles.badge}`}
        >
          {getAlertSeverityLabel(alert.severity)}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div className="rounded-xl border border-white/10 bg-[#0b1224]/50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Reason
          </p>
          <p className="mt-1 text-gray-300">{alert.reason}</p>
        </div>

        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-300/80">
                Suggested coach action
              </p>
              <p className="mt-1 text-gray-200">{alert.suggestedAction}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
