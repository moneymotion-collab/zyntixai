import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import { safeParse } from "@/lib/safe-parse-json"
import {
  createChatCompletion,
  isAiQuotaError,
} from "@/lib/ai-coach/openai"
import {
  scorePostContent,
  type PostScoreInput,
} from "@/lib/marketing/score-post-content"
import { clampViralScore } from "@/lib/marketing/viral-score"
import {
  appendLearningContext,
  LEARNING_CONTEXT_SYSTEM_RULES,
} from "@/lib/marketing/learning/build-learning-context"

export type OptimizationEngineInput = PostScoreInput & {
  originalScore?: number | null
  learningContext?: string | null
}

export type OptimizationEngineResult = {
  original_score: number
  optimized_score: number
  optimized_title: string
  optimized_content: string
  optimized_caption: string
  optimized_hashtags: string
  optimization_reason: string
  improvements: string[]
}

const DEFAULT_TARGET_AUDIENCE =
  "Gyms, personal trainers and online fitness coaches."

const SYSTEM_PROMPT = `You are an expert fitness marketing strategist for gyms, personal trainers and online coaches.

Optimize social media posts for higher engagement, clearer positioning and stronger conversions.

Rules:
- Keep it professional and premium.
- Make the hook stronger in the first line.
- Make the value instantly clear.
- Add a clear CTA.
- Keep it suitable for Instagram.
- Avoid hype that feels fake.
- Avoid mentioning other company names.
- Keep hashtags targeted, not spammy.
- Improve clarity, structure and conversion intent.

${LEARNING_CONTEXT_SYSTEM_RULES}

Return only valid JSON.`

const AI_RESPONSE_JSON_SCHEMA = `{
  "original_score": 0,
  "optimized_score": 0,
  "optimized_title": "",
  "optimized_caption": "",
  "optimized_hashtags": "",
  "optimization_reason": "",
  "improvements": []
}`

function resolveTargetAudience(targetAudience?: string): string {
  const trimmed = targetAudience?.trim()
  return trimmed || DEFAULT_TARGET_AUDIENCE
}

function buildUserPrompt(
  input: OptimizationEngineInput,
  originalScore: number,
): string {
  const targetAudience = resolveTargetAudience(input.targetAudience)
  const platform = input.platform?.trim() || "Instagram"

  return appendLearningContext(
    [
      "Optimize this social media post for higher engagement, clearer positioning and stronger conversions.",
      "",
      `Target audience:\n${targetAudience}`,
      input.niche?.trim() ? `Niche: ${input.niche}` : "",
      `Platform: ${platform}`,
      `Current score: ${originalScore}/100`,
      "",
      `Title:\n${input.title || "(none)"}`,
      `Caption:\n${input.content || "(none)"}`,
      input.hashtags.trim() ? `Hashtags:\n${input.hashtags}` : "Hashtags: (none)",
      "",
      "Return only valid JSON:",
      AI_RESPONSE_JSON_SCHEMA,
    ]
      .filter(Boolean)
      .join("\n"),
    input.learningContext,
  )
}

function parseAiOptimizationResponse(
  raw: string,
): Omit<OptimizationEngineResult, "original_score"> | null {
  const jsonMatch = raw.trim().match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  const parsed = safeParse(jsonMatch[0]) as {
    original_score?: unknown
    optimized_title?: unknown
    optimized_content?: unknown
    optimized_caption?: unknown
    optimized_hashtags?: unknown
    optimized_score?: unknown
    optimization_reason?: unknown
    improvements?: unknown
  } | null

  if (!parsed) return null

  const optimized_title =
    typeof parsed.optimized_title === "string"
      ? parsed.optimized_title.trim()
      : ""
  const optimized_caption =
    typeof parsed.optimized_caption === "string"
      ? parsed.optimized_caption.trim()
      : typeof parsed.optimized_content === "string"
        ? parsed.optimized_content.trim()
        : ""
  const optimized_content = optimized_caption
  const optimized_hashtags =
    typeof parsed.optimized_hashtags === "string"
      ? parsed.optimized_hashtags.trim()
      : ""
  const optimized_score = clampViralScore(parsed.optimized_score)
  const optimization_reason =
    typeof parsed.optimization_reason === "string"
      ? parsed.optimization_reason.trim()
      : "Optimized for clearer positioning, stronger value and conversion intent."
  const improvements = Array.isArray(parsed.improvements)
    ? parsed.improvements
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : []

  if (!optimized_title || !optimized_caption || optimized_score == null) {
    return null
  }

  return {
    optimized_score,
    optimized_title,
    optimized_content,
    optimized_caption: optimized_caption || optimized_content,
    optimized_hashtags,
    optimization_reason,
    improvements,
  }
}

