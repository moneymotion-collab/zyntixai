"use client"

import {
  Copy,
  Eye,
  GripVertical,
  Trash2,
} from "lucide-react"
import Badge, { difficultyBadgeVariant } from "@/components/ui/badge"
import { sanitizeDisplayText } from "@/lib/exercise-display"
import type { PickedWorkoutExercise } from "@/lib/picked-workout-exercises"

type SelectedWorkoutExerciseCardProps = {
  exercise: PickedWorkoutExercise
  index: number
  isDragging?: boolean
  isDropTarget?: boolean
  onSetsChange: (value: number) => void
  onRepsChange: (value: string) => void
  onRestChange: (value: number) => void
  onNotesChange: (value: string) => void
  onViewDetails: () => void
  onDuplicate: () => void
  onRemove: () => void
  onDragStart: () => void
  onDragOver: (event: React.DragEvent) => void
  onDrop: () => void
  onDragEnd: () => void
}

function SettingField({
  label,
  value,
  onChange,
  inputMode = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  inputMode?: "text" | "numeric"
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <input
        value={value}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="premium-input w-full"
      />
    </label>
  )
}

export default function SelectedWorkoutExerciseCard({
  exercise,
  index,
  isDragging = false,
  isDropTarget = false,
  onSetsChange,
  onRepsChange,
  onRestChange,
  onNotesChange,
  onViewDetails,
  onDuplicate,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: SelectedWorkoutExerciseCardProps) {
  const displayName = sanitizeDisplayText(exercise.name) || "Exercise"
  const category = sanitizeDisplayText(exercise.category)
  const equipment = sanitizeDisplayText(exercise.equipment)
  const difficulty = sanitizeDisplayText(exercise.difficulty)

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`glass-panel group relative overflow-hidden transition duration-300 ${
        isDragging
          ? "scale-[0.98] opacity-50"
          : isDropTarget
            ? "border-indigo-400/40 ring-2 ring-indigo-400/25"
            : "hover:border-white/20"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

      <div className="flex gap-3 p-4 sm:gap-4 sm:p-5">
        <button
          type="button"
          className="mt-1 flex shrink-0 cursor-grab touch-none flex-col items-center gap-1 text-slate-500 transition hover:text-slate-300 active:cursor-grabbing"
          aria-label={`Drag to reorder ${displayName}`}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <GripVertical className="h-5 w-5" />
          <span className="text-[10px] font-bold tabular-nums text-slate-600">
            {index + 1}
          </span>
        </button>

        <div className="min-w-0 flex-1 space-y-5">
          <div>
            <h4 className="text-base font-semibold text-white sm:text-lg">
              {displayName}
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {category ? (
                <Badge variant="category">{category}</Badge>
              ) : null}
              {equipment ? (
                <Badge variant="equipment">{equipment}</Badge>
              ) : null}
              {difficulty ? (
                <Badge variant={difficultyBadgeVariant(exercise.difficulty)}>
                  {difficulty}
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Workout settings
            </p>
            <div className="grid grid-cols-3 gap-3">
              <SettingField
                label="Sets"
                value={String(exercise.sets)}
                inputMode="numeric"
                onChange={(value) => {
                  const parsed = Number(value)
                  onSetsChange(Number.isNaN(parsed) ? 0 : parsed)
                }}
              />
              <SettingField
                label="Reps"
                value={exercise.reps}
                onChange={onRepsChange}
              />
              <SettingField
                label="Rest"
                value={String(exercise.restSeconds)}
                inputMode="numeric"
                onChange={(value) => {
                  const parsed = Number(value)
                  onRestChange(Number.isNaN(parsed) ? 0 : parsed)
                }}
              />
            </div>
            <label className="mt-3 block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Coach notes
              </span>
              <textarea
                value={exercise.notes}
                onChange={(event) => onNotesChange(event.target.value)}
                placeholder="Form cues, tempo, or substitutions"
                rows={2}
                className="premium-input w-full resize-none"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onViewDetails}
              className="btn-ghost gap-1.5 px-3 py-2 text-xs sm:text-sm"
            >
              <Eye className="h-3.5 w-3.5" />
              View details
            </button>
            <button
              type="button"
              onClick={onDuplicate}
              className="btn-ghost gap-1.5 px-3 py-2 text-xs sm:text-sm"
            >
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2 text-xs font-medium text-rose-200 transition duration-300 hover:border-rose-400/30 hover:bg-rose-500/10 sm:text-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
