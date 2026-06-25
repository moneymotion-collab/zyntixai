"use client"

import { Crown } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  AnalyticsChartShell,
  AnalyticsGroupedTooltip,
  AXIS_TICK,
  CHART_COLORS,
  formatChartAxis,
} from "@/components/marketing/analytics/chart-utils"
import {
  DEMO_CHART_HEIGHT,
  DEMO_Y_AXIS_WIDTH,
} from "@/components/marketing/analytics/demo-video-styles"
import type {
  BreakdownContentType,
  ContentTypeBreakdown,
} from "@/lib/marketing/analytics/content-type-breakdown"

const TYPE_COLORS: Record<BreakdownContentType, string> = {
  Reels: "#6d28d9",
  Carousels: "#d97706",
  Stories: "#db2777",
  Testimonials: "#1d4ed8",
  Transformations: "#047857",
}

export default function ContentTypeBreakdownSection({
  breakdown,
}: {
  breakdown: ContentTypeBreakdown
}) {
  const { stats, bestType, bestTypeInsight } = breakdown
  const chartData = stats
    .filter((stat) => stat.postCount > 0)
    .map((stat) => ({
      ...stat,
      name: stat.label,
      fullTitle: stat.label,
    }))
  const leader = stats.find((stat) => stat.type === bestType) ?? null

  return (
    <AnalyticsChartShell
      title="Content Type Breakdown"
      description="Which formats drive the most engagement"
      accentBar="from-violet-500 via-fuchsia-500 to-emerald-500"
      legend={[{ label: "Avg engagement rate", color: CHART_COLORS.engagement }]}
    >
      {leader ? (
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-950">
              Best format: {leader.label}
            </p>
            <p className="mt-1 text-base font-medium leading-relaxed text-emerald-900">
              {bestTypeInsight}
            </p>
          </div>
        </div>
      ) : null}

      <div className={`${DEMO_CHART_HEIGHT} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 16, left: 4, bottom: 12 }}
            barCategoryGap="24%"
          >
            <CartesianGrid
              stroke={CHART_COLORS.grid}
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={DEMO_Y_AXIS_WIDTH}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
              content={<AnalyticsGroupedTooltip />}
            />
            <Bar
              dataKey="avgEngagementRate"
              name="Avg engagement"
              radius={[10, 10, 0, 0]}
              maxBarSize={56}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.type}
                  fill={TYPE_COLORS[entry.type]}
                  fillOpacity={entry.type === bestType ? 1 : 0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsChartShell>
  )
}
