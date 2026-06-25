import type { Database, Json } from "@/lib/database.types"
import {
  parseMarketingStrategyResponse,
  type MarketingPlanItem,
} from "@/lib/marketing/marketing-strategy-types"
import type { StrategyWithInsights } from "@/lib/marketing/update-strategy-from-insights"

export type ContentPlan = Database["public"]["Tables"]["content_plans"]["Row"]

export type ContentPlanInsert =
  Database["public"]["Tables"]["content_plans"]["Insert"]

export function marketingPlanToJson(plan: MarketingPlanItem[]): Json {
  return plan as unknown as Json
}

export function jsonToMarketingPlan(planJson: Json): MarketingPlanItem[] {
  if (!Array.isArray(planJson)) return []

  return planJson as MarketingPlanItem[]
}

export function getPlanScheduleItems(planJson: Json): MarketingPlanItem[] {
  const fromArray = jsonToMarketingPlan(planJson)
  if (fromArray.length > 0) return fromArray

  if (typeof planJson === "object" && planJson !== null && !Array.isArray(planJson)) {
    const record = planJson as Record<string, unknown>
    const plan = record.plan
    if (Array.isArray(plan) && plan.length > 0) {
      return plan as MarketingPlanItem[]
    }

    const schedule = record.posting_schedule
    if (Array.isArray(schedule)) {
      return (
        parseMarketingStrategyResponse(
          JSON.stringify({ posting_schedule: schedule }),
        )?.plan ?? []
      )
    }
  }

  return []
}

function readStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined

  const items = value.filter(
    (item): item is string => typeof item === "string" && item.trim() !== "",
  )

  return items.length > 0 ? items : undefined
}

export function planJsonToStrategyWithInsights(
  planJson: Json,
): StrategyWithInsights {
  if (Array.isArray(planJson)) {
    return { plan: planJson as MarketingPlanItem[] }
  }

  if (typeof planJson !== "object" || planJson === null) {
    return {}
  }

  const record = planJson as Record<string, unknown>
  const plan = getPlanScheduleItems(planJson)

  return {
    ...(typeof record.goal === "string" ? { goal: record.goal } : {}),
    ...(readStringArray(record.content_pillars)
      ? { content_pillars: readStringArray(record.content_pillars) }
      : {}),
    ...(plan.length > 0 ? { plan } : {}),
    ...(readStringArray(record.preferred_hooks)
      ? { preferred_hooks: readStringArray(record.preferred_hooks) }
      : {}),
    ...(readStringArray(record.content_types)
      ? { content_types: readStringArray(record.content_types) }
      : {}),
    ...(Array.isArray(record.posting_schedule)
      ? { posting_schedule: record.posting_schedule as StrategyWithInsights["posting_schedule"] }
      : readStringArray(record.best_posting_times)
        ? { posting_schedule: readStringArray(record.best_posting_times) }
        : {}),
    ...(readStringArray(record.top_patterns)
      ? { top_patterns: readStringArray(record.top_patterns) }
      : {}),
    ...(readStringArray(record.ai_notes)
      ? { ai_notes: readStringArray(record.ai_notes) }
      : {}),
  }
}

export function strategyWithInsightsToPlanJson(
  strategy: StrategyWithInsights,
): Json {
  const plan = strategy.plan ?? []
  const postingSchedule = strategy.posting_schedule
  const postingTimes =
    Array.isArray(postingSchedule) &&
    postingSchedule.every((item) => typeof item === "string")
      ? postingSchedule
      : undefined

  return {
    ...(typeof strategy.goal === "string" ? { goal: strategy.goal } : {}),
    ...(strategy.content_pillars?.length
      ? { content_pillars: strategy.content_pillars }
      : {}),
    ...(plan.length > 0 ? { plan } : {}),
    ...(strategy.preferred_hooks?.length
      ? { preferred_hooks: strategy.preferred_hooks }
      : {}),
    ...(strategy.content_types?.length
      ? { content_types: strategy.content_types }
      : {}),
    ...(postingTimes?.length
      ? {
          best_posting_times: postingTimes,
          posting_schedule: postingTimes,
        }
      : Array.isArray(postingSchedule) && postingSchedule.length > 0
        ? { posting_schedule: postingSchedule }
        : {}),
    ...(strategy.top_patterns?.length
      ? { top_patterns: strategy.top_patterns }
      : {}),
    ...(strategy.ai_notes?.length ? { ai_notes: strategy.ai_notes } : {}),
  } as Json
}

export function contentPlanToResponse(plan: ContentPlan) {
  return {
    id: plan.id,
    brand_id: plan.brand_id,
    goal: plan.goal,
    platform: plan.platform,
    duration_days: plan.duration_days,
    plan: jsonToMarketingPlan(plan.plan_json),
    created_at: plan.created_at,
  }
}
