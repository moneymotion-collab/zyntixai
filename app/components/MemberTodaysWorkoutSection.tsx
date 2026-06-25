"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import MyWorkoutCard from "@/app/components/MyWorkoutCard"
import EmptyState from "@/components/ui/empty-state"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { WorkoutCardSkeleton } from "@/components/ui/skeleton"
import { useMyWorkouts } from "@/app/hooks/useMyWorkouts"
import { completeWorkoutAssignment } from "@/lib/complete-workout"
import { getTodaysWorkoutAssignment } from "@/lib/my-workouts"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"
import { createClient } from "@/lib/supabase/client"

export default function MemberTodaysWorkoutSection() {
  const supabase = createClient()
  const { assignments, loading, noMemberProfile, refetch } = useMyWorkouts()
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const todaysAssignment = useMemo(
    () => getTodaysWorkoutAssignment(assignments),
    [assignments],
  )

  const completeWorkout = async (assignmentId: string) => {
    setCompletingId(assignmentId)

    const { error: updateError } = await completeWorkoutAssignment(
      supabase,
      assignmentId,
    )

    setCompletingId(null)

    if (updateError) {
      reportSupabaseError(
        "[MemberTodaysWorkoutSection] complete workout failed",
        updateError,
        {
          setToast,
          toastTitle: "Could not mark workout complete",
        },
      )
      return
    }

    await refetch()
  }

  if (loading) {
    return <WorkoutCardSkeleton />
  }

  if (noMemberProfile) {
    return (
      <EmptyState
        eyebrow="Member profile"
        title="Link your member profile"
        description="Ask your coach to add you with the same email you use to sign in."
      />
    )
  }

  if (!todaysAssignment) {
    return (
      <EmptyState
        {...SAAS_EMPTY.todayWorkout}
        action={
          <Link href="/my-workouts" className="btn-ghost">
            Open My Workouts
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-5">
      <MyWorkoutCard
        assignment={todaysAssignment}
        highlightAsToday
        onComplete={
          todaysAssignment.status === "completed" ? undefined : completeWorkout
        }
        completing={completingId === todaysAssignment.id}
      />
      <div className="text-center">
        <Link
          href="/my-workouts"
          className="text-sm font-medium text-slate-400 transition hover:text-indigo-300"
        >
          View all workouts
        </Link>
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
