import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import { mockAnalyticsRows } from "@/lib/marketing/mock-analytics"

export type ResolvedAnalyticsDisplay = {
  rows: AnalyticsRowWithPost[]
  isDemo: boolean
}

/** True when demo/fallback mode is explicitly enabled. */
export function shouldUseAnalyticsDemo(
  rows: AnalyticsRowWithPost[],
  usingFallback = false,
): boolean {
  return usingFallback
}

/**
 * Prefer live analytics when available; use demo rows only when demo mode is on.
 */
export function resolveAnalyticsDisplay(
  rows: AnalyticsRowWithPost[],
  usingFallback = false,
): ResolvedAnalyticsDisplay {
  const isDemo = shouldUseAnalyticsDemo(rows, usingFallback)

  return {
    rows: isDemo ? mockAnalyticsRows : rows,
    isDemo,
  }
}
