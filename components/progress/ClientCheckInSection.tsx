"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  Battery,
  CalendarCheck,
  ClipboardList,
  FileDown,
  Loader2,
  Moon,
  Scale,
  Send,
  Sparkles,
  User,
} from "lucide-react"
import ClientCheckInDashboardSkeleton from "@/components/progress/ClientCheckInDashboardSkeleton"
import ClientCheckInInsightsCards from "@/components/progress/ClientCheckInInsightsCards"
import ClientCheckInListItem from "@/components/progress/ClientCheckInListItem"
import ClientCheckInMemberFilter from "@/components/progress/ClientCheckInMemberFilter"
import ClientCheckInTrendCharts from "@/components/progress/ClientCheckInTrendCharts"
import ClientAiProgressCoachSection from "@/components/progress/ClientAiProgressCoachSection"
import ClientGoalsTrackingSection from "@/components/progress/ClientGoalsTrackingSection"
import ClientProgressSummaryCard from "@/components/progress/ClientProgressSummaryCard"
import ExportProgressReportButton from "@/components/progress/ExportProgressReportButton"
import ProgressDashboardProTestChecklist from "@/components/progress/ProgressDashboardProTestChecklist"
import ProgressAlertsCenter from "@/components/progress/ProgressAlertsCenter"
import WeeklyProgressReportCard from "@/components/progress/WeeklyProgressReportCard"
import ProgressEmptyState from "@/components/progress/ProgressEmptyState"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import ProgressErrorBanner from "@/components/progress/ProgressErrorBanner"
import {
  PROGRESS_PRO_BTN_PRIMARY,
  PROGRESS_PRO_CARD,
  PROGRESS_PRO_CARD_INNER,
  ProgressProSectionHeader,
  ProgressProSuccessBanner,
} from "@/components/progress/progress-pro-ui"
import { premiumInputClass, premiumSelectClass } from "@/lib/ui/premium-input"
import { computeClientCheckInInsights } from "@/lib/progress/compute-client-checkin-insights"
import { computeAiProgressCoachInsight } from "@/lib/progress/compute-ai-progress-coach"
import { computeProgressAlerts } from "@/lib/progress/compute-progress-alerts"
import { computeWeeklyProgressReport } from "@/lib/progress/compute-weekly-progress-report"
import {
  fetchProgressGoalsData,
} from "@/lib/progress/fetch-progress-goals-data"
import type { ClientGoalViewModel } from "@/lib/progress/client-goals"
import {
  computeClientProgressSummary,
  filterCheckInsByMember,
} from "@/lib/progress/client-checkin-member-view"
import {
  insertClientCheckin,
  type ClientCheckInRow,
} from "@/lib/progress/client-checkins"
import { notifyCoachingCoreChanged } from "@/lib/coaching-core/notify"
import { createClient } from "@/lib/supabase/client"

type MemberOption = {
  id: string
  full_name: string | null
}

type ClientCheckInSectionProps = {
  members: MemberOption[]
}

const RATING_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

const inputClassName = premiumInputClass
const selectClassName = premiumSelectClass

const labelClassName = "mb-2 block text-sm font-medium text-gray-300"

