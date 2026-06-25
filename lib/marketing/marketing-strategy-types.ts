export const MARKETING_CONTENT_TYPES = [
  "education",
  "viral",
  "authority",
  "sales",
] as const

const CONTENT_TYPE_ALIASES: Record<string, MarketingContentType> = {
  education: "education",
  educational: "education",
  viral: "viral",
  authority: "authority",
  engagement: "authority",
  sales: "sales",
}

const DEFAULT_GOAL_BY_TYPE: Record<MarketingContentType, MarketingPostGoal> = {
  education: "trust",
  viral: "reach",
  authority: "trust",
  sales: "leads",
}

export const MARKETING_POST_GOALS = [
  "reach",
  "engagement",
  "trust",
  "leads",
  "sales",
] as const

export type MarketingContentType = (typeof MARKETING_CONTENT_TYPES)[number]
export type MarketingPostGoal = (typeof MARKETING_POST_GOALS)[number]

export type MarketingPlanItem = {
  day: number
  type: MarketingContentType
  hook: string
  caption: string
  cta: string
  goal: MarketingPostGoal
}

export type MarketingStrategy = {
  goal?: string
  content_pillars?: string[]
  plan: MarketingPlanItem[]
}

const MOCK_PLAN_TEMPLATES: Omit<MarketingPlanItem, "day">[] = [
  {
    type: "viral",
    hook: "Stop doing this if you want visible abs.",
    caption:
      "Most people rush their warm-up and kill their progress. Here is the 3-move fix we use before every session.",
    cta: "Save this for your next workout",
    goal: "reach",
  },
  {
    type: "education",
    hook: "Your warm-up is probably killing your gains.",
    caption:
      "A proper warm-up is not cardio — it is activation. Try these 2 drills before your next leg day.",
    cta: "Comment 'WARMUP' for the full routine",
    goal: "trust",
  },
  {
    type: "authority",
    hook: "Day 1 vs day 30 — same member, same gym.",
    caption:
      "Meet Alex: busy professional, zero gym confidence on day 1. Thirty days later, here is what changed.",
    cta: "Tag someone starting their fitness journey",
    goal: "engagement",
  },
  {
    type: "sales",
    hook: "We only have 5 trial spots left this week.",
    caption:
      "New here? Book a free intro session and get a custom starter plan from our coaches.",
    cta: "DM 'START' to claim a spot",
    goal: "leads",
  },
  {
    type: "education",
    hook: "3 myths keeping you out of the gym.",
    caption:
      "You do not need 2 hours, perfect form on day 1, or a crazy diet. You need a plan and consistency.",
    cta: "Follow for more no-fluff tips",
    goal: "trust",
  },
  {
    type: "authority",
    hook: "What is harder: showing up or staying consistent?",
    caption:
      "Be honest in the comments — we will reply with one tip tailored to your answer.",
    cta: "Drop your answer below",
    goal: "engagement",
  },
  {
    type: "viral",
    hook: "POV: your coach catches you skipping the last rep.",
    caption:
      "That last rep is where results live. Film this with your training partner and send it to someone who needs the push.",
    cta: "Share with your gym buddy",
    goal: "reach",
  },
]

export function buildMockMarketingStrategy(
  durationDays: number,
): MarketingStrategy {
  const plan = Array.from({ length: durationDays }, (_, index) => {
    const template =
      MOCK_PLAN_TEMPLATES[index % MOCK_PLAN_TEMPLATES.length] ??
      MOCK_PLAN_TEMPLATES[0]

    return {
      day: index + 1,
      ...template,
    }
  })

  return {
    goal: "Grow audience reach and convert followers into trial members",
    content_pillars: [
      "Training education",
      "Member transformations",
      "Coach authority",
      "Trial offers",
    ],
    plan,
  }
}

export const MOCK_MARKETING_STRATEGY = buildMockMarketingStrategy(7)

function normalizeContentType(value: string): MarketingContentType | null {
  return CONTENT_TYPE_ALIASES[value.trim().toLowerCase()] ?? null
}

function isMarketingPostGoal(value: string): value is MarketingPostGoal {
  return MARKETING_POST_GOALS.includes(value as MarketingPostGoal)
}

export function parseMarketingStrategyResponse(
  raw: string,
  durationDays?: number,
): MarketingStrategy | null {
  const trimmed = raw.trim()

  try {
    const parsed = JSON.parse(trimmed) as unknown
    return normalizeMarketingStrategy(parsed, durationDays)
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    try {
      const parsed = JSON.parse(jsonMatch[0]) as unknown
      return normalizeMarketingStrategy(parsed, durationDays)
    } catch {
      return null
    }
  }
}

function normalizeMarketingPlanItem(
  value: unknown,
): MarketingPlanItem | null {
  if (typeof value !== "object" || value === null) return null

  const record = value as Record<string, unknown>
  const day =
    typeof record.day === "number"
      ? record.day
      : typeof record.day_number === "number"
        ? record.day_number
        : Number.NaN
  const typeRaw =
    typeof record.type === "string"
      ? record.type.trim().toLowerCase()
      : typeof record.content_type === "string"
        ? record.content_type.trim().toLowerCase()
        : ""
  const hook =
    typeof record.hook === "string"
      ? record.hook.trim()
      : typeof record.hook_idea === "string"
        ? record.hook_idea.trim()
        : ""
  const caption =
    typeof record.caption === "string"
      ? record.caption.trim()
      : typeof record.caption_idea === "string"
        ? record.caption_idea.trim()
        : typeof record.idea === "string"
          ? record.idea.trim()
          : ""
  const cta = typeof record.cta === "string" ? record.cta.trim() : ""
  const goalRaw =
    typeof record.goal === "string"
      ? record.goal.trim().toLowerCase()
      : typeof record.post_goal === "string"
        ? record.post_goal.trim().toLowerCase()
        : ""
  const type = normalizeContentType(typeRaw)

  if (!Number.isInteger(day) || day < 1 || !type || !hook || !caption || !cta) {
    return null
  }

  const goal = isMarketingPostGoal(goalRaw)
    ? goalRaw
    : DEFAULT_GOAL_BY_TYPE[type]

  return {
    day,
    type,
    hook,
    caption,
    cta,
    goal,
  }
}

function normalizeMarketingStrategy(
  value: unknown,
  durationDays?: number,
): MarketingStrategy | null {
  if (typeof value !== "object" || value === null) return null

  const record = value as Record<string, unknown>
  const planSource = Array.isArray(record.posting_schedule)
    ? record.posting_schedule
    : Array.isArray(record.plan)
      ? record.plan
      : Array.isArray(record.days)
        ? record.days
        : null

  if (!planSource) return null

  const plan = planSource
    .map((item) => normalizeMarketingPlanItem(item))
    .filter((item): item is MarketingPlanItem => item !== null)
    .sort((left, right) => left.day - right.day)

  if (plan.length === 0) return null

  if (durationDays !== undefined && plan.length !== durationDays) {
    return null
  }

  const strategyGoal =
    typeof record.goal === "string" ? record.goal.trim() : undefined
  const contentPillars = Array.isArray(record.content_pillars)
    ? record.content_pillars
        .filter((pillar): pillar is string => typeof pillar === "string")
        .map((pillar) => pillar.trim())
        .filter(Boolean)
    : undefined

  return {
    ...(strategyGoal ? { goal: strategyGoal } : {}),
    ...(contentPillars?.length ? { content_pillars: contentPillars } : {}),
    plan,
  }
}
