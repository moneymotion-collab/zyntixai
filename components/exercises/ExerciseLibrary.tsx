"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import AddToWorkoutModal from "@/components/exercises/AddToWorkoutModal"
import CreateCustomExerciseModal from "@/components/exercises/CreateCustomExerciseModal"
import ExerciseCard from "@/components/exercises/ExerciseCard"
import ExerciseDetailModal from "@/components/exercises/ExerciseDetailModal"
import ExerciseFiltersPanel from "@/components/exercises/ExerciseFilters"
import ExerciseLibraryHealthWidget from "@/components/exercises/ExerciseLibraryHealthWidget"
import ExercisePreviewPanel from "@/components/exercises/ExercisePreviewPanel"
import ExerciseSearchBar from "@/components/exercises/ExerciseSearchBar"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import ErrorStateBanner from "@/components/ui/error-state-banner"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import SaasPageHeader from "@/components/ui/saas-page-header"
import { SAAS_BTN_PRIMARY } from "@/lib/ui/saas-page-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { getCoachScope } from "@/lib/auth/coach-scope"
import { successToast } from "@/lib/copy/success-toasts"
import {
  DEFAULT_EXERCISE_FILTERS,
  type Exercise,
  type ExerciseFilters,
} from "@/lib/exercise-library"
import { filterExercises } from "@/lib/exercises/filterExercises"
import { createClient } from "@/lib/supabase/client"

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

function isMobilePreviewViewport(): boolean {
  if (typeof window === "undefined") return true
  return !window.matchMedia("(min-width: 1280px)").matches
}

export default function ExerciseLibrary() {
  const [catalog, setCatalog] = useState<Exercise[]>([])
  const [filters, setFilters] = useState<ExerciseFilters>(DEFAULT_EXERCISE_FILTERS)
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null)
  const [detailModalExercise, setDetailModalExercise] = useState<Exercise | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [createCustomOpen, setCreateCustomOpen] = useState(false)
  const [addToWorkoutExercise, setAddToWorkoutExercise] = useState<Exercise | null>(
    null,
  )
  const [toast, setToast] = useState<ToastPayload | null>(null)
  const [showHealthWidget, setShowHealthWidget] = useState(false)

  const fetchCatalog = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch("/api/exercises")
      const json = await res.json()
      if (!res.ok) {
        setLoadError(json.error ?? "Could not load exercise library.")
        setCatalog([])
        return
      }
      setCatalog(json.exercises || [])
    } catch {
      setLoadError("Could not load exercise library.")
      setCatalog([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchCatalog()
  }, [fetchCatalog])

  useEffect(() => {
    const supabase = createClient()

    void getCoachScope(supabase).then((scope) => {
      setShowHealthWidget(scope.isCoach || scope.isAdmin)
    })
  }, [])

  const exercises = useMemo(
    () => filterExercises(catalog, filters),
    [catalog, filters],
  )

  useEffect(() => {
    if (exercises.length === 0) {
      setPreviewExercise(null)
      return
    }

    setPreviewExercise((current) => {
      if (current && exercises.some((exercise) => exercise.id === current.id)) {
        return current
      }

      return exercises[0]
    })
  }, [exercises])

  const updateFilters = (patch: Partial<ExerciseFilters>) => {
    setFilters((current) => ({ ...current, ...patch }))
  }

  const resetFilters = () => {
    setFilters(DEFAULT_EXERCISE_FILTERS)
  }

  const handleExerciseCreated = (exercise: Exercise) => {
    setCatalog((current) => mergeExerciseIntoCatalog(current, exercise))
    setPreviewExercise(exercise)
    setToast({ ...successToast("customExerciseCreated"), variant: "success" })
    setCreateCustomOpen(false)
  }

  const handleAddToWorkout = (exercise: Exercise) => {
    setAddToWorkoutExercise(exercise)
  }

  const handleExerciseAddedToWorkout = (planTitle: string) => {
    const exerciseName = addToWorkoutExercise?.name ?? "Exercise"
    setAddToWorkoutExercise(null)
    setToast({
      ...successToast("exerciseAddedToWorkout", {
        description: `"${exerciseName}" was added to ${planTitle}.`,
      }),
      variant: "success",
    })
  }

  const handleCardSelect = (exercise: Exercise) => {
    setPreviewExercise(exercise)
  }

  const handleCardView = (exercise: Exercise) => {
    if (isMobilePreviewViewport()) {
      setDetailModalExercise(exercise)
    }
  }

  const openDetailModal = () => {
    if (previewExercise) {
      setDetailModalExercise(previewExercise)
    }
  }

  return (
    <div className="space-y-8">
      <SaasPageHeader
        eyebrow="Exercise Library Pro"
        title="Exercise Library"
        description="Search exercises, review technique and build professional workouts faster."
        accent="emerald"
        action={
          <button
            type="button"
            onClick={() => setCreateCustomOpen(true)}
            className={SAAS_BTN_PRIMARY}
          >
            <Plus className="h-4 w-4" />
            Create custom exercise
          </button>
        }
        className="mb-0"
      />

      {showHealthWidget ? (
        <ExerciseLibraryHealthWidget exercises={catalog} />
      ) : null}

      {loadError ? (
        <ErrorStateBanner
          title="Could not load exercises"
          message={loadError}
          onRetry={() => void fetchCatalog()}
          retrying={loading}
        />
      ) : null}

      <ExerciseSearchBar
        value={filters.search}
        onChange={(search) => updateFilters({ search })}
        isFiltering={loading}
      />

      <ExerciseFiltersPanel
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        resultCount={exercises.length}
        loading={loading}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        catalog.length === 0 ? (
          <SaasEmptyState preset="exercises" />
        ) : (
          <SaasEmptyState
            preset="exerciseSearch"
            action={
              <button
                type="button"
                onClick={resetFilters}
                className="btn-gradient"
              >
                Clear filters
              </button>
            }
          />
        )
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                selected={previewExercise?.id === exercise.id}
                searchQuery={filters.search}
                onSelect={handleCardSelect}
                onView={handleCardView}
              />
            ))}
          </div>

          <div className="hidden xl:block">
            <div className="sticky top-6">
              <ExercisePreviewPanel
                exercise={previewExercise}
                canAddToWorkout
                onView={openDetailModal}
                onAddToWorkout={() => {
                  if (previewExercise) {
                    handleAddToWorkout(previewExercise)
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      <ExerciseDetailModal
        exercise={detailModalExercise}
        canAddToWorkout
        onClose={() => setDetailModalExercise(null)}
        onAddToWorkout={(exercise) => {
          setDetailModalExercise(null)
          handleAddToWorkout(exercise)
        }}
      />

      {addToWorkoutExercise ? (
        <AddToWorkoutModal
          exercise={addToWorkoutExercise}
          onClose={() => setAddToWorkoutExercise(null)}
          onAdded={handleExerciseAddedToWorkout}
        />
      ) : null}

      {createCustomOpen ? (
        <CreateCustomExerciseModal
          onClose={() => setCreateCustomOpen(false)}
          onCreated={handleExerciseCreated}
        />
      ) : null}

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
