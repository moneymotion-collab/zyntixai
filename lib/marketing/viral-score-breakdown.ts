import { parseViralFeedback } from "@/lib/marketing/viral-score"

export type ViralQualityLabel =
  | "Weak"
  | "Needs Work"
  | "Strong"
  | "Viral Ready"

export type ViralScoreDimension = {
  key: "hook" | "retention" | "engagement" | "cta"
  label: string
  score: number
  quality: ViralQualityLabel
}

export type ViralScoreBreakdown = {
  overallQuality: ViralQualityLabel
  dimensions: ViralScoreDimension[]
  recommendation: string
  tips: string[]
  improvements: string[]
}

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)))
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getViralQualityLabel(score: number): ViralQualityLabel {
  if (score >= 80) return "Viral Ready"
  if (score >= 60) return "Strong"
  if (score >= 40) return "Needs Work"
  return "Weak"
}

export function getViralQualityStyles(label: ViralQualityLabel): {
  badge: string
  text: string
  bar: string
  hero: string
  heroBadge: string
} {
  switch (label) {
    case "Viral Ready":
      return {
        badge: "border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-900",
        text: "text-violet-800",
        bar: "from-violet-500 via-fuchsia-500 to-pink-500",
        hero: "from-violet-600 via-fuchsia-600 to-pink-600",
        heroBadge: "border-white/30 bg-white/20 text-white",
      }
    case "Strong":
      return {
        badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
        text: "text-emerald-700",
        bar: "from-emerald-500 to-teal-500",
        hero: "from-emerald-600 via-teal-600 to-cyan-600",
        heroBadge: "border-white/30 bg-white/20 text-white",
      }
    case "Needs Work":
      return {
        badge: "border-amber-200 bg-amber-50 text-amber-900",
        text: "text-amber-800",
        bar: "from-amber-400 to-orange-500",
        hero: "from-amber-500 via-orange-500 to-rose-500",
        heroBadge: "border-white/30 bg-white/20 text-white",
      }
    case "Weak":
      return {
        badge: "border-rose-200 bg-rose-50 text-rose-800",
        text: "text-rose-700",
        bar: "from-rose-400 to-red-500",
        hero: "from-rose-600 via-red-600 to-orange-700",
        heroBadge: "border-white/30 bg-white/20 text-white",
      }
  }
}

function dimensionVariance(seed: number, offset: number): number {
  return ((seed + offset * 17) % 11) - 5
}

function scoreDimension(
  base: number,
  adjustment: number,
  variance: number,
): number {
  return clampScore(base + adjustment + variance)
}

function deriveDimensionScores(input: {
  score: number
  feedback: string[]
  reason?: string
  title?: string
  caption?: string
}): Record<ViralScoreDimension["key"], number> {
  const seed = hashString(
    `${input.title ?? ""}|${input.caption ?? ""}|${input.score}`,
  )
  const corpus = [
    ...input.feedback,
    input.reason ?? "",
    input.title ?? "",
    input.caption ?? "",
  ]
    .join(" ")
    .toLowerCase()

  let hookAdj = 0
  let retentionAdj = 0
  let engagementAdj = 0
  let ctaAdj = 0

  if (input.title?.includes("?") || input.caption?.includes("?")) {
    hookAdj += 7
  }
  if ((input.title?.length ?? 0) > 0 && (input.title?.length ?? 0) <= 55) {
    hookAdj += 4
  }
  if (/\b(hook|opening|first line|scroll.?stop)/i.test(corpus)) {
    hookAdj += /\b(strong|clear|bold|great)\b/i.test(corpus) ? 6 : -7
  }

  if (/\b\d+\b/.test(input.caption ?? "")) {
    retentionAdj += 5
  }
  if ((input.caption?.length ?? 0) >= 100) {
    retentionAdj += 3
  }
  if (/\b(retention|watch time|save|carousel|reel|story)\b/i.test(corpus)) {
    retentionAdj += /\b(strong|high|good)\b/i.test(corpus) ? 5 : -6
  }

  if ((input.caption?.length ?? 0) >= 80) {
    engagementAdj += 3
  }
  if (/\b(engagement|share|comment|tag a friend)\b/i.test(corpus)) {
    engagementAdj += 4
  }
  if (/\bhashtag/i.test(corpus)) {
    engagementAdj += 3
  }

  if (/\b(dm|comment|link in bio|book|claim|save this|follow)\b/i.test(
    input.caption ?? "",
  )) {
    ctaAdj += 8
  }
  if (/\b(cta|call to action)\b/i.test(corpus)) {
    ctaAdj += /\b(tighten|clearer|add|improve|missing|sharpen)\b/i.test(
      corpus,
    )
      ? -9
      : 5
  }

  return {
    hook: scoreDimension(input.score, hookAdj, dimensionVariance(seed, 1)),
    retention: scoreDimension(
      input.score,
      retentionAdj,
      dimensionVariance(seed, 2),
    ),
    engagement: scoreDimension(
      input.score,
      engagementAdj,
      dimensionVariance(seed, 3),
    ),
    cta: scoreDimension(input.score, ctaAdj, dimensionVariance(seed, 4)),
  }
}

