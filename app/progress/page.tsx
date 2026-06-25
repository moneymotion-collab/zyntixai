"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Plus,
  ScrollText,
  TrendingUp,
  Users,
} from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import ProtectedShell from "../components/ProtectedShell"
import Toast, { type ToastPayload } from "../components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import { useRole } from "../hooks/useRole"
import AddProgressLogModal from "@/components/progress/AddProgressLogModal"
import ClientCheckInSection from "@/components/progress/ClientCheckInSection"
import ClientGoalsTrackingSection from "@/components/progress/ClientGoalsTrackingSection"
import MembersOverviewSection from "@/components/progress/MembersOverviewSection"
import ProgressCoachSection from "@/components/progress/ProgressCoachSection"
import ProgressEmptyState from "@/components/progress/ProgressEmptyState"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import ProgressErrorBanner from "@/components/progress/ProgressErrorBanner"
import ProgressFiltersBar from "@/components/progress/ProgressFiltersBar"
import ProgressDashboardSkeleton from "@/components/progress/ProgressPageSkeleton"
import ProgressInsightsSection from "@/components/progress/ProgressInsightsSection"
import StrengthPrSection from "@/components/progress/StrengthPrSection"
import {
  ProgressLogCardList,
  ProgressLogTableDesktop,
} from "@/components/progress/ProgressLogListViews"
import ProgressAdherenceSection from "@/components/progress/ProgressAdherenceSection"
import CoachAtRiskInsightSection from "@/components/progress/CoachAtRiskInsightSection"
import { computeProgressCoachInsights } from "@/lib/progress/compute-progress-coach-insights"
import { computeMemberOverviewRows } from "@/lib/progress/compute-member-progress-summary"
import { computeProgressInsights } from "@/lib/progress/compute-progress-insights"
import {
  fetchProgressCoachContext,
  type MemberCoachContext,
} from "@/lib/progress/fetch-progress-coach-context"
import { computeStrengthPrs } from "@/lib/progress/compute-strength-prs"
import {
  filterClientGoalsByMember,
  type ClientGoalViewModel,
} from "@/lib/progress/client-goals"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import { fetchProgressGoalsData } from "@/lib/progress/fetch-progress-goals-data"
import {
  buildChartData,
  buildMultiMemberChart,
  computeProgressOverview,
  fetchProgressDashboard,
  formatChange,
  formatDateTime,
  formatValue,
  type ProgressLogRow,
} from "@/lib/progress/fetch-progress-dashboard"
import { insertProgressLog } from "@/lib/progress/insert-progress-log"
import {
  dateRangeLabel,
  filterProgressLogs,
  type DateRangeFilter,
} from "@/lib/progress/progress-filters"
import { METRIC_FILTER_OPTIONS, formatMetricDisplay, type MetricFilter, type MetricLogCategory } from "@/lib/progress/metrics"
import { resolveLinkedMemberId } from "@/lib/member-link"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"
import { notifyCoachingCoreChanged } from "@/lib/coaching-core/notify"
import { useCoachingCoreChanged } from "@/app/hooks/useCoachingCoreChanged"
import { fetchProgressCoachingSignals } from "@/lib/progress/fetch-progress-coaching-signals"
import { buildProgressAdherenceSnapshot } from "@/lib/progress/fetch-progress-adherence"
import { computeCoachInsightRoster } from "@/lib/progress/compute-coach-insight-status"
import type { ProgressAdherenceSnapshot } from "@/lib/progress/compute-progress-adherence"
import type { ProgressCoachingSignals } from "@/lib/progress/fetch-progress-coaching-signals"
import SaasPageHeader from "@/components/ui/saas-page-header"
import { SAAS_BTN_PRIMARY, SAAS_PAGE_CARD, SAAS_PAGE_MAIN } from "@/lib/ui/saas-page-layout"
import { MOBILE_CHART_HEIGHT, MOBILE_PAGE_ROOT } from "@/lib/ui/mobile-layout"
import { createClient } from "@/lib/supabase/client"

