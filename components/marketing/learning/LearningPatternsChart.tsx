"use client"

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
  AXIS_TICK,
  CHART_COLORS,
  formatChartAxis,
} from "@/components/marketing/analytics/chart-utils"
import { DEMO_CHART_HEIGHT } from "@/components/marketing/analytics/demo-video-styles"
import type { LearningProfileView } from "@/lib/marketing/learning/fetch-learning-run-client"

const BAR_COLORS = ["#7c3aed", "#4f46e5", "#2563eb", "#0891b2", "#059669"]

export default function LearningPatternsChart({
  profile,
}: {
  profile: LearningProfileView
}) {
  const postData = profile.best_performing_posts.slice(0, 5).map((post) => ({
    name:
      post.title.length > 22 ? `${post.title.slice(0, 22)}…` : post.title,
    engagementRate: post.engagementRate,
    views: post.views,
  }))

  const hookData = profile.best_hook_patterns.map((pattern) => ({
    name:
      pattern.hook.length > 20 ? `${pattern.hook.slice(0, 20)}…` : pattern.hook,
    engagementRate: pattern.avgEngagementRate,
    posts: pattern.postCount,
  }))

  if (postData.length === 0 && hookData.length === 0) return null

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {postData.length > 0 ? (
        <AnalyticsChartShell
          title="Top post engagement"
          description="Engagement rate by best-performing content"
          accentBar="from-violet-500 via-indigo-500 to-blue-500"
          legend={[{ label: "Engagement %", color: CHART_COLORS.reach }]}
        >
          <div className={`${DEMO_CHART_HEIGHT} w-full`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={postData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ ...AXIS_TICK, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                  formatter={(value) => [`${value}%`, "Engagement"]}
                />
                <Bar dataKey="engagementRate" radius={[8, 8, 0, 0]} maxBarSize={48}>
                  {postData.map((_, index) => (
                    <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartShell>
      ) : null}

      {hookData.length > 0 ? (
        <AnalyticsChartShell
          title="Hook pattern performance"
          description="Average engagement by winning hook style"
          accentBar="from-amber-500 via-orange-500 to-rose-500"
          legend={[{ label: "Engagement %", color: CHART_COLORS.engagement }]}
        >
          <div className={`${DEMO_CHART_HEIGHT} w-full`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hookData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ ...AXIS_TICK, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tickFormatter={formatChartAxis}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                  formatter={(value, _name, item) => {
                    const posts = item?.payload?.posts
                    return [
                      `${value}%`,
                      typeof posts === "number" ? `${posts} posts` : "Engagement",
                    ]
                  }}
                />
                <Bar
                  dataKey="engagementRate"
                  fill={CHART_COLORS.engagement}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartShell>
      ) : null}
    </div>
  )
}
