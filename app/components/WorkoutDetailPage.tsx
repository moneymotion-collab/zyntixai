"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import ProtectedShell from "./ProtectedShell"
import ExerciseDetailContent from "@/components/exercises/ExerciseDetailContent"
import ExercisePickerModal from "@/components/exercises/ExercisePickerModal"
import WorkoutSummaryCard from "@/components/workouts/WorkoutSummaryCard"
import EmptyState from "@/components/ui/empty-state"
import Toast, { type ToastPayload } from "./Toast"
import { successToast } from "@/lib/copy/success-toasts"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { getCoachScope } from "@/lib/auth/coach-scope"
import type { Database } from "@/lib/database.types"
import {
  mapPlanRowToPicked,
  type PickedWorkoutExercise,
} from "@/lib/picked-workout-exercises"
import { createClient } from "@/lib/supabase/client"
import { premiumSelectClass } from "@/lib/ui/premium-input"
import { assignWorkoutToMember } from "@/lib/workout-assignments"
import { notifyCoachingCoreChanged } from "@/lib/coaching-core/notify"
import {
  fetchExercisesByPlanIds,
  insertWorkoutPlanExercises,
  isWorkoutPlanExercisesSchemaError,
  mapWorkoutPlanExercise,
  WORKOUT_PLAN_EXERCISES_MIGRATION_HINT,
  WORKOUT_PLAN_EXERCISES_SELECT,
  type WorkoutExerciseSummary,
  type WorkoutPlanExerciseRow,
} from "@/lib/workout-exercises"

type WorkoutPlan = Database["public"]["Tables"]["workout_plans"]["Row"] & {
  workout_plan_exercises: WorkoutExerciseSummary[]
  workout_exercises: WorkoutPlanExerciseRow[]
}
type Exercise = Database["public"]["Tables"]["exercises"]["Row"]
type Member = Database["public"]["Tables"]["members"]["Row"]
type WorkoutCompletion = Database["public"]["Tables"]["workout_completions"]["Row"] & {
  members: Pick<Member, "full_name" | "email"> | null
}

type WorkoutDetailPageProps = {
  workoutPlanId: string
}