function ensureHashtags(hashtags: string, niche?: string): string {
  const trimmed = hashtags.trim()
  if (trimmed) return trimmed

  const nicheTag = niche
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")

  if (nicheTag) {
    return `#${nicheTag} #fitnesscoach #gymowner`
  }

  return "#fitnesscoach #personaltrainer #gymmarketing"
}

function buildRuleBasedOptimization(
  input: OptimizationEngineInput,
  originalScore: number,
): OptimizationEngineResult {
  const scored = scorePostContent(input)
  const improvements: string[] = []

  let optimized_title = input.title.trim()
  let optimized_content = input.content.trim()
  let optimized_hashtags = ensureHashtags(input.hashtags, input.niche)

  if (scored.breakdown.hookStrength < 70) {
    if (!optimized_title) {
      optimized_title = "Your content should work harder than your workouts."
    } else if (!optimized_title.includes("?")) {
      optimized_title = optimized_title.replace(/\.$/, "")
      optimized_title = `${optimized_title}?`
    }
    improvements.push("Strengthened the opening hook for a more premium first impression.")
  }

  if (scored.breakdown.clarity < 70 && optimized_content.length > 0) {
    const lines = optimized_content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
    if (lines.length > 4) {
      optimized_content = lines.slice(0, 4).join("\n\n")
      improvements.push("Restructured the caption for clearer, scannable delivery.")
    }
  }

  if (scored.breakdown.ctaPresence < 70 && !CTA_PATTERNS.test(optimized_content)) {
    optimized_content = `${optimized_content}\n\nDM "PLAN" to get a clearer content system for your gym or coaching brand.`
    improvements.push("Added a direct CTA aligned with conversion intent.")
  }

  if (scored.breakdown.emotionalTrigger < 70) {
    if (!/\byou(r)?\b/i.test(optimized_content)) {
      optimized_content = `If you run a gym or coach online, this is worth your attention.\n\n${optimized_content}`
      improvements.push("Added audience-specific framing for trainers and gym owners.")
    }
  }

  if (scored.breakdown.valueProposition < 70) {
    if (!VALUE_PATTERNS.test(optimized_content)) {
      optimized_content = `${optimized_content}\n\nThe payoff: clearer positioning, stronger engagement, and content that converts without sounding salesy.`
      improvements.push("Clarified the value proposition for fitness professionals.")
    }
  }

  if (scored.breakdown.hashtagQuality < 70) {
    const count = (optimized_hashtags.match(/#[\w\u00C0-\u024F]+/g) ?? []).length
    if (count < 3 || count > 8) {
      optimized_hashtags =
        "#fitnesscoach #gymowner #personaltrainer #onlinecoach #gymmarketing"
      improvements.push("Refined hashtags to stay targeted and professional.")
    }
  }

  if (scored.breakdown.length < 70) {
    const { min } = getIdealLengthRange(input.platform)
    if (optimized_content.length < min) {
      optimized_content = `${optimized_content}\n\nStrong brands post with intention — not guesswork.`
      improvements.push("Extended the caption to better suit Instagram engagement patterns.")
    }
  }

  if (improvements.length === 0) {
    improvements.push(
      "Polished hook, structure, and CTA for a more premium fitness-brand post.",
    )
  }

  const optimized_caption = buildCaption(optimized_content, input.platform)
  const rescored = scorePostContent({
    ...input,
    title: optimized_title,
    content: optimized_caption,
    hashtags: optimized_hashtags,
  })

  const optimized_score = Math.max(
    originalScore + 5,
    Math.min(100, rescored.score + 8),
  )

  return {
    original_score: originalScore,
    optimized_score,
    optimized_title,
    optimized_content,
    optimized_caption,
    optimized_hashtags,
    optimization_reason:
      improvements[0] ??
      "Rule-based optimization applied for clearer positioning and conversion intent.",
    improvements,
  }
}

const CTA_PATTERNS =
  /\b(dm|comment|link in bio|book|claim|save this|follow|tap|swipe|share|tag|join|sign up|click|message me|tell me|apply|start)\b/i

const VALUE_PATTERNS =
  /\b(tip|guide|step|lesson|benefit|result|save time|learn|avoid|fix|improve|boost|increase|reduce|free|checklist|framework|strategy)\b/i

function getIdealLengthRange(platform?: string): { min: number; max: number } {
  const normalized = platform?.trim().toLowerCase() ?? ""

  if (normalized.includes("tiktok") || normalized.includes("reel")) {
    return { min: 40, max: 220 }
  }
  if (normalized.includes("linkedin")) {
    return { min: 120, max: 900 }
  }

  return { min: 80, max: 420 }
}

function buildCaption(content: string, platform?: string): string {
  const normalized = platform?.trim().toLowerCase() ?? ""
  const trimmed = content.trim()

  if (normalized.includes("tiktok") || normalized.includes("reel")) {
    const firstParagraph = trimmed.split("\n\n")[0] ?? trimmed
    return firstParagraph.slice(0, 220).trim()
  }

  return trimmed
}

function hasOpenAiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim())
}

