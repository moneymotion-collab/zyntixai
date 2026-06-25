import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { DEMO_MEMBER_LEGACY_EMAIL_OR_FILTER } from "@/lib/demo/demo-members"
import { LOAD_DEMO_NUTRITION_PLAN_TITLES } from "@/lib/demo/load-demo-nutrition-plans"
import { resolveMembersOwnerColumn } from "@/lib/demo/members-owner-column"
import { demoFilter } from "@/lib/demo/demo-query-helpers"
import { insertWithSchemaFallback } from "@/lib/demo/insert-with-schema-fallback"
import { resolveNutritionPlansOwnerColumn } from "@/lib/demo/nutrition-plans-owner-column"

type DemoMemberRef = { id: string; full_name: string }
type DemoPlanRef = { id: string; title: string }

type DemoNutritionAssignmentInsert =
  Database["public"]["Tables"]["member_nutrition_assignments"]["Insert"] & {
    is_demo?: boolean
  }

const LOAD_DEMO_MEMBER_NUTRITION_ASSIGNMENTS: Record<string, string> = {
  "Sarah Johnson": "Fat Loss Plan",
  "Mike Roberts": "Muscle Gain Plan",
  "Emma Davis": "Fat Loss Plan",
  "James Wilson": "Muscle Gain Plan",
  "Olivia Brown": "Fat Loss Plan",
}

async function fetchDemoMembers(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ members: DemoMemberRef[]; error: string | null }> {
  const ownerColumn = resolveMembersOwnerColumn()

  const flagged = await supabase
    .from("members")
    .select("id, full_name")
    .eq(ownerColumn, userId)
    .eq("is_demo", true)
    .order("full_name")

  if (!flagged.error && (flagged.data?.length ?? 0) > 0) {
    return { members: flagged.data ?? [], error: null }
  }

  if (flagged.error && !flagged.error.message.includes("is_demo")) {
    return { members: [], error: flagged.error.message }
  }

  const legacy = await supabase
    .from("members")
    .select("id, full_name")
    .eq(ownerColumn, userId)
    .or(DEMO_MEMBER_LEGACY_EMAIL_OR_FILTER)
    .order("full_name")

  if (legacy.error) {
    return { members: [], error: legacy.error.message }
  }

  return { members: legacy.data ?? [], error: null }
}

async function fetchLoadDemoNutritionPlans(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ plans: DemoPlanRef[]; error: string | null }> {
  const ownerColumn = resolveNutritionPlansOwnerColumn()

  const flagged = await demoFilter(supabase, "nutrition_plans")
    .eq(ownerColumn, userId)
    .eq("is_demo", true)
    .in("title", LOAD_DEMO_NUTRITION_PLAN_TITLES)
    .order("title")
    .select("id, title")

  if (!flagged.error && ((flagged.data as DemoPlanRef[] | null)?.length ?? 0) > 0) {
    return { plans: (flagged.data as DemoPlanRef[]) ?? [], error: null }
  }

  if (flagged.error && !flagged.error.message.includes("is_demo")) {
    return { plans: [], error: flagged.error.message }
  }

  const legacy = await supabase
    .from("nutrition_plans")
    .select("id, title")
    .eq(ownerColumn, userId)
    .in("title", LOAD_DEMO_NUTRITION_PLAN_TITLES)
    .order("title")

  if (legacy.error) {
    return { plans: [], error: legacy.error.message }
  }

  return { plans: legacy.data ?? [], error: null }
}

async function clearDemoNutritionAssignments(
  supabase: SupabaseClient<Database>,
  memberIds: string[],
): Promise<{ error: string | null }> {
  if (memberIds.length === 0) {
    return { error: null }
  }

  const { error: demoDeleteError } = await demoFilter(
    supabase,
    "member_nutrition_assignments",
  )
    .delete()
    .eq("is_demo", true)
    .in("member_id", memberIds)
    .select()

  if (!demoDeleteError) {
    return { error: null }
  }

  if (!demoDeleteError.message.includes("is_demo")) {
    return { error: demoDeleteError.message }
  }

  const { error: legacyDeleteError } = await supabase
    .from("member_nutrition_assignments")
    .delete()
    .in("member_id", memberIds)

  return { error: legacyDeleteError?.message ?? null }
}

function buildLoadDemoNutritionAssignments(
  members: DemoMemberRef[],
  plans: DemoPlanRef[],
): DemoNutritionAssignmentInsert[] {
  const plansByTitle = new Map(plans.map((plan) => [plan.title, plan.id]))
  const assignedAt = new Date().toISOString()

  return members.flatMap((member) => {
    const planTitle = LOAD_DEMO_MEMBER_NUTRITION_ASSIGNMENTS[member.full_name]
    const nutritionPlanId = planTitle ? plansByTitle.get(planTitle) : undefined

    if (!nutritionPlanId) {
      return []
    }

    return [
      {
        member_id: member.id,
        nutrition_plan_id: nutritionPlanId,
        assigned_at: assignedAt,
        status: "active",
        is_demo: true,
      },
    ]
  })
}

export async function loadDemoNutritionAssignmentsForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ nutritionAssignmentsCreated: number; error: string | null }> {
  const { members, error: membersError } = await fetchDemoMembers(
    supabase,
    userId,
  )

  const { plans, error: plansError } = await fetchLoadDemoNutritionPlans(
    supabase,
    userId,
  )

  if (membersError) {
    return { nutritionAssignmentsCreated: 0, error: membersError }
  }

  if (plansError) {
    return { nutritionAssignmentsCreated: 0, error: plansError }
  }

  if (members.length === 0 || plans.length === 0) {
    return { nutritionAssignmentsCreated: 0, error: null }
  }

  const memberIds = members.map((member) => member.id)
  const clearResult = await clearDemoNutritionAssignments(supabase, memberIds)

  if (clearResult.error) {
    return { nutritionAssignmentsCreated: 0, error: clearResult.error }
  }

  const rows = buildLoadDemoNutritionAssignments(members, plans)

  const insertResult = await insertWithSchemaFallback(
    supabase,
    "member_nutrition_assignments",
    rows as Array<Record<string, unknown>>,
    { select: "member_id" },
  )

  if (insertResult.error) {
    return { nutritionAssignmentsCreated: 0, error: insertResult.error.message }
  }

  return {
    nutritionAssignmentsCreated: insertResult.data?.length ?? 0,
    error: null,
  }
}
