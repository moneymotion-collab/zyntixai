import type { Json } from "@/lib/database.types"

export const CAMPAIGN_DURATIONS = [7, 14, 30, 60] as const

export type CampaignDuration = (typeof CAMPAIGN_DURATIONS)[number]

export const CAMPAIGN_GOALS = [
  "Get More Members",
  "Increase Engagement",
  "Build Brand Awareness",
  "Promote Personal Training",
  "Launch a Challenge",
  "Retention",
  "Lead Generation",
] as const

export type CampaignGoal = (typeof CAMPAIGN_GOALS)[number]

export type CampaignPhase = {
  week: number
  theme: string
  objectives: string[]
  content_ideas: string[]
  channels: string[]
}

export type MarketingCampaignPlan = {
  summary: string
  key_messages: string[]
  content_pillars: string[]
  phases: CampaignPhase[]
  kpis: string[]
  budget_tips: string[]
  cta_primary: string
}

export type MarketingCampaignRecord = {
  id: string
  name: string
  target_audience: string
  platform: string
  campaign_goal: string
  duration_days: CampaignDuration
  campaign_json: MarketingCampaignPlan
  status: string
  created_at: string
  updated_at: string
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
}

function normalizePhase(value: unknown, week: number): CampaignPhase | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>

  const theme = typeof record.theme === "string" ? record.theme.trim() : ""
  if (!theme) return null

  return {
    week: typeof record.week === "number" ? record.week : week,
    theme,
    objectives: normalizeStringArray(record.objectives),
    content_ideas: normalizeStringArray(record.content_ideas),
    channels: normalizeStringArray(record.channels),
  }
}

export function parseMarketingCampaignResponse(
  raw: string,
  durationDays: CampaignDuration,
): MarketingCampaignPlan | null {
  let parsed: unknown

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(jsonMatch?.[0] ?? raw)
  } catch {
    return null
  }

  if (!parsed || typeof parsed !== "object") return null
  const record = parsed as Record<string, unknown>

  const summary = typeof record.summary === "string" ? record.summary.trim() : ""
  if (!summary) return null

  const rawPhases = Array.isArray(record.phases) ? record.phases : []
  const weekCount = Math.max(1, Math.ceil(durationDays / 7))
  const phases: CampaignPhase[] = []

  for (let index = 0; index < weekCount; index += 1) {
    const phase = normalizePhase(rawPhases[index], index + 1)
    if (phase) phases.push(phase)
  }

  if (phases.length === 0) return null

  return {
    summary,
    key_messages: normalizeStringArray(record.key_messages),
    content_pillars: normalizeStringArray(record.content_pillars),
    phases,
    kpis: normalizeStringArray(record.kpis),
    budget_tips: normalizeStringArray(record.budget_tips),
    cta_primary:
      typeof record.cta_primary === "string" ? record.cta_primary.trim() : "",
  }
}

export function buildMockMarketingCampaign(
  durationDays: CampaignDuration,
  campaignName: string,
  targetAudience: string,
  platform: string,
  campaignGoal: string,
): MarketingCampaignPlan {
  const weekCount = Math.max(1, Math.ceil(durationDays / 7))
  const phases: CampaignPhase[] = []

  const weekThemes = [
    "Awareness & Hook",
    "Education & Trust",
    "Social Proof",
    "Conversion Push",
    "Retention & Community",
    "Scale & Optimize",
    "Momentum & Upsell",
    "Long-term Loyalty",
  ]

  for (let week = 1; week <= weekCount; week += 1) {
    phases.push({
      week,
      theme: weekThemes[week - 1] ?? `Week ${week} Focus`,
      objectives: [
        `Reach ${targetAudience} on ${platform}`,
        `Advance campaign goal: ${campaignGoal}`,
      ],
      content_ideas: [
        `Behind-the-scenes ${campaignName} story`,
        `Member transformation spotlight`,
        `Coach tip carousel for ${targetAudience}`,
        `Limited-time offer post with clear CTA`,
      ],
      channels: [platform, "Email", "Stories"],
    })
  }

  return {
    summary: `${campaignName} is a ${durationDays}-day campaign on ${platform} designed to ${campaignGoal.toLowerCase()} among ${targetAudience}.`,
    key_messages: [
      "Your fitness journey starts with one committed step.",
      "Expert coaching meets a community that keeps you accountable.",
      "Results come from consistency, not perfection.",
    ],
    content_pillars: [
      "Transformation stories",
      "Expert coaching tips",
      "Community highlights",
      "Promotional offers",
    ],
    phases,
    kpis: [
      "Reach and impressions",
      "Engagement rate",
      "Link clicks / DMs",
      "Trial sign-ups",
      "Cost per lead",
    ],
    budget_tips: [
      "Boost top-performing posts after day 3",
      "Retarget website visitors with testimonial creatives",
      "Allocate 60% to awareness, 40% to conversion content",
    ],
    cta_primary: "Book your free trial session today",
  }
}

export function campaignPlanToJson(plan: MarketingCampaignPlan): Json {
  return plan as unknown as Json
}
