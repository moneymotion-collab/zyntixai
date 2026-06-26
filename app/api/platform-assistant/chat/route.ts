import { NextResponse } from "next/server"
import { normalizeRole } from "@/lib/auth/roles"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"
import { buildChatMessages } from "@/lib/ai-coach/prompt"
import { createChatCompletion } from "@/lib/ai-coach/openai"
import { buildCommandBarSystemPrompt } from "@/lib/platform-assistant/build-command-bar-prompt"
import { canUsePlatformAssistant } from "@/lib/platform-assistant/permissions"
import { resolveCommandBarAiContext } from "@/lib/platform-assistant/resolve-command-bar-context"
import { resolvePageContext } from "@/lib/platform-assistant/resolve-page-context"
import type {
  CommandBarChatRequest,
  CommandBarChatResponse,
  PlatformAssistantRole,
} from "@/lib/platform-assistant/types"

export async function POST(request: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const { supabase, user, profile } = access.context
  const role = normalizeRole(profile.role) as PlatformAssistantRole
  const permission = canUsePlatformAssistant(role)

  if (!permission.allowed) {
    return NextResponse.json({ error: permission.reason }, { status: 403 })
  }

  let body: CommandBarChatRequest
  try {
    body = (await request.json()) as CommandBarChatRequest
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const prompt = body.prompt?.trim()
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 })
  }

  const pathname = body.pageContext?.pathname ?? "/dashboard"
  const pageContext = body.pageContext ?? resolvePageContext(pathname)

  const aiContext = await resolveCommandBarAiContext(
    supabase,
    user,
    role ?? "coach",
    pageContext,
  )

  const history = (body.history ?? []).filter(
    (message) =>
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      message.content.trim().length > 0,
  )

  const chatMessages = buildChatMessages(history, prompt)
  const completion = await createChatCompletion(
    [
      {
        role: "system",
        content: buildCommandBarSystemPrompt(aiContext, pageContext),
      },
      ...chatMessages,
    ],
    { prompt, context: aiContext.scope === "member" ? aiContext : undefined },
  )

  if (!completion.ok) {
    return NextResponse.json({ error: completion.error }, { status: 502 })
  }

  const response: CommandBarChatResponse = { reply: completion.content }
  return NextResponse.json(response)
}