export async function runOptimizationEngine(
  input: OptimizationEngineInput,
): Promise<
  | { ok: true; result: OptimizationEngineResult; warning?: string }
  | { ok: false; error: string }
> {
  const ruleScore = scorePostContent(input)
  const original_score =
    clampViralScore(input.originalScore) ?? ruleScore.score

  if (isAiMockMode() || !hasOpenAiKey()) {
    return {
      ok: true,
      result: buildRuleBasedOptimization(input, original_score),
      warning: isAiMockMode()
        ? "AI mock mode enabled — using rule-based optimization."
        : "OPENAI_API_KEY not configured — using rule-based optimization.",
    }
  }

  const userPrompt = buildUserPrompt(input, original_score)

  try {
    const completion = await createChatCompletion(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      { prompt: userPrompt },
    )

    if (!completion.ok) {
      if (isAiQuotaError(completion.error, completion.status)) {
        return {
          ok: true,
          result: buildRuleBasedOptimization(input, original_score),
          warning:
            "OpenAI quota reached — using rule-based optimization fallback.",
        }
      }

      return {
        ok: true,
        result: buildRuleBasedOptimization(input, original_score),
        warning: completion.error ?? "OpenAI unavailable — using rule-based fallback.",
      }
    }

    const parsed = parseAiOptimizationResponse(completion.content)

    if (!parsed) {
      return {
        ok: true,
        result: buildRuleBasedOptimization(input, original_score),
        warning: "Invalid AI response — using rule-based optimization fallback.",
      }
    }

    const rescored = scorePostContent({
      ...input,
      title: parsed.optimized_title,
      content: parsed.optimized_caption || parsed.optimized_content,
      hashtags: parsed.optimized_hashtags,
    })

    const optimized_score = Math.max(
      parsed.optimized_score,
      Math.min(100, rescored.score),
      original_score,
    )

    return {
      ok: true,
      result: {
        original_score,
        optimized_score,
        optimized_title: parsed.optimized_title,
        optimized_content: parsed.optimized_caption,
        optimized_caption: parsed.optimized_caption,
        optimized_hashtags: parsed.optimized_hashtags,
        optimization_reason: parsed.optimization_reason,
        improvements:
          parsed.improvements.length > 0
            ? parsed.improvements
            : [
                "Strengthened hook, value clarity, and CTA for fitness professionals.",
              ],
      },
    }
  } catch {
    return {
      ok: true,
      result: buildRuleBasedOptimization(input, original_score),
      warning: "OpenAI request failed — using rule-based optimization fallback.",
    }
  }
}
