import { NextResponse } from "next/server"
import { createChatCompletion } from "@/lib/ai-coach/openai"
import { hasAiApiKey } from "@/lib/ai-coach/provider"
import {
  fetchMarketingCoachHistory,
  saveMarketingCoachMessage,
  toChatCompletionMessages,
} from "@/lib/marketing/coach/conversations"
import { buildM7MarketingCoachPrompt } from "@/lib/marketing/coach/m7-system-prompt"
import { loadMarketingCoachContext } from "@/lib/marketing/coach/load-marketing-coach-context"
import { generateStrategyFallbackResponse } from "@/lib/marketing/coach/strategy-fallback"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function GET() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { data, error } = await fetchMarketingCoachHistory(supabase, user.id)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ messages: data })
}

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const body = (await req.json()) as { message?: unknown }
  const message = typeof body.message === "string" ? body.message.trim() : ""

  if (!message) {
    return NextResponse.json({ error: "message is required." }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { data: history, error: historyError } = await fetchMarketingCoachHistory(
    supabase,
    user.id,
  )

  if (historyError) {
    return NextResponse.json({ error: historyError }, { status: 500 })
  }

  const contextResult = await loadMarketingCoachContext(supabase, user.id)
  if (contextResult.error) {
    return NextResponse.json({ error: contextResult.error }, { status: 500 })
  }

  const systemPrompt = buildM7MarketingCoachPrompt(contextResult.data)
  const priorMessages = toChatCompletionMessages(history)

  let answer: string
  let mode: "openai" | "strategy" = "openai"

  if (hasAiApiKey()) {
    const completion = await createChatCompletion([
      { role: "system", content: systemPrompt },
      ...priorMessages,
      { role: "user", content: message },
    ])

    if (completion.ok) {
      answer = completion.content
    } else {
      answer = generateStrategyFallbackResponse(message, contextResult.data)
      mode = "strategy"
    }
  } else {
    answer = generateStrategyFallbackResponse(message, contextResult.data)
    mode = "strategy"
  }

  const saveUser = await saveMarketingCoachMessage(supabase, user.id, "user", message)
  if (saveUser.error) {
    return NextResponse.json({ error: saveUser.error }, { status: 500 })
  }

  const saveAssistant = await saveMarketingCoachMessage(
    supabase,
    user.id,
    "assistant",
    answer,
  )
  if (saveAssistant.error) {
    return NextResponse.json({ error: saveAssistant.error }, { status: 500 })
  }

  return NextResponse.json({
    answer,
    mode,
    brandName: contextResult.data?.brandName ?? null,
  })
}

export async function DELETE() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { error } = await supabase
    .from("marketing_coach_conversations")
    .delete()
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
