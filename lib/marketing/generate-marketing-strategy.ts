import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import {
  createChatCompletion,
  isAiQuotaError,
} from "@/lib/ai-coach/openai"
import {
  buildBrandContext,
  type BrandProfile,
} from "@/lib/marketing/brand-profile"
import {
  buildMockMarketingStrategy,
  parseMarketingStrategyResponse,
  type MarketingStrategy,
} from "@/lib/marketing/marketing-strategy-types"

type GenerateMarketingStrategyInput = {
  brand: Pick<
    BrandProfile,
    | "name"
    | "description"
    | "niche"
    | "target_audience"
    | "tone_of_voice"
    | "goals"
    | "platform_focus"
  >
  goal: string
  platform: string
  durationDays: number
}

const SYSTEM_PROMPT =
  "You are a senior marketing strategist. Always respond in valid JSON only."

function buildUserPrompt({
  brand,
  goal,
  platform,
  durationDays,
}: GenerateMarketingStrategyInput): string {
  const context = buildBrandContext({
    ...brand,
    name: brand.name || "Brand",
    mascot_name: "",
    mascot_description: "",
    mascot_style: "",
    mascot_voice_tone: "",
  })

  return `You are a senior marketing strategist.

Use this brand context:

${context}

Platform: ${platform}
Campaign goal: ${goal}

Create a ${durationDays}-day content strategy.

Return ONLY JSON:

{
  "goal": "",
  "content_pillars": [],
  "posting_schedule": [
    {
      "day": 1,
      "type": "education | viral | authority | sales",
      "hook": "",
      "idea": "",
      "cta": ""
    }
  ]
}

Provide exactly ${durationDays} posting_schedule items numbered day 1 through ${durationDays}.
Make it realistic, high performing, and varied.`
}

export async function generateMarketingStrategy(
  input: GenerateMarketingStrategyInput,
): Promise<
  | { ok: true; strategy: MarketingStrategy; warning?: string }
  | { ok: false; error: string; raw?: string }
> {
  if (isAiMockMode()) {
    return {
      ok: true,
      strategy: buildMockMarketingStrategy(input.durationDays),
    }
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
        strategy: buildMockMarketingStrategy(input.durationDays),
        warning:
          "OpenAI quota reached — showing a sample strategy. Add billing at platform.openai.com or set AI_MOCK_MODE=true in .env.local.",
      }
    }
    return result
  }

  const strategy = parseMarketingStrategyResponse(
    result.content,
    input.durationDays,
  )

  if (!strategy) {
    return {
      ok: false,
      error: "AI returned invalid JSON",
      raw: result.content,
    }
  }

  return { ok: true, strategy }
}
