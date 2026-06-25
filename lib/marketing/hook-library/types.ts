export const HOOK_CATEGORIES = [
  "Pain Point",
  "Curiosity",
  "Mistake",
  "Opportunity",
  "Contrarian",
  "Results",
] as const

export type HookCategory = (typeof HOOK_CATEGORIES)[number]

export const HOOKS_PER_CAMPAIGN = 10

export type HookLibraryItem = {
  text: string
  category: HookCategory
}

export type GenerateHookLibraryInput = {
  campaignName: string
  targetAudience: string
  platform: string
  campaignGoal: string
  learningContext?: string | null
}

export type HookLibraryResult = {
  campaign_name: string
  target_audience: string
  platform: string
  campaign_goal: string
  hooks: HookLibraryItem[]
}

const CATEGORY_ALIASES: Record<string, HookCategory> = {
  "pain point": "Pain Point",
  pain: "Pain Point",
  "pain-point": "Pain Point",
  curiosity: "Curiosity",
  question: "Curiosity",
  mistake: "Mistake",
  mistakes: "Mistake",
  error: "Mistake",
  opportunity: "Opportunity",
  opportunities: "Opportunity",
  contrarian: "Contrarian",
  "hot take": "Contrarian",
  results: "Results",
  proof: "Results",
  transformation: "Results",
}

export function isHookCategory(value: string): value is HookCategory {
  return HOOK_CATEGORIES.includes(value as HookCategory)
}

export function normalizeHookCategory(value: string): HookCategory | null {
  const trimmed = value.trim()
  if (isHookCategory(trimmed)) return trimmed
  return CATEGORY_ALIASES[trimmed.toLowerCase()] ?? null
}

export function normalizeHookLibraryItem(value: unknown): HookLibraryItem | null {
  if (typeof value !== "object" || value === null) return null

  const record = value as Record<string, unknown>
  const text =
    typeof record.text === "string"
      ? record.text.trim()
      : typeof record.hook === "string"
        ? record.hook.trim()
        : ""
  const categoryRaw =
    typeof record.category === "string" ? record.category.trim() : ""

  const category = normalizeHookCategory(categoryRaw)

  if (!text || !category) return null

  return { text, category }
}

export function parseHookLibraryResponse(raw: string): HookLibraryItem[] | null {
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

  const source = Array.isArray(record.hooks)
    ? record.hooks
    : Array.isArray(record.items)
      ? record.items
      : null

  if (!source) return null

  const hooks = source
    .map((item) => normalizeHookLibraryItem(item))
    .filter((item): item is HookLibraryItem => item !== null)

  if (hooks.length !== HOOKS_PER_CAMPAIGN) return null

  return hooks
}

export function groupHooksByCategory(
  hooks: HookLibraryItem[],
): Record<HookCategory, HookLibraryItem[]> {
  const grouped = Object.fromEntries(
    HOOK_CATEGORIES.map((category) => [category, [] as HookLibraryItem[]]),
  ) as Record<HookCategory, HookLibraryItem[]>

  for (const hook of hooks) {
    grouped[hook.category].push(hook)
  }

  return grouped
}
