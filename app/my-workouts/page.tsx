"use client"

import { useMemo, useState } from "react"
import MyWorkoutCard from "../components/MyWorkoutCard"
import ProtectedShell from "../components/ProtectedShell"
import Toast, { type ToastPayload } from "../components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"
import EmptyState from "@/components/ui/empty-state"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { WorkoutCardSkeleton } from "@/components/ui/skeleton"
import { useMyWorkouts } from "../hooks/useMyWorkouts"
import { completeWorkoutAssignment } from "@/lib/complete-workout"
import { getTodaysWorkoutAssignment } from "@/lib/my-workouts"
import { createClient } from "@/lib/supabase/client"

export default function MyWorkoutsPage() {
  const supabase = createClient()
  const {
    assignments,
    noMemberProfile,
    loading,
    error,
    refetch,
  } = useMyWorkouts()
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [completedToast, setCompletedToast] = useState<ToastPayload | null>(null)

  const todaysAssignment = useMemo(
    () => getTodaysWorkoutAssignment(assignments),
    [assignments],
  )

  const otherAssignments = useMemo(
    () =>
      todaysAssignment
        ? assignments.filter((assignment) => assignment.id !== todaysAssignment.id)
        : [],
    [assignments, todaysAssignment],
  )

  const completeWorkout = async (assignmentId: string) => {
    setCompletingId(assignmentId)

    const { error: updateError } = await completeWorkoutAssignment(
      supabase,
      assignmentId,
    )

    setCompletingId(null)

    if (updateError) {
      reportSupabaseError("[MyWorkoutsPage] complete workout failed", updateError, {
        setToast: setCompletedToast,
        toastTitle: "Could not mark workout complete",
      })
      return
    }

    setCompletedToast(successToast("workoutCompleted"))
    await refetch()
  }

  return (
    <ProtectedShell allowed={["admin", "member"]}>
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-gradient">My Workouts</span>
          </h1>
          <p className="mt-3 text-slate-400">
            Start today&apos;s workout, track each exercise, and mark it complete.
          </p>
        </header>

        {error ? (
          <div
            role="alert"
            className="glass-panel border-rose-500/30 bg-rose-500/10 p-6"
          >
            <p className="font-medium text-rose-200">Failed to load workouts</p>
            <p className="mt-1 text-sm text-rose-300/90">{error}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="btn-gradient mt-5"
            >
              Try again
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-6" aria-busy="true">
            <WorkoutCardSkeleton />
            <WorkoutCardSkeleton />
          </div>
        ) : noMemberProfile ? (
          <EmptyState
            {...SAAS_EMPTY.memberProfile}
          />
        ) : assignments.length === 0 ? (
          <EmptyState
            {...SAAS_EMPTY.memberWorkouts}
          />
        ) : (
          <div className="grid gap-6">
            {todaysAssignment ? (
              <MyWorkoutCard
                key={todaysAssignment.id}
                assignment={todaysAssignment}
                highlightAsToday
                onComplete={
                  todaysAssignment.status === "completed"
                    ? undefined
                    : completeWorkout
                }
                completing={completingId === todaysAssignment.id}
              />
            ) : null}

            {otherAssignments.length > 0 ? (
              <section className="space-y-5">
                <h2 className="text-xl font-semibold text-white">Other workouts</h2>
                {otherAssignments.map((assignment) => (
                  <MyWorkoutCard
                    key={assignment.id}
                    assignment={assignment}
                    onComplete={
                      assignment.status === "completed" ? undefined : completeWorkout
                    }
                    completing={completingId === assignment.id}
                  />
                ))}
              </section>
            ) : null}
          </div>
        )}
      </div>

      {completedToast ? (
        <Toast
          title={completedToast.title}
          description={completedToast.description}
          variant={completedToast.variant ?? "success"}
          onDismiss={() => setCompletedToast(null)}
        />
      ) : null}
    </ProtectedShell>
  )
}
