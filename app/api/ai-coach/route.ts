import { NextResponse } from "next/server"
import { assertMemberAccess, getAiCoachAuth } from "@/lib/ai-coach/access"
import { resolveAiContext } from "@/lib/ai-coach/context"
import { detectContentType } from "@/lib/ai-coach/detect-content-type"
import { fetchThreadMessages } from "@/lib/ai-coach/messages"
import { createChatCompletion } from "@/lib/ai-coach/openai"
import { buildChatMessages, buildSystemPrompt } from "@/lib/ai-coach/prompt"
import { getThreadById, persistAiCoachConversation } from "@/lib/ai-coach/threads"
import type { AiCoachRequestBody, AiCoachResponseBody } from "@/lib/ai-coach/types"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(request: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  let body: AiCoachRequestBody

  try {
    body = (await request.json()) as AiCoachRequestBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const prompt = body.prompt?.trim()

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 })
  }

  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    )
  }

  const { auth } = authResult

  let memberId = body.memberId
  let existingTopic: string | undefined

  if (body.threadId) {
    let thread
    try {
      thread = await getThreadById(supabase, body.threadId)
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error ? err.message : "Failed to load thread.",
        },
        { status: 500 },
      )
    }

    if (!thread) {
      return NextResponse.json({ error: "Thread not found." }, { status: 404 })
    }

    memberId = thread.member_id
    existingTopic = thread.topic
  }

  if (!memberId) {
    return NextResponse.json(
      { error: "Select a member before sending a message." },
      { status: 400 },
    )
  }

  const memberAccess = await assertMemberAccess(supabase, auth, memberId)
  if (!memberAccess.ok) {
    return NextResponse.json({ error: memberAccess.error }, { status: memberAccess.status })
  }

  const context = await resolveAiContext(supabase, auth, memberId)

  let history: { role: string; content: string }[] = []
  if (body.threadId) {
    try {
      const messages = await fetchThreadMessages(supabase, body.threadId)
      history = messages.map((m) => ({ role: m.role, content: m.content }))
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error ? err.message : "Failed to load messages.",
        },
        { status: 500 },
      )
    }
  }

  const chatMessages = buildChatMessages(history, prompt)

  const completion = await createChatCompletion(
    [
      { role: "system", content: buildSystemPrompt(context) },
      ...chatMessages,
    ],
    { prompt, context },
  )

  if (!completion.ok) {
    return NextResponse.json({ error: completion.error }, { status: 502 })
  }

  const contentType = detectContentType(completion.content)

  try {
    const saved = await persistAiCoachConversation({
      supabase,
      memberId,
      threadId: body.threadId,
      prompt,
      reply: completion.content,
      contentType,
      existingTopic,
    })

    const response: AiCoachResponseBody = {
      reply: completion.content,
      threadId: saved.id,
      topic: saved.topic,
      status: saved.status,
      messageId: saved.messageId,
      contentType: saved.contentType,
    }

    return NextResponse.json(response)
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to save conversation.",
      },
      { status: 500 },
    )
  }
}
