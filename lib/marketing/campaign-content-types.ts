import type { Json } from "@/lib/database.types"

export const DEFAULT_CAMPAIGN_TARGET_AUDIENCE =
  "Gyms, personal trainers and online coaches"

export const CAMPAIGN_CONTENT_TYPES = [
  "reel",
  "carousel",
  "story",
  "educational_post",
  "testimonial",
  "behind_the_scenes",
  "offer",
] as const

export type CampaignContentType = (typeof CAMPAIGN_CONTENT_TYPES)[number]

export const CAMPAIGN_STRATEGY_CATEGORIES = [
  "Authority",
  "Engagement",
  "Lead Generation",
  "Trust",
] as const

export type CampaignStrategyCategory =
  (typeof CAMPAIGN_STRATEGY_CATEGORIES)[number]

export type CampaignContentItem = {
  day: number
  hook: string
  content_type: CampaignContentType
  caption: string
  hashtags: string
  cta: string
  category: CampaignStrategyCategory
}

export type GenerateCampaignContentInput = {
  campaignName: string
  targetAudience: string
  platform: string
  campaignGoal: string
  durationDays: number
  learningContext?: string | null
}

export type GeneratedCampaignContent = {
  campaign_name: string
  target_audience: string
  platform: string
  campaign_goal: string
  duration_days: number
  items: CampaignContentItem[]
}

const CONTENT_TYPE_LABELS: Record<CampaignContentType, string> = {
  reel: "Reel",
  carousel: "Carousel",
  story: "Story",
  educational_post: "Educational Post",
  testimonial: "Testimonial",
  behind_the_scenes: "Behind The Scenes",
  offer: "Offer",
}

const CONTENT_TYPE_ALIASES: Record<string, CampaignContentType> = {
  reel: "reel",
  reels: "reel",
  carousel: "carousel",
  carousels: "carousel",
  story: "story",
  stories: "story",
  educational_post: "educational_post",
  "educational post": "educational_post",
  educational: "educational_post",
  educationalpost: "educational_post",
  post: "educational_post",
  testimonial: "testimonial",
  testimonials: "testimonial",
  behind_the_scenes: "behind_the_scenes",
  "behind the scenes": "behind_the_scenes",
  behindthescenes: "behind_the_scenes",
  bts: "behind_the_scenes",
  offer: "offer",
  offers: "offer",
  promotion: "offer",
  video: "reel",
}

const CATEGORY_ALIASES: Record<string, CampaignStrategyCategory> = {
  authority: "Authority",
  engagement: "Engagement",
  "lead generation": "Lead Generation",
  leads: "Lead Generation",
  lead: "Lead Generation",
  trust: "Trust",
  educational: "Authority",
  transformation: "Trust",
  motivation: "Engagement",
  "member story": "Trust",
  promotion: "Lead Generation",
  workout: "Authority",
  nutrition: "Authority",
}

const MOCK_TEMPLATES: Omit<CampaignContentItem, "day">[] = [
  {
    hook: "3 mistakes killing your gym's social media growth.",
    content_type: "reel",
    caption:
      "Most gym owners post workouts but never show proof, personality, or a clear next step. Fix these three and watch engagement climb.",
    hashtags: "#gymowner #fitnessbusiness #personaltrainer #gymmarketing #reels",
    cta: "Save this and audit your last 10 posts",
    category: "Authority",
  },
  {
    hook: "Swipe: 5 posts that booked 12 consults last month.",
    content_type: "carousel",
    caption:
      "These formats work for trainers and online coaches — no fancy gear, no viral luck. Just repeatable content that turns followers into leads.",
    hashtags: "#onlinecoach #leadgeneration #contentstrategy #fitcoach #socialmedia",
    cta: "Comment 'SWIPE' for the full breakdown",
    category: "Lead Generation",
  },
  {
    hook: "POV: 6am session before the gym opens.",
    content_type: "story",
    caption:
      "Quick BTS of how we prep the floor, cue the playlist, and greet the first member. People buy the experience — show them yours.",
    hashtags: "#behindthescenes #gymlife #morningroutine #fitnessstudio #coachlife",
    cta: "Reply with your opening time",
    category: "Engagement",
  },
  {
    hook: "Why your free trial isn't converting.",
    content_type: "educational_post",
    caption:
      "A trial without onboarding, a follow-up message, and a clear win in session one feels random — not valuable. Here is the 3-step fix.",
    hashtags: "#gymbusiness #personaltraining #clientretention #fitpro #sales",
    cta: "DM 'TRIAL' for our conversion checklist",
    category: "Authority",
  },
  {
    hook: "She was scared to walk in. Now she coaches others.",
    content_type: "testimonial",
    caption:
      "Meet Jordan: joined as a beginner, stayed for the community, became a volunteer coach. Real results build real trust.",
    hashtags: "#transformation #memberstory #gymcommunity #trust #fitnessjourney",
    cta: "Tag someone who needs this reminder",
    category: "Trust",
  },
  {
    hook: "How we plan a week of content in 45 minutes.",
    content_type: "behind_the_scenes",
    caption:
      "No content team, no burnout — just a simple batching system we use for gyms and online coaches who wear every hat.",
    hashtags: "#contentbatching #fitnessmarketing #coachlife #behindthescenes #gymlife",
    cta: "Follow for the full SOP series",
    category: "Engagement",
  },
  {
    hook: "5 spots left for our 28-day kickstart.",
    content_type: "offer",
    caption:
      "Built for busy professionals who want structure, accountability, and a coach in their corner. Starts Monday — includes assessment + custom plan.",
    hashtags: "#fitnessoffer #personaltrainer #onlinecoaching #newmembers #limitedspots",
    cta: "DM 'START' to claim your spot",
    category: "Lead Generation",
  },
]

