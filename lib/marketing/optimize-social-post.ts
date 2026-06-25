import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import { safeParse } from "@/lib/safe-parse-json"
import {
  createChatCompletion,
  isAiQuotaError,
} from "@/lib/ai-coach/openai"
import { clampViralScore, serializeViralFeedback } from "@/lib/marketing/viral-score"

export type OptimizeSocialPostInput = {
  title: string
  caption: string
  hashtags: string
  platform?: string
  viral_score?: number | null
}

export type OptimizedPostFields = {
  optimized_title?: string | null
  optimized_content?: string | null
  optimized_hashtags?: string | null
  optimized_score?: number | null
}

export type OptimizedSocialPostResult = {
  optimized_title: string
  optimized_content: string
  optimized_hashtags: string
  predicted_score: number
  changes: string[]
}

const SYSTEM_PROMPT = `You are an elite social media strategist.
Improve posts to maximize attention, engagement, retention, and shareability while keeping the same core message.
Return valid JSON only.`

function buildUserPrompt(input: OptimizeSocialPostInput): string {
  const currentScore = input.viral_score ?? 62

  return [
    "The current post scored " + currentScore + "/100.",
    "",
    "Improve the post to maximize:",
    "- attention",
    "- engagement",
    "- retention",
    "- shareability",
    "",
    "Keep the same message.",
    "",
    `Platform: ${input.platform?.trim() || "Instagram"}`,
    `Title:\n${input.title}`,
    `Content:\n${input.caption}`,
    input.hashtags.trim() ? `Hashtags:\n${input.hashtags}` : "",
    "",
    "Return JSON:",
    `{
  "optimized_title": "",
  "optimized_content": "",
  "optimized_hashtags": "",
  "predicted_score": 0,
  "changes": []
}`,
  ]
    .filter(Boolean)
    .join("\n")
}

function parseOptimizeResponse(raw: string): OptimizedSocialPostResult | null {
  const jsonMatch = raw.trim().match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  const parsed = safeParse(jsonMatch[0]) as {
    optimized_title?: unknown
    optimized_content?: unknown
    optimized_hashtags?: unknown
    predicted_score?: unknown
    changes?: unknown
  } | null

  if (!parsed) return null

  const optimized_title =
    typeof parsed.optimized_title === "string"
      ? parsed.optimized_title.trim()
      : ""
  const optimized_content =
    typeof parsed.optimized_content === "string"
      ? parsed.optimized_content.trim()
      : ""
  const optimized_hashtags =
    typeof parsed.optimized_hashtags === "string"
      ? parsed.optimized_hashtags.trim()
      : ""
  const predicted_score = clampViralScore(parsed.predicted_score)

  if (!optimized_title || !optimized_content || predicted_score == null) {
    return null
  }

  const changes = Array.isArray(parsed.changes)
    ? parsed.changes
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : []

  return {
    optimized_title,
    optimized_content,
    optimized_hashtags,
    predicted_score,
    changes,
  }
}

function buildMockOptimized(
  input: OptimizeSocialPostInput,
): OptimizedSocialPostResult {
  const currentScore = input.viral_score ?? 62
  const predicted_score = Math.min(100, currentScore + 14)
  const changes = [
    "Sharpened the opening hook to stop the scroll.",
    "Added a clearer call-to-action for comments and saves.",
    "Tightened phrasing for better retention on short-form feeds.",
  ]

  return {
    optimized_title: input.title.endsWith("?")
      ? input.title
      : `${input.title.replace(/\.$/, "")}?`,
    optimized_content: input.caption.includes("?")
      ? `${input.caption}\n\nSave this before your next session.`
      : `${input.caption}\n\nWhich mistake are you still making? Comment below.`,
    optimized_hashtags: input.hashtags.trim()
      ? `${input.hashtags} #fitness #gymmotivation`
      : "#fitness #gymmotivation #workouttips",
    predicted_score,
    changes,
  }
}

export function optimizedResultToViralReason(changes: string[]): string {
  if (changes.length === 0) return "Optimized for higher engagement."
  return changes[0]
}

export function optimizedResultToViralFeedback(changes: string[]): string {
  return serializeViralFeedback(changes)
}

export async function optimizeSocialPost(
  input: OptimizeSocialPostInput,
): Promise<
  | { ok: true; result: OptimizedSocialPostResult; warning?: string }
  | { ok: false; error: string }
> {
  if (isAiMockMode()) {
    return { ok: true, result: buildMockOptimized(input) }
  }

  const userPrompt = buildUserPrompt(input)

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
        result: buildMockOptimized(input),
        warning:
          "OpenAI quota reached — showing sample optimization. Add billing at platform.openai.com or set AI_MOCK_MODE=true in .env.local.",
      }
    }
    return completion
  }

  const result = parseOptimizeResponse(completion.content)

  if (!result?.optimized_title || !result?.optimized_content) {
    return { ok: false, error: "Invalid AI response" }
  }

  return { ok: true, result }
}

export function optimizeSocialPostDemo(
  input: OptimizeSocialPostInput,
): OptimizedSocialPostResult {
  return buildMockOptimized(input)
}
