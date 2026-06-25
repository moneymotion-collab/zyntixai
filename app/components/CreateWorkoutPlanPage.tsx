"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import ProtectedShell from "./ProtectedShell"
import ExercisePickerModal from "@/components/exercises/ExercisePickerModal"
import SelectedWorkoutExerciseList from "@/components/workouts/SelectedWorkoutExerciseList"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import Toast, { type ToastPayload } from "./Toast"
import { successToast } from "@/lib/copy/success-toasts"
import { notifyCoachingCoreChanged } from "@/lib/coaching-core/notify"
import { getCoachScope } from "@/lib/auth/coach-scope"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/client"
import {
  createPickedExercise,
  type PickedWorkoutExercise,
} from "@/lib/picked-workout-exercises"
import { insertWorkoutPlanExercises } from "@/lib/workout-exercises"
import { mergeCatalogEnrichment } from "@/lib/exercise-enrichment"
import {
  getTemplateExerciseName,
  type WorkoutTemplateExerciseRow,
} from "@/lib/workout-template-exercises"
import {
  PUSH_DAY_TEMPLATE,
  type WorkoutTemplate,
} from "@/lib/workout-templates"
import {
  premiumInputClass,
  premiumSelectClass,
  premiumTextareaClass,
} from "@/lib/ui/premium-input"

type Member = Database["public"]["Tables"]["members"]["Row"]
type Exercise = Database["public"]["Tables"]["exercises"]["Row"]

type CreateWorkoutPlanPageProps = {
  embedded?: boolean
  onCreated?: () => void
}

