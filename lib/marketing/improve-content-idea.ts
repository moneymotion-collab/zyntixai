import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import {
  createChatCompletion,
  isAiQuotaError,
} from "@/lib/ai-coach/openai"
import {
  parseImprovedContentResponse,
  type ContentIdeaItem,
} from "@/lib/marketing/content-idea-types"
import {
  hasRequiredViralScore,
  VIRAL_SCORE_JSON_RULES,
} from "@/lib/marketing/viral-score"

export type ImproveContentInput = {
  title: string
  caption: string
  hashtags: string
  platform?: string
  category?: string
  viral_score?: number | null
  viral_reason?: string
}

const SYSTEM_PROMPT = `You are a social media marketing assistant for gym owners and fitness coaches.
Improve the given post to maximize viral potential on Instagram, TikTok, or Facebook.
Return ONLY valid JSON in this exact shape:
{"title":"...","caption":"...","hashtags":"...","viral_score":0,"viral_reason":"..."}
Keep the same core topic but strengthen the hook, caption clarity, and hashtag relevance.
${VIRAL_SCORE_JSON_RULES}
The improved post should score higher than the original when possible.`

function buildUserPrompt(input: ImproveContentInput): string {
  const parts = [
    "Improve this social media post for my gym. Return JSON only.",
    `Title: ${input.title}`,
    `Caption: ${input.caption}`,
    `Hashtags: ${input.hashtags}`,
  ]

  if (input.platform?.trim()) {
    parts.push(`Platform: ${input.platform}`)
  }

  if (input.category?.trim()) {
    parts.push(`Category: ${input.category}`)
  }

  if (input.viral_score != null) {
    parts.push(`Current viral_score: ${input.viral_score}`)
  }

  if (input.viral_reason?.trim()) {
    parts.push(`Current viral_reason: ${input.viral_reason}`)
  }

  return parts.join("\n")
}

function buildMockImproved(input: ImproveContentInput): ContentIdeaItem {
  const currentScore = input.viral_score ?? 68
  const boosted = Math.min(100, currentScore + 9)

  return {
    title: input.title.replace(/\.$/, "").trim() || input.title,
    caption: input.caption.includes("?")
      ? `${input.caption} Save this before your next session.`
      : `${input.caption} Which mistake are you still making?`,
    hashtags: input.hashtags || "#fitness #gym #training",
    viral_score: boosted,
    viral_reason:
      "Added a sharper question hook and clearer save-worthy CTA to boost engagement.",
  }
}

export async function improveContentIdea(
  input: ImproveContentInput,
): Promise<
  | { ok: true; idea: ContentIdeaItem; warning?: string }
  | { ok: false; error: string }
> {
  if (isAiMockMode()) {
    return { ok: true, idea: buildMockImproved(input) }
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
        idea: buildMockImproved(input),
        warning:
          "OpenAI quota reached — showing a sample improvement. Add billing at platform.openai.com or set AI_MOCK_MODE=true in .env.local.",
      }
    }
    return result
  }

  const idea = parseImprovedContentResponse(result.content)

  if (!idea || !hasRequiredViralScore(idea)) {
    return {
      ok: false,
      error:
        "Could not parse improved content from AI response. viral_score and viral_reason are required.",
    }
  }

  return { ok: true, idea }
}

export function improveContentIdeaDemo(input: ImproveContentInput): ContentIdeaItem {
  return buildMockImproved(input)
}
