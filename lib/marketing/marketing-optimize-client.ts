export type MarketingOptimizeSourceTable = "content_posts" | "scheduled_posts"

export type MarketingOptimizeResult = {
  original_score: number
  optimized_score: number
  optimized_title: string
  optimized_content: string
  optimized_caption: string
  optimized_hashtags: string
  optimization_reason: string
  improvements: string[]
  warning?: string
}

export type AppliedOptimizedPost = {
  title: string
  caption: string
  hashtags: string
}

async function parseJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T
}

export async function requestMarketingOptimizePost(
  postId: string,
  sourceTable: MarketingOptimizeSourceTable,
): Promise<MarketingOptimizeResult> {
  const res = await fetch("/api/marketing/optimize-post", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      post_id: postId,
      source_table: sourceTable,
    }),
  })

  const data = await parseJson<{
    success?: boolean
    original_score?: number
    optimized_score?: number
    optimized_title?: string
    optimized_content?: string
    optimized_caption?: string
    optimized_hashtags?: string
    optimization_reason?: string
    improvements?: string[]
    warning?: string
    error?: string
  }>(res)

  if (!res.ok || !data.success) {
    throw new Error(data.error ?? "Could not optimize post.")
  }

  return {
    original_score: data.original_score ?? 0,
    optimized_score: data.optimized_score ?? 0,
    optimized_title: data.optimized_title ?? "",
    optimized_caption: data.optimized_caption ?? data.optimized_content ?? "",
    optimized_content: data.optimized_content ?? data.optimized_caption ?? "",
    optimized_hashtags: data.optimized_hashtags ?? "",
    optimization_reason: data.optimization_reason ?? "Optimized for stronger engagement.",
    improvements: Array.isArray(data.improvements) ? data.improvements : [],
    warning: data.warning,
  }
}

export async function applyOptimizedPost(
  postId: string,
  sourceTable: MarketingOptimizeSourceTable,
): Promise<AppliedOptimizedPost> {
  const res = await fetch("/api/marketing/apply-optimized-post", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      post_id: postId,
      source_table: sourceTable,
    }),
  })

  const data = await parseJson<{
    success?: boolean
    title?: string
    caption?: string
    hashtags?: string
    error?: string
  }>(res)

  if (!res.ok || !data.success) {
    throw new Error(data.error ?? "Could not apply optimized version.")
  }

  return {
    title: data.title ?? "",
    caption: data.caption ?? "",
    hashtags: data.hashtags ?? "",
  }
}
