"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  AnalyticsChartShell,
  AnalyticsChartTooltip,
  AXIS_TICK,
  CHART_COLORS,
  CHART_MARGIN,
  formatChartAxis,
} from "@/components/marketing/analytics/chart-utils"
import {
  DEMO_ACTIVE_DOT_RADIUS,
  DEMO_AREA_STROKE,
  DEMO_CHART_HEIGHT,
  DEMO_DOT_RADIUS,
  DEMO_Y_AXIS_WIDTH,
} from "@/components/marketing/analytics/demo-video-styles"
import type { ContentPerformanceTimePoint } from "@/lib/marketing/content-performance/types"

export default function ViewsOverTimeChart({
  data,
}: {
  data: ContentPerformanceTimePoint[]
}) {
  return (
    <AnalyticsChartShell
      title="Views Over Time"
      description="Weekly content impressions"
      accentBar="from-blue-500 via-sky-500 to-cyan-400"
      legend={[{ label: "Views", color: CHART_COLORS.views }]}
    >
      <div className={`${DEMO_CHART_HEIGHT} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id="viewsOverTimeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.views} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLORS.views} stopOpacity={0.03} />
              </linearGradient>
            </defs>

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
              interval="preserveStartEnd"
            />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={DEMO_Y_AXIS_WIDTH}
              tickFormatter={formatChartAxis}
            />
            <Tooltip
              cursor={{
                stroke: CHART_COLORS.views,
                strokeWidth: 2,
                strokeDasharray: "4 4",
              }}
              content={<AnalyticsChartTooltip valueLabel="Views" />}
            />
            <Area
              type="monotone"
              dataKey="views"
              name="Views"
              stroke={CHART_COLORS.views}
              strokeWidth={DEMO_AREA_STROKE}
              fill="url(#viewsOverTimeGradient)"
              dot={{
                r: DEMO_DOT_RADIUS,
                fill: CHART_COLORS.views,
                strokeWidth: 2,
                stroke: "#fff",
              }}
              activeDot={{ r: DEMO_ACTIVE_DOT_RADIUS, strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsChartShell>
  )
}
