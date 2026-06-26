import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { normalizeRole } from "@/lib/auth/roles"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"
import type { Database } from "@/lib/database.types"
import { handlePlatformIntent } from "@/lib/platform-assistant/handle-intent"
import {
  expandFollowUpCommand,
  parseIntent,
} from "@/lib/platform-assistant/intent-router"
import { findModuleForPath } from "@/lib/platform-assistant/module-registry"
import { canUsePlatformAssistant } from "@/lib/platform-assistant/permissions"
import { resolvePageContext } from "@/lib/platform-assistant/resolve-page-context"
import { fetchScopedMembers } from "@/lib/platform-assistant/server-actions"
import type {
  PlatformAssistantRole,
  PlatformCommandRequest,
  PlatformCommandResponse,
  PlatformPageContext,
} from "@/lib/platform-assistant/types"

async function enrichPageContext(
  pageContext: PlatformPageContext,
  supabase: SupabaseClient<Database>,
): Promise<PlatformPageContext> {
  if (!pageContext.memberId || pageContext.memberName) {
    return pageContext
  }

  const { data } = await supabase
    .from("members")
    .select("full_name")
    .eq("id", pageContext.memberId)
    .maybeSingle()

  if (!data?.full_name) return pageContext

  return { ...pageContext, memberName: data.full_name }
}

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const { supabase, user, profile } = access.context
  const role = normalizeRole(profile.role) as PlatformAssistantRole
  const permission = canUsePlatformAssistant(role)

  if (!permission.allowed) {
    return NextResponse.json({ error: permission.reason }, { status: 403 })
  }

  let body: PlatformCommandRequest
  try {
    body = (await req.json()) as PlatformCommandRequest
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const command = body.command?.trim()
  if (!command) {
    return NextResponse.json({ error: "Command is required." }, { status: 400 })
  }

  const pathname = body.pageContext?.pathname ?? "/dashboard"
  let pageContext = await enrichPageContext(
    body.pageContext ?? resolvePageContext(pathname),
    supabase,
  )

  const expandedCommand = expandFollowUpCommand(
    command,
    body.sessionMemory?.lastEntity,
  )

  const module = findModuleForPath(pageContext.pathname)
  if (module?.handle) {
    const pluginResult = await module.handle({
      command: expandedCommand,
      pageContext,
      role,
      sessionMemory: body.sessionMemory ?? { messages: [] },
    })
    if (pluginResult) {
      return NextResponse.json(pluginResult satisfies PlatformCommandResponse)
    }
  }

  const isAdmin = role === "admin"
  const members =
    role === "member"
      ? []
      : await fetchScopedMembers(supabase, user.id, isAdmin)

  const intent = parseIntent(expandedCommand, pageContext)
  const response = handlePlatformIntent({
    intent,
    command: expandedCommand,
    pageContext,
    members,
    role: role ?? "coach",
  })

  return NextResponse.json(response)
}
