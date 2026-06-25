"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import EmptyState from "@/components/ui/empty-state"
import GlassCard from "@/components/ui/glass-card"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import {
  formatBusinessCurrency,
} from "@/lib/coach-dashboard/compute-business-overview"
import type { BusinessTrendPoint } from "@/lib/coach-dashboard/types"
import { LineChart as LineChartIcon, TrendingUp, Users } from "lucide-react"
import { MOBILE_CHART_HEIGHT } from "@/lib/ui/mobile-layout"

type CoachBusinessTrendChartsProps = {
  memberGrowthTrend: BusinessTrendPoint[]
  revenueTrend: BusinessTrendPoint[]
  currency: string
  loading?: boolean
}

function ChartTooltip({
  active,
  payload,
  label,
  valueLabel,
  currency,
}: {
  active?: boolean
  payload?: { value?: number }[]
  label?: string
  valueLabel: string
  currency?: string
}) {
  if (!active || !payload?.length) return null

  const value = payload[0]?.value ?? 0

  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1224] px-3 py-2 text-sm shadow-xl">
      <p className="text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-white">
        {currency
          ? formatBusinessCurrency(value, currency)
          : `${valueLabel}: ${value}`}
      </p>
    </div>
  )
}

function TrendChartCard({
  title,
  subtitle,
  icon: Icon,
  stroke,
  dataKey,
  data,
  currency,
  loading,
  chartReady,
  emptyTitle,
  emptyDescription,
  emptyAction,
  formatValue,
}: {
  title: string
  subtitle: string
  icon: typeof Users
  stroke: string
  dataKey: "memberCount" | "estimatedRevenue"
  data: BusinessTrendPoint[]
  currency?: string
  loading?: boolean
  chartReady: boolean
  emptyTitle: string
  emptyDescription: string
  emptyAction?: ReactNode
  formatValue: (value: number) => string
}) {
  const hasData = data.some((point) => point[dataKey] > 0)

  return (
    <GlassCard className="p-6 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-cyan-400/80" aria-hidden />
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <LineChartIcon className="h-5 w-5 shrink-0 text-white/20" aria-hidden />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1224] p-3 sm:p-4">
        {loading || !chartReady ? (
          <div className="flex h-[220px] flex-col justify-end gap-3 px-2 pb-4 sm:h-[260px]">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="skeleton-shimmer h-3 rounded-md"
                style={{
                  width: `${45 + (index % 3) * 12}%`,
                  marginLeft: `${index * 8}%`,
                }}
              />
            ))}
          </div>
        ) : !hasData ? (
          <div className="flex h-[220px] items-center justify-center sm:h-[260px]">
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              icon={<Icon className="h-6 w-6" />}
              action={emptyAction}
              compact
            />
          </div>
        ) : (
          <div className={MOBILE_CHART_HEIGHT}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="monthLabel"
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) =>
                    dataKey === "estimatedRevenue"
                      ? formatBusinessCurrency(value, currency ?? "USD").replace(/\$/g, "")
                      : String(value)
                  }
                  width={48}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      valueLabel={dataKey === "memberCount" ? "Members" : "Revenue"}
                      currency={dataKey === "estimatedRevenue" ? currency : undefined}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={stroke}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: stroke, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: stroke }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {hasData && !loading && chartReady ? (
        <p className="mt-3 text-xs text-slate-500">
          Latest:{" "}
          <span className="font-medium text-slate-300">
            {formatValue(data[data.length - 1]?.[dataKey] ?? 0)}
          </span>
        </p>
      ) : null}
    </GlassCard>
  )
}

export default function CoachBusinessTrendCharts({
  memberGrowthTrend,
  revenueTrend,
  currency,
  loading,
}: CoachBusinessTrendChartsProps) {
  const [chartReady, setChartReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setChartReady(true), 80)
    return () => window.clearTimeout(timer)
  }, [memberGrowthTrend, revenueTrend])

  const latestMemberCount = useMemo(
    () => memberGrowthTrend[memberGrowthTrend.length - 1]?.memberCount ?? 0,
    [memberGrowthTrend],
  )

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <TrendChartCard
        title="Member growth trend"
        subtitle="Total roster size over the last 6 months"
        icon={Users}
        stroke="#22d3ee"
        dataKey="memberCount"
        data={memberGrowthTrend}
        loading={loading}
        chartReady={chartReady}
        emptyTitle={SAAS_EMPTY.memberHistory.title}
        emptyDescription={SAAS_EMPTY.memberHistory.description}
        emptyAction={
          <Link href="/members" className="btn-gradient">
            Add Member
          </Link>
        }
        formatValue={(value) => `${value} members`}
      />
      <TrendChartCard
        title="Revenue trend"
        subtitle={
          latestMemberCount > 0
            ? "Projected monthly revenue based on active members"
            : "Projected revenue will appear once you have active members"
        }
        icon={TrendingUp}
        stroke="#34d399"
        dataKey="estimatedRevenue"
        data={revenueTrend}
        currency={currency}
        loading={loading}
        chartReady={chartReady}
        emptyTitle={SAAS_EMPTY.revenueData.title}
        emptyDescription={SAAS_EMPTY.revenueData.description}
        emptyAction={
          <Link href="/members" className="btn-gradient">
            Add Member
          </Link>
        }
        formatValue={(value) => formatBusinessCurrency(value, currency)}
      />
    </div>
  )
}
