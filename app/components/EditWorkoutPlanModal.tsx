"use client"

import { useEffect, useState } from "react"
import type { Database } from "@/lib/database.types"
import AnimatedModal, { useCloseOnSuccess, useMountAnimatedModal } from "@/components/ui/animated-modal"
import {
  premiumInputClass,
  premiumTextareaClass,
} from "@/lib/ui/premium-input"

type WorkoutPlan = Database["public"]["Tables"]["workout_plans"]["Row"]

type EditWorkoutPlanModalProps = {
  plan: WorkoutPlan
  onClose: () => void
  onSave: (updates: {
    title: string
    goal: string | null
    weeks: number | null
  }) => void
  saving: boolean
  errorMessage: string | null
  closeSignal?: number
}

export default function EditWorkoutPlanModal({
  plan,
  onClose,
  onSave,
  saving,
  errorMessage,
  closeSignal,
}: EditWorkoutPlanModalProps) {
  const [title, setTitle] = useState(plan.title)
  const [goal, setGoal] = useState(plan.goal ?? "")
  const [weeks, setWeeks] = useState(
    plan.weeks != null ? String(plan.weeks) : "",
  )

  useEffect(() => {
    setTitle(plan.title)
    setGoal(plan.goal ?? "")
    setWeeks(plan.weeks != null ? String(plan.weeks) : "")
  }, [plan])

  const handleSubmit = () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return
    }

    const parsedWeeks = weeks.trim() ? Number(weeks) : null

    onSave({
      title: trimmedTitle,
      goal: goal.trim() || null,
      weeks:
        parsedWeeks != null && !Number.isNaN(parsedWeeks) ? parsedWeeks : null,
    })
  }

  const { open, requestClose, onExitComplete } = useMountAnimatedModal(onClose)
  useCloseOnSuccess(closeSignal, saving, requestClose)

  return (
    <AnimatedModal
      open={open}
      onClose={requestClose}
      onExitComplete={onExitComplete}
      ariaLabelledBy="edit-workout-plan-title"
      panelClassName="max-w-lg rounded-2xl border border-white/10 bg-[#0b1224] p-6 text-white shadow-xl"
      backdropClassName="bg-black/70"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <h2 id="edit-workout-plan-title" className="text-2xl font-bold">
          Edit workout plan
        </h2>
        <button
          type="button"
          onClick={requestClose}
          className="rounded-xl border border-white/10 px-3 py-1 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
        >
          Close
        </button>
      </div>

        {errorMessage ? (
          <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </p>
        ) : null}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Workout title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={premiumInputClass}
          />

          <textarea
            placeholder="Goal / description"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className={`${premiumTextareaClass} h-32`}
          />

          <input
            type="number"
            min={1}
            placeholder="Weeks"
            value={weeks}
            onChange={(e) => setWeeks(e.target.value)}
            className={premiumInputClass}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={requestClose}
            className="rounded-xl border border-white/10 px-6 py-3 text-zinc-300 transition hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || saving}
            className="rounded-xl bg-cyan-500 px-6 py-3 font-medium text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
    </AnimatedModal>
  )
}
