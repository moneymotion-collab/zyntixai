import type { LearningProfile } from "@/lib/marketing/learning/types"
import { buildAiLearningProfileSummary } from "@/lib/marketing/learning/build-ai-learning-profile-summary"

function formatList(items: string[], fallback = "None identified yet"): string {
  const filtered = items.map((item) => item.trim()).filter(Boolean)
  if (filtered.length === 0) return fallback
  return filtered.map((item) => `- ${item}`).join("\n")
}

function collectWeakContentTypes(profile: LearningProfile): string[] {
  const fromPatterns = profile.repeatedWeakPatterns
    .filter((pattern) => pattern.category === "content_type")
    .map((pattern) => pattern.pattern)

  const fromWeakPosts = profile.worstPerformingPosts
    .map((post) => post.contentType.trim())
    .filter(Boolean)

  return [...new Set([...fromPatterns, ...fromWeakPosts])]
}

function collectWeakHooks(profile: LearningProfile): string[] {
  return profile.repeatedWeakPatterns
    .filter((pattern) => pattern.category === "hook")
    .map((pattern) => `"${pattern.pattern}" (${pattern.occurrences}× underperformed)`)
}

export function buildLearningContextBlock(profile: LearningProfile): string {
  const summary = profile.aiSummary ?? buildAiLearningProfileSummary(profile)

  const bestHooks = profile.bestHookPatterns.map(
    (pattern) =>
      `"${pattern.hook}" (${pattern.avgEngagementRate}% avg engagement)`,
  )
  const bestCtas = profile.bestCtaPatterns.map(
    (pattern) =>
      `"${pattern.pattern}" (${pattern.avgEngagementRate}% avg engagement)`,
  )
  const weakContentTypes = collectWeakContentTypes(profile)
  const weakHooks = collectWeakHooks(profile)
  const weakCtas = profile.repeatedWeakPatterns
    .filter((pattern) => pattern.category === "cta")
    .map((pattern) => `"${pattern.pattern}"`)

  return `
AI LEARNING PROFILE:
--------------------
Best Content Type: ${summary.bestContentType}
Best Hook Style: ${summary.bestHookStyle}
Best CTA: ${summary.bestCta}
Best Posting Time: ${summary.bestPostingTime}
Recommendation: ${summary.recommendation}

LEARNING ENGINE INSIGHTS (from ${profile.postCount} tracked posts, ${profile.averageEngagementRate}% avg engagement):
--------------------------------------------------------------------------------

REPEAT THESE WINNING PATTERNS:
- Best content type to repeat: ${summary.bestContentType}
- Best platform: ${profile.bestPlatform ?? "Not enough data yet"}
- Best posting window: ${summary.bestPostingTime}
- Winning hook styles:
${formatList(bestHooks, "  - No hook patterns yet — test bold, specific openings")}
- Winning CTA endings:
${formatList(bestCtas, "  - No CTA patterns yet — end with one clear action")}

AVOID THESE WEAK PATTERNS:
${formatList(weakContentTypes, "- No weak content types flagged yet")}
${formatList(weakHooks, "- No repeated weak hooks flagged yet")}
${formatList(weakCtas, "- No repeated weak CTAs flagged yet")}

APPLICATION RULES FOR THIS GENERATION:
- Follow the AI Learning Profile recommendation above.
- Repeat ${summary.bestContentType} and use ${summary.bestHookStyle.toLowerCase()}.
- End with CTA style like: ${summary.bestCta}
- Avoid weak content types and underperforming hook patterns listed above.
- Schedule around ${summary.bestPostingTime} when timing is relevant.
- Prioritize ${profile.bestPlatform ?? "the user's primary platform"} when platform choice is flexible.
`.trim()
}

export function appendLearningContext(
  prompt: string,
  learningContext: string | null | undefined,
): string {
  const block = learningContext?.trim()
  if (!block) return prompt

  return `${prompt.trim()}\n\n${block}`
}

export const LEARNING_CONTEXT_SYSTEM_RULES = `When LEARNING ENGINE INSIGHTS are provided in the user message:
- Repeat the best content types and formats identified from performance data.
- Mirror the winning hook style in titles, openings, and first lines.
- Avoid weak content types and repeated underperforming patterns.
- Prefer CTA endings that match the winning CTA style.
- Favor the best posting time when timing or scheduling is relevant.`
