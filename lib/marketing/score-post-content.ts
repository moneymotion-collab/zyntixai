import { clampViralScore } from "@/lib/marketing/viral-score"

export type PostScoreInput = {
  title: string
  content: string
  hashtags: string
  platform?: string
  niche?: string
  targetAudience?: string
}

export type PostScoreDimension =
  | "hookStrength"
  | "clarity"
  | "ctaPresence"
  | "nicheRelevance"
  | "hashtagQuality"
  | "length"
  | "emotionalTrigger"
  | "valueProposition"

export type PostScoreBreakdown = Record<PostScoreDimension, number>

export type PostScoreResult = {
  score: number
  breakdown: PostScoreBreakdown
  weaknesses: string[]
}

const DIMENSION_WEIGHTS: Record<PostScoreDimension, number> = {
  hookStrength: 0.15,
  clarity: 0.12,
  ctaPresence: 0.12,
  nicheRelevance: 0.12,
  hashtagQuality: 0.1,
  length: 0.12,
  emotionalTrigger: 0.12,
  valueProposition: 0.15,
}

const DIMENSION_LABELS: Record<PostScoreDimension, string> = {
  hookStrength: "Hook strength",
  clarity: "Clarity",
  ctaPresence: "CTA presence",
  nicheRelevance: "Niche relevance",
  hashtagQuality: "Hashtag quality",
  length: "Length",
  emotionalTrigger: "Emotional trigger",
  valueProposition: "Value proposition",
}

const HOOK_POWER_WORDS =
  /\b(secret|stop|mistake|truth|why|how|never|always|warning|proven|hack|before|after|shocking|mistake|unlock|transform)\b/i

const CTA_PATTERNS =
  /\b(dm|comment|link in bio|book|claim|save this|follow|tap|swipe|share|tag|join|sign up|click|message me|tell me)\b/i

const EMOTIONAL_WORDS =
  /\b(love|fear|proud|excited|frustrated|motivated|inspired|confident|struggle|win|breakthrough|dream|pain|joy|hope|angry|grateful)\b/i

const VALUE_PATTERNS =
  /\b(tip|guide|step|lesson|benefit|result|save time|learn|avoid|fix|improve|boost|increase|reduce|free|checklist|framework|strategy)\b/i

function clampDimension(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)))
}

