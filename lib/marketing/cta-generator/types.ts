export const CTA_CATEGORIES = [
  "Business Launch",
  "Early Access",
  "Platform Value",
  "Free Trial",
  "Direct Action",
] as const

export type CtaCategory = (typeof CTA_CATEGORIES)[number]

export const CTAS_PER_GENERATION = 5

export type CtaGeneratorItem = {
  text: string
  category: CtaCategory
}

export type GenerateCtaGeneratorInput = {
  campaignName: string
  targetAudience: string
  platform: string
  campaignGoal: string
  brandName?: string
  learningContext?: string | null
}

const CATEGORY_ALIASES: Record<string, CtaCategory> = {
  "business launch": "Business Launch",
  launch: "Business Launch",
  aspiration: "Business Launch",
  "early access": "Early Access",
  beta: "Early Access",
  waitlist: "Early Access",
  "platform value": "Platform Value",
  platform: "Platform Value",
  "all-in-one": "Platform Value",
  "free trial": "Free Trial",
  trial: "Free Trial",
  "direct action": "Direct Action",
  action: "Direct Action",
  conversion: "Direct Action",
}

export function isCtaCategory(value: string): value is CtaCategory {
  return CTA_CATEGORIES.includes(value as CtaCategory)
}

export function normalizeCtaCategory(value: string): CtaCategory | null {
  const trimmed = value.trim()
  if (isCtaCategory(trimmed)) return trimmed
  return CATEGORY_ALIASES[trimmed.toLowerCase()] ?? null
}

export function normalizeCtaGeneratorItem(value: unknown): CtaGeneratorItem | null {
  if (typeof value !== "object" || value === null) return null

  const record = value as Record<string, unknown>
  const text =
    typeof record.text === "string"
      ? record.text.trim()
      : typeof record.cta === "string"
        ? record.cta.trim()
        : ""
  const categoryRaw =
    typeof record.category === "string" ? record.category.trim() : ""

  const category = normalizeCtaCategory(categoryRaw)

  if (!text || !category) return null

  return { text, category }
}

export function parseCtaGeneratorResponse(raw: string): CtaGeneratorItem[] | null {
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

  const source = Array.isArray(record.ctas)
    ? record.ctas
    : Array.isArray(record.items)
      ? record.items
      : null

  if (!source) return null

  const ctas = source
    .map((item) => normalizeCtaGeneratorItem(item))
    .filter((item): item is CtaGeneratorItem => item !== null)

  if (ctas.length !== CTAS_PER_GENERATION) return null

  const categories = new Set(ctas.map((item) => item.category))
  if (categories.size !== CTAS_PER_GENERATION) return null

  return ctas
}
