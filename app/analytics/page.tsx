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
  Loader2,
  Salad,
  Users,
} from "lucide-react"
import ProtectedShell from "../components/ProtectedShell"
import {
  fetchAnalytics,
  type AnalyticsData,
} from "@/lib/analytics/fetch-analytics"
import { createClient } from "@/lib/supabase/client"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import { EMPTY_STATE_ICONS } from "@/lib/copy/empty-state-presets"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"

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
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
            FitCore AI
          </p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Analytics</h1>
          <p className="mt-2 text-gray-400">
            Live insights across members, workouts, and sessions.
          </p>
        </header>

        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-2 py-20 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            Loading analytics…
          </div>
        ) : !data ? (
          <SaasEmptyState preset="analytics" />
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <KpiCard
                label="Total members"
                value={String(data.kpis.totalMembers)}
                icon={Users}
                accent="text-cyan-400"
              />
              <KpiCard
                label="Active members"
                value={String(data.kpis.activeMembers)}
                icon={Activity}
                accent="text-green-400"
              />
              <KpiCard
                label="Workouts this week"
                value={String(data.kpis.workoutsThisWeek)}
                icon={Dumbbell}
                accent="text-blue-400"
              />
              <KpiCard
                label="Completed workouts"
                value={String(data.kpis.completedWorkouts)}
                icon={Dumbbell}
                accent="text-purple-400"
              />
              <KpiCard
                label="Active nutrition plans"
                value={String(data.kpis.activeNutritionPlans)}
                icon={Salad}
                accent="text-emerald-400"
              />
              <KpiCard
                label="Sessions this week"
                value={String(data.kpis.sessionsThisWeek)}
                icon={Calendar}
                accent="text-amber-400"
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
                      <Tooltip
                        contentStyle={{
                          background: "#0b1224",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 12,
                        }}
                      />
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

              <ChartCard
                title="Workout completions"
                subtitle="By period"
              >
                {data.workoutCompletions.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data.workoutCompletions}>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                      <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: "#0b1224",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 12,
                        }}
                      />
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
                      <Tooltip
                        contentStyle={{
                          background: "#0b1224",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 12,
                        }}
                      />
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

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  icon: typeof Users
  accent: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        <Icon className={`h-5 w-5 ${accent}`} />
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/5 p-6 ${className}`}
    >
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
      <div className="mt-6 rounded-2xl bg-[#0b1224] p-4">{children}</div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 text-cyan-300">
        {EMPTY_STATE_ICONS.analyticsChart}
      </div>
      <p className="text-sm font-medium text-gray-300">
        {SAAS_EMPTY.analyticsChart.title}
      </p>
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-gray-500">
        {SAAS_EMPTY.analyticsChart.description}
      </p>
    </div>
  )
}
