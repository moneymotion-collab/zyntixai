import type { SupabaseClient } from "@supabase/supabase-js"
import { firstDayOfCurrentMonthString } from "@/lib/coach-dashboard/compute-business-overview"
import {
  defaultAiActivityStats,
  resolveAiActivityStats,
  type AiActivityStats,
} from "@/lib/coach-dashboard/ai-activity-stats"
import type { Database } from "@/lib/database.types"

type LooseClient = SupabaseClient<Record<string, unknown>>

function isMissingTableError(message: string, table: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes(table.toLowerCase()) ||
    lower.includes("does not exist") ||
    lower.includes("schema cache")
  )
}

function toLooseClient(supabase: SupabaseClient<Database>): LooseClient {
  return supabase as unknown as LooseClient
}

async function countRowsThisMonth(
  client: LooseClient,
  table: string,
  monthStart: string,
  userId: string | null,
  isAdmin: boolean,
  extraFilters?: Record<string, string>,
): Promise<number> {
  try {
    let query = client
      .from(table)
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthStart)

    if (!isAdmin && userId) {
      query = query.eq("user_id", userId)
    }

    for (const [key, value] of Object.entries(extraFilters ?? {})) {
      query = query.eq(key, value)
    }

    const { count, error } = await query
    if (error) {
      if (isMissingTableError(error.message, table)) return 0
      return 0
    }

    return count ?? 0
  } catch {
    return 0
  }
}

async function countCampaignsThisMonth(
  client: LooseClient,
  monthStart: string,
  userId: string | null,
  isAdmin: boolean,
): Promise<number> {
  const contentPosts = await countRowsThisMonth(
    client,
    "content_posts",
    monthStart,
    userId,
    isAdmin,
  )

  if (contentPosts > 0) {
    return contentPosts
  }

  return countRowsThisMonth(
    client,
    "scheduled_posts",
    monthStart,
    userId,
    isAdmin,
  )
}

async function countPublishedPostsThisMonth(
  client: LooseClient,
  monthStart: string,
  userId: string | null,
  isAdmin: boolean,
): Promise<number> {
  const socialPosts = await countRowsThisMonth(
    client,
    "social_posts",
    monthStart,
    userId,
    isAdmin,
    { status: "published" },
  )

  if (socialPosts > 0) {
    return socialPosts
  }

  return countRowsThisMonth(
    client,
    "content_posts",
    monthStart,
    userId,
    isAdmin,
    { status: "published" },
  )
}

export async function fetchAiActivityStats(
  supabase: SupabaseClient<Database>,
  userId: string | null,
  isAdmin: boolean,
): Promise<AiActivityStats> {
  if (!userId && !isAdmin) {
    return defaultAiActivityStats()
  }

  const client = toLooseClient(supabase)
  const monthStart = firstDayOfCurrentMonthString()

  const [contentIdeas, campaigns, videos, publishedPosts] = await Promise.all([
    countRowsThisMonth(client, "content_ideas", monthStart, userId, isAdmin),
    countCampaignsThisMonth(client, monthStart, userId, isAdmin),
    countRowsThisMonth(client, "video_projects", monthStart, userId, isAdmin),
    countPublishedPostsThisMonth(client, monthStart, userId, isAdmin),
  ])

  return resolveAiActivityStats({
    contentIdeas,
    campaigns,
    videos,
    publishedPosts,
  })
}
