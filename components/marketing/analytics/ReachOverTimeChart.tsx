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
import type { TimeSeriesChartPoint } from "@/lib/marketing/analytics/analytics-chart-data"
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

export default function ReachOverTimeChart({
  data,
}: {
  data: TimeSeriesChartPoint[]
}) {
  return (
    <AnalyticsChartShell
      title="Reach Over Time"
      description="Weekly unique accounts reached"
      accentBar="from-violet-500 via-indigo-500 to-blue-500"
      legend={[{ label: "Reach", color: CHART_COLORS.reach }]}
    >
      <div className={`${DEMO_CHART_HEIGHT} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id="reachOverTimeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.reach} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLORS.reach} stopOpacity={0.03} />
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
              cursor={{ stroke: CHART_COLORS.reach, strokeWidth: 2, strokeDasharray: "4 4" }}
              content={<AnalyticsChartTooltip valueLabel="Reach" />}
            />
            <Area
              type="monotone"
              dataKey="reach"
              name="Reach"
              stroke={CHART_COLORS.reach}
              strokeWidth={DEMO_AREA_STROKE}
              fill="url(#reachOverTimeGradient)"
              dot={{
                r: DEMO_DOT_RADIUS,
                fill: CHART_COLORS.reach,
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
