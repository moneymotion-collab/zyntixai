"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  CalendarClock,
  FileDown,
  MessageSquare,
  NotebookPen,
  Target,
  Dumbbell,
} from "lucide-react"
import CoachCheckInFieldModal, {
  type CoachCheckInFieldMode,
} from "@/components/coach-dashboard/CoachCheckInFieldModal"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import {
  buildAiCoachUrl,
  buildAssignWorkoutUrl,
  buildProgressMemberUrl,
  buildProgressReportUrl,
  buildScheduleSessionUrl,
} from "@/lib/coach-dashboard/coach-action-links"

type CoachMemberActionButtonsProps = {
  memberId: string
  memberName: string
  latestCheckInId?: string | null
  layout?: "wrap" | "stack"
}

const ACTION_BTN =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06]"

export default function CoachMemberActionButtons({
  memberId,
  memberName,
  latestCheckInId = null,
  layout = "wrap",
}: CoachMemberActionButtonsProps) {
  const [modalMode, setModalMode] = useState<CoachCheckInFieldMode | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const containerClass =
    layout === "stack"
      ? "flex flex-col gap-2"
      : "flex flex-wrap gap-2"

  return (
    <>
      <div className={containerClass} onClick={(event) => event.stopPropagation()}>
        <Link href={buildAssignWorkoutUrl(memberId)} className={ACTION_BTN}>
          <Dumbbell className="h-3.5 w-3.5 text-indigo-400" aria-hidden />
          Assign Workout
        </Link>
        <Link href={buildAiCoachUrl(memberId)} className={ACTION_BTN}>
          <MessageSquare className="h-3.5 w-3.5 text-purple-400" aria-hidden />
          AI Coach
        </Link>
        <Link href={buildProgressMemberUrl(memberId)} className={ACTION_BTN}>
          <BarChart3 className="h-3.5 w-3.5 text-cyan-400" aria-hidden />
          View Progress
        </Link>
        <button
          type="button"
          onClick={() => setModalMode("note")}
          className={ACTION_BTN}
        >
          <NotebookPen className="h-3.5 w-3.5 text-violet-400" aria-hidden />
          Add Coach Note
        </button>
        <button
          type="button"
          onClick={() => setModalMode("action_plan")}
          className={ACTION_BTN}
        >
          <Target className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
          Create Action Plan
        </button>
        <Link href={buildScheduleSessionUrl(memberId)} className={ACTION_BTN}>
          <CalendarClock className="h-3.5 w-3.5 text-sky-400" aria-hidden />
          Schedule Session
        </Link>
        <Link href={buildProgressReportUrl(memberId)} className={ACTION_BTN}>
          <FileDown className="h-3.5 w-3.5 text-amber-400" aria-hidden />
          Generate Report
        </Link>
      </div>

      {modalMode ? (
        <CoachCheckInFieldModal
          mode={modalMode}
          memberName={memberName}
          checkInId={latestCheckInId}
          onClose={() => setModalMode(null)}
          onSaved={() => {
            setToast(successToast("coachNotesSaved"))
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
