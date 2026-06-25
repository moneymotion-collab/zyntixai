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
  parseGeneratedPlanPostResponse,
  type GeneratedPlanPost,
  type GeneratedPlanPostAngle,
} from "@/lib/marketing/generated-post"
import type { MarketingPlanItem } from "@/lib/marketing/marketing-strategy-types"

type GeneratePlanDayPostInput = {
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
  platform: string
  day: MarketingPlanItem
}

function toPlanPostAngle(type: MarketingPlanItem["type"]): GeneratedPlanPostAngle {
  return type
}

function buildMockPlanDayPost({
  platform,
  day,
}: GeneratePlanDayPostInput): GeneratedPlanPost {
  return {
    title: day.hook,
    content: day.caption,
    hooks: day.hook,
    cta: day.cta,
    hashtags: ["fitness", "gym", "coaching", "workout"],
    angle: toPlanPostAngle(day.type),
  }
}

function buildUserPrompt({
  brand,
  platform,
  day,
}: GeneratePlanDayPostInput): string {
  const context = buildBrandContext({
    ...brand,
    name: brand.name || "Brand",
    mascot_name: "",
    mascot_description: "",
    mascot_style: "",
    mascot_voice_tone: "",
  })
  const idea = day.caption.trim()

  return `${context}

Create a HIGH PERFORMANCE social media post for ${platform}.

RULES:
- Match angle: ${day.type}
- Use hook direction: ${day.hook}
- Use idea: ${idea}
- Include CTA direction: ${day.cta}
- Keep content platform optimized

Return ONLY JSON:

{
  "title": "",
  "content": "",
  "hooks": "",
  "cta": "",
  "hashtags": [],
  "angle": "viral | education | authority | sales"
}`
}

export async function generatePlanDayPost(
  input: GeneratePlanDayPostInput,
): Promise<
  | { ok: true; post: GeneratedPlanPost; warning?: string }
  | { ok: false; error: string }
> {
  if (isAiMockMode()) {
    return { ok: true, post: buildMockPlanDayPost(input) }
  }

  const userPrompt = buildUserPrompt(input)

  const result = await createChatCompletion(
    [
      {
        role: "system",
        content:
          "You are a viral social media content creator. Output ONLY JSON.",
      },
      { role: "user", content: userPrompt },
    ],
    { prompt: userPrompt },
  )

  if (!result.ok) {
    if (isAiQuotaError(result.error, result.status)) {
      return {
        ok: true,
        post: buildMockPlanDayPost(input),
        warning:
          "OpenAI quota reached — showing a sample post. Add billing at platform.openai.com or set AI_MOCK_MODE=true in .env.local.",
      }
    }
    return result
  }

  const post = parseGeneratedPlanPostResponse(result.content)

  if (!post) {
    return {
      ok: false,
      error: "Could not parse generated post from AI response.",
    }
  }

  return { ok: true, post }
}