export function formatCampaignContentTypeLabel(
  type: CampaignContentType | string,
): string {
  const normalized = normalizeContentType(String(type))
  if (normalized) return CONTENT_TYPE_LABELS[normalized]
  return String(type)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function normalizeContentType(value: string): CampaignContentType | null {
  const key = value.trim().toLowerCase().replace(/\s+/g, " ")
  return CONTENT_TYPE_ALIASES[key] ?? null
}

function normalizeCategory(value: string): CampaignStrategyCategory | null {
  const trimmed = value.trim()
  if (
    CAMPAIGN_STRATEGY_CATEGORIES.includes(
      trimmed as CampaignStrategyCategory,
    )
  ) {
    return trimmed as CampaignStrategyCategory
  }
  return CATEGORY_ALIASES[trimmed.toLowerCase()] ?? null
}

export function normalizeCampaignContentItem(
  value: unknown,
  fallbackDay?: number,
): CampaignContentItem | null {
  if (typeof value !== "object" || value === null) return null

  const record = value as Record<string, unknown>
  const day =
    typeof record.day === "number"
      ? record.day
      : typeof record.day_number === "number"
        ? record.day_number
        : fallbackDay ?? Number.NaN
  const hook =
    typeof record.hook === "string"
      ? record.hook.trim()
      : typeof record.title === "string"
        ? record.title.trim()
        : ""
  const contentTypeRaw =
    typeof record.content_type === "string"
      ? record.content_type
      : typeof record.type === "string"
        ? record.type
        : ""
  const caption =
    typeof record.caption === "string" ? record.caption.trim() : ""
  const hashtags =
    typeof record.hashtags === "string" ? record.hashtags.trim() : ""
  const cta = typeof record.cta === "string" ? record.cta.trim() : ""
  const categoryRaw =
    typeof record.category === "string" ? record.category.trim() : ""

  const content_type = normalizeContentType(contentTypeRaw)
  const category = normalizeCategory(categoryRaw)

  if (
    !Number.isInteger(day) ||
    day < 1 ||
    !hook ||
    !content_type ||
    !caption ||
    !hashtags ||
    !cta ||
    !category
  ) {
    return null
  }

  return {
    day,
    hook,
    content_type,
    caption,
    hashtags,
    cta,
    category,
  }
}

export function parseCampaignContentResponse(
  raw: string,
  durationDays: number,
  startDay = 1,
  endDay?: number,
): CampaignContentItem[] | null {
  const expectedEnd = endDay ?? durationDays
  const expectedCount = expectedEnd - startDay + 1

  const trimmed = raw.trim()
  let parsed: unknown

  try {
    parsed = JSON.parse(trimmed)
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return null
    }
  }

  if (typeof parsed !== "object" || parsed === null) return null
  const record = parsed as Record<string, unknown>

  const source = Array.isArray(record.items)
    ? record.items
    : Array.isArray(record.content)
      ? record.content
      : Array.isArray(record.posts)
        ? record.posts
        : Array.isArray(record.days)
          ? record.days
          : null

  if (!source) return null

  const items = source
    .map((item, index) =>
      normalizeCampaignContentItem(item, startDay + index),
    )
    .filter((item): item is CampaignContentItem => item !== null)
    .sort((left, right) => left.day - right.day)

  if (items.length !== expectedCount) return null

  for (let index = 0; index < items.length; index += 1) {
    if (items[index]?.day !== startDay + index) return null
  }

  return items
}

export function buildMockCampaignContent(
  campaignName: string,
  targetAudience: string,
  platform: string,
  campaignGoal: string,
  durationDays: number,
): CampaignContentItem[] {
  const audience = targetAudience.trim() || DEFAULT_CAMPAIGN_TARGET_AUDIENCE

  return Array.from({ length: durationDays }, (_, index) => {
    const template =
      MOCK_TEMPLATES[index % MOCK_TEMPLATES.length] ?? MOCK_TEMPLATES[0]
    const day = index + 1

    return {
      day,
      hook: template.hook,
      content_type: template.content_type,
      caption: `${template.caption} Part of "${campaignName}" on ${platform} — built for ${audience} (${campaignGoal}).`,
      hashtags: template.hashtags,
      cta: template.cta,
      category: template.category,
    }
  })
}

export function campaignContentToJson(items: CampaignContentItem[]): Json {
  return { items } as unknown as Json
}

export function jsonToCampaignContent(value: Json): CampaignContentItem[] {
  if (typeof value !== "object" || value === null) return []

  const record = value as Record<string, unknown>
  const source = Array.isArray(record.items)
    ? record.items
    : Array.isArray(value)
      ? value
      : null

  if (!source) return []

  return source
    .map((item, index) => normalizeCampaignContentItem(item, index + 1))
    .filter((item): item is CampaignContentItem => item !== null)
    .sort((left, right) => left.day - right.day)
}

export function getStrategyCategoryOptions(): CampaignStrategyCategory[] {
  return [...CAMPAIGN_STRATEGY_CATEGORIES]
}

export function getContentTypeOptions(): CampaignContentType[] {
  return [...CAMPAIGN_CONTENT_TYPES]
}
