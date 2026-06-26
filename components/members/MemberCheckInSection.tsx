"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Battery,
  Brain,
  CalendarCheck,
  Loader2,
  Moon,
  Scale,
  Send,
  Utensils,
} from "lucide-react"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EmptyState from "@/components/ui/empty-state"
import ErrorStateBanner from "@/components/ui/error-state-banner"
import SectionLoadingState from "@/components/ui/section-loading-state"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"
import {
  computeClientCheckInTrendSummary,
  fetchMemberClientCheckIns,
  formatCheckInDate,
  formatCheckInScore,
  formatCheckInWeight,
  getTodayIsoDate,
  insertMemberClientCheckIn,
  upsertMemberSelfCheckIn,
} from "@/lib/members/member-client-checkins"
import type { ClientCheckIn } from "@/lib/types/client-check-ins"
import {
  premiumInputClass,
  premiumTextareaClass,
} from "@/lib/ui/premium-input"
import { useCoachingCoreChanged } from "@/app/hooks/useCoachingCoreChanged"
import { createClient } from "@/lib/supabase/client"

type MemberCheckInSectionProps = {
  memberId: string
  memberName: string
  fallbackWeight?: number | null
  onCheckInSaved?: () => void
  variant?: "coach" | "member"
  coachId?: string
}

const RATING_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const
const labelClassName = "mb-2 block text-sm font-medium text-gray-700"

