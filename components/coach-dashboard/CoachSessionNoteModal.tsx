"use client"

import { useEffect, useState } from "react"
import { Loader2, NotebookPen, X } from "lucide-react"
import ProgressErrorBanner from "@/components/progress/ProgressErrorBanner"
import AnimatedModal, { useMountAnimatedModal } from "@/components/ui/animated-modal"
import { PROGRESS_PRO_BTN_PRIMARY } from "@/components/progress/progress-pro-ui"
import { premiumTextareaClass } from "@/lib/ui/premium-input"
import { updateSessionNotes } from "@/lib/coach-dashboard/session-actions"
import type { TodaySession } from "@/lib/coach-dashboard/types"
import { createClient } from "@/lib/supabase/client"

type CoachSessionNoteModalProps = {
  session: TodaySession
  onClose: () => void
  onSaved?: () => void
}

export default function CoachSessionNoteModal({
  session,
  onClose,
  onSaved,
}: CoachSessionNoteModalProps) {
  const supabase = createClient()
  const [notes, setNotes] = useState(session.notes ?? "")
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { open, requestClose, onExitComplete } = useMountAnimatedModal(onClose)

  useEffect(() => {
    setNotes(session.notes ?? "")
    setErrorMessage(null)
    setSuccessMessage(null)
  }, [session])

  async function handleSave() {
    setSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const result = await updateSessionNotes(supabase, session.id, notes)

    if (result.error) {
      setErrorMessage(result.error)
      setSaving(false)
      return
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
      className="flex items-end justify-center p-4 sm:items-center"
      panelClassName="max-w-lg rounded-3xl border border-white/10 bg-[#0b1224] p-6 shadow-2xl"
      backdropClassName="bg-black/70"
    >
      <div className="w-full">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-400">
              Session note
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">
              Add session note
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {session.memberName} · {session.sessionType ?? "Session"}
            </p>
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

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
            <NotebookPen className="h-4 w-4 text-violet-400" aria-hidden />
            Notes
          </span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={5}
            placeholder="Session prep, follow-up reminders, or outcomes…"
            className={`${premiumTextareaClass} min-h-[120px]`}
          />
        </label>

        {errorMessage ? (
          <div className="mt-4">
            <ProgressErrorBanner title="Failed to save note" message={errorMessage} embedded />
          </div>
        ) : null}
        {successMessage ? (
          <p className="mt-4 text-sm text-emerald-300">{successMessage}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={requestClose}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className={PROGRESS_PRO_BTN_PRIMARY}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Save note"
            )}
          </button>
        </div>
      </div>
    </AnimatedModal>
  )
}