export default function ProgressDashboardPage() {
  const supabase = createClient()
  const { role, loading: roleLoading } = useRole()
  const [logs, setLogs] = useState<ProgressLogRow[]>([])
  const [members, setMembers] = useState<
    { id: string; full_name: string | null; email: string | null }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [memberFilter, setMemberFilter] = useState("all")
  const [metricFilter, setMetricFilter] = useState<MetricFilter>("all")
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all")
  const [chartReady, setChartReady] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalCloseSignal, setModalCloseSignal] = useState(0)
  const [goals, setGoals] = useState<ClientGoalViewModel[]>([])
  const [checkIns, setCheckIns] = useState<ClientCheckInRow[]>([])
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)
  const [linkedMemberId, setLinkedMemberId] = useState<string | undefined>()
  const [memberContexts, setMemberContexts] = useState<
    Map<string, MemberCoachContext>
  >(new Map())
  const [adherenceSnapshot, setAdherenceSnapshot] =
    useState<ProgressAdherenceSnapshot | null>(null)
  const [coachingSignals, setCoachingSignals] =
    useState<ProgressCoachingSignals | null>(null)

  const isMember = role === "member"
  const isCoach = role === "admin" || role === "coach"
  const canAddLog = isCoach || isMember

  const refreshGoals = useCallback(async () => {
    const result = await fetchProgressGoalsData(supabase)
    if (result.error) {
      setErrorMessage((current) => current ?? result.error)
      setCheckIns([])
      setGoals([])
      return false
    }

    setCheckIns(result.data.checkIns)
    setGoals(result.data.goals)
    return true
  }, [supabase])

  const applyDashboardData = useCallback(
    async (data: NonNullable<Awaited<ReturnType<typeof fetchProgressDashboard>>["data"]>) => {
      setLogs(data.logs)
      setMembers(
        data.members.map((m) => ({
          id: m.id,
          full_name: m.full_name,
          email: m.email,
        })),
      )
      if (data.members.length === 1) {
        setMemberFilter(data.members[0].id)
      }
      await refreshGoals()
    },
    [refreshGoals],
  )

  const refreshCoachContext = useCallback(async () => {
    const result = await fetchProgressCoachContext(supabase)
    if (result.error) {
      setErrorMessage((current) => current ?? result.error)
      setMemberContexts(new Map())
      return false
    }
    setMemberContexts(result.data?.memberContexts ?? new Map())
    return true
  }, [supabase])

  const refreshCoachingSignals = useCallback(async () => {
    const result = await fetchProgressCoachingSignals(supabase)
    if (result.error) {
      setErrorMessage((current) => current ?? result.error)
      setCoachingSignals(null)
      setAdherenceSnapshot(null)
      return false
    }

    setCoachingSignals(result.data)
    return true
  }, [supabase])

  const refreshDashboard = useCallback(async () => {
    setErrorMessage(null)
    const [dashboardResult] = await Promise.all([
      fetchProgressDashboard(supabase),
      refreshCoachContext(),
      refreshCoachingSignals(),
    ])
    if (dashboardResult.error) {
      setErrorMessage(dashboardResult.error)
      setLogs([])
      setMembers([])
      return false
    }
    if (dashboardResult.data) {
      await applyDashboardData(dashboardResult.data)
    }
    return true
  }, [applyDashboardData, refreshCoachContext, refreshCoachingSignals, supabase])

  useEffect(() => {
    if (roleLoading) return

    const load = async () => {
      setLoading(true)
      if (isMember) {
        const memberId = await resolveLinkedMemberId(supabase)
        setLinkedMemberId(memberId ?? undefined)
      }
      await refreshDashboard()
      setLoading(false)
    }
    void load()
  }, [isMember, refreshDashboard, roleLoading, supabase])

  useCoachingCoreChanged(() => {
    void refreshDashboard()
  }, !roleLoading)

  useEffect(() => {
    setChartReady(true)
  }, [])

  const memberIds = useMemo(() => members.map((member) => member.id), [members])

  useEffect(() => {
    if (!coachingSignals) {
      setAdherenceSnapshot(null)
      return
    }

    if (memberIds.length === 0) {
      setAdherenceSnapshot({ byMember: new Map() })
      return
    }

    setAdherenceSnapshot(buildProgressAdherenceSnapshot(coachingSignals, memberIds))
  }, [coachingSignals, memberIds])

  const filteredLogs = useMemo(
    () => filterProgressLogs(logs, memberFilter, metricFilter, dateRange),
    [logs, memberFilter, metricFilter, dateRange],
  )

  const overview = useMemo(
    () => computeProgressOverview(filteredLogs),
    [filteredLogs],
  )

  const insights = useMemo(
    () => computeProgressInsights(filteredLogs, members, memberFilter),
    [filteredLogs, members, memberFilter],
  )

  const strengthPrs = useMemo(
    () => computeStrengthPrs(filteredLogs, members, memberFilter),
    [filteredLogs, members, memberFilter],
  )

  const coachInsightRoster = useMemo(() => {
    if (!coachingSignals) return null
    return computeCoachInsightRoster({
      members,
      checkIns,
      logs,
      goals,
      signals: coachingSignals,
      memberFilter,
    })
  }, [checkIns, coachingSignals, goals, logs, memberFilter, members])

  const filteredGoals = useMemo(
    () => filterClientGoalsByMember(goals, memberFilter),
    [goals, memberFilter],
  )

  const coachInsights = useMemo(
    () =>
      computeProgressCoachInsights(
        filteredLogs,
        filteredGoals,
        members,
        memberContexts,
        memberFilter,
      ),
    [filteredLogs, filteredGoals, members, memberContexts, memberFilter],
  )

  const memberOverviewRows = useMemo(
    () => computeMemberOverviewRows(members, logs, goals),
    [members, logs, goals],
  )

  const singleMemberChart = useMemo(
    () => buildChartData(filteredLogs),
    [filteredLogs],
  )

  const multiMemberChart = useMemo(
    () => buildMultiMemberChart(filteredLogs, members),
    [filteredLogs, members],
  )

  const isMultiMemberChart = memberFilter === "all" && multiMemberChart.series.length > 1

  const selectedMemberLabel =
    memberFilter === "all"
      ? "All members"
      : (members.find((m) => m.id === memberFilter)?.full_name ?? "Member")

  const selectedMetricLabel =
    METRIC_FILTER_OPTIONS.find((o) => o.value === metricFilter)?.label ??
    "All metrics"

  const selectedDateLabel = dateRangeLabel(dateRange)

  const openModal = () => {
    setModalError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalError(null)
    setModalOpen(false)
  }

  const handleSaveProgressLog = async (input: {
    memberId: string
    metricCategory: MetricLogCategory
    customMetricName?: string
    startValue: number
    currentValue: number
  }) => {
    setSaving(true)
    setModalError(null)

    const result = await insertProgressLog(supabase, input)

    if (result.error) {
      reportSupabaseError("[progress] save log failed", result.error, {
        setError: setModalError,
      })
      setSaving(false)
      return
    }

    const refreshed = await refreshDashboard()
    setSaving(false)

    if (!refreshed) {
      setModalError("Progress saved, but the dashboard could not be refreshed.")
      return
    }

    setModalCloseSignal((current) => current + 1)
    setToast(successToast("progressLogged"))
    notifyCoachingCoreChanged()
  }

  return (
    <ProtectedShell allowed={["admin", "coach", "member"]}>
      <main className={`${SAAS_PAGE_MAIN} ${MOBILE_PAGE_ROOT}`}>
        <SaasPageHeader
          eyebrow="Progress Dashboard Pro"
          title="Progress"
          description="Track member metrics, spot trends, and surface who needs coaching attention — all from live progress logs."
          action={
            canAddLog ? (
              <button
                type="button"
                onClick={openModal}
                disabled={loading || (isMember && !linkedMemberId)}
                className={SAAS_BTN_PRIMARY}
              >
                <Plus className="h-4 w-4" />
                Add progress log
              </button>
            ) : undefined
          }
          className="mb-8"
        />
        <div data-tour="progress-tracking" className="sr-only" aria-hidden />

        {errorMessage ? (
          <ProgressErrorBanner
            message={errorMessage}
            onRetry={() => void refreshDashboard()}
            retrying={loading}
          />
        ) : null}

        <ProgressFiltersBar
          memberFilter={memberFilter}
          onMemberFilterChange={setMemberFilter}
          members={members}
          memberFilterDisabled={members.length <= 1 && memberFilter !== "all"}
          metricFilter={metricFilter}
          onMetricFilterChange={setMetricFilter}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        {loading ? (
          <ProgressDashboardSkeleton />
        ) : isCoach && members.length === 0 ? (
          <SaasEmptyState preset="progressRoster" />
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Total progress logs"
                value={String(overview.totalLogs)}
                icon={BarChart3}
                accent="text-cyan-400"
              />
              <KpiCard
                label="Average progress change"
                value={
                  overview.averageChange != null
                    ? formatChange(overview.averageChange)
                    : "—"
                }
                icon={TrendingUp}
                accent="text-emerald-400"
              />
              <KpiCard
                label="Best improving member"
                value={overview.bestImprovingMember ?? "—"}
                icon={ArrowUpRight}
                accent="text-green-400"
                compact
              />
              <KpiCard
                label="Needs attention"
                value={String(overview.needsAttentionCount)}
                icon={AlertTriangle}
                accent="text-amber-400"
              />
            </div>

            <ProgressAdherenceSection
              snapshot={adherenceSnapshot}
              memberFilter={memberFilter}
              memberIds={memberIds}
              loading={loading}
            />

            <CoachAtRiskInsightSection
              roster={coachInsightRoster}
              memberFilter={memberFilter}
              loading={loading}
            />

            <MembersOverviewSection rows={memberOverviewRows} />

            {isCoach ? (
              <Suspense fallback={null}>
                <ClientCheckInSection members={members} />
              </Suspense>
            ) : null}

            {isMember ? (
              <ClientGoalsTrackingSection
                members={members}
                checkIns={checkIns}
                memberFilter={memberFilter}
                memberFilterLabel={selectedMemberLabel}
                goals={filteredGoals}
                onGoalsChange={async () => {
                  await refreshGoals()
                }}
              />
            ) : null}

            <ProgressCoachSection
              insights={coachInsights}
              memberContexts={memberContexts}
            />

            <ProgressInsightsSection insights={insights} />

            <StrengthPrSection entries={strengthPrs} />

            <div className="mb-8">
              <ChartCard
                title="Progress trend"
                subtitle={`${selectedMemberLabel} · ${selectedMetricLabel} · ${selectedDateLabel}`}
              >
                {!chartReady ? (
                  <div className="flex h-[300px] flex-col justify-end gap-3 px-2 pb-4">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <div
                        key={index}
                        className="skeleton-shimmer h-3 rounded-md"
                        style={{ width: `${50 + (index % 4) * 10}%`, marginLeft: `${index * 6}%` }}
                      />
                    ))}
                  </div>
                ) : (isMultiMemberChart
                    ? multiMemberChart.data.length === 0
                    : singleMemberChart.length === 0) ? (
                  <ProgressEmptyState
                    {...SAAS_EMPTY.progress}
                    description="Adjust your filters or add a progress log to see trends here."
                    icon={<ScrollText className="h-5 w-5" />}
                    compact
                  />
                ) : (
                  <div className={MOBILE_CHART_HEIGHT}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={
                          isMultiMemberChart
                            ? multiMemberChart.data
                            : singleMemberChart
                        }
                      >
                        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="label"
                          stroke="#64748b"
                          fontSize={10}
                          tickLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} width={36} />
                        <Tooltip
                          contentStyle={{
                            background: "#0b1224",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 12,
                          }}
                          labelFormatter={(_, payload) => {
                            const point = payload?.[0]?.payload as
                              | { updatedAt?: string }
                              | undefined
                            return point?.updatedAt
                              ? formatDateTime(point.updatedAt)
                              : ""
                          }}
                          formatter={(value, name) => {
                            if (isMultiMemberChart) {
                              const seriesEntry = multiMemberChart.series.find(
                                (s) => s.dataKey === name,
                              )
                              return [
                                formatValue(Number(value)),
                                seriesEntry?.memberName ?? "Current",
                              ]
                            }
                            return [formatValue(Number(value)), "Current"]
                          }}
                        />
                        {isMultiMemberChart ? (
                          multiMemberChart.series.map((entry) => (
                            <Line
                              key={entry.memberId}
                              type="monotone"
                              dataKey={entry.dataKey}
                              name={entry.dataKey}
                              stroke={entry.color}
                              strokeWidth={2}
                              dot={{ r: 3, fill: entry.color, strokeWidth: 0 }}
                              activeDot={{ r: 5 }}
                              connectNulls
                            />
                          ))
                        ) : (
                          <Line
                            type="monotone"
                            dataKey="currentValue"
                            stroke="#22d3ee"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "#22d3ee", strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                    {isMultiMemberChart ? (
                      <div className="mt-4 flex flex-wrap gap-4">
                        {multiMemberChart.series.map((entry) => (
                          <div
                            key={entry.memberId}
                            className="flex items-center gap-2 text-xs text-gray-400"
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            {entry.memberName}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </ChartCard>
            </div>

            <section className={SAAS_PAGE_CARD}>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Recent progress</h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Latest entries matching your filters
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {filteredLogs.length} {filteredLogs.length === 1 ? "entry" : "entries"}
                </p>
              </div>

              {filteredLogs.length === 0 ? (
                <ProgressEmptyState
                  {...SAAS_EMPTY.progress}
                  description="Progress entries matching your filters will appear in this table."
                  icon={<ScrollText className="h-5 w-5" />}
                  action={
                    canAddLog ? (
                      <button
                        type="button"
                        onClick={openModal}
                        disabled={isMember && !linkedMemberId}
                        className={SAAS_BTN_PRIMARY}
                      >
                        <Plus className="h-4 w-4" />
                        Add progress log
                      </button>
                    ) : undefined
                  }
                />
              ) : (
                <>
                  <ProgressLogCardList logs={filteredLogs} showMember />
                  <ProgressLogTableDesktop logs={filteredLogs} showMember />
                </>
              )}
            </section>
          </>
        )}

        {modalOpen ? (
          <AddProgressLogModal
            members={members}
            isMember={isMember}
            lockedMemberId={linkedMemberId}
            saving={saving}
            errorMessage={modalError}
            onClose={closeModal}
            closeSignal={modalCloseSignal}
            onSubmit={(input) => void handleSaveProgressLog(input)}
          />
        ) : null}

        {toast ? (
          <Toast
            title={toast.title}
            description={toast.description}
            variant={toast.variant ?? "success"}
            onDismiss={() => setToast(null)}
          />
        ) : null}
      </main>
    </ProtectedShell>
  )
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  compact = false,
}: {
  label: string
  value: string
  icon: typeof Users
  accent: string
  compact?: boolean
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        <Icon className={`h-5 w-5 ${accent}`} />
      </div>
      <p
        className={`mt-4 font-bold text-white ${compact ? "truncate text-xl" : "text-3xl"}`}
        title={compact ? value : undefined}
      >
        {value}
      </p>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
        </div>
        <ArrowDownRight className="h-5 w-5 shrink-0 text-cyan-400/60" />
      </div>
      <div className="mt-6 rounded-2xl bg-[#0b1224] p-4">{children}</div>
    </div>
  )
}
