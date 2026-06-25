export type SyncAnalyticsResponse = {
  success?: boolean
  updated?: number
  skipped?: number
  mode?: "real" | "mock" | "skipped"
  message?: string | null
  error?: string
}

export async function syncAnalytics(): Promise<SyncAnalyticsResponse> {
  const res = await fetch("/api/marketing/analytics/sync", {
    method: "POST",
    credentials: "include",
  })

  const data = (await res.json()) as SyncAnalyticsResponse

  if (!res.ok) {
    throw new Error(data.error ?? "Could not sync analytics.")
  }

  return data
}
