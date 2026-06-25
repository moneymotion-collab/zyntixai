"use client"

import ExerciseBadges from "@/components/exercises/ExerciseBadges"
import ExerciseMediaThumbnail from "@/components/exercises/ExerciseMediaThumbnail"
import HighlightedText from "@/components/exercises/HighlightedText"
import { sanitizeDisplayText } from "@/lib/exercise-display"
import type { Exercise } from "@/lib/exercise-library"

type ExerciseCardProps = {
  exercise: Exercise
  selected: boolean
  searchQuery?: string
  onSelect: (exercise: Exercise) => void
  onView?: (exercise: Exercise) => void
}

export default function ExerciseCard({
  exercise,
  selected,
  searchQuery = "",
  onSelect,
  onView,
}: ExerciseCardProps) {
  const instructions = sanitizeDisplayText(exercise.instructions)
  const name = sanitizeDisplayText(exercise.name) || "Exercise"

  return (
    <button
      type="button"
      onClick={() => {
        onSelect(exercise)
        onView?.(exercise)
      }}
      className={`glass-panel glass-panel-hover w-full overflow-hidden p-0 text-left ${
        selected ? "glass-panel-active" : ""
      }`}
    >
      <ExerciseMediaThumbnail
        exercise={exercise}
        variant="card"
        videoUrl={exercise.video_url}
      />

      <div className="p-5">
        <h3 className="font-semibold text-white">
          <HighlightedText text={name} searchQuery={searchQuery} />
        </h3>

        <ExerciseBadges
          exercise={exercise}
          searchQuery={searchQuery}
          className="mt-3"
        />

        {instructions ? (
          <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-500">
            {instructions}
          </p>
        ) : null}
      </div>
    </button>
  )
}
