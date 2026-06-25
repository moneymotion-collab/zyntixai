import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type { AiMessageContentType } from "./detect-content-type"

export type AiCoachMessageRow =
  Database["public"]["Tables"]["ai_coach_messages"]["Row"]

export async function fetchThreadMessages(
  supabase: SupabaseClient<Database>,
  threadId: string,
): Promise<AiCoachMessageRow[]> {
  const { data, error } = await supabase
    .from("ai_coach_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function insertThreadMessages(params: {
  supabase: SupabaseClient<Database>
  threadId: string
  userContent: string
  assistantContent: string
  contentType: AiMessageContentType
}) {
  const { error: userError } = await params.supabase
    .from("ai_coach_messages")
    .insert({
      thread_id: params.threadId,
      role: "user",
      content: params.userContent,
      content_type: "general",
    })

  if (userError) throw new Error(userError.message)

  const { data, error: assistantError } = await params.supabase
    .from("ai_coach_messages")
    .insert({
      thread_id: params.threadId,
      role: "assistant",
      content: params.assistantContent,
      content_type: params.contentType,
    })
    .select("id, content_type, created_at")
    .single()

  if (assistantError) throw new Error(assistantError.message)
  return data
}
