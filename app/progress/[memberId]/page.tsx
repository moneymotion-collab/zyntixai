"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  FileText,
  Mail,
  ScrollText,
  Target,
  TrendingUp,
  User,
} from "lucide-react"
import ProtectedShell from "../../components/ProtectedShell"
import MemberGoalsDetailSection from "@/components/progress/MemberGoalsDetailSection"
import MemberMetricCharts from "@/components/progress/MemberMetricCharts"
import ProgressCoachSection from "@/components/progress/ProgressCoachSection"
import ProgressEmptyState from "@/components/progress/ProgressEmptyState"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import ProgressErrorBanner from "@/components/progress/ProgressErrorBanner"
import ProgressFiltersBar from "@/components/progress/ProgressFiltersBar"
import { ProgressDetailSkeleton } from "@/components/progress/ProgressPageSkeleton"
import ProgressInsightsSection from "@/components/progress/ProgressInsightsSection"
import ProgressReportModal from "@/components/progress/ProgressReportModal"
import {
  ProgressLogCardList,
  ProgressLogTableDesktop,
} from "@/components/progress/ProgressLogListViews"
import ProgressAdherenceSection from "@/components/progress/ProgressAdherenceSection"
import CoachAtRiskInsightSection from "@/components/progress/CoachAtRiskInsightSection"
import { computeMemberProgressSummary } from "@/lib/progress/compute-member-progress-summary"
import { computeProgressCoachInsights } from "@/lib/progress/compute-progress-coach-insights"
import { computeProgressInsights } from "@/lib/progress/compute-progress-insights"
import { fetchMemberProgressDetail } from "@/lib/progress/fetch-member-progress-detail"
import {
  fetchProgressCoachContext,
  type MemberCoachContext,
} from "@/lib/progress/fetch-progress-coach-context"
import {
  formatChange,
  formatDateTime,
  formatValue,
  type ProgressLogRow,
} from "@/lib/progress/fetch-progress-dashboard"
import {
  dateRangeLabel,
  filterProgressLogs,
  type DateRangeFilter,
} from "@/lib/progress/progress-filters"
import { formatMetricDisplay, type MetricFilter } from "@/lib/progress/metrics"
import {
  buildProgressAdherenceSnapshot,
} from "@/lib/progress/fetch-progress-adherence"
import { fetchProgressCoachingSignals } from "@/lib/progress/fetch-progress-coaching-signals"
import { computeCoachInsightRoster } from "@/lib/progress/compute-coach-insight-status"
import type { ProgressAdherenceSnapshot } from "@/lib/progress/compute-progress-adherence"
import type { ProgressCoachingSignals } from "@/lib/progress/fetch-progress-coaching-signals"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"
import type { ClientGoalViewModel } from "@/lib/progress/client-goals"

type Member = Database["public"]["Tables"]["members"]["Row"]

