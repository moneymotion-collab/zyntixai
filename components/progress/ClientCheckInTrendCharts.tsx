"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  Battery,
  LineChart as LineChartIcon,
  Moon,
  Scale,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import ProgressEmptyState from "@/components/progress/ProgressEmptyState"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { ProgressProSectionHeader } from "@/components/progress/progress-pro-ui"
import { PROGRESS_PRO_CARD } from "@/components/progress/progress-pro-ui"
import {
  buildClientCheckInCharts,
  formatChartMetricValue,
  type CheckInMetricChart,
  type CheckInMetricKey,
} from "@/lib/progress/build-client-checkin-charts"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import { formatProgressChartDate } from "@/lib/progress/progress-date"

type ClientCheckInTrendChartsProps = {
  checkIns: ClientCheckInRow[]
  loading?: boolean
  memberFilterLabel?: string
}

type MetricChartConfig = {
  metric: CheckInMetricKey
  title: string
  subtitle: string
  icon: LucideIcon
  stroke: string
  yDomain?: [number, number]
}

const METRIC_CHARTS: MetricChartConfig[] = [
  {
    metric: "weight",
    title: "Weight trend",
    subtitle: "Body weight from client check-ins over time",
    icon: Scale,
    stroke: "#22d3ee",
  },
  {
    metric: "energy",
    title: "Energy trend",
    subtitle: "Average energy score over time",
    icon: Battery,
    stroke: "#34d399",
    yDomain: [0, 10],
  },
  {
    metric: "sleep",
    title: "Sleep trend",
    subtitle: "Average sleep score over time",
    icon: Moon,
    stroke: "#a78bfa",
    yDomain: [0, 10],
  },
  {
    metric: "motivation",
    title: "Motivation trend",
    subtitle: "Average motivation score over time",
    icon: Sparkles,
    stroke: "#f472b6",
    yDomain: [0, 10],
  },
]

function TrendChartCard({
  config,
  chart,
  loading,
  chartReady,
}: {
  config: MetricChartConfig
  chart: CheckInMetricChart
  loading?: boolean
  chartReady: boolean
}) {
  const Icon = config.icon

  return (
    <div className={`${PROGRESS_PRO_CARD} p-6 transition hover:border-white/15`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-cyan-400/80" aria-hidden />
            <h3 className="text-lg font-bold text-white">{config.title}</h3>
          </div>
          <p className="mt-1 text-sm text-gray-400">{config.subtitle}</p>
        </div>
        <LineChartIcon className="h-5 w-5 shrink-0 text-white/20" aria-hidden />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1224] p-3 sm:p-4">
        {loading || !chartReady ? (
          <div className="flex h-[220px] flex-col justify-end gap-3 px-2 pb-4 sm:h-[260px]">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="skeleton-shimmer h-3 rounded-md"
                style={{
                  width: `${45 + (index % 3) * 12}%`,
                  marginLeft: `${index * 8}%`,
                }}
              />
            ))}
          </div>
        ) : !chart.hasEnoughData ? (
          <ProgressEmptyState
            {...SAAS_EMPTY.progressCheckInTrend}
            description={
              config.metric === "weight"
                ? "Log at least two check-ins with weight to reveal the trend line."
                : "Log at least two check-ins with this metric to reveal the trend line."
            }
            icon={<Activity className="h-5 w-5" />}
            compact
          />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chart.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis
                dataKey="checkin_date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
                tickFormatter={(value) => formatProgressChartDate(String(value))}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                domain={config.yDomain ?? ["auto", "auto"]}
                width={config.metric === "weight" ? 44 : 32}
              />
              <Tooltip
                contentStyle={{
                  background: "#0b1224",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                }}
                labelFormatter={(_, payload) => {
                  const point = payload?.[0]?.payload as
                    | { checkin_date?: string; label?: string }
                    | undefined
                  return point?.label ?? formatProgressChartDate(point?.checkin_date)
                }}
                formatter={(value) => [
                  formatChartMetricValue(config.metric, Number(value)),
                  config.title.replace(" trend", ""),
                ]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={config.stroke}
                strokeWidth={2}
                dot={{ r: 4, fill: config.stroke, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default function ClientCheckInTrendCharts({
  checkIns,
  loading = false,
  memberFilterLabel = "All members",
}: ClientCheckInTrendChartsProps) {
  const [chartReady, setChartReady] = useState(false)
  const charts = useMemo(() => buildClientCheckInCharts(checkIns), [checkIns])

  useEffect(() => {
    setChartReady(true)
  }, [])

  return (
    <div>
      <ProgressProSectionHeader
        eyebrow="Trend analysis"
        title="Check-in trend lines"
        description={
          memberFilterLabel === "All members"
            ? "Trend lines from client check-ins, grouped by date."
            : `Trend lines for ${memberFilterLabel}, grouped by date.`
        }
        accent="violet"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {METRIC_CHARTS.map((config) => (
          <TrendChartCard
            key={config.metric}
            config={config}
            chart={charts[config.metric]}
            loading={loading}
            chartReady={chartReady}
          />
        ))}
      </div>
    </div>
  )
}
