"use client"

import { useMemo, useState } from "react"
import Badge from "@/components/ui/badge"
import ButtonSpinner from "@/components/ui/button-spinner"
import TodayWorkoutView from "@/components/workouts/TodayWorkoutView"
import type { MyWorkoutAssignment } from "@/lib/types/my-workouts"

type MyWorkoutCardProps = {
  assignment: MyWorkoutAssignment
  onComplete?: (assignmentId: string) => void
  completing?: boolean
  highlightAsToday?: boolean
}

export default function MyWorkoutCard({
  assignment,
  onComplete,
  completing = false,
  highlightAsToday = false,
}: MyWorkoutCardProps) {
  const plan = assignment.workout_plans
  const exercises = plan?.workout_plan_exercises ?? []
  const isCompleted = assignment.status === "completed"

  const [started, setStarted] = useState(false)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set())

  const effectiveCheckedIds = useMemo(() => {
    if (isCompleted) {
      return new Set(exercises.map((exercise) => exercise.id))
    }
    return checkedIds
  }, [checkedIds, exercises, isCompleted])

  const allExercisesChecked = useMemo(() => {
    if (exercises.length === 0) return true
    return exercises.every((ex) => effectiveCheckedIds.has(ex.id))
  }, [effectiveCheckedIds, exercises])

  const toggleExercise = (exerciseId: string, checked: boolean) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(exerciseId)
      } else {
        next.delete(exerciseId)
      }
      return next
    })
  }

  const inSession = started && !isCompleted
  const showCheckboxes = isCompleted || inSession

  return (
    <article
      className={`glass-panel p-6 sm:p-8 ${
        highlightAsToday ? "shadow-glow ring-1 ring-indigo-500/20" : ""
      }`}
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {highlightAsToday ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
              Today&apos;s Workout
            </p>
          ) : null}
          <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            {plan?.title ?? "Workout"}
          </h2>
          {!highlightAsToday ? (
            <p className="mt-2 text-sm text-slate-400">
              Assigned on{" "}
              {new Date(assignment.assigned_at).toLocaleDateString("en-US", {
                dateStyle: "medium",
              })}
            </p>
          ) : null}
        </div>
        <Badge status={assignment.status}>{assignment.status}</Badge>
      </header>

      {plan?.goal ? (
        <div className="mt-6 rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <h3 className="text-sm font-medium text-slate-400">Goal</h3>
          <p className="mt-1.5 leading-relaxed text-slate-300">{plan.goal}</p>
        </div>
      ) : null}

      <div className="mt-8">
        {!highlightAsToday ? (
          <h3 className="mb-5 text-lg font-semibold text-white">Today&apos;s Workout</h3>
        ) : null}

        <TodayWorkoutView
          exercises={exercises}
          checkedIds={effectiveCheckedIds}
          onToggleExercise={toggleExercise}
          showCheckboxes={showCheckboxes}
          checkboxesDisabled={isCompleted || completing}
        />
      </div>

      {isCompleted ? (
        <div className="mt-8 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-4 text-center text-base font-semibold text-emerald-200">
          ✓ Workout completed
        </div>
      ) : onComplete ? (
        <div className="mt-8 space-y-3">
          {!started ? (
            <button
              type="button"
              onClick={() => setStarted(true)}
              className="btn-gradient w-full py-4"
            >
              Start Workout
            </button>
          ) : (
            <>
              {!allExercisesChecked ? (
                <p className="text-center text-sm text-slate-400">
                  Check off each exercise when finished to complete the workout.
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => onComplete(assignment.id)}
                disabled={completing || !allExercisesChecked}
                aria-busy={completing || undefined}
                className="btn-gradient w-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/25"
              >
                {completing ? (
                  <>
                    <ButtonSpinner />
                    Saving…
                  </>
                ) : (
                  "Complete Workout"
                )}
              </button>
            </>
          )}
        </div>
      ) : null}
    </article>
  )
}
