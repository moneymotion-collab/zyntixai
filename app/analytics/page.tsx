"use client"

import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Activity,
  Calendar,
  Dumbbell,
  Salad,
  Users,
} from "lucide-react"
import { FITCORE_AI_BRAND_NAME } from "@/lib/brand/fitcore-ai"
import ProtectedShell from "../components/ProtectedShell"
import {
  fetchAnalytics,
  type AnalyticsData,
} from "@/lib/analytics/fetch-analytics"
import { createClient } from "@/lib/supabase/client"
import ChartCard from "@/components/ui/chart-card"
import DashboardStatCard from "@/components/ui/dashboard-stat-card"
import EmptyState from "@/components/ui/empty-state"
import ErrorStateBanner from "@/components/ui/error-state-banner"
import { GlassCardSkeleton, Skeleton } from "@/components/ui/skeleton"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import SaasPageHeader from "@/components/ui/saas-page-header"
import { EMPTY_STATE_ICONS } from "@/lib/copy/empty-state-presets"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import {
  SAAS_KPI_GRID,
  SAAS_PAGE_MAIN,
  SAAS_PAGE_SECTION_GAP,
} from "@/lib/ui/saas-page-layout"
import { MOBILE_PAGE_ROOT } from "@/lib/ui/mobile-layout"

const CHART_TOOLTIP_STYLE = {
  background: "#0b1224",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
} as const

export default function AnalyticsPage() {
  const supabase = createClient()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const result = await fetchAnalytics(supabase)
      if (result.error) {
        setErrorMessage(result.error)
        setData(null)
      } else {
        setData(result.data)
      }
      setLoading(false)
    }
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <main className={`${SAAS_PAGE_MAIN} ${MOBILE_PAGE_ROOT} ${SAAS_PAGE_SECTION_GAP}`}>
        <SaasPageHeader
          eyebrow={FITCORE_AI_BRAND_NAME}
          title="Analytics"
          description="Live insights across members, workouts, and sessions."
        />

        {errorMessage ? (
          <ErrorStateBanner message={errorMessage} embedded />
        ) : null}

        {loading ? (
          <AnalyticsPageSkeleton />
        ) : !data ? (
          <SaasEmptyState preset="analytics" />
        ) : (
          <>
            <div className={SAAS_KPI_GRID}>
              <DashboardStatCard
                label="Total members"
                value={String(data.kpis.totalMembers)}
                icon={Users}
                accent="from-cyan-500/20 to-blue-500/10 text-cyan-300"
              />
              <DashboardStatCard
                label="Active members"
                value={String(data.kpis.activeMembers)}
                icon={Activity}
                accent="from-emerald-500/20 to-teal-500/10 text-emerald-300"
              />
              <DashboardStatCard
                label="Workouts this week"
                value={String(data.kpis.workoutsThisWeek)}
                icon={Dumbbell}
                accent="from-indigo-500/20 to-violet-500/10 text-indigo-300"
              />
              <DashboardStatCard
                label="Completed workouts"
                value={String(data.kpis.completedWorkouts)}
                icon={Dumbbell}
                accent="from-violet-500/20 to-purple-500/10 text-violet-300"
              />
              <DashboardStatCard
                label="Active nutrition plans"
                value={String(data.kpis.activeNutritionPlans)}
                icon={Salad}
                accent="from-emerald-500/20 to-green-500/10 text-emerald-300"
              />
              <DashboardStatCard
                label="Sessions this week"
                value={String(data.kpis.sessionsThisWeek)}
                icon={Calendar}
                accent="from-amber-500/20 to-orange-500/10 text-amber-300"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ChartCard title="Weight trend" subtitle="Progress logs (kg)">
                {data.weightTrend.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={data.weightTrend}>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Workout completions" subtitle="By period">
                {data.workoutCompletions.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data.workoutCompletions}>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                      <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                      <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard
                title="New members per month"
                subtitle="Sign-ups"
                className="xl:col-span-2"
              >
                {data.newMembersPerMonth.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data.newMembersPerMonth}>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                      <Bar dataKey="count" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
          </>
        )}
      </main>
    </ProtectedShell>
  )
}

function AnalyticsPageSkeleton() {
  return (
    <>
      <div className={SAAS_KPI_GRID}>
        {Array.from({ length: 6 }).map((_, index) => (
          <GlassCardSkeleton key={index} className="h-[168px]">
            <Skeleton className="h-full w-full" />
          </GlassCardSkeleton>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <GlassCardSkeleton className="h-[360px]">
          <Skeleton className="h-full w-full" />
        </GlassCardSkeleton>
        <GlassCardSkeleton className="h-[360px]">
          <Skeleton className="h-full w-full" />
        </GlassCardSkeleton>
        <GlassCardSkeleton className="h-[360px] xl:col-span-2">
          <Skeleton className="h-full w-full" />
        </GlassCardSkeleton>
      </div>
    </>
  )
}

function EmptyChart() {
  return (
    <EmptyState
      compact
      title={SAAS_EMPTY.analyticsChart.title}
      description={SAAS_EMPTY.analyticsChart.description}
      icon={EMPTY_STATE_ICONS.analyticsChart}
      variant="dark"
      style="dashed"
    />
  )
}
