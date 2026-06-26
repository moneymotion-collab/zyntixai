"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import AssignWorkoutModal from "../components/AssignWorkoutModal"
import EditWorkoutPlanModal from "../components/EditWorkoutPlanModal"
import ProtectedShell from "../components/ProtectedShell"
import Toast, { type ToastPayload } from "../components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import Button from "@/components/ui/button"
import ErrorStateBanner from "@/components/ui/error-state-banner"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import { WorkoutsPageSkeleton } from "@/components/ui/page-skeletons"
import { useWorkoutAssignments } from "../hooks/useWorkoutAssignments"
import type { Database } from "@/lib/database.types"
import type { CoachWorkoutAssignment } from "@/lib/types/workout-assignments"
import { assignWorkoutToMember } from "@/lib/workout-assignments"
import { getCoachScope } from "@/lib/auth/coach-scope"
import { filterDemoRowsForWorkspace } from "@/lib/demo/workspace-data-filter"
import { fetchCoachMembersList } from "@/lib/member-status"
import {
  fetchWorkoutPlansWithExercises,
  type WorkoutExerciseSummary,
  WORKOUT_PLAN_EXERCISES_MIGRATION_HINT,
} from "@/lib/workout-exercises"
import { notifyCoachingCoreChanged } from "@/lib/coaching-core/notify"
import {
  reportSupabaseError,
  type ReportSupabaseErrorToast,
} from "@/lib/errors/reportSupabaseError"
import { createClient } from "@/lib/supabase/client"
import { fetchWorkspaceMode } from "@/lib/workspace/workspace-mode"
import SaasPageHeader from "@/components/ui/saas-page-header"
import SaasSectionHeader from "@/components/ui/saas-section-header"
import {
  SAAS_BTN_DESTRUCTIVE,
  SAAS_BTN_PRIMARY,
  SAAS_BTN_SECONDARY,
  SAAS_PAGE_CARD,
  SAAS_PAGE_GRID,
  SAAS_PAGE_MAIN,
  SAAS_PAGE_SECTION_GAP,
} from "@/lib/ui/saas-page-layout"

type WorkoutPlan = Database["public"]["Tables"]["workout_plans"]["Row"] & {
  workout_plan_exercises: WorkoutExerciseSummary[]
}
type Member = Database["public"]["Tables"]["members"]["Row"]

type ToastState = ToastPayload & { variant: "success" | "error" }