function RatingField({
  label,
  icon: Icon,
  value,
  onChange,
  disabled,
}: {
  label: string
  icon: typeof Battery
  value: number | null
  onChange: (value: number) => void
  disabled?: boolean
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-cyan-600" aria-hidden />
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {value != null ? (
          <span className="ml-auto rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-semibold text-cyan-800">
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
            disabled={disabled}
            className={`flex h-9 min-w-9 items-center justify-center rounded-xl border px-2 text-sm font-semibold transition disabled:opacity-50 ${
              value === rating
                ? "border-black bg-black text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  )
}

function TrendTile({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className={`mt-1 text-xl font-bold ${accent ?? "text-black"}`}>{value}</p>
    </div>
  )
}

function CheckInCard({ checkIn }: { checkIn: ClientCheckIn }) {
  return (
    <article className="space-y-4 rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
            Check-in
          </p>
          <h3 className="mt-1 text-lg font-semibold text-black">
            {formatCheckInDate(checkIn.check_in_date)}
          </h3>
        </div>
        <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700">
          {formatCheckInWeight(checkIn.weight)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Energy" value={formatCheckInScore(checkIn.energy)} />
        <Metric
          label="Sleep quality"
          value={formatCheckInScore(checkIn.sleep_quality)}
        />
        <Metric label="Stress" value={formatCheckInScore(checkIn.stress)} />
        <Metric label="Hunger" value={formatCheckInScore(checkIn.hunger)} />
      </div>

      {checkIn.mood ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Mood
          </p>
          <p className="mt-1 text-sm text-gray-700">{checkIn.mood}</p>
        </div>
      ) : null}

      {checkIn.wins ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Wins
          </p>
          <p className="mt-1 text-sm text-gray-700">{checkIn.wins}</p>
        </div>
      ) : null}

      {checkIn.struggles ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Struggles
          </p>
          <p className="mt-1 text-sm text-gray-700">{checkIn.struggles}</p>
        </div>
      ) : null}

      {checkIn.notes ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Notes
          </p>
          <p className="mt-1 text-sm text-gray-700">{checkIn.notes}</p>
        </div>
      ) : null}
    </article>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-black">{value}</p>
    </div>
  )
}

export default function MemberCheckInSection({
  memberId,
  memberName,
  fallbackWeight,
  onCheckInSaved,
  variant = "coach",
  coachId,
}: MemberCheckInSectionProps) {
  const supabase = createClient()
  const isMemberView = variant === "member"
  const todayDate = getTodayIsoDate()

  const [checkIns, setCheckIns] = useState<ClientCheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(isMemberView)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)

  const [weight, setWeight] = useState("")
  const [energy, setEnergy] = useState<number | null>(null)
  const [sleepQuality, setSleepQuality] = useState<number | null>(null)
  const [stress, setStress] = useState<number | null>(null)
  const [hunger, setHunger] = useState<number | null>(null)
  const [mood, setMood] = useState("")
  const [wins, setWins] = useState("")
  const [struggles, setStruggles] = useState("")
  const [notes, setNotes] = useState("")

  const loadCheckIns = useCallback(async () => {
    setLoading(true)

    const result = await fetchMemberClientCheckIns(supabase, memberId)

    if (result.error) {
      reportSupabaseError("[client_checkins] load failed", result.error, {
        setError: setFormError,
      })
      setCheckIns([])
    } else {
      setFormError(null)
      setCheckIns(result.checkIns)
      if (result.checkIns[0]?.weight != null) {
        setWeight(String(result.checkIns[0].weight))
      } else if (fallbackWeight != null) {
        setWeight(String(fallbackWeight))
      }
    }

    setLoading(false)
  }, [fallbackWeight, memberId, supabase])

  useEffect(() => {
    void loadCheckIns()
  }, [loadCheckIns])

  useCoachingCoreChanged(() => {
    void loadCheckIns()
  })

  const todayCheckIn = useMemo(
    () => checkIns.find((checkIn) => checkIn.check_in_date === todayDate) ?? null,
    [checkIns, todayDate],
  )

  const prefillFromCheckIn = useCallback((checkIn: ClientCheckIn) => {
    setWeight(checkIn.weight != null ? String(checkIn.weight) : "")
    setEnergy(checkIn.energy)
    setSleepQuality(checkIn.sleep_quality)
    setStress(checkIn.stress)
    setHunger(checkIn.hunger)
    setMood(checkIn.mood ?? "")
    setWins(checkIn.wins ?? "")
    setStruggles(checkIn.struggles ?? "")
    setNotes(checkIn.notes ?? "")
  }, [])

  useEffect(() => {
    if (!isMemberView || !todayCheckIn) return
    prefillFromCheckIn(todayCheckIn)
  }, [isMemberView, prefillFromCheckIn, todayCheckIn])

  const trendSummary = useMemo(
    () => computeClientCheckInTrendSummary(checkIns),
    [checkIns],
  )

  const resetForm = () => {
    setEnergy(null)
    setSleepQuality(null)
    setStress(null)
    setHunger(null)
    setMood("")
    setWins("")
    setStruggles("")
    setNotes("")
    setFormError(null)
  }

  const addCheckIn = async () => {
    setFormError(null)
    setSaveNotice(null)
    setSaving(true)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      setFormError(authError?.message ?? "You must be signed in to save check-ins.")
      setSaving(false)
      return
    }

    const payload = {
      memberId,
      memberName,
      weight: weight ? Number(weight) : null,
      energy,
      sleepQuality,
      stress,
      hunger,
      mood: mood || null,
      wins: wins || null,
      struggles: struggles || null,
      notes: notes || null,
    }

    const result = isMemberView
      ? await upsertMemberSelfCheckIn(supabase, coachId ?? "", payload)
      : await insertMemberClientCheckIn(supabase, user.id, payload)

    if (result.error) {
      setFormError(result.error)
      setSaving(false)
      return
    }

    if (result.checkIn) {
      setCheckIns((current) => {
        const withoutToday = isMemberView
          ? current.filter((checkIn) => checkIn.check_in_date !== todayDate)
          : current
        return [result.checkIn!, ...withoutToday]
      })
    } else {
      await loadCheckIns()
    }

    if (isMemberView && "updated" in result && result.updated) {
      setSaveNotice("Today's check-in was updated.")
    } else if (isMemberView) {
      setSaveNotice("Today's check-in was saved.")
    }

    if (!isMemberView) {
      resetForm()
      setShowForm(false)
    } else if (result.checkIn) {
      prefillFromCheckIn(result.checkIn)
    }

    setSaving(false)
    onCheckInSaved?.()
  }

  return (
    <Card variant="light">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            {isMemberView ? "Weekly wellbeing" : "C3 Coaching Core"}
          </p>
          <CardTitle className="mt-1">
            {isMemberView ? "Your check-in" : "Check-Ins"}
          </CardTitle>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((open) => {
              const next = !open
              if (next && isMemberView && todayCheckIn) {
                prefillFromCheckIn(todayCheckIn)
              }
              return next
            })
          }}
          className="rounded-xl border border-black px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-50"
        >
          {showForm
            ? "Cancel"
            : isMemberView && todayCheckIn
              ? "Update today's check-in"
              : "New check-in"}
        </button>
      </CardHeader>

      <CardContent className="space-y-6">
        {saveNotice && !showForm ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {saveNotice}
          </p>
        ) : null}

        {formError && !showForm ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TrendTile
            label="Latest weight"
            value={formatCheckInWeight(trendSummary.latestWeight)}
            accent="text-cyan-700"
          />
          <TrendTile
            label="Avg energy"
            value={formatCheckInScore(trendSummary.averageEnergy)}
          />
          <TrendTile
            label="Avg sleep"
            value={formatCheckInScore(trendSummary.averageSleep)}
          />
          <TrendTile
            label="Avg stress"
            value={formatCheckInScore(trendSummary.averageStress)}
          />
        </div>

        {showForm ? (
          <div className="space-y-5 rounded-xl border p-4">
            {formError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </p>
            ) : null}

            <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5">
              <div className="mb-2 flex items-center gap-2">
                <Scale className="h-4 w-4 text-gray-700" aria-hidden />
                <label className={labelClassName}>Weight (kg)</label>
              </div>
              <input
                type="number"
                step="any"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                className={premiumInputClass}
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5">
                <RatingField
                  label="Energy (1–10)"
                  icon={Battery}
                  value={energy}
                  onChange={setEnergy}
                  disabled={saving}
                />
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5">
                <RatingField
                  label="Sleep quality (1–10)"
                  icon={Moon}
                  value={sleepQuality}
                  onChange={setSleepQuality}
                  disabled={saving}
                />
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5">
                <RatingField
                  label="Stress (1–10)"
                  icon={Brain}
                  value={stress}
                  onChange={setStress}
                  disabled={saving}
                />
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5">
                <RatingField
                  label="Hunger (1–10)"
                  icon={Utensils}
                  value={hunger}
                  onChange={setHunger}
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <label className={labelClassName}>Mood</label>
              <input
                type="text"
                value={mood}
                onChange={(event) => setMood(event.target.value)}
                placeholder="Focused, tired, motivated…"
                className={premiumInputClass}
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className={labelClassName}>Wins</label>
                <textarea
                  value={wins}
                  onChange={(event) => setWins(event.target.value)}
                  rows={3}
                  placeholder="What went well this week?"
                  className={premiumTextareaClass}
                  disabled={saving}
                />
              </div>
              <div>
                <label className={labelClassName}>Struggles</label>
                <textarea
                  value={struggles}
                  onChange={(event) => setStruggles(event.target.value)}
                  rows={3}
                  placeholder="What was challenging?"
                  className={premiumTextareaClass}
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <label className={labelClassName}>Notes</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="Additional context for this check-in"
                className={premiumTextareaClass}
                disabled={saving}
              />
            </div>

            <button
              type="button"
              onClick={() => void addCheckIn()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden />
                  {isMemberView && todayCheckIn
                    ? "Update today's check-in"
                    : "Save check-in"}
                </>
              )}
            </button>
          </div>
        ) : null}

        {loading ? (
          <SectionLoadingState label="Loading check-ins" rows={4} />
        ) : checkIns.length === 0 ? (
          <EmptyState
            {...SAAS_EMPTY.checkIns}
            variant="light"
            compact
            icon={<CalendarCheck className="h-7 w-7" />}
            action={
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="btn-primary-solid"
              >
                Log first check-in
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            {checkIns.map((checkIn) => (
              <CheckInCard key={checkIn.id} checkIn={checkIn} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
