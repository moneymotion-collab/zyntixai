import type { Database } from "@/lib/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  LearningContentPostEmbed,
  LearningPerformanceRow,
  LearningScheduledPostEmbed,
} from "@/lib/marketing/learning/types"

const CONTENT_POST_SELECT =
  "id, title, caption, content_type, topic, category, platform, published_at, scheduled_at, viral_score"

const SCHEDULED_POST_SELECT =
  "id, hook, content, scheduled_date, published_at, platform"

function normalizeText(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? ""
}

function matchScheduledPost(
  row: { title: string; platform: string; post_id: string | null },
  scheduledPosts: LearningScheduledPostEmbed[],
): LearningScheduledPostEmbed | null {
  if (scheduledPosts.length === 0) return null

  const titleKey = normalizeText(row.title)
  const platformKey = normalizeText(row.platform)

  for (const scheduled of scheduledPosts) {
    const hookKey = normalizeText(scheduled.hook)
    const contentKey = normalizeText(scheduled.content)
    const scheduledPlatform = normalizeText(scheduled.platform)

    if (platformKey && scheduledPlatform && platformKey !== scheduledPlatform) {
      continue
    }

    if (titleKey && (titleKey === hookKey || titleKey === contentKey)) {
      return scheduled
    }

    if (
      hookKey &&
      titleKey &&
      (titleKey.includes(hookKey) || hookKey.includes(titleKey))
    ) {
      return scheduled
    }
  }

  return null
}

async function attachContentPosts(
  supabase: SupabaseClient<Database>,
  rows: Database["public"]["Tables"]["content_performance"]["Row"][],
): Promise<{
  data: Array<
    Database["public"]["Tables"]["content_performance"]["Row"] & {
      content_posts: LearningContentPostEmbed | null
    }
  > | null
  error: Error | null
}> {
  if (rows.length === 0) {
    return { data: [], error: null }
  }

  const postIds = [
    ...new Set(
      rows
        .map((row) => row.post_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  ]

  if (postIds.length === 0) {
    return {
      data: rows.map((row) => ({ ...row, content_posts: null })),
      error: null,
    }
  }

  const { data: posts, error } = await supabase
    .from("content_posts")
    .select(CONTENT_POST_SELECT)
    .in("id", postIds)

  if (error) {
    return { data: null, error }
  }

  const postMap = new Map(
    (posts ?? []).map((post) => {
      const { id: _id, ...embed } = post
      return [post.id, embed as LearningContentPostEmbed]
    }),
  )

  return {
    data: rows.map((row) => ({
      ...row,
      content_posts: row.post_id ? (postMap.get(row.post_id) ?? null) : null,
    })),
    error: null,
  }
}

export async function fetchLearningPerformanceRows(
  supabase: SupabaseClient<Database>,
  userId: string,
  isAdmin: boolean,
): Promise<{ data: LearningPerformanceRow[] | null; error: Error | null }> {
  let performanceQuery = supabase
    .from("content_performance")
    .select("*")
    .order("created_at", { ascending: false })

  if (!isAdmin) {
    performanceQuery = performanceQuery.eq("created_by", userId)
  }

  const { data: performanceRows, error: performanceError } =
    await performanceQuery

  if (performanceError) {
    return { data: null, error: performanceError }
  }

  const rows = performanceRows ?? []

  const { data: withPosts, error: postsError } = await attachContentPosts(
    supabase,
    rows,
  )

  if (postsError || !withPosts) {
    return { data: null, error: postsError }
  }

  let scheduledQuery = supabase
    .from("scheduled_posts")
    .select(SCHEDULED_POST_SELECT)
    .order("created_at", { ascending: false })

  if (!isAdmin) {
    scheduledQuery = scheduledQuery.eq("user_id", userId)
  }

  const { data: scheduledPosts, error: scheduledError } = await scheduledQuery

  if (scheduledError) {
    return { data: null, error: scheduledError }
  }

  const scheduled = (scheduledPosts ?? []) as LearningScheduledPostEmbed[]

  return {
    data: withPosts.map((row) => ({
      ...row,
      scheduled_post: matchScheduledPost(row, scheduled),
    })),
    error: null,
  }
}