export default function WorkoutsPage() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const {
    assignments,
    loading: assignmentsLoading,
    refetch: refetchAssignments,
  } = useWorkoutAssignments()
  const [pageLoading, setPageLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const showErrorToast = useCallback((payload: ReportSupabaseErrorToast) => {
    setToast({
      title: payload.title,
      description: payload.description,
      variant: payload.variant ?? "error",
    })
  }, [])
  const [editCloseSignal, setEditCloseSignal] = useState(0)
  const [assignCloseSignal, setAssignCloseSignal] = useState(0)
  const [assignModalPlan, setAssignModalPlan] = useState<WorkoutPlan | null>(
    null,
  )
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null)
  const [modalMemberId, setModalMemberId] = useState("")
  const [modalError, setModalError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [assignSaving, setAssignSaving] = useState(false)
  const [editSaving, setEditSaving] = useState(false)

  const fetchWorkoutPlans = async () => {
    const scope = await getCoachScope(supabase)

    const { plans, error, schemaMissing } = await fetchWorkoutPlansWithExercises(
      supabase,
      { coachUserId: scope.isCoach ? scope.userId : null },
    )

    if (error) {
      reportSupabaseError("[workouts] load plans failed", error, {
        setError: setErrorMessage,
        fallbackMessage: schemaMissing
          ? WORKOUT_PLAN_EXERCISES_MIGRATION_HINT
          : "Could not load workout plans.",
      })
      if (schemaMissing && plans.length > 0) {
        setWorkoutPlans(plans)
      }
      return
    }

    setErrorMessage(null)
    const workspaceMode =
      scope.userId != null
        ? await fetchWorkspaceMode(supabase, scope.userId)
        : ("live" as const)
    setWorkoutPlans(filterDemoRowsForWorkspace(plans, workspaceMode))
  }

  const fetchMembers = async () => {
    const { data, error } = await fetchCoachMembersList(supabase)

    if (error) {
      console.error(error.message)
      return
    }

    setMembers(data)
  }

  useEffect(() => {
    void Promise.all([fetchWorkoutPlans(), fetchMembers()]).finally(() => {
      setPageLoading(false)
    })
  }, [])

  const assignMemberParam = searchParams.get("assignMember")

  useEffect(() => {
    if (!assignMemberParam || members.length === 0 || pageLoading) return
    if (!members.some((member) => member.id === assignMemberParam)) return

    setModalMemberId(assignMemberParam)
    setToast({
      title: "Ready to assign",
      description: "Choose a workout plan and click Assign — member is pre-selected.",
      variant: "success",
    })
  }, [assignMemberParam, members, pageLoading])

  const plansByMember = useMemo(() => {
    const map = new Map<string, CoachWorkoutAssignment[]>()

    for (const member of members) {
      map.set(member.id, [])
    }

    for (const assignment of assignments) {
      const list = map.get(assignment.member_id) ?? []
      list.push(assignment)
      map.set(assignment.member_id, list)
    }

    return map
  }, [members, assignments])

  const assignmentsByPlan = useMemo(() => {
    const map = new Map<string, CoachWorkoutAssignment[]>()

    for (const assignment of assignments) {
      const list = map.get(assignment.workout_plan_id) ?? []
      list.push(assignment)
      map.set(assignment.workout_plan_id, list)
    }

    return map
  }, [assignments])

  const openAssignModal = (plan: WorkoutPlan, preselectedMemberId?: string) => {
    setAssignModalPlan(plan)
    setModalMemberId(preselectedMemberId ?? modalMemberId)
    setModalError(null)
  }

  const closeAssignModal = () => {
    setAssignModalPlan(null)
    setModalMemberId("")
    setModalError(null)
  }

  const closeEditModal = () => {
    setEditingPlan(null)
    setEditError(null)
  }

  const saveWorkoutPlan = async (updates: {
    title: string
    goal: string | null
    weeks: number | null
  }) => {
    if (!editingPlan) {
      return
    }

    setEditSaving(true)
    setEditError(null)

    const { error } = await supabase
      .from("workout_plans")
      .update({
        title: updates.title,
        goal: updates.goal,
        weeks: updates.weeks,
      })
      .eq("id", editingPlan.id)

    setEditSaving(false)

    if (error) {
      reportSupabaseError("[workouts] save plan failed", error, {
        setError: setEditError,
        setToast: showErrorToast,
      })
      return
    }

    setEditCloseSignal((current) => current + 1)
    setToast({ ...successToast("workoutUpdated"), variant: "success" })
    await fetchWorkoutPlans()
    notifyCoachingCoreChanged()
  }

  const saveAssignment = async () => {
    if (!assignModalPlan || !modalMemberId) {
      setModalError("Select a member first.")
      return
    }

    setAssignSaving(true)
    setModalError(null)

    const result = await assignWorkoutToMember(supabase, {
      memberId: modalMemberId,
      workoutPlanId: assignModalPlan.id,
    })

    setAssignSaving(false)

    if (!result.success) {
      reportSupabaseError("[workouts] assign workout failed", result.message, {
        setError: setModalError,
        setToast: showErrorToast,
      })
      return
    }

    const member = members.find((m) => m.id === modalMemberId)
    setAssignCloseSignal((current) => current + 1)
    closeAssignModal()
    setToast({
      ...successToast("workoutAssigned", {
        description: `${member?.full_name ?? "Member"} can now follow this plan.`,
      }),
      variant: "success",
    })
    await refetchAssignments()
    notifyCoachingCoreChanged()
  }

  const removeAssignment = async (memberId: string, workoutPlanId: string) => {
    setErrorMessage(null)

    const { error } = await supabase
      .from("workout_assignments")
      .delete()
      .eq("member_id", memberId)
      .eq("workout_plan_id", workoutPlanId)

    if (error) {
      reportSupabaseError("[workouts] remove assignment failed", error, {
        setError: setErrorMessage,
        setToast: showErrorToast,
      })
      return
    }

    setToast({ ...successToast("workoutAssignmentRemoved"), variant: "success" })
    await refetchAssignments()
    notifyCoachingCoreChanged()
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <main className={SAAS_PAGE_MAIN}>
        <SaasPageHeader
          eyebrow="Training library"
          title="Workout Plans"
          description="Create plans and assign them to members."
          action={
            <Link href="/workouts/new" className={SAAS_BTN_PRIMARY}>
              Create Workout Plan
            </Link>
          }
        />

        {errorMessage ? (
          <ErrorStateBanner
            title="Could not load workouts"
            message={errorMessage}
            onRetry={() => {
              setPageLoading(true)
              setErrorMessage(null)
              void Promise.all([
                fetchWorkoutPlans(),
                fetchMembers(),
                refetchAssignments(),
              ]).finally(() => setPageLoading(false))
            }}
            embedded
            className="mb-4"
          />
        ) : null}

        {pageLoading || assignmentsLoading ? (
          <WorkoutsPageSkeleton />
        ) : (
          <>
        <div className={SAAS_PAGE_SECTION_GAP}>
        <section>
          <SaasSectionHeader title="Member workout plans" />

          {members.length === 0 ? (
            <SaasEmptyState preset="workoutMembersRequired" />
          ) : (
            <div className={SAAS_PAGE_GRID}>
              {members.map((member) => {
                const memberPlans = plansByMember.get(member.id) ?? []

                return (
                  <div
                    key={member.id}
                    className={SAAS_PAGE_CARD}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold">{member.full_name}</h3>
                        <p className="mt-1 text-sm text-zinc-400">{member.email}</p>
                        {member.goal ? (
                          <p className="mt-1 text-sm text-cyan-400">
                            Goal: {member.goal}
                          </p>
                        ) : null}
                      </div>
                      <span className="rounded-xl bg-cyan-500/20 px-3 py-1 text-sm text-cyan-400">
                        {memberPlans.length} plan{memberPlans.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {memberPlans.length === 0 ? (
                      <div className="mt-4">
                        <SaasEmptyState preset="workoutMemberPlans" compact />
                      </div>
                    ) : (
                      <ul className="mt-4 space-y-3">
                        {memberPlans.map((assignment) => (
                          <li
                            key={`${assignment.member_id}-${assignment.workout_plan_id}`}
                            className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/10 bg-[#0b1224] p-4"
                          >
                            <div>
                              <Link
                                href={`/workouts/${assignment.workout_plan_id}`}
                                className="font-semibold text-white transition hover:text-cyan-400"
                              >
                                {assignment.workout_plans?.title ?? "Unknown plan"}
                              </Link>
                              <p className="mt-1 text-sm text-zinc-400">
                                {assignment.workout_plans?.goal || "No goal set"}
                              </p>
                              <p className="mt-2 text-xs text-zinc-500">
                                Assigned{" "}
                                {new Date(assignment.assigned_at).toLocaleDateString(
                                  "en-US",
                                )}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                removeAssignment(
                                  assignment.member_id,
                                  assignment.workout_plan_id,
                                )
                              }
                              className={SAAS_BTN_DESTRUCTIVE}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section>
          <SaasSectionHeader title="All workout plans" />
          <div className={SAAS_PAGE_GRID}>
            {workoutPlans.length === 0 ? (
              <SaasEmptyState preset="workouts" />
            ) : (
              workoutPlans.map((plan) => {
                const planAssignments =
                  assignmentsByPlan.get(plan.id) ?? []

                return (
                  <div
                    key={plan.id}
                    className={`${SAAS_PAGE_CARD} flex flex-col`}
                  >
                    <Link
                      href={`/workouts/${plan.id}`}
                      className="group block flex-1 rounded-xl transition hover:bg-white/5 -m-2 p-2"
                    >
                      <h3 className="text-xl font-bold group-hover:text-cyan-400">
                        {plan.title}
                      </h3>
                    {plan.goal ? (
                      <p className="mt-1 text-sm text-cyan-400">Goal: {plan.goal}</p>
                    ) : null}
                    <p className="mt-2 flex-1 text-zinc-400">
                      {plan.weeks ? `${plan.weeks} weeks` : "No duration set"}
                    </p>

                    {plan.workout_plan_exercises?.length > 0 ? (
                      <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                        {plan.workout_plan_exercises.map((exercise) => (
                          <li
                            key={exercise.id}
                            className="flex flex-wrap justify-between gap-2 border-b border-white/5 pb-2 last:border-0 last:pb-0"
                          >
                            <span>{exercise.exercise_name}</span>
                            <span className="text-zinc-500">
                              {exercise.sets} × {exercise.reps}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-4">
                        <SaasEmptyState
                          preset="workoutPlanMovements"
                          compact
                          showAction={false}
                        />
                      </div>
                    )}

                    {planAssignments.length > 0 ? (
                      <p className="mt-4 text-sm text-cyan-400">
                        Assigned to {planAssignments.length}{" "}
                        {planAssignments.length === 1 ? "member" : "members"}
                      </p>
                    ) : (
                      <p className="mt-4 text-sm text-zinc-400">
                        Assign this plan to a member to start tracking completions.
                      </p>
                    )}
                    </Link>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPlan(plan)}
                      >
                        Edit
                      </Button>
                      <button
                        type="button"
                        onClick={() =>
                          openAssignModal(
                            plan,
                            assignMemberParam ?? (modalMemberId || undefined),
                          )
                        }
                        className={`${SAAS_BTN_SECONDARY} flex-1 px-4 py-2`}
                      >
                        Assign Workout
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
        </div>
          </>
        )}
      </main>

      {assignModalPlan ? (
        <AssignWorkoutModal
          workoutPlan={assignModalPlan}
          members={members}
          selectedMemberId={modalMemberId}
          onSelectMember={setModalMemberId}
          onClose={closeAssignModal}
          onSave={saveAssignment}
          saving={assignSaving}
          errorMessage={modalError}
          closeSignal={assignCloseSignal}
        />
      ) : null}

      {editingPlan ? (
        <EditWorkoutPlanModal
          plan={editingPlan}
          onClose={closeEditModal}
          onSave={saveWorkoutPlan}
          saving={editSaving}
          errorMessage={editError}
          closeSignal={editCloseSignal}
        />
      ) : null}

      {toast ? (
        <Toast
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </ProtectedShell>
  )
}
