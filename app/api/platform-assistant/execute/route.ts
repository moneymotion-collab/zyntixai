import { NextResponse } from "next/server"
import { normalizeRole } from "@/lib/auth/roles"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"
import { canAccessMemberData } from "@/lib/platform-assistant/permissions"
import {
  executePlatformAction,
} from "@/lib/platform-assistant/server-actions"
import type {
  ActivityLogEntry,
  PlatformActionKind,
} from "@/lib/platform-assistant/types"

type ExecuteBody = {
  kind: PlatformActionKind
  payload: Record<string, unknown>
}

function activityEntry(
  type: string,
  label: string,
  detail?: string,
  href?: string,
): ActivityLogEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    label,
    detail,
    href,
    timestamp: new Date().toISOString(),
  }
}

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const { supabase, user, profile } = access.context
  const role = normalizeRole(profile.role)

  if (role === "member") {
    return NextResponse.json(
      { error: "Members cannot execute coach actions." },
      { status: 403 },
    )
  }

  let body: ExecuteBody
  try {
    body = (await req.json()) as ExecuteBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const { kind, payload } = body
  if (!kind || !payload) {
    return NextResponse.json({ error: "Missing action details." }, { status: 400 })
  }

  const memberId = payload.memberId ? String(payload.memberId) : undefined
  if (memberId) {
    const { data: member } = await supabase
      .from("members")
      .select("id, coach_id, full_name")
      .eq("id", memberId)
      .maybeSingle()

    if (!member) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 })
    }

    const memberAccess = canAccessMemberData(
      role,
      member.coach_id,
      user.id,
    )
    if (!memberAccess.allowed) {
      return NextResponse.json({ error: memberAccess.reason }, { status: 403 })
    }
  }

  const coachName =
    user.email?.split("@")[0]?.replace(/\./g, " ") ?? "Coach"

  const result = await executePlatformAction(
    supabase,
    kind,
    payload,
    coachName,
  )

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const activity =
    kind === "schedule_session"
      ? activityEntry(
          "session",
          "Session scheduled",
          payload.memberName ? String(payload.memberName) : undefined,
          result.href,
        )
      : kind === "assign_workout"
        ? activityEntry("workout", "Workout assigned", undefined, result.href)
        : activityEntry("action", result.detail, undefined, result.href)

  return NextResponse.json({
    ok: true,
    detail: result.detail,
    href: result.href,
    activityEntry: activity,
  })
}
