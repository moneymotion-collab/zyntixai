"use client"

import { useState } from "react"
import Link from "next/link"
import {
  CalendarClock,
  CheckCircle2,
  Eye,
  Loader2,
  NotebookPen,
} from "lucide-react"
import CoachRescheduleSessionModal from "@/components/coach-dashboard/CoachRescheduleSessionModal"
import CoachSessionNoteModal from "@/components/coach-dashboard/CoachSessionNoteModal"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import {
  buildViewSessionUrl,
  markSessionCompleted,
} from "@/lib/coach-dashboard/session-actions"
import { isSessionCompleted } from "@/lib/coach-dashboard/map-coach-sessions"
import type { TodaySession } from "@/lib/coach-dashboard/types"
import { notifyCoachingCoreChanged } from "@/lib/coaching-core/notify"
import { createClient } from "@/lib/supabase/client"

type CoachSessionQuickActionsProps = {
  session: TodaySession
  onSessionUpdated?: () => void
  layout?: "wrap" | "stack"
}

const ACTION_BTN =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"

export default function CoachSessionQuickActions({
  session,
  onSessionUpdated,
  layout = "wrap",
}: CoachSessionQuickActionsProps) {
  const supabase = createClient()
  const [noteOpen, setNoteOpen] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const isCompleted = isSessionCompleted(session.status)

  async function handleMarkCompleted() {
    setCompleting(true)
    setCompleteError(null)

    const result = await markSessionCompleted(supabase, session.id)

    if (result.error) {
      setCompleteError(result.error)
      setCompleting(false)
      return
    }

    setCompleting(false)
    setToast(successToast("sessionCompleted"))
    notifyCoachingCoreChanged()
    onSessionUpdated?.()
  }

  const containerClass = layout === "stack" ? "flex flex-col gap-2" : "flex flex-wrap gap-2"

  return (
    <>
      <div className={containerClass}>
        <Link href={buildViewSessionUrl(session.id)} className={ACTION_BTN}>
          <Eye className="h-3.5 w-3.5 text-cyan-400" aria-hidden />
          View Session
        </Link>
        <button
          type="button"
          onClick={() => void handleMarkCompleted()}
          disabled={completing || isCompleted}
          className={ACTION_BTN}
        >
          {completing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
          )}
          Mark as Completed
        </button>
        <button
          type="button"
          onClick={() => setRescheduleOpen(true)}
          className={ACTION_BTN}
        >
          <CalendarClock className="h-3.5 w-3.5 text-sky-400" aria-hidden />
          Reschedule
        </button>
        <button type="button" onClick={() => setNoteOpen(true)} className={ACTION_BTN}>
          <NotebookPen className="h-3.5 w-3.5 text-violet-400" aria-hidden />
          Add Session Note
        </button>
      </div>

      {completeError ? (
        <p className="mt-2 text-xs text-red-300">{completeError}</p>
      ) : null}

      {noteOpen ? (
        <CoachSessionNoteModal
          session={session}
          onClose={() => setNoteOpen(false)}
          onSaved={() => {
            onSessionUpdated?.()
            setToast(successToast("sessionNoteSaved"))
          }}
        />
      ) : null}

      {rescheduleOpen ? (
        <CoachRescheduleSessionModal
          session={session}
          onClose={() => setRescheduleOpen(false)}
          onSaved={() => {
            onSessionUpdated?.()
            setToast(successToast("sessionRescheduled"))
          }}
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
    </>
  )
}
