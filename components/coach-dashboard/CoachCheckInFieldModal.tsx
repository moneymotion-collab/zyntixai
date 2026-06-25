"use client"

import { useEffect, useState } from "react"
import { Loader2, NotebookPen, Target, X } from "lucide-react"
import ProgressErrorBanner from "@/components/progress/ProgressErrorBanner"
import AnimatedModal, { useMountAnimatedModal } from "@/components/ui/animated-modal"
import { PROGRESS_PRO_BTN_PRIMARY } from "@/components/progress/progress-pro-ui"
import { premiumTextareaClass } from "@/lib/ui/premium-input"
import { updateClientCheckinCoachNotes } from "@/lib/progress/client-checkins"
import { createClient } from "@/lib/supabase/client"

export type CoachCheckInFieldMode = "note" | "action_plan"

type CoachCheckInFieldModalProps = {
  mode: CoachCheckInFieldMode
  memberName: string
  checkInId: string | null
  onClose: () => void
  onSaved?: () => void
}

const MODE_COPY: Record<
  CoachCheckInFieldMode,
  { title: string; label: string; placeholder: string; success: string }
> = {
  note: {
    title: "Add coach note",
    label: "Coach note",
    placeholder: "Observations, context, or follow-up reminders…",
    success: "Coach note saved successfully",
  },
  action_plan: {
    title: "Create action plan",
    label: "Action plan",
    placeholder: "Next steps, habits to focus on, or coaching actions…",
    success: "Action plan saved successfully",
  },
}

export default function CoachCheckInFieldModal({
  mode,
  memberName,
  checkInId,
  onClose,
  onSaved,
}: CoachCheckInFieldModalProps) {
  const supabase = createClient()
  const copy = MODE_COPY[mode]

  const [value, setValue] = useState("")
  const [existingNote, setExistingNote] = useState("")
  const [existingPlan, setExistingPlan] = useState("")
  const [loading, setLoading] = useState(Boolean(checkInId))
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { open, requestClose, onExitComplete } = useMountAnimatedModal(onClose)

  useEffect(() => {
    if (!checkInId) {
      setLoading(false)
      return
    }

    let cancelled = false
    const id = checkInId

    async function loadCheckIn() {
      setLoading(true)
      setErrorMessage(null)

      const { data, error } = await supabase
        .from("client_checkins")
        .select("coach_note, action_plan")
        .eq("id", id)
        .single()

      if (cancelled) return

      if (error) {
        setErrorMessage(error.message)
        setLoading(false)
        return
      }

      const note = data?.coach_note ?? ""
      const plan = data?.action_plan ?? ""
      setExistingNote(note)
      setExistingPlan(plan)
      setValue(mode === "note" ? note : plan)
      setLoading(false)
    }

    void loadCheckIn()

    return () => {
      cancelled = true
    }
  }, [checkInId, mode, supabase])

  async function handleSave() {
    if (!checkInId) return

    setSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const result = await updateClientCheckinCoachNotes(supabase, checkInId, {
      coachNote: mode === "note" ? value : existingNote,
      actionPlan: mode === "action_plan" ? value : existingPlan,
    })

    if (result.error) {
      setErrorMessage(result.error)
      setSaving(false)
      return
    }

    if (result.data) {
      setExistingNote(result.data.coach_note ?? "")
      setExistingPlan(result.data.action_plan ?? "")
    }

    setSaving(false)
    onSaved?.()
    requestClose()
  }

  return (
    <AnimatedModal
      open={open}
      onClose={requestClose}
      onExitComplete={onExitComplete}
      ariaLabelledBy="coach-checkin-field-title"
      className="flex items-end justify-center p-4 sm:items-center"
      panelClassName="max-w-lg rounded-3xl border border-white/10 bg-[#0b1224] p-6 shadow-2xl"
      backdropClassName="bg-black/70"
    >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-400">
              Quick coach action
            </p>
            <h3 id="coach-checkin-field-title" className="mt-2 text-xl font-bold text-white">
              {copy.title}
            </h3>
            <p className="mt-1 text-sm text-slate-400">{memberName}</p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!checkInId ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm text-amber-100">
            No check-in found for this member yet. Log a check-in in Progress
            Dashboard first, then add a note or action plan.
          </div>
        ) : loading ? (
          <div className="flex min-h-[120px] items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Loading check-in…
          </div>
        ) : (
          <>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                {mode === "note" ? (
                  <NotebookPen className="h-4 w-4 text-violet-400" aria-hidden />
                ) : (
                  <Target className="h-4 w-4 text-cyan-400" aria-hidden />
                )}
                {copy.label}
              </span>
              <textarea
                value={value}
                onChange={(event) => setValue(event.target.value)}
                rows={5}
                placeholder={copy.placeholder}
                className={`${premiumTextareaClass} min-h-[120px]`}
              />
            </label>

            {errorMessage ? (
              <div className="mt-4">
                <ProgressErrorBanner
                  title="Failed to save"
                  message={errorMessage}
                  embedded
                />
              </div>
            ) : null}

            {successMessage ? (
              <p className="mt-4 text-sm text-emerald-300">{successMessage}</p>
            ) : null}
          </>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={requestClose}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5"
          >
            Close
          </button>
          {checkInId ? (
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || loading}
              className={PROGRESS_PRO_BTN_PRIMARY}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </button>
          ) : null}
        </div>
    </AnimatedModal>
  )
}
