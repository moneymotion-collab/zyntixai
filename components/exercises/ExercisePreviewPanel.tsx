"use client"

import SaasEmptyState from "@/components/ui/saas-empty-state"
import type { Exercise } from "@/lib/exercise-library"
import ExerciseDetailContent from "@/components/exercises/ExerciseDetailContent"
import { exerciseDetailFields } from "@/lib/exercise-metadata"

type ExercisePreviewPanelProps = {
  exercise: Exercise | null
  canAddToWorkout: boolean
  onView: () => void
  onAddToWorkout: () => void
}

export default function ExercisePreviewPanel({
  exercise,
  canAddToWorkout,
  onView,
  onAddToWorkout,
}: ExercisePreviewPanelProps) {
  if (!exercise) {
    return (
      <SaasEmptyState preset="exercisePreview" compact showAction={false} />
    )
  }

  const fields = exerciseDetailFields(exercise)

  return (
    <aside className="glass-panel p-6 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
        Preview
      </p>

      <div className="mt-4">
        <ExerciseDetailContent
          name={exercise.name}
          primaryMuscle={exercise.primary_muscle}
          equipment={exercise.equipment}
          difficulty={exercise.difficulty}
          instructions={exercise.instructions}
          coachNote={fields.legacyCoachNote}
          formSteps={fields.formSteps}
          commonMistakes={fields.commonMistakes}
          coachTips={fields.coachTips}
          imageUrls={fields.imageUrls}
          isCustom={exercise.is_custom}
          truncateInstructions={180}
          compact
          variant="dark"
        />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <button type="button" onClick={onView} className="btn-ghost w-full">
          View details
        </button>
        {canAddToWorkout ? (
          <button type="button" onClick={onAddToWorkout} className="btn-gradient w-full">
            Add to workout
          </button>
        ) : null}
      </div>
    </aside>
  )
}
