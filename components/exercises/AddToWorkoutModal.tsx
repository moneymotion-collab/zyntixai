"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { Database } from "@/lib/database.types"
import EmptyState from "@/components/ui/empty-state"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { Skeleton } from "@/components/ui/skeleton"
import { getCoachScope } from "@/lib/auth/coach-scope"
import { notifyCoachingCoreChanged } from "@/lib/coaching-core/notify"
import { createClient } from "@/lib/supabase/client"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"
import type { Exercise } from "@/lib/exercise-library"
import {
  appendExerciseToWorkoutPlan,
  DEFAULT_LIBRARY_ADD_PRESCRIPTION,
  fetchWorkoutPlansWithExercises,
} from "@/lib/workout-exercises"
import AnimatedModal, { useMountAnimatedModal } from "@/components/ui/animated-modal"

type WorkoutPlan = Database["public"]["Tables"]["workout_plans"]["Row"] & {
  workout_plan_exercises?: Array<{ id: string }>
}

type AddToWorkoutModalProps = {
  exercise: Exercise | null
  onClose: () => void
  onAdded: (planTitle: string) => void
}

export default function AddToWorkoutModal({
  exercise,
  onClose,
  onAdded,
}: AddToWorkoutModalProps) {
  const supabase = useMemo(() => createClient(), [])
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { open, requestClose, onExitComplete } = useMountAnimatedModal(onClose)

  const loadPlans = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    const scope = await getCoachScope(supabase)
    const { plans: fetchedPlans, error } = await fetchWorkoutPlansWithExercises(
      supabase,
      { coachUserId: scope.isCoach ? scope.userId : null },
    )

    if (error) {
      reportSupabaseError("[exercises] load workout plans failed", error, {
        setError: setErrorMessage,
        fallbackMessage: "Could not load workout plans.",
      })
      setPlans([])
    } else {
      setPlans(fetchedPlans)
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (!exercise) return
    void loadPlans()
  }, [exercise, loadPlans])

  const handleAdd = async () => {
    if (!exercise || !selectedPlanId) return

    setSaving(true)
    setErrorMessage(null)

    const { error } = await appendExerciseToWorkoutPlan(
      supabase,
      selectedPlanId,
      exercise.id,
    )

    if (error) {
      reportSupabaseError("[exercises] add exercise to workout failed", error, {
        setError: setErrorMessage,
        fallbackMessage: "Could not add exercise to workout.",
      })
      setSaving(false)
      return
    }

    await loadPlans()
    notifyCoachingCoreChanged()

    const planTitle =
      plans.find((plan) => plan.id === selectedPlanId)?.title ?? "workout plan"
    onAdded(planTitle)
    setSaving(false)
    requestClose()
  }

  return (
    <AnimatedModal
      open={open && Boolean(exercise)}
      onClose={requestClose}
      onExitComplete={onExitComplete}
      ariaLabelledBy="add-to-workout-title"
      panelClassName="glass-panel max-w-lg p-6 shadow-glow sm:p-8"
      backdropClassName="bg-black/70 backdrop-blur-sm"
    >
      {exercise ? (
        <>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 id="add-to-workout-title" className="text-2xl font-bold text-white">
                Add to workout
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Add <span className="font-medium text-slate-200">{exercise.name}</span>{" "}
                to a workout plan ({DEFAULT_LIBRARY_ADD_PRESCRIPTION.sets} ×{" "}
                {DEFAULT_LIBRARY_ADD_PRESCRIPTION.reps},{" "}
                {DEFAULT_LIBRARY_ADD_PRESCRIPTION.restSeconds}s rest).
              </p>
            </div>
            <button
              type="button"
              onClick={requestClose}
              className="btn-ghost shrink-0 px-3 py-1.5"
            >
              Close
            </button>
          </div>

          {errorMessage ? (
            <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {errorMessage}
            </p>
          ) : null}

          {loading ? (
            <div className="space-y-3" aria-busy="true">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : plans.length === 0 ? (
            <EmptyState
              {...SAAS_EMPTY.workouts}
              action={
                <Link href="/workouts" className="btn-gradient">
                  Go to Workouts
                </Link>
              }
            />
          ) : (
            <select
              value={selectedPlanId}
              onChange={(event) => setSelectedPlanId(event.target.value)}
              className="premium-select"
            >
              <option value="" className="bg-slate-900">
                Select workout plan
              </option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id} className="bg-slate-900">
                  {plan.title}
                  {plan.workout_plan_exercises
                    ? ` (${plan.workout_plan_exercises.length} exercises)`
                    : ""}
                </option>
              ))}
            </select>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={requestClose} className="btn-ghost">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleAdd()}
              disabled={!selectedPlanId || saving || plans.length === 0}
              className="btn-gradient"
            >
              {saving ? "Adding…" : "Add exercise"}
            </button>
          </div>
        </>
      ) : null}
    </AnimatedModal>
  )
}