export default function MemberProgressDetailPage() {
  const params = useParams<{ memberId: string }>()
  const memberId = params.memberId
  const supabase = createClient()

  const [member, setMember] = useState<Member | null>(null)
  const [logs, setLogs] = useState<ProgressLogRow[]>([])
  const [goals, setGoals] = useState<ClientGoalViewModel[]>([])
  const [checkIns, setCheckIns] = useState<ClientCheckInRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [chartReady, setChartReady] = useState(false)
  const [memberContexts, setMemberContexts] = useState<
    Map<string, MemberCoachContext>
  >(new Map())
  const [reportOpen, setReportOpen] = useState(false)
  const [metricFilter, setMetricFilter] = useState<MetricFilter>("all")
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all")
  const [retrying, setRetrying] = useState(false)
  const [adherenceSnapshot, setAdherenceSnapshot] =
    useState<ProgressAdherenceSnapshot | null>(null)
  const [coachingSignals, setCoachingSignals] =
    useState<ProgressCoachingSignals | null>(null)

  const loadDetail = useCallback(async () => {
    if (!memberId) return

    setLoading(true)
    setErrorMessage(null)

    const [detailResult, contextResult, signalsResult] = await Promise.all([
      fetchMemberProgressDetail(supabase, memberId),
      fetchProgressCoachContext(supabase),
      fetchProgressCoachingSignals(supabase),
    ])

    if (detailResult.error || !detailResult.data) {
      setErrorMessage(detailResult.error ?? "Failed to load member progress.")
      setMember(null)
      setLogs([])
      setGoals([])
      setCheckIns([])
      setAdherenceSnapshot(null)
      setCoachingSignals(null)
      setLoading(false)
      setRetrying(false)
      return
    }

    setMember(detailResult.data.member)
    setLogs(detailResult.data.logs)
    setGoals(detailResult.data.goals)
    setCheckIns(detailResult.data.checkIns)

    if (contextResult.error) {
      setErrorMessage((current) => current ?? contextResult.error)
      setMemberContexts(new Map())
    } else {
      setMemberContexts(contextResult.data?.memberContexts ?? new Map())
    }

    if (signalsResult.error) {
      setErrorMessage((current) => current ?? signalsResult.error)
      setCoachingSignals(null)
      setAdherenceSnapshot(null)
    } else {
      setCoachingSignals(signalsResult.data)
      setAdherenceSnapshot(
        signalsResult.data
          ? buildProgressAdherenceSnapshot(signalsResult.data, [memberId])
          : null,
      )
    }

    setLoading(false)
    setRetrying(false)
  }, [memberId, supabase])

  const handleRetry = useCallback(async () => {
    setRetrying(true)
    await loadDetail()
  }, [loadDetail])

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

  useEffect(() => {
    setChartReady(true)
  }, [])

  const coachInsightRoster = useMemo(() => {
    if (!coachingSignals || !member) return null
    return computeCoachInsightRoster({
      members: [{ id: member.id, full_name: member.full_name }],
      checkIns,
      logs,
      goals,
      signals: coachingSignals,
      memberFilter: memberId,
    })
  }, [checkIns, coachingSignals, goals, logs, member, memberId])

  const filteredLogs = useMemo(
    () => filterProgressLogs(logs, memberId, metricFilter, dateRange),
    [logs, memberId, metricFilter, dateRange],
  )

  const summary = useMemo(
    () => computeMemberProgressSummary(filteredLogs, goals),
    [filteredLogs, goals],
  )

  const members = useMemo(
    () =>
      member
        ? [{ id: member.id, full_name: member.full_name }]
        : [],
    [member],
  )

  const insights = useMemo(
    () => computeProgressInsights(filteredLogs, members, memberId),
    [filteredLogs, members, memberId],
  )

  const coachInsights = useMemo(
    () =>
      computeProgressCoachInsights(
        filteredLogs,
        goals,
        members,
        memberContexts,
        memberId,
      ),
    [filteredLogs, goals, members, memberContexts, memberId],
  )

  return (
    <ProtectedShell allowed={["admin", "coach", "member"]}>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <Link
            href="/progress"
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-cyan-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Progress Dashboard
          </Link>
        </div>

        {loading ? (
          <ProgressDetailSkeleton />
        ) : errorMessage && !member ? (
          <ProgressErrorBanner
            title="Unable to load member progress"
            message={errorMessage}
            onRetry={() => void handleRetry()}
            retrying={retrying}
          />
        ) : member ? (
          <>
            {errorMessage ? (
              <ProgressErrorBanner
                message={errorMessage}
                variant="warning"
                onRetry={() => void handleRetry()}
                retrying={retrying}
              />
            ) : null}

            <header className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/[0.08] via-white/[0.04] to-violet-500/[0.06] p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="relative flex flex-wrap items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
                    <User className="h-8 w-8 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
                      Member Progress Detail
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                      {member.full_name ?? "Member"}
                    </h1>
                    {member.email ? (
                      <p className="mt-2 flex items-center gap-2 text-gray-400">
                        <Mail className="h-4 w-4 shrink-0" />
                        {member.email}
                      </p>
                    ) : null}
                    <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 shrink-0" />
                      Latest update:{" "}
                      {summary.latestUpdateDate
                        ? formatDateTime(summary.latestUpdateDate)
                        : SAAS_EMPTY.progress.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:border-cyan-500/30 hover:bg-cyan-500/10"
                >
                  <FileText className="h-4 w-4 text-cyan-400" />
                  Generate Progress Report
                </button>
              </div>
            </header>

            <ProgressFiltersBar
              memberFilter={memberId}
              onMemberFilterChange={() => undefined}
              members={members}
              showMemberFilter={false}
              metricFilter={metricFilter}
              onMetricFilterChange={setMetricFilter}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />

            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Total logs"
                value={String(summary.totalLogs)}
                icon={BarChart3}
                accent="text-cyan-400"
              />
              <SummaryCard
                label="Best metric improvement"
                value={
                  summary.bestMetricImprovement
                    ? `${summary.bestMetricImprovement.metric} (${formatChange(summary.bestMetricImprovement.changeValue)})`
                    : "—"
                }
                icon={TrendingUp}
                accent="text-emerald-400"
                compact
              />
              <SummaryCard
                label="Active goals"
                value={String(summary.activeGoals)}
                icon={Target}
                accent="text-violet-400"
              />
              <SummaryCard
                label="Completed goals"
                value={String(summary.completedGoals)}
                icon={Target}
                accent="text-green-400"
              />
            </section>

            <ProgressAdherenceSection
              snapshot={adherenceSnapshot}
              memberFilter={memberId}
              memberIds={[memberId]}
              memberName={member.full_name ?? "Member"}
              loading={loading}
              variant="member"
            />

            <CoachAtRiskInsightSection
              roster={coachInsightRoster}
              memberFilter={memberId}
              loading={loading}
              variant="member"
            />

            <section className="mb-8">
              <div className="mb-6">
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">
                  Metrics
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Progress by metric
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Weight, body fat, strength, endurance, and custom metrics ·{" "}
                  {dateRangeLabel(dateRange)}
                </p>
              </div>
              <MemberMetricCharts
                logs={filteredLogs}
                chartReady={chartReady}
                loading={loading}
              />
            </section>

            <MemberGoalsDetailSection goals={goals} />

            <ProgressCoachSection
              insights={coachInsights}
              memberContexts={memberContexts}
            />

            <ProgressInsightsSection insights={insights} />

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">
                    History
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white">
                    Progress history
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    All recorded progress entries for this member
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {filteredLogs.length} {filteredLogs.length === 1 ? "entry" : "entries"}
                </p>
              </div>

              {filteredLogs.length === 0 ? (
                <ProgressEmptyState
                  {...SAAS_EMPTY.progress}
                  description="History entries matching your filters will show up here."
                  icon={<ScrollText className="h-5 w-5" />}
                />
              ) : (
                <>
                  <ProgressLogCardList logs={filteredLogs} showMember={false} />
                  <ProgressLogTableDesktop logs={filteredLogs} showMember={false} />
                </>
              )}
            </section>

            {reportOpen ? (
              <ProgressReportModal
                memberId={memberId}
                memberName={member.full_name ?? "Member"}
                memberEmail={member.email}
                logs={logs}
                goals={goals}
                summary={computeMemberProgressSummary(logs, goals)}
                coachInsights={computeProgressCoachInsights(
                  logs,
                  goals,
                  members,
                  memberContexts,
                  memberId,
                )}
                onClose={() => setReportOpen(false)}
              />
            ) : null}
          </>
        ) : null}
      </main>
    </ProtectedShell>
  )
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
  compact = false,
}: {
  label: string
  value: string
  icon: typeof BarChart3
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
        className={`mt-4 font-bold text-white ${compact ? "truncate text-lg" : "text-3xl"}`}
        title={compact ? value : undefined}
      >
        {value}
      </p>
    </div>
  )
}
