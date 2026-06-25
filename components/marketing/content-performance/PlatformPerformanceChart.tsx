"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
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
  DEMO_BAR_MARGIN,
  DEMO_CATEGORY_AXIS_TICK,
  DEMO_CATEGORY_AXIS_WIDTH,
  DEMO_CHART_HEIGHT,
} from "@/components/marketing/analytics/demo-video-styles"
import type { PlatformPerformancePoint } from "@/lib/marketing/content-performance/types"

export default function PlatformPerformanceChart({
  data,
}: {
  data: PlatformPerformancePoint[]
}) {
  if (data.length < 2) return null

  return (
    <AnalyticsChartShell
      title="Platform Performance"
      description="Views and engagement by platform"
      accentBar="from-violet-500 via-indigo-500 to-blue-500"
      legend={[
        { label: "Views", color: CHART_COLORS.views },
        { label: "Engagement", color: CHART_COLORS.engagement },
      ]}
    >
      <div className={`${DEMO_CHART_HEIGHT} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={DEMO_BAR_MARGIN} barCategoryGap="20%" barGap={8}>
            <CartesianGrid
              stroke={CHART_COLORS.grid}
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="platform"
              tick={DEMO_CATEGORY_AXIS_TICK}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={DEMO_CATEGORY_AXIS_WIDTH}
              tickFormatter={formatChartAxis}
            />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
              content={<AnalyticsGroupedTooltip />}
            />
            <Bar
              dataKey="views"
              name="Views"
              fill={CHART_COLORS.views}
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
            />
            <Bar
              dataKey="engagement"
              name="Engagement"
              fill={CHART_COLORS.engagement}
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsChartShell>
  )
}
