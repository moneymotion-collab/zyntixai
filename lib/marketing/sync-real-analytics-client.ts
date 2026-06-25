export type SyncRealAnalyticsResponse = {
  success?: boolean
  mode?: "real" | "mock" | "skipped"
  updated?: number
  skipped?: number
  errors?: string[]
  error?: string
}

export async function syncRealAnalytics(): Promise<SyncRealAnalyticsResponse> {
  const res = await fetch("/api/marketing/analytics/sync-real", {
    method: "POST",
    credentials: "include",
  })

  const data = (await res.json()) as SyncRealAnalyticsResponse

  if (!res.ok) {
    throw new Error(
      data.errors?.[0] ?? data.error ?? "Could not sync real analytics.",
    )
  }

  return data
}
