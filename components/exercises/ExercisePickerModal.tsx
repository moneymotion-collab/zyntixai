"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Search, Sparkles, X } from "lucide-react"
import CreateCustomExerciseModal from "@/components/exercises/CreateCustomExerciseModal"
import {
  EXERCISE_CATEGORIES,
  type Exercise,
} from "@/lib/exercise-library"
import { filterExercises } from "@/lib/exercises/filterExercises"
import { exerciseMetaFromRow } from "@/lib/exercise-display"
import SelectedWorkoutExerciseList from "@/components/workouts/SelectedWorkoutExerciseList"
import AnimatedModal from "@/components/ui/animated-modal"
import {
  createPickedExercise,
  ensurePickedExerciseIds,
  type PickedWorkoutExercise,
} from "@/lib/picked-workout-exercises"

type ExercisePickerModalProps = {
  open: boolean
  catalog: Exercise[]
  initialExercises?: PickedWorkoutExercise[]
  onClose: () => void
  onSave: (exercises: PickedWorkoutExercise[]) => void
  onExerciseCreated?: (exercise: Exercise) => void
  saving?: boolean
  variant?: "light" | "dark"
}

const PICKER_CATEGORIES = EXERCISE_CATEGORIES.filter((group) => group !== "All")

function mergeExerciseIntoCatalog(
  catalog: Exercise[],
  exercise: Exercise,
): Exercise[] {
  if (catalog.some((item) => item.id === exercise.id)) {
    return catalog.map((item) => (item.id === exercise.id ? exercise : item))
  }

  return [...catalog, exercise].sort((left, right) =>
    left.name.localeCompare(right.name),
  )
}

export default function ExercisePickerModal({
  open,
  catalog,
  initialExercises = [],
  onClose,
  onSave,
  onExerciseCreated,
  saving = false,
}: ExercisePickerModalProps) {
  const [localCatalog, setLocalCatalog] = useState<Exercise[]>(catalog)
  const [search, setSearch] = useState("")
  const [muscle, setMuscle] = useState("All")
  const [selected, setSelected] = useState<PickedWorkoutExercise[]>(
    ensurePickedExerciseIds(initialExercises),
  )
  const [validationError, setValidationError] = useState<string | null>(null)
  const [createCustomOpen, setCreateCustomOpen] = useState(false)
  const [createSuccessMessage, setCreateSuccessMessage] = useState<string | null>(
    null,
  )

  useEffect(() => {
    setLocalCatalog(catalog)
  }, [catalog])

  useEffect(() => {
    if (!open) return
    setSelected(ensurePickedExerciseIds(initialExercises))
    setSearch("")
    setMuscle("All")
    setValidationError(null)
    setCreateSuccessMessage(null)
    setCreateCustomOpen(false)
  }, [open, initialExercises])

  useEffect(() => {
    if (!createSuccessMessage) return
    const timer = window.setTimeout(() => setCreateSuccessMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [createSuccessMessage])

  const filteredCatalog = useMemo(
    () =>
      filterExercises(localCatalog, {
        search,
        muscle,
        equipment: "All",
        difficulty: "All",
      }),
    [localCatalog, muscle, search],
  )

  const selectedIds = useMemo(
    () => new Set(selected.map((item) => item.exerciseId)),
    [selected],
  )

  const addExercise = (exercise: Exercise) => {
    if (selectedIds.has(exercise.id)) return
    setSelected((current) => [...current, createPickedExercise(exercise)])
  }

  const handleExerciseCreated = (exercise: Exercise) => {
    setLocalCatalog((current) => mergeExerciseIntoCatalog(current, exercise))
    onExerciseCreated?.(exercise)
    addExercise(exercise)
    setCreateSuccessMessage(`"${exercise.name}" created and added to this workout.`)
    setCreateCustomOpen(false)
  }

  const handleSave = () => {
    if (selected.length === 0) {
      setValidationError("Add at least one exercise before saving.")
      return
    }

    const invalid = selected.find(
      (item) =>
        !item.sets ||
        item.sets < 1 ||
        !item.reps.trim() ||
        item.restSeconds < 0,
    )

    if (invalid) {
      setValidationError("Each exercise needs valid sets, reps, and rest values.")
      return
    }

    setValidationError(null)
    onSave(selected)
  }

  return (
    <>
      <AnimatedModal
        open={open}
        onClose={onClose}
        ariaLabelledBy="exercise-picker-title"
        className="flex items-center justify-center p-3 sm:p-4"
        panelClassName="glass-panel flex max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1rem))] w-full max-w-6xl flex-col overflow-hidden shadow-glow"
        backdropClassName="bg-black/75 backdrop-blur-md"
      >
          <div className="border-b border-white/10 px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="exercise-picker-title" className="text-xl font-bold text-white sm:text-2xl">
                  Workout builder
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Search, filter, reorder, and configure sets, reps, and rest.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCreateCustomOpen(true)}
                  className="btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Create custom exercise
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost p-2"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {createSuccessMessage ? (
              <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
                {createSuccessMessage}
              </p>
            ) : null}

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search exercises..."
                className="premium-input pl-10"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <MuscleChip
                label="All"
                active={muscle === "All"}
                onClick={() => setMuscle("All")}
              />
              {PICKER_CATEGORIES.map((group) => (
                <MuscleChip
                  key={group}
                  label={group}
                  active={muscle === group}
                  onClick={() => setMuscle(group)}
                />
              ))}
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <section className="min-h-0 overflow-y-auto border-b border-white/10 p-4 sm:p-5 lg:border-b-0 lg:border-r">
              <h3 className="text-sm font-semibold text-white">Browse exercises</h3>
              <p className="mt-1 text-xs text-slate-400">
                {filteredCatalog.length} available
              </p>

              <ul className="mt-4 space-y-2">
                {filteredCatalog.map((exercise) => {
                  const isAdded = selectedIds.has(exercise.id)

                  return (
                    <li
                      key={exercise.id}
                      className="glass-panel glass-panel-hover flex items-center justify-between gap-3 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{exercise.name}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {exerciseMetaFromRow(exercise)}
                          {exercise.is_custom ? " · Custom" : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addExercise(exercise)}
                        disabled={isAdded}
                        className="btn-gradient shrink-0 gap-1 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {isAdded ? "Added" : "Add"}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className="flex min-h-0 flex-col overflow-hidden p-4 sm:p-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Selected exercises</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Drag to reorder · {selected.length} selected
                </p>
              </div>

              <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                <SelectedWorkoutExerciseList
                  exercises={selected}
                  catalog={localCatalog}
                  onChange={setSelected}
                />
              </div>
            </section>
          </div>

          <div className="border-t border-white/10 px-5 py-5 sm:px-6">
            {validationError ? (
              <p className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
                {validationError}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} className="btn-ghost">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-gradient"
              >
                {saving ? "Saving…" : "Save workout"}
              </button>
            </div>
          </div>
      </AnimatedModal>

      {createCustomOpen ? (
        <CreateCustomExerciseModal
          onClose={() => setCreateCustomOpen(false)}
          onCreated={handleExerciseCreated}
        />
      ) : null}
    </>
  )
}

function MuscleChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md shadow-indigo-500/25"
          : "border border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      {label}
    </button>
  )
}
