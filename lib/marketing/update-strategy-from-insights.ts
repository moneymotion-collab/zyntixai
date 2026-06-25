import type { BrandContentInsights } from "@/lib/marketing/brand-content-insights-types"
import type { MarketingPlanItem } from "@/lib/marketing/marketing-strategy-types"

export type StrategyWithInsights = {
  goal?: string
  content_pillars?: string[]
  plan?: MarketingPlanItem[]
  preferred_hooks?: string[]
  content_types?: string[]
  posting_schedule?: string[] | MarketingPlanItem[]
  top_patterns?: string[]
  ai_notes?: string[]
}

function pickStrings(
  next: string[] | undefined,
  fallback: string[] | undefined,
): string[] | undefined {
  if (next && next.length > 0) {
    return next
  }

  return fallback
}

export function updateStrategyFromInsights<T extends StrategyWithInsights>(
  strategy: T,
  insights: BrandContentInsights,
): T {
  return {
    ...strategy,
    preferred_hooks: pickStrings(
      insights.best_hooks,
      strategy.preferred_hooks,
    ),
    content_types: pickStrings(
      insights.best_content_types,
      strategy.content_types,
    ),
    posting_schedule:
      insights.best_posting_times?.length
        ? insights.best_posting_times
        : strategy.posting_schedule,
    top_patterns: pickStrings(insights.top_patterns, strategy.top_patterns),
    ai_notes: insights.what_to_do_next,
  }
}
