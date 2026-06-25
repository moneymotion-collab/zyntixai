"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  buildChartData,
  formatDateTime,
  formatValue,
  type ProgressLogRow,
} from "@/lib/progress/fetch-progress-dashboard"
import {
  formatCategoryDisplay,
  matchesMetricFilter,
  type MetricCategory,
} from "@/lib/progress/metrics"
import ProgressEmptyState from "@/components/progress/ProgressEmptyState"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { ProgressChartSkeleton } from "@/components/progress/ProgressPageSkeleton"

const METRIC_CATEGORIES: MetricCategory[] = [
  "weight",
  "body_fat",
  "strength",
  "endurance",
  "custom",
]

const CATEGORY_COLORS: Record<MetricCategory, string> = {
  weight: "#22d3ee",
  body_fat: "#a78bfa",
  strength: "#34d399",
  endurance: "#fbbf24",
  custom: "#f472b6",
}

type MemberMetricChartsProps = {
  logs: ProgressLogRow[]
  chartReady: boolean
  loading?: boolean
}

export default function MemberMetricCharts({
  logs,
  chartReady,
  loading = false,
}: MemberMetricChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ProgressChartSkeleton height={220} />
        <ProgressChartSkeleton height={220} />
      </div>
    )
  }

  const chartsWithData = METRIC_CATEGORIES.map((category) => {
    const categoryLogs = logs.filter((log) =>
      matchesMetricFilter(log.metric, category),
    )
    const chartData = buildChartData(categoryLogs)
    return { category, chartData, logCount: categoryLogs.length }
  }).filter((entry) => entry.logCount > 0)

  if (chartsWithData.length === 0) {
    return (
      <ProgressEmptyState
        {...SAAS_EMPTY.progress}
        description="Charts will appear here once progress entries are recorded for this member."
        compact
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {chartsWithData.map(({ category, chartData, logCount }) => (
        <MetricChartCard
          key={category}
          category={category}
          chartData={chartData}
          logCount={logCount}
          chartReady={chartReady}
        />
      ))}
    </div>
  )
}

function MetricChartCard({
  category,
  chartData,
  logCount,
  chartReady,
}: {
  category: MetricCategory
  chartData: ReturnType<typeof buildChartData>
  logCount: number
  chartReady: boolean
}) {
  const color = CATEGORY_COLORS[category]
  const label = formatCategoryDisplay(category)

  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
            {label}
          </p>
          <h3 className="mt-2 text-lg font-bold text-white">{label} trend</h3>
          <p className="mt-1 text-sm text-gray-400">
            {logCount} {logCount === 1 ? "entry" : "entries"}
          </p>
        </div>
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      <div className="mt-6 rounded-2xl bg-[#0b1224] p-4">
        {!chartReady ? (
          <div className="flex h-[220px] flex-col justify-end gap-2 px-2 pb-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="skeleton-shimmer rounded-md"
                style={{ height: 12, width: `${55 + (index % 3) * 12}%`, marginLeft: `${index * 8}%` }}
              />
            ))}
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-gray-500">
            {SAAS_EMPTY.progressMetric.title}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
              />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#0b1224",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                }}
                labelFormatter={(_, payload) => {
                  const point = payload?.[0]?.payload as
                    | { updatedAt?: string }
                    | undefined
                  return point?.updatedAt ? formatDateTime(point.updatedAt) : ""
                }}
                formatter={(value) => [formatValue(Number(value)), "Current"]}
              />
              <Line
                type="monotone"
                dataKey="currentValue"
                stroke={color}
                strokeWidth={2}
                dot={{ r: 4, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  )
}