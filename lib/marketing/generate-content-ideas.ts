import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import {
  createChatCompletion,
  isAiQuotaError,
} from "@/lib/ai-coach/openai"
import type { ContentIdeaCount } from "@/lib/marketing/content-idea-counts"
import { DEFAULT_CONTENT_IDEA_COUNT } from "@/lib/marketing/content-idea-counts"
import type { ContentCategory } from "@/lib/marketing/content-categories"
import type { ContentGoal } from "@/lib/marketing/content-goals"
import {
  MOCK_CONTENT_IDEAS,
  parseContentIdeasResponse,
  type ContentIdeaItem,
} from "@/lib/marketing/content-idea-types"
import {
  filterIdeasWithViralScore,
  VIRAL_SCORE_JSON_RULES,
} from "@/lib/marketing/viral-score"
import {
  appendLearningContext,
  LEARNING_CONTEXT_SYSTEM_RULES,
} from "@/lib/marketing/learning/build-learning-context"

function buildSystemPrompt(count: ContentIdeaCount): string {
  return `You are a social media marketing assistant for gym owners and fitness coaches.
Generate practical, engaging social media content ideas for Instagram, TikTok, Facebook, and LinkedIn.
Return ONLY valid JSON in this exact shape:
{"ideas":[{"title":"...","caption":"...","hashtags":"...","viral_score":0,"viral_reason":"..."}]}
Provide exactly ${count} ideas.
Each title must be short, catchy, and gym-specific (3–8 words).
Each caption should be 1–2 sentences ready to post.
Each hashtags field should contain 3–5 relevant hashtags as a single string (e.g. "#fitness #gym #training").
${VIRAL_SCORE_JSON_RULES}
Score based on hook strength, shareability, emotional trigger, trend fit, and platform algorithm appeal — not generic quality.
Include a mix of reels, carousels, stories, and promotional posts.
When marketing goals are provided, tailor every idea to support those goals.
When content categories are provided, every idea must fit one of those categories.
${LEARNING_CONTEXT_SYSTEM_RULES}`
}

function buildMockContentIdeas(
  count: ContentIdeaCount,
): ContentIdeaItem[] {
  return MOCK_CONTENT_IDEAS.slice(0, count)
}

function buildUserPrompt(
  goals: ContentGoal[],
  categories: ContentCategory[],
  count: ContentIdeaCount,
  learningContext?: string | null,
): string {
  const base = `Generate exactly ${count} social media content ideas for my gym. Return JSON only with title, caption, hashtags, viral_score, and viral_reason for every idea — never skip viral_score or viral_reason on any idea.`

  const parts = [base]

  if (categories.length > 0) {
    parts.push(
      `Focus on these content categories: ${categories.join(", ")}. Spread ideas across the selected categories where possible.`,
    )
  }

  if (goals.length > 0) {
    parts.push(
      `Prioritize these marketing goals: ${goals.join(", ")}. Every idea should clearly support at least one of these goals.`,
    )
  }

  return appendLearningContext(parts.join("\n\n"), learningContext)
}

export async function generateContentIdeas(
  goals: ContentGoal[] = [],
  count: ContentIdeaCount = DEFAULT_CONTENT_IDEA_COUNT,
  categories: ContentCategory[] = [],
  learningContext?: string | null,
): Promise<
  | { ok: true; ideas: ContentIdeaItem[]; warning?: string }
  | { ok: false; error: string }
> {
  if (isAiMockMode()) {
    return { ok: true, ideas: buildMockContentIdeas(count) }
  }

  const userPrompt = buildUserPrompt(goals, categories, count, learningContext)

  const result = await createChatCompletion(
    [
      { role: "system", content: buildSystemPrompt(count) },
      { role: "user", content: userPrompt },
    ],
    {
      prompt: userPrompt,
    },
  )

  if (!result.ok) {
    if (isAiQuotaError(result.error, result.status)) {
      return {
        ok: true,
        ideas: buildMockContentIdeas(count),
        warning:
          "OpenAI quota reached — showing sample ideas. Add billing at platform.openai.com or set AI_MOCK_MODE=true in .env.local.",
      }
    }
    return result
  }

  const ideas = filterIdeasWithViralScore(parseContentIdeasResponse(result.content))

  if (ideas.length === 0) {
    return {
      ok: false,
      error:
        "Could not parse content ideas from AI response. Every idea must include viral_score and viral_reason.",
    }
  }

  return { ok: true, ideas: ideas.slice(0, count) }
}
