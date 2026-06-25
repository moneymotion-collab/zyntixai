import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getCoachMemberIds, getCoachScope } from "@/lib/auth/coach-scope"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/lib/database.types"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"
import {
  fetchMemberClientCheckIns,
  upsertMemberSelfCheckIn,
} from "@/lib/members/member-client-checkins"
import type { CreateClientCheckInInput } from "@/lib/types/client-check-ins"

type LegacyCheckInBody = {
  member_id?: string
  weight_kg?: number | null
  energy?: number | null
  sleep?: number | null
  motivation?: number | null
  notes?: string | null
  weight?: number | null
  sleep_quality?: number | null
  stress?: number | null
  hunger?: number | null
  mood?: string | null
  wins?: string | null
  struggles?: string | null
}

const DEPRECATION_HEADERS = {
  Deprecation: "true",
  Link: '</my-check-ins>; rel="successor-version"',
  Warning: '299 - "Deprecated: use client_checkins via /my-check-ins or Supabase client_checkins directly."',
}

function normalizeOptionalNumber(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(Number(value))) return null
  return Number(value)
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed || null
}

async function assertMemberAccess(
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

async function getAuthenticatedClient() {
  const access = await requireAppAccess()
  if (!access.ok) {
    return { ok: false as const, response: access.response }
  }

  const { supabase, user } = access.context

  const writeClient = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase
  ) as SupabaseClient<Database>

  return { ok: true as const, supabase, writeClient, user }
}

function toCreateInput(
  memberId: string,
  memberName: string,
  body: LegacyCheckInBody,
): CreateClientCheckInInput {
  return {
    memberId,
    memberName,
    weight: normalizeOptionalNumber(body.weight ?? body.weight_kg),
    energy: normalizeOptionalNumber(body.energy),
    sleepQuality: normalizeOptionalNumber(body.sleep_quality ?? body.sleep),
    stress: normalizeOptionalNumber(body.stress),
    hunger: normalizeOptionalNumber(body.hunger),
    mood: normalizeOptionalText(body.mood),
    wins: normalizeOptionalText(body.wins),
    struggles: normalizeOptionalText(body.struggles),
    notes: normalizeOptionalText(body.notes),
  }
}

export async function GET(req: Request) {
  const memberId = new URL(req.url).searchParams.get("member_id")?.trim()

  if (!memberId) {
    return NextResponse.json(
      { error: "member_id is required.", deprecated: true },
      { status: 400, headers: DEPRECATION_HEADERS },
    )
  }

  const auth = await getAuthenticatedClient()
  if (!auth.ok) {
    return auth.response
  }

  const memberAccess = await assertMemberAccess(auth.supabase, memberId, auth.user.id)
  if (!memberAccess.ok) {
    return NextResponse.json(
      { error: memberAccess.error, deprecated: true },
      { status: memberAccess.status, headers: DEPRECATION_HEADERS },
    )
  }

  const result = await fetchMemberClientCheckIns(auth.writeClient, memberId)

  if (result.error) {
    return NextResponse.json(
      { error: result.error, deprecated: true },
      { status: 500, headers: DEPRECATION_HEADERS },
    )
  }

  return NextResponse.json(
    {
      success: true,
      deprecated: true,
      source: "client_checkins",
      data: result.checkIns,
    },
    { headers: DEPRECATION_HEADERS },
  )
}

export async function POST(req: Request) {
  let body: LegacyCheckInBody

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON.", deprecated: true },
      { status: 400, headers: DEPRECATION_HEADERS },
    )
  }

  const memberId = body.member_id?.trim()
  if (!memberId) {
    return NextResponse.json(
      { error: "member_id is required.", deprecated: true },
      { status: 400, headers: DEPRECATION_HEADERS },
    )
  }

  const auth = await getAuthenticatedClient()
  if (!auth.ok) {
    return auth.response
  }

  const memberAccess = await assertMemberAccess(auth.supabase, memberId, auth.user.id)
  if (!memberAccess.ok) {
    return NextResponse.json(
      { error: memberAccess.error, deprecated: true },
      { status: memberAccess.status, headers: DEPRECATION_HEADERS },
    )
  }

  const { data: member, error: memberError } = await auth.supabase
    .from("members")
    .select("coach_id, full_name")
    .eq("id", memberId)
    .maybeSingle()

  if (memberError) {
    return NextResponse.json(
      { error: memberError.message, deprecated: true },
      { status: 500, headers: DEPRECATION_HEADERS },
    )
  }

  if (!member?.coach_id) {
    return NextResponse.json(
      { error: "Member is not linked to a coach.", deprecated: true },
      { status: 400, headers: DEPRECATION_HEADERS },
    )
  }

  const result = await upsertMemberSelfCheckIn(
    auth.writeClient,
    member.coach_id,
    toCreateInput(memberId, member.full_name ?? "Member", body),
  )

  if (result.error) {
    return NextResponse.json(
      { error: result.error, deprecated: true },
      { status: 500, headers: DEPRECATION_HEADERS },
    )
  }

  return NextResponse.json(
    {
      success: true,
      deprecated: true,
      source: "client_checkins",
      updated: result.updated,
      data: result.checkIn,
    },
    { headers: DEPRECATION_HEADERS },
  )
}
