"use client"

import { useEffect, useState } from "react"
import ExerciseDetailModal from "@/components/exercises/ExerciseDetailModal"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import type { Exercise } from "@/lib/exercise-library"
import {
  duplicatePickedExerciseAt,
  ensurePickedExerciseIds,
  reorderPickedExercises,
  removePickedExercise,
  updatePickedExercise,
  type PickedWorkoutExercise,
} from "@/lib/picked-workout-exercises"
import SelectedWorkoutExerciseCard from "@/components/workouts/SelectedWorkoutExerciseCard"
import WorkoutSummaryCard from "@/components/workouts/WorkoutSummaryCard"

type SelectedWorkoutExerciseListProps = {
  exercises: PickedWorkoutExercise[]
  catalog: Exercise[]
  onChange: (exercises: PickedWorkoutExercise[]) => void
  canViewDetails?: boolean
  canAddToWorkoutFromDetails?: boolean
  emptyTitle?: string
  emptyDescription?: string
  className?: string
  showSummary?: boolean
  summaryTitle?: string
}

export default function SelectedWorkoutExerciseList({
  exercises,
  catalog,
  onChange,
  canViewDetails = true,
  canAddToWorkoutFromDetails = false,
  emptyTitle = SAAS_EMPTY.workoutExercisesSelected.title,
  emptyDescription = SAAS_EMPTY.workoutExercisesSelected.description,
  className = "",
  showSummary = true,
  summaryTitle = "Your workout",
}: SelectedWorkoutExerciseListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null)

  useEffect(() => {
    if (exercises.some((item) => !item.id)) {
      onChange(ensurePickedExerciseIds(exercises))
    }
  }, [exercises, onChange])

  const normalizedExercises = ensurePickedExerciseIds(exercises)

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null)
      setDropIndex(null)
      return
    }

    onChange(reorderPickedExercises(normalizedExercises, dragIndex, targetIndex))
    setDragIndex(null)
    setDropIndex(null)
  }

  const openDetails = (exerciseId: string) => {
    const match = catalog.find((item) => item.id === exerciseId)
    if (match) setDetailExercise(match)
  }

  if (normalizedExercises.length === 0) {
    return (
      <SaasEmptyState
        preset="workoutExercisesSelected"
        title={emptyTitle}
        description={emptyDescription}
        compact
        showAction={false}
      />
    )
  }

  return (
    <>
      <ul className={`space-y-4 ${className}`.trim()}>
        {normalizedExercises.map((item, index) => (
          <li key={item.id}>
            <SelectedWorkoutExerciseCard
              exercise={item}
              index={index}
              isDragging={dragIndex === index}
              isDropTarget={dropIndex === index && dragIndex !== index}
              onSetsChange={(sets) =>
                onChange(updatePickedExercise(normalizedExercises, item.id, { sets }))
              }
              onRepsChange={(reps) =>
                onChange(updatePickedExercise(normalizedExercises, item.id, { reps }))
              }
              onRestChange={(restSeconds) =>
                onChange(
                  updatePickedExercise(normalizedExercises, item.id, { restSeconds }),
                )
              }
              onNotesChange={(notes) =>
                onChange(updatePickedExercise(normalizedExercises, item.id, { notes }))
              }
              onViewDetails={() => {
                if (canViewDetails) openDetails(item.exerciseId)
              }}
              onDuplicate={() =>
                onChange(duplicatePickedExerciseAt(normalizedExercises, item.id))
              }
              onRemove={() =>
                onChange(removePickedExercise(normalizedExercises, item.id))
              }
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => {
                event.preventDefault()
                setDropIndex(index)
              }}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => {
                setDragIndex(null)
                setDropIndex(null)
              }}
            />
          </li>
        ))}
      </ul>

      {showSummary ? (
        <div className="mt-5">
          <WorkoutSummaryCard
            title={summaryTitle}
            exercises={normalizedExercises}
          />
        </div>
      ) : null}

      {canViewDetails ? (
        <ExerciseDetailModal
          exercise={detailExercise}
          canAddToWorkout={canAddToWorkoutFromDetails}
          onClose={() => setDetailExercise(null)}
          onAddToWorkout={() => setDetailExercise(null)}
        />
      ) : null}
    </>
  )
}
