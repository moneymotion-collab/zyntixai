import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

export type MarketingCoachMessageRow =
  Database["public"]["Tables"]["marketing_coach_conversations"]["Row"]

const HISTORY_LIMIT = 30

export async function fetchMarketingCoachHistory(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ data: MarketingCoachMessageRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from("marketing_coach_conversations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(HISTORY_LIMIT)

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data ?? [], error: null }
}

export async function saveMarketingCoachMessage(
  supabase: SupabaseClient<Database>,
  userId: string,
  role: "user" | "assistant",
  message: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("marketing_coach_conversations").insert({
    user_id: userId,
    role,
    message,
  })

  return { error: error?.message ?? null }
}

export async function clearMarketingCoachHistory(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("marketing_coach_conversations")
    .delete()
    .eq("user_id", userId)

  return { error: error?.message ?? null }
}

export function toChatCompletionMessages(
  history: MarketingCoachMessageRow[],
): { role: "user" | "assistant"; content: string }[] {
  return history.map((row) => ({
    role: row.role === "assistant" ? "assistant" : "user",
    content: row.message,
  }))
}
