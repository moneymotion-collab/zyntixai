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
import type { ContentPerformanceChartPoint } from "@/lib/marketing/analytics/analytics-chart-data"
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
  DEMO_CHART_HEIGHT_LG,
} from "@/components/marketing/analytics/demo-video-styles"

export default function ContentPerformanceChart({
  data,
}: {
  data: ContentPerformanceChartPoint[]
}) {
  return (
    <AnalyticsChartShell
      title="Content Performance"
      description="Top posts by views and engagement"
      accentBar="from-blue-500 via-violet-500 to-emerald-500"
      legend={[
        { label: "Views", color: CHART_COLORS.views },
        { label: "Engagement", color: CHART_COLORS.engagement },
      ]}
    >
      <div className={`${DEMO_CHART_HEIGHT_LG} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={DEMO_BAR_MARGIN}
            barCategoryGap="20%"
            barGap={8}
          >
            <CartesianGrid
              stroke={CHART_COLORS.grid}
              strokeDasharray="4 4"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatChartAxis}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={DEMO_CATEGORY_AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={DEMO_CATEGORY_AXIS_WIDTH}
            />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
              content={<AnalyticsGroupedTooltip />}
            />
            <Bar
              dataKey="views"
              name="Views"
              fill={CHART_COLORS.views}
              radius={[0, 8, 8, 0]}
              maxBarSize={20}
            />
            <Bar
              dataKey="engagement"
              name="Engagement"
              fill={CHART_COLORS.engagement}
              radius={[0, 8, 8, 0]}
              maxBarSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsChartShell>
  )
}
