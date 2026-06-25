import type { MarketingAnalyticsApiResponse } from "@/lib/marketing/content-performance/build-api-response"

export type FetchMarketingAnalyticsResult = MarketingAnalyticsApiResponse

export async function fetchMarketingAnalytics(): Promise<FetchMarketingAnalyticsResult> {
  const res = await fetch("/api/marketing/analytics", {
    credentials: "include",
    cache: "no-store",
  })

  const data = (await res.json()) as
    | MarketingAnalyticsApiResponse
    | { success: false; error?: string }

  if (!res.ok || !data.success) {
    const message =
      "error" in data && typeof data.error === "string"
        ? data.error
        : "Could not load analytics."
    throw new Error(message)
  }

  return data
}
