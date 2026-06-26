"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import ClientProfileCard from "@/components/members/ClientProfileCard"
import MemberDetailSectionNav from "@/components/members/MemberDetailMobileNav"
import {
  buildProgressMemberUrl,
} from "@/lib/coach-dashboard/coach-action-links"
import CoachMemberActionButtons from "@/components/coach-dashboard/CoachMemberActionButtons"
import GoalProgressCard from "@/components/members/GoalProgressCard"
import MemberAssignedWorkoutsSection from "@/components/members/MemberAssignedWorkoutsSection"
import MemberCheckInSection from "@/components/members/MemberCheckInSection"
import MemberClientGoalsSection from "@/components/members/MemberClientGoalsSection"
import MemberCoachNotesSection from "@/components/members/MemberCoachNotesSection"
import MemberClientRemindersSection from "@/components/members/MemberClientRemindersSection"
import MemberClientTimelineSection from "@/components/members/MemberClientTimelineSection"
import MemberHabitTrackerSection from "@/components/members/MemberHabitTrackerSection"
import MemberProgressPhotosSection from "@/components/members/MemberProgressPhotosSection"
import ProtectedShell from "../../components/ProtectedShell"
import EmptyState from "@/components/ui/empty-state"
import ErrorStateBanner from "@/components/ui/error-state-banner"
import { MemberDetailSkeleton } from "@/components/ui/page-skeletons"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import {
  SAAS_MEMBER_BTN_PRIMARY,
  SAAS_MEMBER_BTN_SECONDARY,
  SAAS_MEMBER_DETAIL_CARD,
  SAAS_MEMBER_DETAIL_MAIN,
} from "@/lib/ui/saas-page-layout"
import {
  premiumInputClass,
  premiumTextareaClass,
} from "@/lib/ui/premium-input"
import { createPlan, getPlan, updatePlan, type MemberPlan } from "@/lib/plans"
import type { Database } from "@/lib/database.types"
import { fetchMemberAssignedWorkouts } from "@/lib/members/member-assigned-workouts"
import { mapClientGoalRow } from "@/lib/members/member-client-goals"
import type { ClientGoal } from "@/lib/types/client-goals"
import type { MyWorkoutAssignment } from "@/lib/types/my-workouts"
import { notifyCoachingCoreChanged } from "@/lib/coaching-core/notify"
import { useCoachingCoreChanged } from "@/app/hooks/useCoachingCoreChanged"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"
import { createClient } from "@/lib/supabase/client"

type Member = Database["public"]["Tables"]["members"]["Row"]
type ProgressLog = Database["public"]["Tables"]["progress_logs"]["Row"]

function formatWeight(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "—"
  const n = Number(value)
  return Number.isInteger(n) ? `${n} kg` : `${n.toFixed(1)} kg`
}

