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

export default function ContentPerformanceEngagementChart({
  data,
}: {
  data: ContentPerformanceTimePoint[]
}) {
  return (
    <AnalyticsChartShell
      title="Engagement Over Time"
      description="Weekly likes, comments, shares, and saves"
      accentBar="from-emerald-500 via-teal-500 to-cyan-400"
      legend={[{ label: "Engagement", color: CHART_COLORS.engagement }]}
    >
      <div className={`${DEMO_CHART_HEIGHT} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={CHART_MARGIN}>
            <defs>
              <linearGradient
                id="cpEngagementOverTimeGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={CHART_COLORS.engagement} stopOpacity={0.35} />
                <stop
                  offset="100%"
                  stopColor={CHART_COLORS.engagement}
                  stopOpacity={0.03}
                />
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
                stroke: CHART_COLORS.engagement,
                strokeWidth: 2,
                strokeDasharray: "4 4",
              }}
              content={<AnalyticsChartTooltip valueLabel="Engagement" />}
            />
            <Area
              type="monotone"
              dataKey="engagement"
              name="Engagement"
              stroke={CHART_COLORS.engagement}
              strokeWidth={DEMO_AREA_STROKE}
              fill="url(#cpEngagementOverTimeGradient)"
              dot={{
                r: DEMO_DOT_RADIUS,
                fill: CHART_COLORS.engagement,
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
