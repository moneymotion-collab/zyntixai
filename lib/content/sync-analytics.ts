export type SyncPostAnalyticsResponse = {
  success: boolean
  metrics: {
    views: number
    reach: number
    likes: number
    comments: number
    shares: number
    saves: number
  }
  engagement_rate: number
  error?: string
}

export async function syncAnalytics(postId: string): Promise<SyncPostAnalyticsResponse> {
  const res = await fetch("/api/content/analytics/sync", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId }),
  })

  const data = (await res.json()) as SyncPostAnalyticsResponse & { error?: string }

  if (!res.ok) {
    throw new Error(data.error || "Analytics sync failed")
  }

  return data
}
