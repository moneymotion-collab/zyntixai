"use client"

import { useEffect, useState } from "react"
import {
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Loader2,
  NotebookPen,
  Save,
  Target,
} from "lucide-react"
import ProgressErrorBanner from "@/components/progress/ProgressErrorBanner"
import { PROGRESS_PRO_BTN_SECONDARY, PROGRESS_PRO_CARD_INNER } from "@/components/progress/progress-pro-ui"
import { premiumTextareaClass } from "@/lib/ui/premium-input"
import {
  formatCheckInDate,
  formatCheckInScore,
  formatCheckInWeight,
  updateClientCheckinCoachNotes,
  type ClientCheckInRow,
} from "@/lib/progress/client-checkins"
import { createClient } from "@/lib/supabase/client"
import { notifyCoachingCoreChanged } from "@/lib/coaching-core/notify"

type ClientCheckInListItemProps = {
  checkIn: ClientCheckInRow
  onSaved: (updated: ClientCheckInRow) => void
}

const fieldClassName = premiumTextareaClass

const labelClassName = "mb-2 block text-sm font-medium text-gray-300"

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 font-medium tabular-nums text-white">{value}</p>
    </div>
  )
}

export default function ClientCheckInListItem({
  checkIn,
  onSaved,
}: ClientCheckInListItemProps) {
  const supabase = createClient()

  const [coachNote, setCoachNote] = useState(checkIn.coach_note ?? "")
  const [actionPlan, setActionPlan] = useState(checkIn.action_plan ?? "")
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setCoachNote(checkIn.coach_note ?? "")
    setActionPlan(checkIn.action_plan ?? "")
    setErrorMessage(null)
    setSaved(false)
  }, [checkIn])

  async function handleSave() {
    setSaving(true)
    setErrorMessage(null)
    setSaved(false)

    const result = await updateClientCheckinCoachNotes(supabase, checkIn.id, {
      coachNote,
      actionPlan,
    })

    if (result.error) {
      setErrorMessage(result.error)
      setSaving(false)
      return
    }

    if (result.data) {
      onSaved(result.data)
      setCoachNote(result.data.coach_note ?? "")
      setActionPlan(result.data.action_plan ?? "")
    }

    setSaved(true)
    setSaving(false)
    notifyCoachingCoreChanged()
  }

  return (
    <li className={`${PROGRESS_PRO_CARD_INNER} p-4 transition hover:border-white/20 sm:p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">{checkIn.member_name}</p>
          <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-gray-400">
            <CalendarCheck className="h-3.5 w-3.5 text-violet-400" aria-hidden />
            {formatCheckInDate(checkIn.checkin_date)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <ClipboardList className="h-3.5 w-3.5" aria-hidden />
          Check-in record
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MetricPill label="Weight" value={formatCheckInWeight(checkIn.weight)} />
        <MetricPill label="Energy" value={formatCheckInScore(checkIn.energy)} />
        <MetricPill label="Sleep" value={formatCheckInScore(checkIn.sleep)} />
        <MetricPill
          label="Motivation"
          value={formatCheckInScore(checkIn.motivation)}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-2 flex items-center gap-2">
            <NotebookPen className="h-4 w-4 text-violet-400" aria-hidden />
            <label htmlFor={`coach-note-${checkIn.id}`} className={labelClassName}>
              Coach note
            </label>
          </div>
          <textarea
            id={`coach-note-${checkIn.id}`}
            value={coachNote}
            onChange={(event) => {
              setCoachNote(event.target.value)
              setSaved(false)
            }}
            rows={3}
            placeholder="Observations, context, or follow-up reminders for this check-in…"
            className={`${fieldClassName} min-h-[96px] resize-y`}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-400" aria-hidden />
            <label htmlFor={`action-plan-${checkIn.id}`} className={labelClassName}>
              Action plan
            </label>
          </div>
          <textarea
            id={`action-plan-${checkIn.id}`}
            value={actionPlan}
            onChange={(event) => {
              setActionPlan(event.target.value)
              setSaved(false)
            }}
            rows={3}
            placeholder="Next steps, habits to focus on, or coaching actions…"
            className={`${fieldClassName} min-h-[96px] resize-y`}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          {errorMessage ? (
            <ProgressErrorBanner
              title="Failed to save coach note/action plan"
              message={errorMessage}
              onRetry={() => void handleSave()}
              retrying={saving}
              embedded
            />
          ) : saved ? (
            <p className="inline-flex items-center gap-1.5 text-sm text-emerald-300">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Coach notes saved successfully
            </p>
          ) : checkIn.coach_note || checkIn.action_plan ? (
            <p className="text-sm text-gray-500">Saved notes loaded</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className={PROGRESS_PRO_BTN_SECONDARY}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden />
              Save notes
            </>
          )}
        </button>
      </div>
    </li>
  )
}
