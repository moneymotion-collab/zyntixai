import type { StoredMarketingRecommendation } from "@/lib/marketing/recommendations/generate-recommendations"

export type RecommendationView = {
  id: string
  title: string
  insight: string
  whyItMatters: string
  action: string
  priority: number
  recommendation_type: string
  confidence_score: number | null
  triggerPostId: string | null
  triggerPostTitle: string | null
}

const CATEGORY_INSIGHTS: Record<string, string> = {
  best_hook: "Based on hooks used in your top-performing posts.",
  best_cta: "Based on CTA patterns in your captions.",
  best_platform: "Based on platform view and engagement comparisons.",
  content_type: "Based on which content formats perform best.",
  posting_time: "Based on engagement patterns by publish time.",
  improve_weak_post: "Based on gaps between your best and weakest posts.",
  next_content_idea: "Based on your strongest platform, format, and hook patterns.",
  engagement_trend: "Based on engagement rate changes across recent vs earlier posts.",
  platform: "Based on platform engagement rates across your posts.",
  content_type_legacy: "Based on which content formats perform best.",
  category: "Based on category-level engagement patterns.",
  topic: "Based on topic performance in your analytics.",
  hooks: "Based on hooks used in your top-performing posts.",
  cta: "Based on CTA patterns in your captions.",
  engagement: "Based on overall engagement trends.",
  optimization: "Based on gaps between your best and weakest posts.",
  strategy: "Based on your current content volume and diversity.",
  analytics: "Based on analytics coverage for published posts.",
  schedule: "Based on posting consistency and timing.",
}

function readPatternsPayload(row: StoredMarketingRecommendation): {
  insight?: string
  why_it_matters?: string
  confidence_score?: number
  recommendation_type?: string
  trigger_post_id?: string | null
  trigger_post_title?: string | null
} {
  if (!row.patterns || typeof row.patterns !== "object" || Array.isArray(row.patterns)) {
    return {}
  }

  return row.patterns as {
    insight?: string
    why_it_matters?: string
    confidence_score?: number
    recommendation_type?: string
    trigger_post_id?: string | null
    trigger_post_title?: string | null
  }
}

function formatCategoryInsight(category: string): string {
  const normalized = category.trim().toLowerCase()
  if (CATEGORY_INSIGHTS[normalized]) {
    return CATEGORY_INSIGHTS[normalized]
  }

  if (!normalized) {
    return "Based on your latest content performance."
  }

  return `Based on ${normalized.replace(/_/g, " ")} data.`
}

export function formatRecommendationView(
  row: StoredMarketingRecommendation,
): RecommendationView {
  const patterns = readPatternsPayload(row)
  const insight = patterns.insight ?? formatCategoryInsight(row.category)

  return {
    id: row.id,
    title: row.title,
    insight,
    whyItMatters: patterns.why_it_matters ?? insight,
    action: row.message,
    priority: row.priority,
    recommendation_type: patterns.recommendation_type ?? row.category,
    confidence_score:
      typeof patterns.confidence_score === "number"
        ? patterns.confidence_score
        : null,
    triggerPostId:
      typeof patterns.trigger_post_id === "string"
        ? patterns.trigger_post_id
        : null,
    triggerPostTitle:
      typeof patterns.trigger_post_title === "string"
        ? patterns.trigger_post_title
        : null,
  }
}
