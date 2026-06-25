import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type { AiMessageContentType } from "./detect-content-type"
import { insertThreadMessages } from "./messages"
import type { AiCoachThreadStatus } from "./types"
import { deriveTopic } from "./prompt"

const SUGGESTION_STATUS: AiCoachThreadStatus = "Suggestion sent"

export async function getThreadById(
  supabase: SupabaseClient<Database>,
  threadId: string,
) {
  const { data, error } = await supabase
    .from("ai_coach_threads")
    .select("*")
    .eq("id", threadId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export async function persistAiCoachConversation(params: {
  supabase: SupabaseClient<Database>
  memberId: string
  threadId?: string
  prompt: string
  reply: string
  contentType: AiMessageContentType
  existingTopic?: string
}) {
  const now = new Date().toISOString()
  const topic = params.existingTopic ?? deriveTopic(params.prompt)
  let threadId = params.threadId

  if (threadId) {
    const { error } = await params.supabase
      .from("ai_coach_threads")
      .update({
        last_message: params.reply,
        last_active: now,
        status: SUGGESTION_STATUS,
      })
      .eq("id", threadId)

    if (error) throw new Error(error.message)
  } else {
    const { data, error } = await params.supabase
      .from("ai_coach_threads")
      .insert({
        member_id: params.memberId,
        topic,
        last_message: params.reply,
        last_active: now,
        status: SUGGESTION_STATUS,
      })
      .select("id, topic, status")
      .single()

    if (error) throw new Error(error.message)
    threadId = data.id
  }

  const assistantMessage = await insertThreadMessages({
    supabase: params.supabase,
    threadId,
    userContent: params.prompt,
    assistantContent: params.reply,
    contentType: params.contentType,
  })

  const { data: thread, error: threadError } = await params.supabase
    .from("ai_coach_threads")
    .select("id, topic, status")
    .eq("id", threadId)
    .single()

  if (threadError) throw new Error(threadError.message)

  return {
    ...thread,
    messageId: assistantMessage.id,
    contentType: assistantMessage.content_type,
  }
}
