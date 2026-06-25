import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import {
  createChatCompletion,
  isAiQuotaError,
} from "@/lib/ai-coach/openai"
import {
  parseImprovedContentResponse,
  type ContentIdeaItem,
} from "@/lib/marketing/content-idea-types"
import type { ImproveContentInput } from "@/lib/marketing/improve-content-idea"
import {
  hasRequiredViralScore,
  VIRAL_SCORE_JSON_RULES,
} from "@/lib/marketing/viral-score"

const SYSTEM_PROMPT = `You are a social media marketing assistant for gym owners and fitness coaches.
Generate a NEW post that is similar in topic and intent to the reference post, but with a different hook, angle, and wording.
Return ONLY valid JSON in this exact shape:
{"title":"...","caption":"...","hashtags":"...","viral_score":0,"viral_reason":"..."}
${VIRAL_SCORE_JSON_RULES}`

function buildUserPrompt(input: ImproveContentInput): string {
  const parts = [
    "Generate a similar social media post variation for my gym. Return JSON only.",
    `Reference title: ${input.title}`,
    `Reference caption: ${input.caption}`,
    `Reference hashtags: ${input.hashtags}`,
  ]

  if (input.platform?.trim()) {
    parts.push(`Platform: ${input.platform}`)
  }

  if (input.category?.trim()) {
    parts.push(`Category: ${input.category}`)
  }

  return parts.join("\n")
}

function buildMockSimilar(input: ImproveContentInput): ContentIdeaItem {
  const baseScore = input.viral_score ?? 70

  return {
    title:
      input.title.startsWith("Another angle:")
        ? input.title
        : `Another angle: ${input.title}`,
    caption: `Same topic, fresh hook — ${input.caption}`,
    hashtags: input.hashtags || "#fitness #gym #training",
    viral_score: Math.min(100, baseScore + 4),
    viral_reason:
      "Similar topic with a new hook pattern — useful for A/B testing engagement.",
  }
}

export async function generateSimilarPost(
  input: ImproveContentInput,
): Promise<
  | { ok: true; idea: ContentIdeaItem; warning?: string }
  | { ok: false; error: string }
> {
  if (isAiMockMode()) {
    return { ok: true, idea: buildMockSimilar(input) }
  }

  const userPrompt = buildUserPrompt(input)

  const result = await createChatCompletion(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    { prompt: userPrompt },
  )

  if (!result.ok) {
    if (isAiQuotaError(result.error, result.status)) {
      return {
        ok: true,
        idea: buildMockSimilar(input),
        warning:
          "OpenAI quota reached — showing a sample variation. Add billing at platform.openai.com or set AI_MOCK_MODE=true in .env.local.",
      }
    }

    return { ok: false, error: result.error }
  }

  const idea = parseImprovedContentResponse(result.content)

  if (!idea || !hasRequiredViralScore(idea)) {
    return {
      ok: false,
      error:
        "Could not parse similar post from AI response. viral_score and viral_reason are required.",
    }
  }

  return { ok: true, idea }
}

export function generateSimilarPostDemo(
  input: ImproveContentInput,
): ContentIdeaItem {
  return buildMockSimilar(input)
}
