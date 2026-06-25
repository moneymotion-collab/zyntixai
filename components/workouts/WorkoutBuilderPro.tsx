"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import { EXERCISE_CATEGORIES, type Exercise } from "@/lib/exercise-library"
import { filterExercises } from "@/lib/exercises/filterExercises"
import { premiumInputClass, premiumSelectClass, premiumTextareaClass } from "@/lib/ui/premium-input"

const MUSCLE_OPTIONS = EXERCISE_CATEGORIES.filter((group) => group !== "All")

type SelectedExercise = {
  exercise_id: string
  name: string
  primary_muscle: string | null
  sets: number
  reps: string
  rest_seconds: number
  notes: string
}

export default function WorkoutBuilderPro() {
  const [catalog, setCatalog] = useState<Exercise[]>([])
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([])
  const [search, setSearch] = useState("")
  const [muscle, setMuscle] = useState("All")

  const [title, setTitle] = useState("")
  const [goal, setGoal] = useState("")
  const [weeks, setWeeks] = useState(4)

  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const fetchCatalog = useCallback(async () => {
    const res = await fetch("/api/exercises")
    const json = await res.json()

    setCatalog(json.exercises || [])
  }, [])

  useEffect(() => {
    void fetchCatalog()
  }, [fetchCatalog])

  const exercises = useMemo(
    () =>
      filterExercises(catalog, {
        search,
        muscle,
        equipment: "All",
        difficulty: "All",
      }),
    [catalog, muscle, search],
  )

  function addExercise(exercise: Exercise) {
    const alreadyAdded = selectedExercises.some(
      (item) => item.exercise_id === exercise.id,
    )

    if (alreadyAdded) return

    setSelectedExercises((prev) => [
      ...prev,
      {
        exercise_id: exercise.id,
        name: exercise.name,
        primary_muscle: exercise.primary_muscle,
        sets: 3,
        reps: "10",
        rest_seconds: 60,
        notes: "",
      },
    ])
  }

  function updateSelectedExercise(
    exerciseId: string,
    field: keyof SelectedExercise,
    value: string | number,
  ) {
    setSelectedExercises((prev) =>
      prev.map((exercise) =>
        exercise.exercise_id === exerciseId
          ? { ...exercise, [field]: value }
          : exercise,
      ),
    )
  }

  function removeExercise(exerciseId: string) {
    setSelectedExercises((prev) =>
      prev.filter((exercise) => exercise.exercise_id !== exerciseId),
    )
  }

  async function saveWorkout() {
    setSaving(true)
    setErrorMessage("")

    const res = await fetch("/api/workout-builder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, goal, weeks, exercises: selectedExercises }),
    })

    const json = await res.json()

    if (!res.ok) {
      setErrorMessage(json.error || "Something went wrong")
      setSaving(false)
      return
    }

    setToast(successToast("workoutCreated"))
    setTitle("")
    setGoal("")
    setWeeks(4)
    setSelectedExercises([])
    setSaving(false)
  }

  async function saveAsTemplate() {
    setSaving(true)
    setErrorMessage("")

    const res = await fetch("/api/workout-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        goal,
        category: "Custom",
        exercises: selectedExercises.map((exercise) => ({
          exercise_id: exercise.exercise_id,
          exercise_name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_seconds: exercise.rest_seconds,
          notes: exercise.notes,
        })),
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setErrorMessage(json.error || "Could not save template")
      setSaving(false)
      return
    }

    setToast(successToast("workoutTemplateSaved"))
    setSaving(false)
  }

  const totalSets = selectedExercises.reduce(
    (sum, item) => sum + Number(item.sets),
    0,
  )
  const estimatedMinutes = Math.max(15, totalSets * 3)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        <p className="font-semibold">Experimental builder</p>
        <p className="mt-1 text-amber-100/80">
          This page is kept for testing. For the full coaching workflow — templates,
          custom exercises, reorder, and member assignment — use{" "}
          <Link href="/workouts/new" className="font-medium text-amber-50 underline">
            Create Workout Plan
          </Link>
          .
        </p>
      </div>

      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
          Workout Builder Pro
        </p>
        <h1 className="text-3xl font-bold text-white">Build a Workout</h1>
        <p className="text-gray-400">
          Create professional workout plans from your exercise library.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercise..."
              className={premiumInputClass}
            />

            <select
              value={muscle}
              onChange={(e) => setMuscle(e.target.value)}
              className={premiumSelectClass}
            >
              <option value="All">All muscles</option>
              {MUSCLE_OPTIONS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {exercises.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => addExercise(exercise)}
                className="rounded-2xl border border-white/10 bg-black/30 p-4 text-left hover:bg-white/10"
              >
                <h3 className="font-semibold text-white">{exercise.name}</h3>
                <p className="mt-1 text-sm text-gray-400">
                  {exercise.primary_muscle} • {exercise.equipment}
                </p>
                <p className="mt-3 text-sm text-emerald-400">+ Add to workout</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-bold text-white">Workout Summary</h2>

          <div className="mt-4 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Workout title"
              className={premiumInputClass}
            />

            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Goal / description"
              className={premiumTextareaClass}
            />

            <input
              type="number"
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
              placeholder="Weeks"
              className={premiumInputClass}
            />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-black/30 p-3">
              <p className="text-xs text-gray-400">Exercises</p>
              <p className="text-xl font-bold text-white">
                {selectedExercises.length}
              </p>
            </div>
            <div className="rounded-xl bg-black/30 p-3">
              <p className="text-xs text-gray-400">Sets</p>
              <p className="text-xl font-bold text-white">{totalSets}</p>
            </div>
            <div className="rounded-xl bg-black/30 p-3">
              <p className="text-xs text-gray-400">Time</p>
              <p className="text-xl font-bold text-white">{estimatedMinutes}m</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {selectedExercises.map((exercise) => (
              <div
                key={exercise.exercise_id}
                className="rounded-2xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{exercise.name}</h3>
                    <p className="text-sm text-gray-400">
                      {exercise.primary_muscle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeExercise(exercise.exercise_id)}
                    className="text-sm text-red-400"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={exercise.sets}
                    onChange={(e) =>
                      updateSelectedExercise(
                        exercise.exercise_id,
                        "sets",
                        Number(e.target.value),
                      )
                    }
                    className={premiumInputClass}
                    placeholder="Sets"
                  />

                  <input
                    value={exercise.reps}
                    onChange={(e) =>
                      updateSelectedExercise(
                        exercise.exercise_id,
                        "reps",
                        e.target.value,
                      )
                    }
                    className={premiumInputClass}
                    placeholder="Reps"
                  />

                  <input
                    type="number"
                    value={exercise.rest_seconds}
                    onChange={(e) =>
                      updateSelectedExercise(
                        exercise.exercise_id,
                        "rest_seconds",
                        Number(e.target.value),
                      )
                    }
                    className={premiumInputClass}
                    placeholder="Rest"
                  />
                </div>

                <input
                  value={exercise.notes}
                  onChange={(e) =>
                    updateSelectedExercise(
                      exercise.exercise_id,
                      "notes",
                      e.target.value,
                    )
                  }
                  className={`${premiumInputClass} mt-2`}
                  placeholder="Coach notes"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void saveWorkout()}
            disabled={saving || selectedExercises.length === 0 || !title}
            className="mt-5 w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-black disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save Workout"}
          </button>

          <button
            type="button"
            onClick={() => void saveAsTemplate()}
            disabled={saving || selectedExercises.length === 0 || !title}
            className="mt-3 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 font-semibold text-emerald-300 disabled:opacity-40"
          >
            Save as Template
          </button>

          {errorMessage ? (
            <p className="mt-3 text-sm text-red-300">{errorMessage}</p>
          ) : null}
        </div>
      </div>

      {toast ? (
        <Toast
          title={toast.title}
          description={toast.description}
          variant={toast.variant ?? "success"}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </div>
  )
}
