"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import AddProgressLogModal from "@/components/progress/AddProgressLogModal"
import CoachWorkspaceSkeleton from "@/components/coach-workspace/CoachWorkspaceSkeleton"
import MemberQuickProfile from "@/components/coach-workspace/MemberQuickProfile"
import MemberSearchPanel from "@/components/coach-workspace/MemberSearchPanel"
import TodayTasksPanel from "@/components/coach-workspace/TodayTasksPanel"
import {
  ScheduleSessionModal,
  WorkspacePickerModal,
} from "@/components/coach-workspace/WorkspaceModals"
import ErrorStateBanner from "@/components/ui/error-state-banner"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import SaasPageHeader from "@/components/ui/saas-page-header"
import { SAAS_PAGE_MAIN } from "@/lib/ui/saas-page-layout"
import { MOBILE_PAGE_ROOT } from "@/lib/ui/mobile-layout"
import { useCoachWorkspace } from "@/app/hooks/useCoachWorkspace"
import { insertProgressLog } from "@/lib/progress/insert-progress-log"
import type { MetricLogCategory } from "@/lib/progress/metrics"
import type { TaskStatus, TodayTaskType } from "@/lib/coach-workspace/types"
import { notifyCoachingCoreChanged } from "@/lib/coaching-core/notify"
import { assignWorkoutToMember } from "@/lib/workout-assignments"
import { NUTRITION_ASSIGNMENT_STATUS } from "@/lib/types/nutrition-assignments"
import ProtectedShell from "../components/ProtectedShell"
import Toast, { type ToastPayload } from "../components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"

