"use client"

import Badge, { difficultyBadgeVariant } from "@/components/ui/badge"
import HighlightedText from "@/components/exercises/HighlightedText"
import { sanitizeDisplayText } from "@/lib/exercise-display"
import type { Exercise } from "@/lib/exercise-library"

type ExerciseBadgesProps = {
  exercise: Pick<
    Exercise,
    "is_custom" | "primary_muscle" | "equipment" | "difficulty"
  >
  searchQuery?: string
  showStandard?: boolean
  className?: string
}

export default function ExerciseBadges({
  exercise,
  searchQuery = "",
  showStandard = true,
  className = "",
}: ExerciseBadgesProps) {
  const primaryMuscle = sanitizeDisplayText(exercise.primary_muscle)
  const equipment = sanitizeDisplayText(exercise.equipment)
  const difficulty = sanitizeDisplayText(exercise.difficulty)

  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {exercise.is_custom ? (
        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
          Custom
        </span>
      ) : showStandard ? (
        <span className="rounded-full border border-slate-400/25 bg-slate-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
          Standard
        </span>
      ) : null}

      {primaryMuscle ? (
        <Badge variant="muscle">
          <HighlightedText text={primaryMuscle} searchQuery={searchQuery} />
        </Badge>
      ) : null}

      {equipment ? (
        <Badge variant="equipment">
          <HighlightedText text={equipment} searchQuery={searchQuery} />
        </Badge>
      ) : null}

      {difficulty ? (
        <Badge variant={difficultyBadgeVariant(exercise.difficulty)}>
          <HighlightedText text={difficulty} searchQuery={searchQuery} />
        </Badge>
      ) : null}
    </div>
  )
}