function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function RatingField({
  label,
  icon: Icon,
  value,
  onChange,
}: {
  label: string
  icon: typeof Battery
  value: number | null
  onChange: (value: number) => void
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-cyan-400" aria-hidden />
        <label className="text-sm font-medium text-gray-300">{label}</label>
        {value != null ? (
          <span className="ml-auto rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-200">
            {value}/10
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {RATING_OPTIONS.map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`flex h-9 min-w-9 items-center justify-center rounded-xl border px-2 text-sm font-semibold transition ${
              value === rating
                ? "border-cyan-400 bg-cyan-500 text-black shadow-sm shadow-cyan-500/20"
                : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20 hover:bg-white/[0.06]"
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ClientCheckInSection({
  members,
}: ClientCheckInSectionProps) {
  const supabase = createClient()
  const searchParams = useSearchParams()

  const [allCheckIns, setAllCheckIns] = useState<ClientCheckInRow[]>([])
  const [clientGoals, setClientGoals] = useState<ClientGoalViewModel[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [memberFilter, setMemberFilter] = useState("all")

  const [formMemberId, setFormMemberId] = useState("")
  const [weight, setWeight] = useState("")
  const [energy, setEnergy] = useState<number | null>(null)
  const [sleep, setSleep] = useState<number | null>(null)
  const [motivation, setMotivation] = useState<number | null>(null)
  const [checkInDate, setCheckInDate] = useState(todayIsoDate)

  const selectedFilterMember = useMemo(
    () => members.find((member) => member.id === memberFilter),
    [memberFilter, members],
  )

  const memberFilterLabel =
    memberFilter === "all"
      ? "All members"
      : (selectedFilterMember?.full_name ?? "Member")

  const selectedFilterMemberName = selectedFilterMember?.full_name ?? "Member"

  const filteredCheckIns = useMemo(
    () =>
      filterCheckInsByMember(allCheckIns, memberFilter, selectedFilterMemberName),
    [allCheckIns, memberFilter, selectedFilterMemberName],
  )

  const displayCheckIns = useMemo(
    () => filteredCheckIns.slice(0, 20),
    [filteredCheckIns],
  )

  const insights = useMemo(
    () => computeClientCheckInInsights(filteredCheckIns),
    [filteredCheckIns],
  )

  const progressSummary = useMemo(() => {
    if (memberFilter === "all") return null
    return computeClientProgressSummary(
      allCheckIns,
      memberFilter,
      selectedFilterMemberName,
    )
  }, [allCheckIns, memberFilter, selectedFilterMemberName])

  const weeklyReport = useMemo(() => {
    if (memberFilter === "all") return null
    return computeWeeklyProgressReport(
      allCheckIns,
      memberFilter,
      selectedFilterMemberName,
    )
  }, [allCheckIns, memberFilter, selectedFilterMemberName])

  const progressAlerts = useMemo(
    () =>
      computeProgressAlerts(
        members,
        allCheckIns,
        clientGoals,
        memberFilter,
        selectedFilterMemberName,
      ),
    [allCheckIns, clientGoals, memberFilter, members, selectedFilterMemberName],
  )

  const aiCoachInsight = useMemo(
    () =>
      computeAiProgressCoachInsight({
        members,
        checkIns: allCheckIns,
        goals: clientGoals,
        alerts: progressAlerts,
        memberFilter,
        memberName: selectedFilterMemberName,
      }),
    [
      allCheckIns,
      clientGoals,
      memberFilter,
      members,
      progressAlerts,
      selectedFilterMemberName,
    ],
  )

  const hasLoadedOnceRef = useRef(false)

  const refreshDashboard = useCallback(async () => {
    if (hasLoadedOnceRef.current) setRefreshing(true)

    const result = await fetchProgressGoalsData(supabase)

    if (result.error) {
      setLoadError(result.error)
      setAllCheckIns([])
      setClientGoals([])
    } else {
      setLoadError(null)
      setAllCheckIns(result.data.checkIns)
      setClientGoals(result.data.goals)
    }

    hasLoadedOnceRef.current = true
    setInitialLoading(false)
    setRefreshing(false)
  }, [supabase])

  useEffect(() => {
    void refreshDashboard()
  }, [refreshDashboard])

  useEffect(() => {
    const memberParam = searchParams.get("member")
    if (!memberParam || memberParam === "all") return
    if (members.some((member) => member.id === memberParam)) {
      setMemberFilter(memberParam)
    }
  }, [members, searchParams])

  useEffect(() => {
    if (searchParams.get("section") !== "report") return
    if (initialLoading) return

    const timer = window.setTimeout(() => {
      document
        .getElementById("progress-export-report")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 300)

    return () => window.clearTimeout(timer)
  }, [initialLoading, searchParams])

  useEffect(() => {
    if (members.length === 1 && !formMemberId) {
      setFormMemberId(members[0].id)
    }
  }, [formMemberId, members])

  function resetRatings() {
    setEnergy(null)
    setSleep(null)
    setMotivation(null)
  }

  async function handleSubmit() {
    const selectedMember = members.find((member) => member.id === formMemberId)
    const memberName = selectedMember?.full_name?.trim()

    if (!formMemberId || !memberName) {
      setFormError("Select a member.")
      setSuccess(false)
      return
    }

    if (!checkInDate) {
      setFormError("Select a check-in date.")
      setSuccess(false)
      return
    }

    setSubmitting(true)
    setFormError(null)
    setSuccess(false)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      setFormError(authError?.message ?? "You must be signed in to save check-ins.")
      setSubmitting(false)
      return
    }

    const result = await insertClientCheckin(supabase, user.id, {
      memberId: formMemberId,
      memberName,
      weight: weight ? Number(weight) : null,
      energy,
      sleep,
      motivation,
      checkInDate,
    })

    if (result.error) {
      setFormError(result.error)
      setSubmitting(false)
      return
    }

    resetRatings()
    setWeight("")
    setSuccess(true)
    setSubmitting(false)
    await refreshDashboard()
    notifyCoachingCoreChanged()
  }

  function handleCheckInNotesSaved(updated: ClientCheckInRow) {
    setAllCheckIns((current) =>
      current.map((row) => (row.id === updated.id ? updated : row)),
    )
  }

  const showSkeleton = initialLoading

  return (
    <section className="mb-8 space-y-6 sm:space-y-8">
      <ClientCheckInMemberFilter
        memberFilter={memberFilter}
        onMemberFilterChange={setMemberFilter}
        members={members}
        showDashboardHeader
      />

      {loadError ? (
        <ProgressErrorBanner
          title="Failed to load check-ins"
          message={loadError}
          onRetry={() => void refreshDashboard()}
          retrying={refreshing || initialLoading}
        />
      ) : null}

      {refreshing && !initialLoading ? (
        <p className="text-center text-xs text-gray-500">Refreshing dashboard…</p>
      ) : null}

      {showSkeleton ? (
        <ClientCheckInDashboardSkeleton />
      ) : (
        <>
          <ClientCheckInInsightsCards
            insights={insights}
            memberFilterLabel={memberFilterLabel}
          />

          <ClientCheckInTrendCharts
            checkIns={filteredCheckIns}
            memberFilterLabel={memberFilterLabel}
          />

          {memberFilter !== "all" && weeklyReport ? (
            <WeeklyProgressReportCard report={weeklyReport} />
          ) : null}

          {memberFilter !== "all" && progressSummary ? (
            <ClientProgressSummaryCard summary={progressSummary} />
          ) : null}

          <ClientGoalsTrackingSection
            members={members}
            checkIns={allCheckIns}
            memberFilter={memberFilter}
            memberFilterLabel={memberFilterLabel}
            goals={clientGoals}
            onGoalsChange={refreshDashboard}
          />

          <ProgressAlertsCenter
            alerts={progressAlerts}
            memberFilterLabel={memberFilterLabel}
          />

          <ClientAiProgressCoachSection insight={aiCoachInsight} />

          <div className={`${PROGRESS_PRO_CARD} p-6 sm:p-8`}>
            <ProgressProSectionHeader
              eyebrow="Wellness tracking"
              title="Client Check-in"
              description="Log member wellbeing scores and weight. Check-ins are saved to your coach profile and appear below instantly."
              accent="violet"
              action={
                <span className="inline-flex items-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-violet-200">
                  <ClipboardList className="h-4 w-4" aria-hidden />
                  Premium form
                </span>
              }
            />

            {success ? (
              <ProgressProSuccessBanner
                title="Check-in saved successfully"
                description="The latest entry is now visible in your check-in history below."
              />
            ) : null}

            {formError ? (
              <div className="mb-6">
                <ProgressErrorBanner
                  title="Failed to save check-in"
                  message={formError}
                />
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className={`${PROGRESS_PRO_CARD_INNER} p-5`}>
                <div className="mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-cyan-400" aria-hidden />
                  <label htmlFor="checkin-member" className={labelClassName}>
                    Member name
                  </label>
                </div>
                <select
                  id="checkin-member"
                  value={formMemberId}
                  onChange={(event) => {
                    setFormMemberId(event.target.value)
                    setSuccess(false)
                    setFormError(null)
                  }}
                  className={selectClassName}
                >
                  <option value="">Select a member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name ?? "Unnamed member"}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`${PROGRESS_PRO_CARD_INNER} p-5`}>
                <div className="mb-2 flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-violet-400" aria-hidden />
                  <label htmlFor="checkin-date" className={labelClassName}>
                    Date
                  </label>
                </div>
                <input
                  id="checkin-date"
                  type="date"
                  value={checkInDate}
                  onChange={(event) => {
                    setCheckInDate(event.target.value)
                    setSuccess(false)
                    setFormError(null)
                  }}
                  className={inputClassName}
                />
              </div>
            </div>

            <div className={`mt-6 ${PROGRESS_PRO_CARD_INNER} p-5`}>
              <div className="mb-2 flex items-center gap-2">
                <Scale className="h-4 w-4 text-cyan-400" aria-hidden />
                <label htmlFor="checkin-weight" className={labelClassName}>
                  Weight (kg)
                </label>
              </div>
              <input
                id="checkin-weight"
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={(event) => {
                  setWeight(event.target.value)
                  setSuccess(false)
                  setFormError(null)
                }}
                placeholder="72.5"
                className={inputClassName}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className={`${PROGRESS_PRO_CARD_INNER} p-5`}>
                <RatingField
                  label="Energy (1–10)"
                  icon={Battery}
                  value={energy}
                  onChange={(value) => {
                    setEnergy(value)
                    setSuccess(false)
                    setFormError(null)
                  }}
                />
              </div>

              <div className={`${PROGRESS_PRO_CARD_INNER} p-5`}>
                <RatingField
                  label="Sleep (1–10)"
                  icon={Moon}
                  value={sleep}
                  onChange={(value) => {
                    setSleep(value)
                    setSuccess(false)
                    setFormError(null)
                  }}
                />
              </div>

              <div className={`${PROGRESS_PRO_CARD_INNER} p-5`}>
                <RatingField
                  label="Motivation (1–10)"
                  icon={Sparkles}
                  value={motivation}
                  onChange={(value) => {
                    setMotivation(value)
                    setSuccess(false)
                    setFormError(null)
                  }}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting || members.length === 0}
                className={PROGRESS_PRO_BTN_PRIMARY}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" aria-hidden />
                    Save check-in
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={`${PROGRESS_PRO_CARD} p-6 sm:p-8`}>
            <ProgressProSectionHeader
              eyebrow="Check-in history"
              title="Latest check-ins"
              description={
                memberFilter === "all"
                  ? "Recent client wellbeing entries you have logged"
                  : `Check-in history for ${memberFilterLabel}`
              }
              accent="cyan"
              action={
                <p className="text-sm text-gray-500">
                  {displayCheckIns.length}{" "}
                  {displayCheckIns.length === 1 ? "entry" : "entries"}
                </p>
              }
            />

            {displayCheckIns.length === 0 ? (
              <ProgressEmptyState
                {...SAAS_EMPTY.checkIns}
                description={
                  memberFilter === "all"
                    ? SAAS_EMPTY.checkIns.description
                    : `Log a check-in for ${memberFilterLabel} to start tracking wellness scores.`
                }
                icon={<ClipboardList className="h-5 w-5" />}
                compact
              />
            ) : (
              <ul className="space-y-4">
                {displayCheckIns.map((checkIn) => (
                  <ClientCheckInListItem
                    key={checkIn.id}
                    checkIn={checkIn}
                    onSaved={handleCheckInNotesSaved}
                  />
                ))}
              </ul>
            )}
          </div>

          <div
            id="progress-export-report"
            className={`${PROGRESS_PRO_CARD} flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8`}
          >
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <FileDown className="h-5 w-5 text-cyan-400" aria-hidden />
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-400">
                  Export
                </p>
              </div>
              <h3 className="text-xl font-bold text-white sm:text-2xl">
                Export professional report
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-400">
                Download a ZyntixAI-branded PDF with weekly summary, goals, alerts,
                AI coaching insights, and coach notes.
              </p>
            </div>
            <ExportProgressReportButton
              memberFilterLabel={memberFilterLabel}
              memberFilter={memberFilter}
              memberName={selectedFilterMemberName}
              weeklyReport={weeklyReport}
              progressSummary={progressSummary}
              goals={clientGoals}
              alerts={progressAlerts}
              aiCoach={aiCoachInsight}
              checkIns={allCheckIns}
              disabled={refreshing}
              className="shrink-0"
            />
          </div>
        </>
      )}

      {process.env.NEXT_PUBLIC_SHOW_DEV_QA === "true" ? (
        <ProgressDashboardProTestChecklist />
      ) : null}
    </section>
  )
}
