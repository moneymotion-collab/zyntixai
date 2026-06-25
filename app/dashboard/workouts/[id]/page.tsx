"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import ProtectedShell from "@/app/components/ProtectedShell"
import WorkoutSummaryCard from "@/components/workouts/WorkoutSummaryCard"
import TodayWorkoutView from "@/components/workouts/TodayWorkoutView"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { getCoachScope } from "@/lib/auth/coach-scope"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/client"
import {
  fetchExercisesByPlanIds,
  isWorkoutPlanExercisesSchemaError,
  mapWorkoutPlanExercise,
  WORKOUT_PLAN_EXERCISES_MIGRATION_HINT,
  WORKOUT_PLAN_EXERCISES_SELECT,
  type WorkoutExerciseSummary,
  type WorkoutPlanExerciseRow,
} from "@/lib/workout-exercises"

type WorkoutPlan = Database["public"]["Tables"]["workout_plans"]["Row"] & {
  workout_exercises: WorkoutPlanExerciseRow[]
  workout_plan_exercises: WorkoutExerciseSummary[]
}

export default function DashboardWorkoutDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = useMemo(() => createClient(), [])

  const [workout, setWorkout] = useState<WorkoutPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadWorkout = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setErrorMessage(null)

    const scope = await getCoachScope(supabase)

    let query = supabase
      .from("workout_plans")
      .select(`*, workout_plan_exercises ( ${WORKOUT_PLAN_EXERCISES_SELECT} )`)
      .eq("id", id)

    if (scope.isCoach && scope.userId) {
      query = query.eq("created_by", scope.userId)
    }

    const { data, error } = await query.maybeSingle()

    if (error && isWorkoutPlanExercisesSchemaError(error.message)) {
      let plainQuery = supabase.from("workout_plans").select("*").eq("id", id)

      if (scope.isCoach && scope.userId) {
        plainQuery = plainQuery.eq("created_by", scope.userId)
      }

      const { data: plainPlan, error: plainError } = await plainQuery.maybeSingle()

      if (plainError || !plainPlan) {
        setErrorMessage(plainError?.message ?? WORKOUT_PLAN_EXERCISES_MIGRATION_HINT)
        setWorkout(null)
        setLoading(false)
        return
      }

      const { rows, error: exercisesError } = await fetchExercisesByPlanIds(
        supabase,
        [plainPlan.id],
      )

      if (exercisesError) {
        setErrorMessage(exercisesError.message)
        setWorkout({
          ...plainPlan,
          workout_exercises: [],
          workout_plan_exercises: [],
        })
      } else {
        setWorkout({
          ...plainPlan,
          workout_exercises: rows,
          workout_plan_exercises: rows.map(mapWorkoutPlanExercise),
        })
      }
    } else if (error) {
      setErrorMessage(error.message)
      setWorkout(null)
    } else if (!data) {
      setWorkout(null)
    } else {
      const plan = data as Database["public"]["Tables"]["workout_plans"]["Row"] & {
        workout_plan_exercises: WorkoutPlanExerciseRow[] | null
      }
      const rows = plan.workout_plan_exercises ?? []

      setWorkout({
        ...plan,
        workout_exercises: rows,
        workout_plan_exercises: rows.map(mapWorkoutPlanExercise),
      })
    }

    setLoading(false)
  }, [id, supabase])

  useEffect(() => {
    void loadWorkout()
  }, [loadWorkout])

  if (!id) {
    return null
  }

  if (loading) {
    return (
      <ProtectedShell allowed={["admin", "coach"]}>
        <div className="p-6 text-slate-400">Loading workout…</div>
      </ProtectedShell>
    )
  }

  if (!workout) {
    return (
      <ProtectedShell allowed={["admin", "coach"]}>
        <div className="mx-auto max-w-4xl space-y-4 p-6">
          <p className="text-rose-300">
            {errorMessage ?? "Workout plan not found."}
          </p>
          <Link
            href="/workouts"
            className="text-sm text-emerald-400 transition hover:text-emerald-300"
          >
            ← Back to workouts
          </Link>
        </div>
      </ProtectedShell>
    )
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        <header className="space-y-4">
          <Link
            href="/workouts"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to workouts
          </Link>

          {workout.goal ? (
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
              {workout.goal}
            </p>
          ) : null}

          {workout.weeks ? (
            <p className="text-sm text-slate-400">{workout.weeks} weeks</p>
          ) : null}
        </header>

        <WorkoutSummaryCard
          title={workout.title}
          exercises={workout.workout_exercises || []}
        />

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Exercises</h2>
            <p className="mt-1 text-sm text-slate-400">
              {workout.workout_plan_exercises.length > 0
                ? `${workout.workout_plan_exercises.length} exercise${workout.workout_plan_exercises.length === 1 ? "" : "s"} in this plan`
                : SAAS_EMPTY.workoutExercises.title}
            </p>
          </div>

          {workout.workout_plan_exercises.length === 0 ? (
            <SaasEmptyState preset="workoutExercises" />
          ) : (
            <TodayWorkoutView
              exercises={workout.workout_plan_exercises}
              checkedIds={new Set()}
              onToggleExercise={() => {}}
            />
          )}
        </section>
      </div>
    </ProtectedShell>
  )
}
