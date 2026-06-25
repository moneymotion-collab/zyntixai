"use client"

import { formatExercisePrescription } from "@/lib/exercise-display"
import EmptyState from "@/components/ui/empty-state"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import type { WorkoutExerciseSummary } from "@/lib/workout-exercises"

type TodayWorkoutViewProps = {
  exercises: WorkoutExerciseSummary[]
  checkedIds: Set<string>
  onToggleExercise: (exerciseId: string, checked: boolean) => void
  showCheckboxes?: boolean
  checkboxesDisabled?: boolean
}

export default function TodayWorkoutView({
  exercises,
  checkedIds,
  onToggleExercise,
  showCheckboxes = false,
  checkboxesDisabled = false,
}: TodayWorkoutViewProps) {
  if (exercises.length === 0) {
    return (
      <EmptyState
        {...SAAS_EMPTY.workoutExercises}
      />
    )
  }

  return (
    <div className="space-y-4">
      {exercises.map((exercise, index) => {
        const checked = checkedIds.has(exercise.id)
        const prescription = formatExercisePrescription(
          exercise.sets,
          exercise.reps,
          exercise.rest_seconds,
        )

        return (
          <article
            key={exercise.id}
            className={`glass-panel glass-panel-hover p-5 transition sm:p-6 ${
              checked ? "border-emerald-400/30 bg-emerald-500/[0.06]" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/70">
                  Exercise {index + 1}
                </p>
                <h4
                  className={`mt-2 text-lg font-bold ${
                    checked ? "text-emerald-200" : "text-white"
                  }`}
                >
                  {exercise.exercise_name}
                </h4>

                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    <div>
                      <dt className="inline font-medium text-slate-400">Sets: </dt>
                      <dd className="inline text-slate-200">{exercise.sets}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-slate-400">Reps: </dt>
                      <dd className="inline text-slate-200">{exercise.reps}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-slate-400">Rest: </dt>
                      <dd className="inline text-slate-200">
                        {exercise.rest_seconds}s
                      </dd>
                    </div>
                  </div>

                  <p className="font-medium text-indigo-200/90">{prescription}</p>

                  {exercise.instructions ? (
                    <div>
                      <dt className="font-medium text-slate-300">Instructions:</dt>
                      <dd className="mt-1.5 leading-relaxed text-slate-400">
                        {exercise.instructions}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              {showCheckboxes ? (
                <label className="flex shrink-0 flex-col items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={checkboxesDisabled}
                    onChange={(event) =>
                      onToggleExercise(exercise.id, event.target.checked)
                    }
                    aria-label={`Mark ${exercise.exercise_name} complete`}
                    className="premium-checkbox h-6 w-6"
                  />
                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Done
                  </span>
                </label>
              ) : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}
