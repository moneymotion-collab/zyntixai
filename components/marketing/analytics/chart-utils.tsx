"use client"

import type { ReactNode } from "react"
import {
  DEMO_AXIS_TICK,
  DEMO_CHART_MARGIN,
} from "@/components/marketing/analytics/demo-video-styles"

export const CHART_COLORS = {
  reach: "#6d28d9",
  views: "#1d4ed8",
  engagement: "#047857",
  grid: "#e2e8f0",
  axis: "#334155",
  muted: "#64748b",
} as const

export const CHART_MARGIN = DEMO_CHART_MARGIN

export const AXIS_TICK = DEMO_AXIS_TICK

export function formatChartAxis(value: number): string {
  if (!Number.isFinite(value)) return "0"
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 10_000) return `${Math.round(value / 100) / 10}K`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(Math.round(value))
}

export function formatChartTooltipValue(value: number | string | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "0"
  return value.toLocaleString()
}

type ChartTooltipPayload = {
  name?: string
  value?: number | string
  color?: string
  payload?: Record<string, unknown>
}

export function AnalyticsChartTooltip({
  active,
  payload,
  label,
  valueLabel,
}: {
  active?: boolean
  payload?: ChartTooltipPayload[]
  label?: string | number
  valueLabel: string
}) {
  if (!active || !payload?.length) return null

  const point = payload[0]?.payload as ChartTooltipPayload["payload"]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.14)]">
      <p className="text-sm font-bold text-slate-600">{label}</p>
      {point?.fullTitle ? (
        <p className="mt-1 max-w-[260px] text-base font-semibold leading-snug text-slate-900">
          {String(point.fullTitle)}
        </p>
      ) : null}
      <p className="mt-2 text-3xl font-bold tabular-nums text-slate-950">
        {formatChartTooltipValue(payload[0]?.value as number)}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-500">{valueLabel}</p>
    </div>
  )
}

export function AnalyticsGroupedTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: ChartTooltipPayload[]
  label?: string | number
}) {
  if (!active || !payload?.length) return null

  const point = payload[0]?.payload as ChartTooltipPayload["payload"]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.14)]">
      <p className="text-sm font-bold text-slate-600">{label}</p>
      {point?.fullTitle ? (
        <p className="mt-1 max-w-[280px] text-base font-semibold leading-snug text-slate-900">
          {String(point.fullTitle)}
        </p>
      ) : null}
      <div className="mt-3 space-y-2.5">
        {payload.map((entry) => (
          <div key={String(entry.name)} className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2.5">
              <span
                className="h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-base font-semibold text-slate-700">{entry.name}</span>
            </div>
            <span className="text-base font-bold tabular-nums text-slate-950">
              {formatChartTooltipValue(entry.value as number)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

type LegendItem = {
  label: string
  color: string
}

export function AnalyticsChartShell({
  title,
  description,
  accentBar,
  legend,
  children,
}: {
  title: string
  description?: string
  accentBar: string
  legend?: LegendItem[]
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className={`h-1.5 bg-gradient-to-r ${accentBar}`} />

      <div className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[1.75rem]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1.5 text-base font-medium text-slate-600">{description}</p>
          ) : null}
        </div>

        {children}

        {legend && legend.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {legend.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-base font-bold text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
