import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getCoachMemberIds, getCoachScope } from "@/lib/auth/coach-scope"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

type ClientProfileInsert =
  Database["public"]["Tables"]["client_profiles"]["Insert"]

type ClientProfileBody = {
  member_id?: string
  age?: number | null
  gender?: string | null
  height_cm?: number | null
  weight_kg?: number | null
  goal_weight?: number | null
  fitness_level?: string | null
  training_days?: number | string | string[] | null
  primary_goal?: string | null
  injuries?: string | string[] | null
  mobility_notes?: string | null
  allergies?: string | string[] | null
  food_preferences?: string | string[] | null
  coach_notes?: string | null
  intake_summary?: string | null
}

function normalizeTextField(
  value: string | string[] | number | null | undefined,
): string | null {
  if (value == null) return null

  if (Array.isArray(value)) {
    const items = value.map((item) => String(item).trim()).filter(Boolean)
    return items.length > 0 ? items.join(", ") : null
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : null
  }

  const trimmed = value.trim()
  return trimmed || null
}

function normalizeOptionalNumber(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(Number(value))) return null
  return Number(value)
}

function buildPartialProfile(
  body: ClientProfileBody,
  memberId: string,
): Partial<ClientProfileInsert> {
  const profile: Partial<ClientProfileInsert> = { member_id: memberId }

  if ("age" in body) profile.age = normalizeOptionalNumber(body.age)
  if ("gender" in body) profile.gender = normalizeTextField(body.gender)
  if ("height_cm" in body) profile.height_cm = normalizeOptionalNumber(body.height_cm)
  if ("weight_kg" in body) profile.weight_kg = normalizeOptionalNumber(body.weight_kg)
  if ("goal_weight" in body) profile.goal_weight = normalizeOptionalNumber(body.goal_weight)
  if ("fitness_level" in body) profile.fitness_level = normalizeTextField(body.fitness_level)
  if ("training_days" in body) profile.training_days = normalizeTextField(body.training_days)
  if ("primary_goal" in body) profile.primary_goal = normalizeTextField(body.primary_goal)
  if ("injuries" in body) profile.injuries = normalizeTextField(body.injuries)
  if ("mobility_notes" in body) profile.mobility_notes = normalizeTextField(body.mobility_notes)
  if ("allergies" in body) profile.allergies = normalizeTextField(body.allergies)
  if ("food_preferences" in body) {
    profile.food_preferences = normalizeTextField(body.food_preferences)
  }
  if ("coach_notes" in body) profile.coach_notes = normalizeTextField(body.coach_notes)
  if ("intake_summary" in body) {
    profile.intake_summary = normalizeTextField(body.intake_summary)
  }

  return profile
}

async function assertClientProfileAccess(
  supabase: SupabaseClient<Database>,
  memberId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const scope = await getCoachScope(supabase)

  if (scope.isAdmin) {
    return { ok: true }
  }

  if (scope.isCoach) {
    const allowedMemberIds = await getCoachMemberIds(supabase, userId)
    if (allowedMemberIds.includes(memberId)) {
      return { ok: true }
    }

    return {
      ok: false,
      status: 403,
      error: "You do not have access to this member.",
    }
  }

  const { data: member, error } = await supabase
    .from("members")
    .select("user_id")
    .eq("id", memberId)
    .maybeSingle()

  if (error) {
    return { ok: false, status: 500, error: error.message }
  }

  if (!member) {
    return { ok: false, status: 404, error: "Member not found." }
  }

  if (member.user_id === userId) {
    return { ok: true }
  }

  return {
    ok: false,
    status: 403,
    error: "You do not have access to this member.",
  }
}

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  let body: ClientProfileBody

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 })
  }

  console.log("CLIENT PROFILE request body:", body)

  const memberId = body.member_id?.trim()
  if (!memberId) {
    return NextResponse.json({ error: "member_id is required." }, { status: 400 })
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  console.log("CLIENT PROFILE logged in user:", user?.id ?? null, authError?.message ?? null)

  if (authError) {
    console.log("CLIENT PROFILE Supabase auth error:", authError)
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const profileAccess = await assertClientProfileAccess(supabase, memberId, user.id)
  if (!profileAccess.ok) {
    return NextResponse.json({ error: profileAccess.error }, { status: profileAccess.status })
  }

  const writeClient = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase
  ) as SupabaseClient<Database>

  const profile = buildPartialProfile(body, memberId)

  const { data: existingRows, error: lookupError } = await writeClient
    .from("client_profiles")
    .select("member_id")
    .eq("member_id", memberId)
    .limit(1)

  if (lookupError) {
    console.log("CLIENT PROFILE Supabase error:", lookupError)
    return NextResponse.json({ error: lookupError.message }, { status: 500 })
  }

  const { member_id: _memberId, ...profileUpdate } = profile

  const saveResult = existingRows?.length
    ? await writeClient
        .from("client_profiles")
        .update(profileUpdate)
        .eq("member_id", memberId)
        .select()
        .single()
    : await writeClient
        .from("client_profiles")
        .insert(profile as ClientProfileInsert)
        .select()
        .single()

  const { data: savedProfile, error: saveError } = saveResult

  if (saveError) {
    console.log("CLIENT PROFILE Supabase error:", saveError)
    return NextResponse.json({ error: saveError.message }, { status: 500 })
  }

  console.log("CLIENT PROFILE saved data:", savedProfile)

  return NextResponse.json(savedProfile)
}
