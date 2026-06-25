import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { DEMO_MEMBER_LEGACY_EMAIL_OR_FILTER } from "@/lib/demo/demo-members"
import { DEMO_NUTRITION_PLAN_SEEDS } from "@/lib/demo/demo-nutrition-plans"
import { resolveMembersOwnerColumn } from "@/lib/demo/members-owner-column"
import { demoFilter } from "@/lib/demo/demo-query-helpers"
import { resolveNutritionPlansOwnerColumn } from "@/lib/demo/nutrition-plans-owner-column"
import { insertWithSchemaFallback } from "@/lib/demo/insert-with-schema-fallback"

type DemoMemberRef = { id: string; full_name: string }
type DemoPlanRef = { id: string }

type DemoNutritionAssignmentInsert =
  Database["public"]["Tables"]["member_nutrition_assignments"]["Insert"] & {
    is_demo?: boolean
  }

export type GenerateDemoNutritionAssignmentsResult = {
  nutritionAssignmentsCreated: number
  error: string | null
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

async function fetchDemoNutritionPlans(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ plans: DemoPlanRef[]; error: string | null }> {
  const ownerColumn = resolveNutritionPlansOwnerColumn()
  const demoTitles = DEMO_NUTRITION_PLAN_SEEDS.map((plan) => plan.title)

  const flagged = await demoFilter(supabase, "nutrition_plans")
    .eq(ownerColumn, userId)
    .eq("is_demo", true)
    .order("title")
    .select("id")

  if (!flagged.error && ((flagged.data as DemoPlanRef[] | null)?.length ?? 0) > 0) {
    return { plans: (flagged.data as DemoPlanRef[]) ?? [], error: null }
  }

  if (flagged.error && !flagged.error.message.includes("is_demo")) {
    return { plans: [], error: flagged.error.message }
  }

  const legacy = await supabase
    .from("nutrition_plans")
    .select("id")
    .eq(ownerColumn, userId)
    .in("title", demoTitles)
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

export async function clearDemoNutritionAssignmentsForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ error: string | null }> {
  const { members, error: membersError } = await fetchDemoMembers(
    supabase,
    userId,
  )

  if (membersError) {
    return { error: membersError }
  }

  const memberIds = members.map((member) => member.id)
  return clearDemoNutritionAssignments(supabase, memberIds)
}

function hoursAgo(hours: number): string {
  const date = new Date()
  date.setHours(date.getHours() - hours)
  return date.toISOString()
}

function assignedAtForMember(member: DemoMemberRef, index: number): string {
  if (member.full_name === "James Wilson") {
    return hoursAgo(7)
  }

  return hoursAgo(index * 3 + 24)
}

function buildDemoNutritionAssignments(
  members: DemoMemberRef[],
  plans: DemoPlanRef[],
): DemoNutritionAssignmentInsert[] {
  return members.map((member, index) => ({
    member_id: member.id,
    nutrition_plan_id: plans[index % plans.length].id,
    assigned_at: assignedAtForMember(member, index),
    status: "active",
    is_demo: true,
  }))
}

export async function generateDemoNutritionAssignmentsForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<GenerateDemoNutritionAssignmentsResult> {
  const { members, error: membersError } = await fetchDemoMembers(
    supabase,
    userId,
  )

  const { plans, error: plansError } = await fetchDemoNutritionPlans(
    supabase,
    userId,
  )

  console.log("[demo/generate] nutrition members found:", members.length)
  console.log("[demo/generate] nutrition plans found:", plans.length)

  if (membersError) {
    console.error("[demo/generate] nutrition members fetch error:", membersError)
    return { nutritionAssignmentsCreated: 0, error: membersError }
  }

  if (plansError) {
    console.error("[demo/generate] nutrition plans fetch error:", plansError)
    return { nutritionAssignmentsCreated: 0, error: plansError }
  }

  if (members.length === 0 || plans.length === 0) {
    return { nutritionAssignmentsCreated: 0, error: null }
  }

  const memberIds = members.map((member) => member.id)
  const clearResult = await clearDemoNutritionAssignments(supabase, memberIds)

  if (clearResult.error) {
    console.error(
      "[demo/generate] clear nutrition assignments error:",
      clearResult.error,
    )
    return { nutritionAssignmentsCreated: 0, error: clearResult.error }
  }

  const rows = buildDemoNutritionAssignments(members, plans)

  const insertResult = await insertWithSchemaFallback(
    supabase,
    "member_nutrition_assignments",
    rows as Array<Record<string, unknown>>,
    { select: "member_id" },
  )

  if (insertResult.error) {
    console.error(
      "[demo/generate] nutrition insert error:",
      insertResult.error.message,
    )
    return { nutritionAssignmentsCreated: 0, error: insertResult.error.message }
  }

  const created = insertResult.data?.length ?? 0
  console.log("[demo/generate] nutrition assignments created:", created)

  return { nutritionAssignmentsCreated: created, error: null }
}