export default function CreateWorkoutPlanPage({
  embedded = false,
  onCreated,
}: CreateWorkoutPlanPageProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [title, setTitle] = useState("")
  const [goal, setGoal] = useState("")
  const [weeks, setWeeks] = useState("4")
  const [createForMember, setCreateForMember] = useState("")
  const [members, setMembers] = useState<Member[]>([])
  const [catalog, setCatalog] = useState<Exercise[]>([])
  const [pickedExercises, setPickedExercises] = useState<PickedWorkoutExercise[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [showTemplates, setShowTemplates] = useState(false)
  const [usingTemplateId, setUsingTemplateId] = useState<string | null>(null)

  const fieldClass = premiumInputClass
  const fieldTextareaClass = premiumTextareaClass
  const fieldSelectClass = premiumSelectClass

  async function fetchTemplates() {
    const res = await fetch("/api/workout-templates")
    const json = await res.json()

    setTemplates(json.templates || [])
  }

  useEffect(() => {
    const fetchMembers = async () => {
      const scope = await getCoachScope(supabase)

      let query = supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false })

      if (scope.isCoach && scope.userId) {
        query = query.eq("coach_id", scope.userId)
      }

      const { data } = await query
      setMembers(data ?? [])
    }

    const fetchExerciseCatalog = async () => {
      const { data } = await supabase
        .from("exercises")
        .select("*")
        .order("primary_muscle")

      setCatalog(mergeCatalogEnrichment(data ?? []))
    }

    void fetchMembers()
    void fetchExerciseCatalog()
  }, [supabase])

  useEffect(() => {
    void fetchTemplates()
  }, [])

  const resetForm = () => {
    setTitle("")
    setGoal("")
    setWeeks("4")
    setCreateForMember("")
    setPickedExercises([])
  }

  const applyPushDayTemplate = () => {
    setTitle(PUSH_DAY_TEMPLATE.title)
    setGoal(PUSH_DAY_TEMPLATE.description)

    const templateExercises = PUSH_DAY_TEMPLATE.exercises
      .map((templateExercise) => {
        const match = catalog.find(
          (exercise) =>
            exercise.name.trim().toLowerCase() ===
            templateExercise.name.trim().toLowerCase(),
        )

        if (!match) return null

        return createPickedExercise(match, {
          sets: templateExercise.sets,
          reps: String(templateExercise.reps),
        })
      })
      .filter((exercise): exercise is PickedWorkoutExercise => exercise !== null)

    setPickedExercises(templateExercises)
  }

  const handleExerciseCreated = (exercise: Exercise) => {
    setCatalog((current) => {
      if (current.some((item) => item.id === exercise.id)) {
        return current.map((item) => (item.id === exercise.id ? exercise : item))
      }

      return [...current, exercise].sort((left, right) =>
        left.name.localeCompare(right.name),
      )
    })
  }

  async function useTemplate(template: WorkoutTemplate) {
    setUsingTemplateId(template.id)
    setErrorMessage(null)
    setToast(null)

    const res = await fetch(`/api/workout-templates/${template.id}/use`, {
      method: "POST",
    })

    const json = (await res.json()) as {
      success?: boolean
      error?: string
      workout_plan_id?: string
      exercise_count?: number
    }

    setUsingTemplateId(null)

    if (!res.ok || !json.success || !json.workout_plan_id) {
      setErrorMessage(json.error || "Could not create workout from template.")
      return
    }

    const exerciseCount = json.exercise_count ?? 0
    router.push(
      `/workouts/${json.workout_plan_id}?fromTemplate=1&exercises=${exerciseCount}`,
    )
  }

  const createWorkout = async () => {
    if (!title.trim()) return

    setLoading(true)
    setErrorMessage(null)

    const scope = await getCoachScope(supabase)
    const parsedWeeks = weeks.trim() ? Number(weeks) : null

    const { data, error } = await supabase
      .from("workout_plans")
      .insert({
        title: title.trim(),
        goal: goal.trim() || null,
        weeks:
          parsedWeeks != null && !Number.isNaN(parsedWeeks) ? parsedWeeks : null,
        created_by: scope.userId,
      })
      .select()
      .single()

    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
      return
    }

    if (data && pickedExercises.length > 0) {
      const { error: exercisesError } = await insertWorkoutPlanExercises(
        supabase,
        data.id,
        pickedExercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          sets: exercise.sets,
          reps: exercise.reps,
          restSeconds: exercise.restSeconds,
          notes: exercise.notes,
        })),
      )

      if (exercisesError) {
        setErrorMessage(exercisesError.message)
        setLoading(false)
        return
      }
    }

    if (data && createForMember) {
      const { error: assignError } = await supabase
        .from("workout_assignments")
        .insert({
          member_id: createForMember,
          workout_plan_id: data.id,
          status: "active",
        })

      if (assignError) {
        setErrorMessage(assignError.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)

    if (!data) return

    if (embedded) {
      setToast(successToast("workoutCreated"))
      resetForm()
      notifyCoachingCoreChanged()
      onCreated?.()
      return
    }

    notifyCoachingCoreChanged()
    router.push(`/workouts/${data.id}?created=1`)
  }

  const saveAsTemplate = async () => {
    if (!title.trim() || pickedExercises.length === 0) return

    setLoading(true)
    setErrorMessage(null)
    setToast(null)

    const res = await fetch("/api/workout-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        goal: goal.trim() || null,
        category: "Custom",
        exercises: pickedExercises.map((exercise) => ({
          exercise_id: exercise.exerciseId,
          exercise_name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_seconds: exercise.restSeconds,
          notes: exercise.notes || null,
        })),
      }),
    })

    const json = (await res.json()) as { error?: string }

    if (!res.ok) {
      setErrorMessage(json.error || "Could not save template")
      setLoading(false)
      return
    }

    setToast(successToast("workoutTemplateSaved"))
    await fetchTemplates()
    setLoading(false)
  }

  const content = (
    <main className={embedded ? "mb-8" : "space-y-6 text-white"} data-tour="workout-builder">
      {!embedded ? (
        <>
          <Link
            href="/workouts"
            className="inline-block text-sm text-zinc-400 transition hover:text-cyan-400"
          >
            ← Back to workouts
          </Link>

          <div className="space-y-1">
            <h1 className="text-4xl font-bold sm:text-5xl">Create Workout Plan</h1>
            <p className="text-zinc-400">
              Add a title, goal, and exercises, then assign to a member if needed.
            </p>
          </div>
        </>
      ) : null}

      {errorMessage ? (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">Workout Templates</h2>
            <p className="text-sm text-gray-400">
              Load saved templates and build workouts faster.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300"
          >
            {showTemplates ? "Hide Templates" : "Show Templates"}
          </button>
        </div>

        {showTemplates ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {templates.length === 0 ? (
              <p className="text-sm text-gray-400">
                {SAAS_EMPTY.workoutTemplates.title} —{" "}
                {SAAS_EMPTY.workoutTemplates.description}
              </p>
            ) : (
              templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => void useTemplate(template)}
                  disabled={usingTemplateId !== null}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4 text-left hover:bg-white/10 disabled:opacity-50"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                    {template.category || "Template"}
                  </p>

                  <h3 className="mt-1 font-semibold text-white">
                    {template.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-400">
                    {template.workout_template_exercises?.length || 0} exercises
                  </p>

                  {template.workout_template_exercises?.length ? (
                    <ul className="mt-3 space-y-1 text-sm text-gray-300">
                      {template.workout_template_exercises
                        .slice(0, 4)
                        .map((item: WorkoutTemplateExerciseRow) => (
                          <li key={item.id}>
                            {getTemplateExerciseName(item)} · {item.sets}x{item.reps}
                          </li>
                        ))}
                      {template.workout_template_exercises.length > 4 ? (
                        <li className="text-gray-500">
                          +{template.workout_template_exercises.length - 4} more
                        </li>
                      ) : null}
                    </ul>
                  ) : null}

                  <p className="mt-3 text-sm text-emerald-400">
                    {usingTemplateId === template.id
                      ? "Creating workout..."
                      : "Use Template →"}
                  </p>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">
            {embedded ? "Create Workout Plan" : "Plan details"}
          </h2>
          <button
            type="button"
            onClick={applyPushDayTemplate}
            className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition hover:border-cyan-500 hover:bg-cyan-500/20"
          >
            Use Push Day template
          </button>
        </div>

        <select
          className={fieldSelectClass}
          value={createForMember}
          onChange={(e) => setCreateForMember(e.target.value)}
        >
          <option value="" className="bg-zinc-900">
            Assign to member (optional)
          </option>
          {members.map((member) => (
            <option key={member.id} value={member.id} className="bg-zinc-900">
              {member.full_name || member.email}
            </option>
          ))}
        </select>

        <input
          className={fieldClass}
          placeholder="Workout title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className={`h-32 ${fieldTextareaClass}`}
          placeholder="Goal / description"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <input
          className={fieldClass}
          placeholder="Weeks"
          value={weeks}
          onChange={(e) => setWeeks(e.target.value)}
        />

        <div className="glass-panel space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-white">Exercises</h3>
              <p className="mt-1 text-sm text-slate-400">
                {pickedExercises.length > 0
                  ? `${pickedExercises.length} exercise${pickedExercises.length === 1 ? "" : "s"} · drag to reorder`
                  : "Build your workout with premium exercise cards."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="btn-gradient shrink-0"
            >
              Pick exercises
            </button>
          </div>

          <SelectedWorkoutExerciseList
            exercises={pickedExercises}
            catalog={catalog}
            onChange={setPickedExercises}
            summaryTitle={title.trim() || "Untitled workout"}
            emptyTitle={SAAS_EMPTY.workoutExercisesSelected.title}
            emptyDescription={SAAS_EMPTY.workoutExercisesSelected.description}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => void createWorkout()}
            disabled={loading || !title.trim()}
            className="rounded-xl bg-cyan-500 px-6 py-3 font-medium text-black transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : createForMember
                ? "Create & assign"
                : "Create workout plan"}
          </button>

          <button
            type="button"
            onClick={() => void saveAsTemplate()}
            disabled={loading || pickedExercises.length === 0 || !title.trim()}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 font-semibold text-emerald-300 transition hover:border-emerald-500/50 hover:bg-emerald-500/20 disabled:opacity-40"
          >
            Save as Template
          </button>
        </div>
      </div>

      <ExercisePickerModal
        open={pickerOpen}
        catalog={catalog}
        initialExercises={pickedExercises}
        variant="dark"
        onClose={() => setPickerOpen(false)}
        onExerciseCreated={handleExerciseCreated}
        onSave={(exercises) => {
          setPickedExercises(exercises)
          setPickerOpen(false)
        }}
      />
      {toast ? (
        <Toast
          title={toast.title}
          description={toast.description}
          variant={toast.variant ?? "success"}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </main>
  )

  if (embedded) {
    return content
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>{content}</ProtectedShell>
  )
}