export default function MemberDetailPage() {
  const params = useParams<{ id: string }>()
  const memberId = params.id

  const supabase = createClient()

  const [member, setMember] = useState<Member | null>(null)
  const [plan, setPlan] = useState<MemberPlan | null>(null)
  const [workout, setWorkout] = useState("")
  const [nutrition, setNutrition] = useState("")
  const [targetCalories, setTargetCalories] = useState("")
  const [targetProtein, setTargetProtein] = useState("")
  const [logs, setLogs] = useState<ProgressLog[]>([])
  const [workoutAssignments, setWorkoutAssignments] = useState<
    MyWorkoutAssignment[]
  >([])
  const [clientGoals, setClientGoals] = useState<ClientGoal[]>([])
  const [workoutsLoading, setWorkoutsLoading] = useState(true)
  const [goalsLoading, setGoalsLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingTargets, setSavingTargets] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)
  const [profileRefreshKey, setProfileRefreshKey] = useState(0)
  const [activityRefreshKey, setActivityRefreshKey] = useState(0)

  const bumpActivity = useCallback(() => {
    setActivityRefreshKey((key) => key + 1)
  }, [])

  const loadMemberData = useCallback(async () => {
    if (!memberId) return

    setErrorMessage(null)

    const [memberResult, planResult, logsResult] = await Promise.all([
      supabase.from("members").select("*").eq("id", memberId).maybeSingle(),
      getPlan(memberId),
      supabase
        .from("progress_logs")
        .select("*")
        .eq("member_id", memberId)
        .order("updated_at", { ascending: false })
        .limit(10),
    ])

    if (memberResult.error) {
      reportSupabaseError("[members] load member failed", memberResult.error, {
        setError: setErrorMessage,
      })
    } else {
      setMember(memberResult.data)
      if (memberResult.data) {
        setTargetCalories(
          memberResult.data.target_calories?.toString() ?? "",
        )
        setTargetProtein(
          memberResult.data.target_protein?.toString() ?? "",
        )
      }
    }

    const member = memberResult.data

    if (planResult.error) {
      reportSupabaseError("[members] load plan failed", planResult.error, {
        setError: setErrorMessage,
      })
    } else if (planResult.data) {
      setPlan(planResult.data)
      setWorkout(planResult.data.workout_plan || "")
      setNutrition(planResult.data.nutrition_plan || "")
    } else {
      setPlan(null)
      setWorkout("")
      setNutrition("")
    }

    if (logsResult.error) {
      reportSupabaseError("[members] load progress logs failed", logsResult.error, {
        setError: setErrorMessage,
      })
      setLogs([])
    } else {
      setLogs(logsResult.data ?? [])
    }

    setWorkoutsLoading(true)
    setGoalsLoading(true)

    const goalsQuery = member
      ? supabase
          .from("client_goals")
          .select("*")
          .eq("member_id", member.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null })

    const [workoutsResult, goalsResult] = await Promise.all([
      fetchMemberAssignedWorkouts(supabase, memberId),
      goalsQuery,
    ])

    if (workoutsResult.error) {
      reportSupabaseError("[members] load workouts failed", workoutsResult.error, {
        setError: setErrorMessage,
      })
      setWorkoutAssignments([])
    } else {
      setWorkoutAssignments(workoutsResult.assignments)
    }

    if (goalsResult.error) {
      reportSupabaseError("[members] load client goals failed", goalsResult.error, {
        setError: setErrorMessage,
      })
      setClientGoals([])
    } else {
      setClientGoals((goalsResult.data ?? []).map(mapClientGoalRow))
    }

    setWorkoutsLoading(false)
    setGoalsLoading(false)
    setLoading(false)
  }, [memberId, supabase])

  const refreshMemberActivity = useCallback(() => {
    bumpActivity()
    void loadMemberData()
    notifyCoachingCoreChanged()
  }, [bumpActivity, loadMemberData])

  useEffect(() => {
    void loadMemberData()
  }, [loadMemberData])

  useCoachingCoreChanged(() => {
    void loadMemberData()
  })

  async function handleSaveTargets() {
    if (!memberId) return

    setSavingTargets(true)
    setErrorMessage(null)

    const result = await supabase
      .from("members")
      .update({
        target_calories: Number(targetCalories) || null,
        target_protein: Number(targetProtein) || null,
      })
      .eq("id", memberId)

    if (result.error) {
      reportSupabaseError("[members] save targets failed", result.error, {
        setError: setErrorMessage,
      })
      setSavingTargets(false)
      return
    }

    setMember((prev) =>
      prev
        ? {
            ...prev,
            target_calories: Number(targetCalories) || null,
            target_protein: Number(targetProtein) || null,
          }
        : null,
    )

    setToast(successToast("memberTargetsSaved"))
    notifyCoachingCoreChanged()
    setSavingTargets(false)
  }

  async function handleSave() {
    if (!memberId) return

    setSaving(true)
    setErrorMessage(null)

    const result = plan
      ? await updatePlan(memberId, workout, nutrition)
      : await createPlan(memberId, workout, nutrition)

    if (result.error) {
      reportSupabaseError("[members] save plan failed", result.error, {
        setError: setErrorMessage,
      })
      setSaving(false)
      return
    }

    setPlan(result.data)
    if (result.data) {
      setWorkout(result.data.workout_plan || "")
      setNutrition(result.data.nutrition_plan || "")
    }
    await loadMemberData()
    setToast(successToast("memberPlanSaved"))
    notifyCoachingCoreChanged()
    setSaving(false)
  }

  if (loading) {
    return (
      <ProtectedShell allowed={["admin", "coach"]}>
        <MemberDetailSkeleton />
      </ProtectedShell>
    )
  }

  if (!member) {
    return (
      <ProtectedShell allowed={["admin", "coach"]}>
        <div className={`${SAAS_MEMBER_DETAIL_MAIN} space-y-4`}>
          <ErrorStateBanner
            variant="light"
            title="Member not found"
            message={
              errorMessage ??
              "This member profile could not be loaded. They may have been removed or you may not have access."
            }
            onRetry={() => void loadMemberData()}
          />
          <Link href="/members" className="text-sm font-medium text-cyan-600 hover:underline">
            ← Back to members
          </Link>
        </div>
      </ProtectedShell>
    )
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <div className={SAAS_MEMBER_DETAIL_MAIN}>
        <div>
          <Link
            href="/members"
            className="text-sm text-gray-500 transition hover:text-black"
          >
            ← Back to members
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            {member.full_name}
          </h1>
          <p className="mt-2 text-gray-500">{member.email}</p>
          {member.goal ? (
            <p className="mt-1 text-sm text-gray-600">Goal: {member.goal}</p>
          ) : null}
          {member.plan ? (
            <p className="mt-1 text-sm text-gray-600">Plan: {member.plan}</p>
          ) : null}
          {member.status ? (
            <p className="mt-1 text-sm text-gray-600">Status: {member.status}</p>
          ) : null}
        </div>

        {errorMessage ? (
          <ErrorStateBanner
            variant="light"
            title="Could not refresh member data"
            message={errorMessage}
            onRetry={() => void loadMemberData()}
            embedded
          />
        ) : null}

        <CoachMemberActionButtons
          memberId={member.id}
          memberName={member.full_name ?? "Member"}
          layout="wrap"
        />

        <MemberDetailSectionNav memberId={member.id} />

        <div id="member-workouts" className="scroll-mt-24">
        <MemberAssignedWorkoutsSection
          assignments={workoutAssignments}
          loading={workoutsLoading}
          memberId={member.id}
        />
        </div>

        <div id="member-goals" className="scroll-mt-24">
        <MemberClientGoalsSection
          goals={clientGoals}
          loading={goalsLoading}
          memberId={member.id}
          memberName={member.full_name ?? "Member"}
          onGoalAdded={() => {
            refreshMemberActivity()
            setToast(successToast("goalCreated"))
          }}
        />
        </div>

        <div id="member-checkins" className="scroll-mt-24">
        <MemberCheckInSection
          memberId={member.id}
          memberName={member.full_name ?? "Member"}
          fallbackWeight={member.current_weight}
          onCheckInSaved={() => {
            refreshMemberActivity()
            setToast(successToast("checkInSubmitted"))
          }}
        />
        </div>

        <div id="member-habits" className="scroll-mt-24">
        <MemberHabitTrackerSection
          memberId={member.id}
          onHabitChanged={() => {
            refreshMemberActivity()
            setToast(successToast("habitLogged"))
          }}
        />
        </div>

        <div id="member-photos" className="scroll-mt-24">
        <MemberProgressPhotosSection
          memberId={member.id}
          onPhotoUploaded={() => {
            refreshMemberActivity()
            setToast(successToast("progressPhotoUploaded"))
          }}
        />
        </div>

        <div id="member-notes" className="scroll-mt-24">
        <MemberCoachNotesSection
          memberId={member.id}
          onNoteCreated={() => {
            refreshMemberActivity()
            setToast(successToast("clientNoteCreated"))
          }}
          onNoteUpdated={() => {
            refreshMemberActivity()
            setToast(successToast("clientNoteUpdated"))
          }}
          onNoteDeleted={() => {
            refreshMemberActivity()
            setToast(successToast("clientNoteDeleted"))
          }}
        />
        </div>

        <MemberClientRemindersSection
          memberId={member.id}
          onReminderCreated={() => {
            refreshMemberActivity()
            setToast(successToast("clientReminderCreated"))
          }}
          onReminderUpdated={() => {
            refreshMemberActivity()
            setToast(successToast("clientReminderUpdated"))
          }}
          onReminderDeleted={() => {
            refreshMemberActivity()
            setToast(successToast("clientReminderDeleted"))
          }}
        />

        <MemberClientTimelineSection
          memberId={member.id}
          refreshKey={activityRefreshKey}
        />

        <div id="member-plans" className="scroll-mt-24 space-y-6">
        <GoalProgressCard
          memberId={member.id}
          fallbackWeight={member.current_weight}
          fallbackGoalWeight={member.target_weight}
          refreshKey={profileRefreshKey}
        />

        <ClientProfileCard
          memberId={member.id}
          onSaved={() => {
            setProfileRefreshKey((key) => key + 1)
            refreshMemberActivity()
            setToast(successToast("profileSaved"))
          }}
        />

        <div className={SAAS_MEMBER_DETAIL_CARD}>
          <h2 className="mb-6 text-xl font-semibold text-black sm:text-2xl">
            Nutrition Targets
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Target Calories
              </label>
              <input
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(e.target.value)}
                className={premiumInputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Target Protein (g)
              </label>
              <input
                type="number"
                value={targetProtein}
                onChange={(e) => setTargetProtein(e.target.value)}
                className={premiumInputClass}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleSaveTargets()}
            disabled={savingTargets}
            className={SAAS_MEMBER_BTN_SECONDARY}
          >
            {savingTargets ? "Saving…" : "Save nutrition targets"}
          </button>
        </div>

        <div className={SAAS_MEMBER_DETAIL_CARD}>
          <h2 className="mb-4 text-xl font-semibold text-black sm:text-2xl">
            Workout Plan
          </h2>
          <p className="mb-3 text-sm text-gray-500">
            Use format: <code>- Squat: 4x8</code> (one exercise per line)
          </p>
          <textarea
            value={workout}
            onChange={(e) => setWorkout(e.target.value)}
            rows={8}
            placeholder={`# Upper/Lower Split\nGoal: Muscle building\n\n- Barbell Squat: 4x8\n- Bench Press: 4x8`}
            className={`${premiumTextareaClass} font-mono`}
          />
        </div>

        <div className={SAAS_MEMBER_DETAIL_CARD}>
          <h2 className="mb-4 text-xl font-semibold text-black sm:text-2xl">
            Nutrition Plan
          </h2>
          <textarea
            value={nutrition}
            onChange={(e) => setNutrition(e.target.value)}
            rows={8}
            placeholder={`# Daily menu\nGoal: Maintenance\nCalories: 2200 kcal\nProtein: 160g\nCarbs: 220g\nFats: 70g`}
            className={`${premiumTextareaClass} font-mono`}
          />
        </div>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className={SAAS_MEMBER_BTN_PRIMARY}
        >
          {saving ? "Saving…" : "Save plan"}
        </button>

        <div className={SAAS_MEMBER_DETAIL_CARD}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-black sm:text-2xl">
              Progress
            </h2>
            <Link
              href={buildProgressMemberUrl(member.id)}
              className="text-sm font-medium text-cyan-600 hover:underline"
            >
              Full progress →
            </Link>
          </div>

          {logs.length === 0 ? (
            <EmptyState {...SAAS_EMPTY.memberProgress} variant="light" compact />
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-2xl border px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-black">
                      {log.metric ?? "Metric"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {log.updated_at
                        ? new Date(log.updated_at).toLocaleDateString("en-US")
                        : "—"}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-black">
                    {formatWeight(log.current_value)}
                  </p>
                </div>
              ))}
            </div>
          )}
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
    </ProtectedShell>
  )
}