export default function WorkoutDetailPage({
  workoutPlanId,
}: WorkoutDetailPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const [workout, setWorkout] = useState<WorkoutPlan | null>(null)
  const [planExerciseRows, setPlanExerciseRows] = useState<WorkoutPlanExerciseRow[]>([])
  const planExercises = useMemo(
    () => planExerciseRows.map(mapWorkoutPlanExercise),
    [planExerciseRows],
  )
  const [catalog, setCatalog] = useState<Exercise[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([])
  const [performance, setPerformance] = useState({
    activeMembers: 0,
    completionRate: 0,
    weeklyCompletions: 0,
    assignedWorkouts: 0,
  })
  const [pageLoading, setPageLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [selectedMember, setSelectedMember] = useState("")
  const [pickerOpen, setPickerOpen] = useState(false)
  const [savingExercises, setSavingExercises] = useState(false)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  useEffect(() => {
    if (searchParams.get("created") === "1" && !pageLoading && workout) {
      setToast(successToast("workoutCreated"))
      router.replace(`/workouts/${workoutPlanId}`, { scroll: false })
      return
    }

    if (searchParams.get("fromTemplate") !== "1" || pageLoading || !workout) {
      return
    }

    const expectedExercises = Number(searchParams.get("exercises") ?? "0")
    if (Number.isNaN(expectedExercises) || planExerciseRows.length < expectedExercises) {
      return
    }

    setToast(successToast("workoutCreated"))
    router.replace(`/workouts/${workoutPlanId}`, { scroll: false })
  }, [
    pageLoading,
    planExerciseRows.length,
    router,
    searchParams,
    workout,
    workoutPlanId,
  ])

  const fetchPlanExercises = useCallback(async () => {
    const { data, error } = await supabase
      .from("workout_plan_exercises")
      .select(WORKOUT_PLAN_EXERCISES_SELECT)
      .eq("workout_plan_id", workoutPlanId)
      .order("order_index", { ascending: true })

    if (!error) {
      const rows = (data ?? []) as WorkoutPlanExerciseRow[]
      setPlanExerciseRows(rows)
      setWorkout((prev) =>
        prev
          ? {
              ...prev,
              workout_exercises: rows,
              workout_plan_exercises: rows.map(mapWorkoutPlanExercise),
            }
          : prev,
      )
    }
  }, [supabase, workoutPlanId])

  const loadWorkout = useCallback(async () => {
    setPageLoading(true)
    setErrorMessage(null)

    const scope = await getCoachScope(supabase)

    let query = supabase
      .from("workout_plans")
      .select(`*, workout_plan_exercises ( ${WORKOUT_PLAN_EXERCISES_SELECT} )`)
      .eq("id", workoutPlanId)

    if (scope.isCoach && scope.userId) {
      query = query.eq("created_by", scope.userId)
    }

    const { data: workout, error } = await query.maybeSingle()

    if (error && isWorkoutPlanExercisesSchemaError(error.message)) {
      let plainQuery = supabase
        .from("workout_plans")
        .select("*")
        .eq("id", workoutPlanId)

      if (scope.isCoach && scope.userId) {
        plainQuery = plainQuery.eq("created_by", scope.userId)
      }

      const { data: plainPlan, error: plainError } = await plainQuery.maybeSingle()

      if (plainError || !plainPlan) {
        setErrorMessage(plainError?.message ?? WORKOUT_PLAN_EXERCISES_MIGRATION_HINT)
        setWorkout(null)
        setPlanExerciseRows([])
      } else {
        const { rows, error: exercisesError } = await fetchExercisesByPlanIds(
          supabase,
          [plainPlan.id],
        )

        if (exercisesError) {
          setErrorMessage(
            isWorkoutPlanExercisesSchemaError(exercisesError.message)
              ? WORKOUT_PLAN_EXERCISES_MIGRATION_HINT
              : exercisesError.message,
          )
          setWorkout({
            ...plainPlan,
            workout_exercises: [],
            workout_plan_exercises: [],
          })
          setPlanExerciseRows([])
        } else {
          setErrorMessage(null)
          setWorkout({
            ...plainPlan,
            workout_exercises: rows,
            workout_plan_exercises: rows.map(mapWorkoutPlanExercise),
          })
          setPlanExerciseRows(rows)
        }
      }
    } else if (error) {
      setErrorMessage(error.message)
      setWorkout(null)
      setPlanExerciseRows([])
    } else if (!workout) {
      setWorkout(null)
      setPlanExerciseRows([])
    } else {
      const plan = workout as Database["public"]["Tables"]["workout_plans"]["Row"] & {
        workout_plan_exercises: WorkoutPlanExerciseRow[] | null
      }
      const rows = plan.workout_plan_exercises ?? []
      setWorkout({
        ...plan,
        workout_exercises: rows,
        workout_plan_exercises: rows.map(mapWorkoutPlanExercise),
      })
      setPlanExerciseRows(rows)
    }

    setPageLoading(false)
  }, [supabase, workoutPlanId])

  useEffect(() => {
    void loadWorkout()
  }, [loadWorkout])

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase.from("members").select("*")

      setMembers(data || [])
    }

    void fetchMembers()
  }, [supabase])

  useEffect(() => {
    const fetchExerciseCatalog = async () => {
      const { data: exerciseCatalog } = await supabase
        .from("exercises")
        .select("*")
        .order("primary_muscle")

      setCatalog(exerciseCatalog ?? [])
    }

    void fetchExerciseCatalog()
  }, [supabase])

  useEffect(() => {
    const fetchCompletions = async () => {
      const { data } = await supabase
        .from("workout_completions")
        .select("id, workout_plan_id, member_id, completed_at, members ( full_name, email )")
        .eq("workout_plan_id", workoutPlanId)
        .order("completed_at", { ascending: false })

      setCompletions(data ?? [])
    }

    void fetchCompletions()
  }, [supabase, workoutPlanId])

  useEffect(() => {
    const fetchPerformance = async () => {
      const { count: totalMembers } = await supabase
        .from("members")
        .select("*", {
          count: "exact",
          head: true,
        })

      const { count: assignedWorkouts } = await supabase
        .from("member_workout_assignments")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("workout_plan_id", workoutPlanId)

      const { count: completedWorkouts } = await supabase
        .from("workout_completions")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("workout_plan_id", workoutPlanId)

      const completionRate =
        assignedWorkouts && assignedWorkouts > 0
          ? Math.round(
              ((completedWorkouts || 0) / assignedWorkouts) * 100,
            )
          : 0

      setPerformance({
        activeMembers: totalMembers || 0,
        completionRate,
        weeklyCompletions: completedWorkouts || 0,
        assignedWorkouts: assignedWorkouts || 0,
      })
    }

    void fetchPerformance()
  }, [supabase, workoutPlanId])

  const pickerInitialExercises = useMemo(
    () => planExerciseRows.map(mapPlanRowToPicked),
    [planExerciseRows],
  )

  const savePlanExercises = async (picked: PickedWorkoutExercise[]) => {
    if (!workout) return

    setSavingExercises(true)
    setErrorMessage(null)

    const { error: deleteError } = await supabase
      .from("workout_plan_exercises")
      .delete()
      .eq("workout_plan_id", workout.id)

    if (deleteError) {
      setErrorMessage(deleteError.message)
      setSavingExercises(false)
      return
    }

    const { error: insertError } = await insertWorkoutPlanExercises(
      supabase,
      workout.id,
      picked.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        sets: exercise.sets,
        reps: exercise.reps,
        restSeconds: exercise.restSeconds,
      })),
    )

    if (insertError) {
      setErrorMessage(insertError.message)
      setSavingExercises(false)
      return
    }

    await fetchPlanExercises()
    setPickerOpen(false)
    setSavingExercises(false)
  }

  const assignWorkout = async () => {
    if (!selectedMember || !workout) return

    setAssigning(true)
    const supabase = createClient()

    const result = await assignWorkoutToMember(supabase, {
      memberId: selectedMember,
      workoutPlanId: workout.id,
    })

    setAssigning(false)

    if (!result.success) {
      setErrorMessage(result.message)
      setToast({
        title: "Could not assign workout",
        description: result.message,
        variant: "error",
      })
      return
    }

    setToast(successToast("workoutAssigned"))
    setShowAssign(false)
    notifyCoachingCoreChanged()
  }

  if (pageLoading) {
    return (
      <ProtectedShell allowed={["admin", "coach"]}>
        <div className="p-6 text-gray-500">Loading workout…</div>
      </ProtectedShell>
    )
  }

  if (!workout) {
    return (
      <ProtectedShell allowed={["admin", "coach"]}>
        <div className="space-y-4 p-6">
          <p className="text-red-600">
            {errorMessage ?? "Workout plan not found."}
          </p>
          <Link href="/workouts" className="text-cyan-600 hover:underline">
            ← Back to workouts
          </Link>
        </div>
      </ProtectedShell>
    )
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <main className="space-y-6 p-4 sm:p-6">
        <div>
          <Link
            href="/workouts"
            className="text-sm text-gray-500 transition hover:text-black"
          >
            ← Back to workouts
          </Link>
          <div className="mt-3 space-y-1">
            <h1 className="text-2xl font-bold">{workout.title}</h1>
            <p className="text-gray-500">{workout.goal}</p>
            {workout.weeks ? (
              <p className="text-sm text-gray-500">{workout.weeks} weeks</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setShowAssign(true)}
            className="mt-4 rounded-xl bg-black px-4 py-2 text-white transition hover:bg-gray-800"
          >
            Assign to Member
          </button>

          {showAssign && (
            <div className="border rounded-xl p-4 mt-4 bg-white shadow">
              <h3 className="font-semibold mb-2">Assign Workout</h3>

              <select
                className={premiumSelectClass}
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                <option value="">Select member</option>

                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name || m.email}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => void assignWorkout()}
                disabled={assigning || !selectedMember}
                className="bg-black text-white px-4 py-2 rounded w-full mt-3 disabled:opacity-50"
                aria-busy={assigning}
              >
                {assigning ? "Assigning…" : "Assign"}
              </button>
            </div>
          )}
        </div>

        <WorkoutSummaryCard
          title={workout.title}
          exercises={workout.workout_exercises || []}
        />

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Exercises</h2>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Pick exercises
            </button>
          </div>

          {planExercises.length === 0 ? (
            <EmptyState {...SAAS_EMPTY.workoutExercises} variant="light" compact />
          ) : (
            <div className="mt-2 space-y-4">
              {planExerciseRows.map((row, index) => (
                <div
                  key={row.id}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  <ExerciseDetailContent
                    index={index + 1}
                    name={row.exercises?.name ?? "Unknown exercise"}
                    primaryMuscle={row.exercises?.primary_muscle ?? "General"}
                    equipment={row.exercises?.equipment ?? "Varies"}
                    difficulty={row.exercises?.difficulty ?? "Intermediate"}
                    instructions={row.exercises?.instructions ?? ""}
                    coachNote={row.exercises?.tips}
                    sets={row.sets}
                    reps={row.reps}
                    restSeconds={row.rest_seconds}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <ExercisePickerModal
          open={pickerOpen}
          catalog={catalog}
          initialExercises={pickerInitialExercises}
          saving={savingExercises}
          onClose={() => setPickerOpen(false)}
          onSave={(exercises) => void savePlanExercises(exercises)}
        />

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Performance Overview</h2>

            <p className="text-sm text-muted-foreground">
              Member engagement and coaching performance.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border p-5">
              <p className="text-sm text-muted-foreground">Completion Rate</p>

              <p className="mt-2 text-3xl font-bold">
                {performance.completionRate}%
              </p>
            </div>

            <div className="rounded-2xl border p-5">
              <p className="text-sm text-muted-foreground">Active Members</p>

              <p className="mt-2 text-3xl font-bold">
                {performance.activeMembers}
              </p>
            </div>

            <div className="rounded-2xl border p-5">
              <p className="text-sm text-muted-foreground">Assigned Workouts</p>

              <p className="mt-2 text-3xl font-bold">
                {performance.assignedWorkouts}
              </p>
            </div>

            <div className="rounded-2xl border p-5">
              <p className="text-sm text-muted-foreground">
                Workout Completions
              </p>

              <p className="mt-2 text-3xl font-bold">
                {performance.weeklyCompletions}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border p-5">
            <h3 className="font-semibold">Coaching Insight</h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Members are completing{" "}
              <span className="font-medium">
                {performance.completionRate}%
              </span>{" "}
              of assigned workouts.
            </p>
          </div>

          {completions.length === 0 ? (
            <EmptyState {...SAAS_EMPTY.workoutCompletions} variant="light" compact />
          ) : (
            <div className="space-y-2">
              {completions.map((completion) => (
                <div
                  key={completion.id}
                  className="rounded-xl border p-3"
                >
                  <p className="font-medium">
                    {completion.members?.full_name ||
                      completion.members?.email ||
                      "Member"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(completion.completed_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {toast ? (
        <Toast
          title={toast.title}
          description={toast.description}
          variant={toast.variant ?? "success"}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </ProtectedShell>
  )
}