export default function CoachWorkspacePage() {
  const {
    data,
    loading,
    refreshing,
    refreshRevision,
    error,
    refetch,
    taskStatuses,
    setTaskStatus,
    supabase,
  } = useCoachWorkspace()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [taskFilter, setTaskFilter] = useState<TaskStatus>("todo")

  const [workoutModalOpen, setWorkoutModalOpen] = useState(false)
  const [nutritionModalOpen, setNutritionModalOpen] = useState(false)
  const [progressModalOpen, setProgressModalOpen] = useState(false)
  const [sessionModalOpen, setSessionModalOpen] = useState(false)

  const [selectedWorkoutPlanId, setSelectedWorkoutPlanId] = useState("")
  const [selectedNutritionPlanId, setSelectedNutritionPlanId] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [sessionType, setSessionType] = useState("Personal Training")

  const [modalError, setModalError] = useState<string | null>(null)
  const [workoutSaving, setWorkoutSaving] = useState(false)
  const [nutritionSaving, setNutritionSaving] = useState(false)
  const [progressSaving, setProgressSaving] = useState(false)
  const [sessionSaving, setSessionSaving] = useState(false)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const [workoutCloseSignal, setWorkoutCloseSignal] = useState(0)
  const [nutritionCloseSignal, setNutritionCloseSignal] = useState(0)
  const [progressCloseSignal, setProgressCloseSignal] = useState(0)
  const [sessionCloseSignal, setSessionCloseSignal] = useState(0)

  const selectedMember = useMemo(
    () => data?.members.find((m) => m.id === selectedMemberId) ?? null,
    [data?.members, selectedMemberId],
  )

  useEffect(() => {
    if (!data?.members.length) return
    if (!selectedMemberId) {
      setSelectedMemberId(data.members[0].id)
      return
    }
    const stillExists = data.members.some((member) => member.id === selectedMemberId)
    if (!stillExists) {
      setSelectedMemberId(data.members[0].id)
    }
  }, [data?.members, selectedMemberId])

  const closeWorkoutModal = useCallback(() => {
    setWorkoutModalOpen(false)
    setModalError(null)
    setSelectedWorkoutPlanId("")
  }, [])

  const closeNutritionModal = useCallback(() => {
    setNutritionModalOpen(false)
    setModalError(null)
    setSelectedNutritionPlanId("")
  }, [])

  const closeProgressModal = useCallback(() => {
    setProgressModalOpen(false)
    setModalError(null)
  }, [])

  const closeSessionModal = useCallback(() => {
    setSessionModalOpen(false)
    setModalError(null)
    setScheduledDate("")
    setScheduledTime("")
  }, [])

  const openWorkoutModal = useCallback(() => {
    setModalError(null)
    setWorkoutSaving(false)
    setWorkoutModalOpen(true)
  }, [])

  const openNutritionModal = useCallback(() => {
    setModalError(null)
    setNutritionSaving(false)
    setNutritionModalOpen(true)
  }, [])

  const openProgressModal = useCallback(() => {
    setModalError(null)
    setProgressSaving(false)
    setProgressModalOpen(true)
  }, [])

  const openSessionModal = useCallback(() => {
    setModalError(null)
    setSessionSaving(false)
    setSessionModalOpen(true)
  }, [])

  const refreshAfterAction = useCallback(() => {
    void refetch()
  }, [refetch])

  const completeTasksForMember = useCallback(
    (memberId: string, taskTypes: TodayTaskType[]) => {
      if (!data) return

      for (const task of data.tasks) {
        if (task.memberId === memberId && taskTypes.includes(task.type)) {
          setTaskStatus(task.id, "done")
        }
      }
    },
    [data, setTaskStatus],
  )

  const finishQuickAction = useCallback(
    (
      memberId: string,
      toastKey: Parameters<typeof successToast>[0],
      completedTaskTypes: TodayTaskType[] = [],
    ) => {
      completeTasksForMember(memberId, completedTaskTypes)
      refreshAfterAction()
      notifyCoachingCoreChanged()
      setToast(successToast(toastKey))
    },
    [completeTasksForMember, refreshAfterAction],
  )

  const handleAssignWorkout = async () => {
    if (!selectedMember || !selectedWorkoutPlanId) return

    setWorkoutSaving(true)
    setModalError(null)

    try {
      const result = await assignWorkoutToMember(supabase, {
        memberId: selectedMember.id,
        workoutPlanId: selectedWorkoutPlanId,
      })

      if (!result.success) {
        reportSupabaseError("[coach-workspace] assign workout failed", result.message, {
          setError: setModalError,
        })
        return
      }

      finishQuickAction(selectedMember.id, "workoutAssigned", ["no_workout_plan"])
      setWorkoutCloseSignal((current) => current + 1)
      closeWorkoutModal()
    } catch (error) {
      reportSupabaseError("[coach-workspace] assign workout failed", error, {
        setError: setModalError,
        fallbackMessage: "Failed to assign workout.",
      })
    } finally {
      setWorkoutSaving(false)
    }
  }

  const handleAssignNutrition = async () => {
    if (!selectedMember || !selectedNutritionPlanId) return

    setNutritionSaving(true)
    setModalError(null)

    try {
      const { error: insertError } = await supabase
        .from("member_nutrition_assignments")
        .insert([
          {
            member_id: selectedMember.id,
            nutrition_plan_id: selectedNutritionPlanId,
            status: NUTRITION_ASSIGNMENT_STATUS.active,
          },
        ])

      if (insertError) {
        reportSupabaseError("[coach-workspace] assign nutrition failed", insertError, {
          setError: setModalError,
        })
        return
      }

      finishQuickAction(selectedMember.id, "nutritionAssigned", ["no_nutrition_plan"])
      setNutritionCloseSignal((current) => current + 1)
      closeNutritionModal()
    } catch (error) {
      reportSupabaseError("[coach-workspace] assign nutrition failed", error, {
        setError: setModalError,
        fallbackMessage: "Failed to assign nutrition plan.",
      })
    } finally {
      setNutritionSaving(false)
    }
  }

  const handleScheduleSession = async () => {
    if (!selectedMember || !scheduledDate || !scheduledTime) return

    setSessionSaving(true)
    setModalError(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const coachName =
        userData.user?.email?.split("@")[0]?.replace(/\./g, " ") ?? "Coach"

      const scheduledAt = new Date(
        `${scheduledDate}T${scheduledTime}:00`,
      ).toISOString()

      const { error: insertError } = await supabase.from("sessions").insert({
        member_id: selectedMember.id,
        coach: coachName,
        session_type: sessionType,
        scheduled_at: scheduledAt,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        duration: 60,
        status: "gepland",
      })

      if (insertError) {
        reportSupabaseError("[coach-workspace] schedule session failed", insertError, {
          setError: setModalError,
        })
        return
      }

      finishQuickAction(selectedMember.id, "sessionScheduled")
      setSessionCloseSignal((current) => current + 1)
      closeSessionModal()
    } catch (error) {
      reportSupabaseError("[coach-workspace] schedule session failed", error, {
        setError: setModalError,
        fallbackMessage: "Failed to schedule session.",
      })
    } finally {
      setSessionSaving(false)
    }
  }

  const handleLogProgress = async (input: {
    memberId: string
    metricCategory: MetricLogCategory
    customMetricName?: string
    startValue: number
    currentValue: number
  }) => {
    setProgressSaving(true)
    setModalError(null)

    try {
      const result = await insertProgressLog(supabase, input)

      if (result.error) {
        reportSupabaseError("[coach-workspace] log progress failed", result.error, {
          setError: setModalError,
        })
        return
      }

      finishQuickAction(input.memberId, "progressLogged", ["stale_progress"])
      setProgressCloseSignal((current) => current + 1)
      closeProgressModal()
    } catch (error) {
      reportSupabaseError("[coach-workspace] log progress failed", error, {
        setError: setModalError,
        fallbackMessage: "Failed to log progress.",
      })
    } finally {
      setProgressSaving(false)
    }
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <main className={`${SAAS_PAGE_MAIN} ${MOBILE_PAGE_ROOT}`}>
        <SaasPageHeader
          eyebrow="Coach Workspace Pro"
          title="Workspace"
          description="Search members, review quick profiles, complete daily tasks, and take action — all from one place."
          action={
            refreshing ? (
              <p className="text-xs text-slate-500">Refreshing workspace…</p>
            ) : undefined
          }
        />

        {error ? (
          <ErrorStateBanner
            title="Could not load workspace"
            message={error}
            onRetry={() => void refetch()}
            retrying={refreshing}
            embedded
            className="mb-6"
          />
        ) : null}

        {loading ? (
          <CoachWorkspaceSkeleton />
        ) : !data ? (
          error ? null : (
            <CoachWorkspaceSkeleton />
          )
        ) : data.members.length === 0 ? (
          <SaasEmptyState
            preset="members"
            action={
              <Link href="/members" className="btn-gradient">
                Add your first client
              </Link>
            }
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="xl:col-span-4">
                <MemberSearchPanel
                  key={`roster-${refreshRevision}`}
                  members={data.members}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedMemberId={selectedMemberId}
                  onSelectMember={setSelectedMemberId}
                />
              </div>
              <div className="xl:col-span-8">
                <MemberQuickProfile
                  key={`profile-${selectedMemberId ?? "none"}-${refreshRevision}`}
                  member={selectedMember}
                  onAssignWorkout={openWorkoutModal}
                  onAssignNutrition={openNutritionModal}
                  onLogProgress={openProgressModal}
                  onScheduleSession={openSessionModal}
                />
              </div>
            </div>

            <TodayTasksPanel
              key={`tasks-${refreshRevision}`}
              tasks={data.tasks}
              taskStatuses={taskStatuses}
              onStatusChange={setTaskStatus}
              onSelectMember={setSelectedMemberId}
              filter={taskFilter}
              onFilterChange={setTaskFilter}
            />
          </div>
        )}

        {toast ? (
          <Toast
            title={toast.title}
            description={toast.description}
            variant={toast.variant ?? "success"}
            onDismiss={() => setToast(null)}
          />
        ) : null}

        {workoutModalOpen && selectedMember ? (
          <WorkspacePickerModal
            title="Assign workout"
            description={`Choose a workout plan for ${selectedMember.fullName}`}
            plans={data?.workoutPlans ?? []}
            selectedPlanId={selectedWorkoutPlanId}
            onSelectPlan={setSelectedWorkoutPlanId}
            onClose={closeWorkoutModal}
            closeSignal={workoutCloseSignal}
            onSave={handleAssignWorkout}
            saving={workoutSaving}
            errorMessage={modalError}
            emptyPreset="workouts"
            emptyAction={
              <Link href="/workouts/new" className="btn-gradient">
                Create workout plan
              </Link>
            }
          />
        ) : null}

        {nutritionModalOpen && selectedMember ? (
          <WorkspacePickerModal
            title="Assign nutrition"
            description={`Choose a nutrition plan for ${selectedMember.fullName}`}
            plans={data?.nutritionPlans ?? []}
            selectedPlanId={selectedNutritionPlanId}
            onSelectPlan={setSelectedNutritionPlanId}
            onClose={closeNutritionModal}
            closeSignal={nutritionCloseSignal}
            onSave={handleAssignNutrition}
            saving={nutritionSaving}
            errorMessage={modalError}
            emptyPreset="nutrition"
            emptyAction={
              <Link href="/nutrition#nutrition-form" className="btn-gradient">
                Create nutrition plan
              </Link>
            }
          />
        ) : null}

        {progressModalOpen && selectedMember ? (
          <AddProgressLogModal
            members={[{ id: selectedMember.id, full_name: selectedMember.fullName }]}
            isMember={false}
            lockedMemberId={selectedMember.id}
            saving={progressSaving}
            errorMessage={modalError}
            onClose={closeProgressModal}
            closeSignal={progressCloseSignal}
            onSubmit={handleLogProgress}
          />
        ) : null}

        {sessionModalOpen && selectedMember ? (
          <ScheduleSessionModal
            memberName={selectedMember.fullName}
            scheduledDate={scheduledDate}
            scheduledTime={scheduledTime}
            sessionType={sessionType}
            onDateChange={setScheduledDate}
            onTimeChange={setScheduledTime}
            onSessionTypeChange={setSessionType}
            onClose={closeSessionModal}
            closeSignal={sessionCloseSignal}
            onSave={handleScheduleSession}
            saving={sessionSaving}
            errorMessage={modalError}
          />
        ) : null}
      </main>
    </ProtectedShell>
  )
}
