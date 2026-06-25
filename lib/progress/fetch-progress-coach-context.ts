import type { SupabaseClient } from "@supabase/supabase-js"
import { getCoachMemberIds, getCoachScope } from "@/lib/auth/coach-scope"
import type { Database } from "@/lib/database.types"
import { resolveLinkedMemberId } from "@/lib/member-link"

export type MemberCoachContext = {
  memberId: string
  workoutCompletions14d: number
  hasNutritionPlan: boolean
  nutritionPlanTitle: string | null
}

export type ProgressCoachContextData = {
  memberContexts: Map<string, MemberCoachContext>
}

const CONTEXT_WINDOW_DAYS = 14

function contextWindowStartIso(): string {
  const start = new Date()
  start.setDate(start.getDate() - CONTEXT_WINDOW_DAYS)
  start.setHours(0, 0, 0, 0)
  return start.toISOString()
}

export async function fetchProgressCoachContext(
  supabase: SupabaseClient<Database>,
): Promise<{ data: ProgressCoachContextData | null; error: string | null }> {
  try {
    const scope = await getCoachScope(supabase)
    let memberIds: string[] | null = null

    if (scope.isMember) {
      const memberId = await resolveLinkedMemberId(supabase)
      memberIds = memberId ? [memberId] : []
    } else if (scope.isCoach && scope.userId) {
      memberIds = await getCoachMemberIds(supabase, scope.userId)
    }

    if (memberIds && memberIds.length === 0) {
      return { data: { memberContexts: new Map() }, error: null }
    }

    const windowStart = contextWindowStartIso()

    let completionsQuery = supabase
      .from("workout_completions")
      .select("member_id, completed_at")
      .gte("completed_at", windowStart)

    if (memberIds) {
      completionsQuery = completionsQuery.in("member_id", memberIds)
    }

    let nutritionQuery = supabase.from("member_nutrition_assignments").select(`
        member_id,
        status,
        nutrition_plans (
          title
        )
      `)

    if (memberIds) {
      nutritionQuery = nutritionQuery.in("member_id", memberIds)
    }

    const [completionsResult, nutritionResult] = await Promise.all([
      completionsQuery,
      nutritionQuery,
    ])

    if (completionsResult.error) {
      return { data: null, error: completionsResult.error.message }
    }
    if (nutritionResult.error) {
      return { data: null, error: nutritionResult.error.message }
    }

    const memberContexts = new Map<string, MemberCoachContext>()

    const ensureContext = (memberId: string): MemberCoachContext => {
      const existing = memberContexts.get(memberId)
      if (existing) return existing

      const created: MemberCoachContext = {
        memberId,
        workoutCompletions14d: 0,
        hasNutritionPlan: false,
        nutritionPlanTitle: null,
      }
      memberContexts.set(memberId, created)
      return created
    }

    for (const completion of completionsResult.data ?? []) {
      if (!completion.member_id) continue
      const ctx = ensureContext(completion.member_id)
      ctx.workoutCompletions14d += 1
    }

    type NutritionAssignmentRow = {
      member_id: string
      status: string
      nutrition_plans: { title: string } | null
    }

    for (const row of (nutritionResult.data ?? []) as NutritionAssignmentRow[]) {
      if (!row.member_id) continue
      const status = (row.status ?? "").toLowerCase()
      if (status === "inactive" || status === "cancelled") continue

      const ctx = ensureContext(row.member_id)
      ctx.hasNutritionPlan = true
      ctx.nutritionPlanTitle = row.nutrition_plans?.title ?? ctx.nutritionPlanTitle
    }

    return { data: { memberContexts }, error: null }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load progress coach context"
    return { data: null, error: message }
  }
}
