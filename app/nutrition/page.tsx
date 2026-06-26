"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import {
  Beef,
  Droplets,
  Flame,
  Loader2,
  Plus,
  Target,
  User,
  Utensils,
  Wheat,
} from "lucide-react"
import ProtectedShell from "../components/ProtectedShell"
import NutritionPlanCard from "../components/NutritionPlanCard"
import Badge from "@/components/ui/badge"
import { getCoachMemberIds, getCoachScope } from "@/lib/auth/coach-scope"
import type { Database } from "@/lib/database.types"
import { filterDemoRowsForWorkspace } from "@/lib/demo/workspace-data-filter"
import { fetchCoachMembersList } from "@/lib/member-status"
import { notifyCoachingCoreChanged } from "@/lib/coaching-core/notify"
import { useCoachingCoreChanged } from "@/app/hooks/useCoachingCoreChanged"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"
import { createClient } from "@/lib/supabase/client"
import { fetchWorkspaceMode } from "@/lib/workspace/workspace-mode"
import ErrorStateBanner from "@/components/ui/error-state-banner"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import { NutritionPageSkeleton } from "@/components/ui/page-skeletons"
import SaasPageHeader from "@/components/ui/saas-page-header"
import { SAAS_PAGE_MAIN } from "@/lib/ui/saas-page-layout"
import Toast, { type ToastPayload } from "../components/Toast"
import { NUTRITION_ASSIGNMENT_STATUS } from "@/lib/types/nutrition-assignments"
import { successToast } from "@/lib/copy/success-toasts"
import {
  PROGRESS_PRO_BTN_PRIMARY,
  PROGRESS_PRO_BTN_SECONDARY,
  PROGRESS_PRO_CARD,
  PROGRESS_PRO_CARD_INNER,
  ProgressProSectionHeader,
} from "@/components/progress/progress-pro-ui"

type NutritionPlan = Database["public"]["Tables"]["nutrition_plans"]["Row"]
type Member = Database["public"]["Tables"]["members"]["Row"]

type NutritionPlanForm = {
  title: string
  description: string
  calories: string
  protein: string
  carbs: string
  fats: string
  goal: string
}

type NutritionAssignment = {
  member_id: string
  nutrition_plan_id: string
  assigned_at: string
  status: string
  members: Pick<Member, "full_name" | "email"> | null
  nutrition_plans: Pick<NutritionPlan, "title"> | null
}

const emptyFormValues: NutritionPlanForm = {
  title: "",
  description: "",
  calories: "",
  protein: "",
  carbs: "",
  fats: "",
  goal: "",
}

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white placeholder:text-gray-500 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"

const selectClassName =
  "w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"

const textareaClassName =
  "w-full min-h-32 resize-y rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white placeholder:text-gray-500 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"

const labelClassName = "mb-2 block text-sm font-medium text-gray-300"

