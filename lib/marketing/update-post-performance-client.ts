import type { PostPerformanceMetrics } from "@/lib/marketing/analytics/update-post-performance"

export type UpdatePostPerformanceResponse = {
  success?: boolean
  engagement_rate?: number
  error?: string
}

export async function updatePostPerformance(
  postId: string,
  metrics: PostPerformanceMetrics,
): Promise<UpdatePostPerformanceResponse> {
  const res = await fetch("/api/content/analytics/update", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      post_id: postId,
      metrics,
    }),
  })

  const data = (await res.json()) as UpdatePostPerformanceResponse

  if (!res.ok) {
    throw new Error(data.error ?? "Could not update post performance.")
  }

  return data
}
