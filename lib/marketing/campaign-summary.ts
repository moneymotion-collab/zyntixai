import {
  CAMPAIGN_CONTENT_TYPES,
  formatCampaignContentTypeLabel,
  type CampaignContentItem,
  type CampaignContentType,
} from "@/lib/marketing/campaign-content-types"

export type CampaignContentTypeBreakdown = {
  content_type: CampaignContentType
  label: string
  count: number
}

export type CampaignSummary = {
  totalPosts: number
  breakdown: CampaignContentTypeBreakdown[]
  primaryGoal: string
  estimatedWeeklyOutput: number
}

function pluralizeContentTypeLabel(label: string, count: number): string {
  if (count === 1) return label

  switch (label) {
    case "Reel":
      return "Reels"
    case "Carousel":
      return "Carousels"
    case "Story":
      return "Stories"
    case "Educational Post":
      return "Educational Posts"
    case "Testimonial":
      return "Testimonials"
    case "Behind The Scenes":
      return "Behind The Scenes"
    case "Offer":
      return "Offers"
    default:
      return `${label}s`
  }
}

function resolvePrimaryGoal(
  items: CampaignContentItem[],
  campaignGoal: string,
): string {
  const goal = campaignGoal.trim()
  if (goal) return goal

  const categoryCounts = new Map<string, number>()
  for (const item of items) {
    categoryCounts.set(
      item.category,
      (categoryCounts.get(item.category) ?? 0) + 1,
    )
  }

  let topCategory = ""
  let topCount = 0
  for (const [category, count] of categoryCounts) {
    if (count > topCount) {
      topCategory = category
      topCount = count
    }
  }

  return topCategory || "Lead Generation"
}

export function buildCampaignSummary(
  items: CampaignContentItem[],
  durationDays: number,
  campaignGoal: string,
): CampaignSummary {
  const counts = new Map<CampaignContentType, number>()

  for (const type of CAMPAIGN_CONTENT_TYPES) {
    counts.set(type, 0)
  }

  for (const item of items) {
    counts.set(item.content_type, (counts.get(item.content_type) ?? 0) + 1)
  }

  const breakdown = CAMPAIGN_CONTENT_TYPES.map((content_type) => ({
    content_type,
    label: pluralizeContentTypeLabel(
      formatCampaignContentTypeLabel(content_type),
      counts.get(content_type) ?? 0,
    ),
    count: counts.get(content_type) ?? 0,
  }))
    .filter((entry) => entry.count > 0)
    .sort((left, right) => right.count - left.count)

  const weeks = Math.max(1, durationDays / 7)
  const estimatedWeeklyOutput = Math.max(
    1,
    Math.round(items.length / weeks),
  )

  return {
    totalPosts: items.length,
    breakdown,
    primaryGoal: resolvePrimaryGoal(items, campaignGoal),
    estimatedWeeklyOutput,
  }
}