function FormField({
  label,
  icon: Icon,
  iconClassName,
  htmlFor,
  children,
}: {
  label: string
  icon: typeof Utensils
  iconClassName: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div className={`${PROGRESS_PRO_CARD_INNER} p-5`}>
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconClassName}`} aria-hidden />
        <label htmlFor={htmlFor} className={labelClassName}>
          {label}
        </label>
      </div>
      {children}
    </div>
  )
}

export default function NutritionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <NutritionPageContent />
    </Suspense>
  )
}

function NutritionPageContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [plans, setPlans] = useState<NutritionPlan[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState("")
  const [selectedPlan, setSelectedPlan] = useState("")
  const [assignments, setAssignments] = useState<NutritionAssignment[]>([])
  const [editingPlan, setEditingPlan] = useState<NutritionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [planSaving, setPlanSaving] = useState(false)
  const [assignSaving, setAssignSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const { register, handleSubmit, setValue, reset } = useForm<NutritionPlanForm>({
    defaultValues: emptyFormValues,
  })

  useEffect(() => {
    if (!editingPlan) return

    setValue("title", editingPlan.title)
    setValue("description", editingPlan.description ?? "")
    setValue(
      "calories",
      editingPlan.calories != null ? String(editingPlan.calories) : "",
    )
    setValue(
      "protein",
      editingPlan.protein != null ? String(editingPlan.protein) : "",
    )
    setValue("carbs", editingPlan.carbs != null ? String(editingPlan.carbs) : "")
    setValue("fats", editingPlan.fats != null ? String(editingPlan.fats) : "")
    setValue("goal", editingPlan.goal ?? "")
  }, [editingPlan, setValue])

  const fetchPlans = useCallback(async () => {
    const scope = await getCoachScope(supabase)

    let query = supabase
      .from("nutrition_plans")
      .select("*")
      .order("created_at", { ascending: false })

    if (scope.isCoach && scope.userId) {
      query = query.or(`created_by.eq.${scope.userId},created_by.is.null`)
    }

    const { data, error } = await query

    if (error) {
      console.error("FETCH PLANS ERROR:", error.message)
      setErrorMessage(error.message)
      setPlans([])
      return false
    }

    const workspaceMode =
      scope.userId != null
        ? await fetchWorkspaceMode(supabase, scope.userId)
        : ("live" as const)

    setPlans(filterDemoRowsForWorkspace(data || [], workspaceMode))
    return true
  }, [supabase])

  const fetchMembers = useCallback(async () => {
    const { data, error } = await fetchCoachMembersList(supabase)

    if (error) {
      console.error(error.message)
      setMembers([])
      return false
    }

    setMembers(data)
    return true
  }, [supabase])

  const fetchAssignments = useCallback(async () => {
    const scope = await getCoachScope(supabase)

    let query = supabase
      .from("member_nutrition_assignments")
      .select(
        `
        member_id,
        nutrition_plan_id,
        assigned_at,
        status,
        members ( full_name, email ),
        nutrition_plans ( title )
      `,
      )
      .order("assigned_at", { ascending: false })

    if (scope.isCoach && scope.userId) {
      const memberIds = await getCoachMemberIds(supabase, scope.userId)
      if (memberIds.length === 0) {
        setAssignments([])
        return
      }
      query = query.in("member_id", memberIds)
    }

    const { data, error } = await query

    if (error) {
      console.error(error.message)
      setErrorMessage(error.message)
      return
    }

    setAssignments((data as NutritionAssignment[]) || [])
  }, [supabase])

  useEffect(() => {
    fetchPlans().finally(() => setLoading(false))
    fetchMembers()
    fetchAssignments()
  }, [fetchAssignments, fetchMembers, fetchPlans])

  const memberParam = searchParams.get("member")

  useEffect(() => {
    if (!memberParam || members.length === 0) return
    if (!members.some((member) => member.id === memberParam)) return
    setSelectedMember(memberParam)
    window.requestAnimationFrame(() => {
      document.getElementById("nutrition-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
  }, [memberParam, members])

  useCoachingCoreChanged(() => {
    void fetchPlans()
    void fetchMembers()
    void fetchAssignments()
  })

  const assignmentsByPlan = useMemo(() => {
    const map = new Map<string, NutritionAssignment[]>()

    for (const assignment of assignments) {
      const list = map.get(assignment.nutrition_plan_id) ?? []
      list.push(assignment)
      map.set(assignment.nutrition_plan_id, list)
    }

    return map
  }, [assignments])

  const cancelEdit = () => {
    setEditingPlan(null)
    reset(emptyFormValues)
  }

  const savePlan = async (data: NutritionPlanForm) => {
    if (!data.title.trim()) {
      setErrorMessage("Enter a title.")
      return
    }

    setErrorMessage(null)
    setToast(null)
    setPlanSaving(true)

    const payload = {
      title: data.title.trim(),
      calories: data.calories ? Number(data.calories) : null,
      protein: data.protein ? Number(data.protein) : null,
      carbs: data.carbs ? Number(data.carbs) : null,
      fats: data.fats ? Number(data.fats) : null,
      description: data.description.trim() || null,
      goal: data.goal.trim() || null,
    }

    if (editingPlan) {
      const { error } = await supabase
        .from("nutrition_plans")
        .update(payload)
        .eq("id", editingPlan.id)

      if (error) {
        reportSupabaseError("[nutrition] update plan failed", error, {
          setError: setErrorMessage,
        })
        setPlanSaving(false)
        return
      }

      setToast(successToast("nutritionPlanUpdated"))
      cancelEdit()
      await fetchPlans()
      notifyCoachingCoreChanged()
      setPlanSaving(false)
      return
    }

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      setErrorMessage("No user found.")
      setPlanSaving(false)
      return
    }

    const { error } = await supabase.from("nutrition_plans").insert([
      {
        ...payload,
        created_by: userData.user.id,
      },
    ])

    if (error) {
      reportSupabaseError("[nutrition] create plan failed", error, {
        setError: setErrorMessage,
      })
      setPlanSaving(false)
      return
    }

    setToast(successToast("nutritionPlanCreated"))
    reset(emptyFormValues)
    await fetchPlans()
    notifyCoachingCoreChanged()
    setPlanSaving(false)
  }

  const assignPlan = async () => {
    if (!selectedMember || !selectedPlan) {
      setErrorMessage("Select a member and a nutrition plan.")
      return
    }

    setErrorMessage(null)
    setToast(null)
    setAssignSaving(true)

    const { error } = await supabase.from("member_nutrition_assignments").insert([
      {
        member_id: selectedMember,
        nutrition_plan_id: selectedPlan,
        status: NUTRITION_ASSIGNMENT_STATUS.active,
      },
    ])

    if (error) {
      reportSupabaseError("[nutrition] assign plan failed", error, {
        setError: setErrorMessage,
      })
      setAssignSaving(false)
      return
    }

    setToast(successToast("nutritionAssigned"))
    setSelectedMember("")
    setSelectedPlan("")
    await fetchAssignments()
    notifyCoachingCoreChanged()
    setAssignSaving(false)
  }

  const removeAssignment = async (memberId: string, planId: string) => {
    setErrorMessage(null)
    setToast(null)

    const { error } = await supabase
      .from("member_nutrition_assignments")
      .delete()
      .eq("member_id", memberId)
      .eq("nutrition_plan_id", planId)

    if (error) {
      reportSupabaseError("[nutrition] remove assignment failed", error, {
        setError: setErrorMessage,
      })
      return
    }

    setToast(successToast("nutritionUnassigned"))
    await fetchAssignments()
    notifyCoachingCoreChanged()
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <main className={SAAS_PAGE_MAIN}>
        <SaasPageHeader
          eyebrow="Coach workspace"
          title="Nutrition"
          description="Manage nutrition plans for your members."
          accent="emerald"
          className="mb-8"
        />
        <div data-tour="nutrition-planning" className="sr-only" aria-hidden />

        {errorMessage ? (
          <ErrorStateBanner
            title="Could not save nutrition data"
            message={errorMessage}
            onRetry={() => {
              void fetchPlans()
              void fetchAssignments()
            }}
            embedded
            className="mb-6"
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

        <div id="nutrition-form" className={`${PROGRESS_PRO_CARD} mb-8 p-6 sm:p-8`}>
          <ProgressProSectionHeader
            eyebrow="Plan builder"
            title={editingPlan ? "Edit nutrition plan" : "Add nutrition plan"}
            description="Define macro targets and goals for your coaching clients."
            accent="emerald"
            action={
              editingPlan ? (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className={PROGRESS_PRO_BTN_SECONDARY}
                >
                  Cancel
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-emerald-200">
                  <Plus className="h-4 w-4" aria-hidden />
                  Premium form
                </span>
              )
            }
          />

          <form onSubmit={handleSubmit(savePlan)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <FormField
                label="Title"
                icon={Utensils}
                iconClassName="text-emerald-400"
                htmlFor="nutrition-title"
              >
                <input
                  id="nutrition-title"
                  type="text"
                  placeholder="e.g. Lean bulk phase"
                  className={inputClassName}
                  {...register("title", { required: true })}
                />
              </FormField>

              <FormField
                label="Goal"
                icon={Target}
                iconClassName="text-cyan-400"
                htmlFor="nutrition-goal"
              >
                <input
                  id="nutrition-goal"
                  type="text"
                  placeholder="e.g. Muscle gain"
                  className={inputClassName}
                  {...register("goal")}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <FormField
                label="Calories"
                icon={Flame}
                iconClassName="text-orange-400"
                htmlFor="nutrition-calories"
              >
                <input
                  id="nutrition-calories"
                  type="number"
                  placeholder="2500"
                  className={inputClassName}
                  {...register("calories")}
                />
              </FormField>

              <FormField
                label="Protein (g)"
                icon={Beef}
                iconClassName="text-emerald-400"
                htmlFor="nutrition-protein"
              >
                <input
                  id="nutrition-protein"
                  type="number"
                  placeholder="180"
                  className={inputClassName}
                  {...register("protein")}
                />
              </FormField>

              <FormField
                label="Carbs (g)"
                icon={Wheat}
                iconClassName="text-amber-400"
                htmlFor="nutrition-carbs"
              >
                <input
                  id="nutrition-carbs"
                  type="number"
                  placeholder="250"
                  className={inputClassName}
                  {...register("carbs")}
                />
              </FormField>

              <FormField
                label="Fats (g)"
                icon={Droplets}
                iconClassName="text-violet-400"
                htmlFor="nutrition-fats"
              >
                <input
                  id="nutrition-fats"
                  type="number"
                  placeholder="70"
                  className={inputClassName}
                  {...register("fats")}
                />
              </FormField>
            </div>

            <div className={`${PROGRESS_PRO_CARD_INNER} p-5`}>
              <div className="mb-2 flex items-center gap-2">
                <Utensils className="h-4 w-4 text-emerald-400" aria-hidden />
                <label htmlFor="nutrition-description" className={labelClassName}>
                  Description
                </label>
              </div>
              <textarea
                id="nutrition-description"
                placeholder="Meal timing, preferences, or coaching notes…"
                className={textareaClassName}
                {...register("description")}
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" className={PROGRESS_PRO_BTN_PRIMARY} disabled={planSaving}>
                {planSaving
                  ? "Saving…"
                  : editingPlan
                    ? "Save changes"
                    : (
                      <>
                        <Plus className="h-4 w-4" aria-hidden />
                        Add nutrition plan
                      </>
                    )}
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <NutritionPageSkeleton />
        ) : plans.length === 0 ? (
          <SaasEmptyState preset="nutrition" />
        ) : (
          <section className="mb-8 space-y-6">
            <ProgressProSectionHeader
              eyebrow="Your library"
              title="Nutrition plans"
              description="Review macro targets and assigned members for each plan."
              accent="cyan"
            />
            <div className="grid gap-6">
              {plans.map((plan) => (
                <NutritionPlanCard
                  key={plan.id}
                  plan={plan}
                  assignedCount={
                    (assignmentsByPlan.get(plan.id) ?? []).length
                  }
                  description={plan.description}
                  onEdit={setEditingPlan}
                />
              ))}
            </div>
          </section>
        )}

        <div className={`${PROGRESS_PRO_CARD} mb-8 p-6 sm:p-8`}>
          <ProgressProSectionHeader
            eyebrow="Member assignment"
            title="Assign nutrition plan"
            description="Link a nutrition plan to a member — same flow as workout assignments."
            accent="violet"
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <FormField
              label="Member"
              icon={User}
              iconClassName="text-cyan-400"
              htmlFor="assign-member"
            >
              <select
                id="assign-member"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className={selectClassName}
              >
                <option value="" className="bg-zinc-900">
                  Select member
                </option>
                {members.map((member) => (
                  <option key={member.id} value={member.id} className="bg-zinc-900">
                    {member.full_name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Nutrition plan"
              icon={Utensils}
              iconClassName="text-emerald-400"
              htmlFor="assign-plan"
            >
              <select
                id="assign-plan"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className={selectClassName}
              >
                <option value="" className="bg-zinc-900">
                  Select nutrition plan
                </option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id} className="bg-zinc-900">
                    {plan.title}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={assignPlan}
              disabled={assignSaving}
              className="btn-gradient px-6 py-3 disabled:opacity-50"
            >
              {assignSaving ? "Assigning…" : "Assign nutrition plan"}
            </button>
          </div>
        </div>

        {assignments.length > 0 ? (
          <section className={`${PROGRESS_PRO_CARD} p-6 sm:p-8`}>
            <ProgressProSectionHeader
              eyebrow="Active assignments"
              title="Assigned nutrition plans"
              description="Members currently following a nutrition plan."
              accent="cyan"
              action={
                <span className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-300">
                  {assignments.length}{" "}
                  {assignments.length === 1 ? "assignment" : "assignments"}
                </span>
              }
            />

            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <div
                  key={`${assignment.member_id}-${assignment.nutrition_plan_id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b1224] p-4"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {assignment.members?.full_name ?? "Member"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {assignment.nutrition_plans?.title ?? "Plan"}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Assigned{" "}
                      {new Date(assignment.assigned_at).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge status={assignment.status}>{assignment.status}</Badge>
                    <button
                      type="button"
                      onClick={() =>
                        removeAssignment(
                          assignment.member_id,
                          assignment.nutrition_plan_id,
                        )
                      }
                      className="rounded-lg bg-red-500/20 px-3 py-1 text-sm text-red-300 transition hover:bg-red-500/30"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {!loading && plans.length > 0 && assignments.length === 0 ? (
          <section className={`${PROGRESS_PRO_CARD} mt-8 p-6 sm:p-8`}>
            <SaasEmptyState preset="nutritionAssignments" compact />
          </section>
        ) : null}
      </main>
    </ProtectedShell>
  )
}