const DIMENSION_IMPROVEMENTS: Record<ViralScoreDimension["key"], string> = {
  hook: "Sharpen your opening line to stop the scroll in the first 2 seconds.",
  retention:
    "Give viewers a reason to stay — tease the payoff or use a numbered structure.",
  engagement:
    "Add a participation prompt to drive comments, saves, or shares.",
  cta: "Make the next step crystal clear — DM, link in bio, or a comment keyword.",
}

function buildImprovementTips(
  feedback: string[],
  dimensions: ViralScoreDimension[],
): string[] {
  if (feedback.length > 0) {
    return feedback.slice(0, 5)
  }

  const weakest = [...dimensions]
    .sort((a, b) => a.score - b.score)
    .filter((dimension) => dimension.score < 80)
    .slice(0, 3)

  if (weakest.length === 0) {
    return [
      "You're in great shape — test posting time and format for an extra lift.",
    ]
  }

  return weakest.map((dimension) => DIMENSION_IMPROVEMENTS[dimension.key])
}

function buildRecommendation(
  feedback: string[],
  reason: string | null | undefined,
  quality: ViralQualityLabel,
): { recommendation: string; tips: string[] } {
  const tips = feedback.length > 0 ? feedback : []

  if (tips.length > 0) {
    const recommendation =
      quality === "Viral Ready"
        ? "This post is ready to publish — minor polish could push it even further."
        : quality === "Strong"
          ? "Strong foundation — tighten the weakest dimension before you go live."
          : quality === "Needs Work"
            ? "Solid start — sharpen the hook and CTA to unlock more reach."
            : "Rework the hook and call-to-action before scheduling this post."

    return { recommendation, tips }
  }

  const trimmedReason = reason?.trim()
  if (trimmedReason) {
    return {
      recommendation: trimmedReason,
      tips: [],
    }
  }

  return {
    recommendation:
      quality === "Viral Ready"
        ? "High viral potential — this post is primed for strong organic reach."
        : quality === "Strong"
          ? "Strong performance across the board — a few targeted tweaks could push this into viral territory."
          : quality === "Needs Work"
            ? "Good building blocks — focus on hook and CTA clarity to lift your score."
            : "This post needs a stronger hook and clearer CTA before it's ready to publish.",
    tips: [],
  }
}

export function buildViralScoreBreakdown(input: {
  score: number
  reason?: string | null
  viral_feedback?: string | null
  title?: string
  caption?: string
}): ViralScoreBreakdown {
  const feedback = parseViralFeedback(input.viral_feedback)
  const overallQuality = getViralQualityLabel(input.score)
  const dimensionScores = deriveDimensionScores({
    score: input.score,
    feedback,
    reason: input.reason ?? undefined,
    title: input.title,
    caption: input.caption,
  })

  const dimensions: ViralScoreDimension[] = [
    {
      key: "hook",
      label: "Hook Strength",
      score: dimensionScores.hook,
      quality: getViralQualityLabel(dimensionScores.hook),
    },
    {
      key: "retention",
      label: "Retention Potential",
      score: dimensionScores.retention,
      quality: getViralQualityLabel(dimensionScores.retention),
    },
    {
      key: "engagement",
      label: "Engagement Potential",
      score: dimensionScores.engagement,
      quality: getViralQualityLabel(dimensionScores.engagement),
    },
    {
      key: "cta",
      label: "CTA Clarity",
      score: dimensionScores.cta,
      quality: getViralQualityLabel(dimensionScores.cta),
    },
  ]

  const { recommendation, tips } = buildRecommendation(
    feedback,
    input.reason,
    overallQuality,
  )
  const improvements = buildImprovementTips(tips, dimensions)

  return {
    overallQuality,
    dimensions,
    recommendation,
    tips,
    improvements,
  }
}