function countHashtags(hashtags: string): number {
  return (hashtags.match(/#[\w\u00C0-\u024F]+/g) ?? []).length
}

function getIdealLengthRange(platform?: string): { min: number; max: number } {
  const normalized = platform?.trim().toLowerCase() ?? ""

  if (normalized.includes("tiktok") || normalized.includes("reel")) {
    return { min: 40, max: 220 }
  }
  if (normalized.includes("linkedin")) {
    return { min: 120, max: 900 }
  }
  if (normalized.includes("twitter") || normalized === "x") {
    return { min: 40, max: 240 }
  }

  return { min: 80, max: 420 }
}

function scoreHookStrength(title: string, content: string): number {
  const hook = `${title} ${content.split("\n")[0] ?? ""}`.trim()
  let score = 35

  if (hook.length >= 8) score += 10
  if (hook.includes("?")) score += 15
  if (HOOK_POWER_WORDS.test(hook)) score += 18
  if (/^\d+/.test(hook) || /\b\d+\s+(ways|tips|reasons|mistakes|steps)\b/i.test(hook)) {
    score += 12
  }
  if (hook.length > 0 && hook.length <= 70) score += 10

  return clampDimension(score)
}

function scoreClarity(title: string, content: string): number {
  const text = `${title}\n${content}`.trim()
  let score = 45

  const sentences = text.split(/[.!?]+/).filter(Boolean)
  const avgSentenceLength =
    sentences.length > 0
      ? text.replace(/\s+/g, " ").split(" ").length / sentences.length
      : text.split(" ").length

  if (avgSentenceLength <= 18) score += 20
  else if (avgSentenceLength <= 24) score += 10
  else score -= 10

  if (!/\b(um|uh|basically|literally|kind of|sort of)\b/i.test(text)) score += 10
  if (title.trim().length > 0) score += 10
  if (!/!!!+/.test(text)) score += 5

  return clampDimension(score)
}

function scoreCtaPresence(content: string): number {
  if (CTA_PATTERNS.test(content)) return 88
  if (content.includes("?")) return 62
  return 28
}

function scoreNicheRelevance(
  title: string,
  content: string,
  niche?: string,
  targetAudience?: string,
): number {
  const corpus = `${title} ${content}`.toLowerCase()
  const signals = [niche, targetAudience]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.trim().toLowerCase())

  if (signals.length === 0) return 58

  let matches = 0
  for (const signal of signals) {
    const tokens = signal.split(/[\s,/|]+/).filter((token) => token.length > 3)
    if (tokens.some((token) => corpus.includes(token))) {
      matches += 1
    }
  }

  if (matches === signals.length) return 90
  if (matches > 0) return 72
  return 42
}

function scoreHashtagQuality(hashtags: string, platform?: string): number {
  const count = countHashtags(hashtags)
  const normalized = platform?.trim().toLowerCase() ?? ""

  if (count === 0) return 20

  let idealMin = 3
  let idealMax = 8
  if (normalized.includes("linkedin")) {
    idealMin = 2
    idealMax = 5
  } else if (normalized.includes("tiktok")) {
    idealMin = 4
    idealMax = 10
  }

  let score = 55
  if (count >= idealMin && count <= idealMax) score += 25
  else if (count < idealMin) score += 8
  else score += 12

  const unique = new Set(
    (hashtags.match(/#[\w\u00C0-\u024F]+/gi) ?? []).map((tag) => tag.toLowerCase()),
  )
  if (unique.size === count) score += 10

  if (!/#(like4like|follow4follow|f4f|l4l)\b/i.test(hashtags)) score += 10

  return clampDimension(score)
}

function scoreLength(content: string, platform?: string): number {
  const length = content.trim().length
  const { min, max } = getIdealLengthRange(platform)

  if (length === 0) return 15
  if (length >= min && length <= max) return 92
  if (length < min) return clampDimension(45 + (length / min) * 35)
  if (length <= max * 1.35) return 68
  return 38
}

function scoreEmotionalTrigger(title: string, content: string): number {
  const text = `${title} ${content}`
  let score = 35

  if (EMOTIONAL_WORDS.test(text)) score += 25
  if (/\b(you|your)\b/i.test(text)) score += 15
  if (text.includes("!")) score += 8
  if (/\b(story|journey|moment|remember|felt)\b/i.test(text)) score += 12

  return clampDimension(score)
}

function scoreValueProposition(title: string, content: string): number {
  const text = `${title} ${content}`
  let score = 38

  if (VALUE_PATTERNS.test(text)) score += 28
  if (/\b(because|so you can|which means|that means)\b/i.test(text)) score += 14
  if (/\b\d+\b/.test(text)) score += 10
  if (/\b(without|in under|in \d+)\b/i.test(text)) score += 10

  return clampDimension(score)
}

function buildWeaknesses(breakdown: PostScoreBreakdown): string[] {
  return (Object.entries(breakdown) as [PostScoreDimension, number][])
    .filter(([, score]) => score < 65)
    .sort((a, b) => a[1] - b[1])
    .map(([key]) => `${DIMENSION_LABELS[key]} needs improvement`)
}

export function scorePostContent(input: PostScoreInput): PostScoreResult {
  const breakdown: PostScoreBreakdown = {
    hookStrength: scoreHookStrength(input.title, input.content),
    clarity: scoreClarity(input.title, input.content),
    ctaPresence: scoreCtaPresence(input.content),
    nicheRelevance: scoreNicheRelevance(
      input.title,
      input.content,
      input.niche,
      input.targetAudience,
    ),
    hashtagQuality: scoreHashtagQuality(input.hashtags, input.platform),
    length: scoreLength(input.content, input.platform),
    emotionalTrigger: scoreEmotionalTrigger(input.title, input.content),
    valueProposition: scoreValueProposition(input.title, input.content),
  }

  const weightedScore = (
    Object.entries(breakdown) as [PostScoreDimension, number][]
  ).reduce((total, [key, value]) => total + value * DIMENSION_WEIGHTS[key], 0)

  return {
    score: clampViralScore(weightedScore) ?? 0,
    breakdown,
    weaknesses: buildWeaknesses(breakdown),
  }
}
