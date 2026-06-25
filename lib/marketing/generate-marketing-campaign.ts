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
  buildMockMarketingCampaign,
  parseMarketingCampaignResponse,
  type CampaignDuration,
  type MarketingCampaignPlan,
} from "@/lib/marketing/marketing-campaign-types"

type GenerateMarketingCampaignInput = {
  brand?: Pick<
    BrandProfile,
    | "name"
    | "description"
    | "niche"
    | "target_audience"
    | "tone_of_voice"
    | "goals"
    | "platform_focus"
  > | null
  campaignName: string
  targetAudience: string
  platform: string
  campaignGoal: string
  durationDays: CampaignDuration
}

const SYSTEM_PROMPT =
  "You are a senior fitness marketing strategist for gyms and fitness brands. Always respond in valid JSON only."

function buildUserPrompt(input: GenerateMarketingCampaignInput): string {
  const weekCount = Math.max(1, Math.ceil(input.durationDays / 7))
  const brandBlock = input.brand
    ? buildBrandContext({
        ...input.brand,
        name: input.brand.name || "FitCore AI",
        mascot_name: "",
        mascot_description: "",
        mascot_style: "",
        mascot_voice_tone: "",
      })
    : "Brand: FitCore AI — AI-powered gym management and marketing platform."

  return `You are a senior fitness marketing strategist.

${brandBlock}

Campaign name: ${input.campaignName}
Target audience: ${input.targetAudience}
Platform: ${input.platform}
Campaign goal: ${input.campaignGoal}
Duration: ${input.durationDays} days (${weekCount} week phases)

Create a complete marketing campaign plan.

Return ONLY JSON:

{
  "summary": "",
  "key_messages": [],
  "content_pillars": [],
  "phases": [
    {
      "week": 1,
      "theme": "",
      "objectives": [],
      "content_ideas": [],
      "channels": []
    }
  ],
  "kpis": [],
  "budget_tips": [],
  "cta_primary": ""
}

Provide exactly ${weekCount} phase items numbered week 1 through ${weekCount}.
Make it realistic, high-performing, and tailored to fitness/gym marketing.`
}

export async function generateMarketingCampaign(
  input: GenerateMarketingCampaignInput,
): Promise<
  | { ok: true; campaign: MarketingCampaignPlan; warning?: string }
  | { ok: false; error: string; raw?: string }
> {
  if (isAiMockMode()) {
    return {
      ok: true,
      campaign: buildMockMarketingCampaign(
        input.durationDays,
        input.campaignName,
        input.targetAudience,
        input.platform,
        input.campaignGoal,
      ),
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
        campaign: buildMockMarketingCampaign(
          input.durationDays,
          input.campaignName,
          input.targetAudience,
          input.platform,
          input.campaignGoal,
        ),
        warning:
          "OpenAI quota reached — showing a sample campaign. Add billing at platform.openai.com or set AI_MOCK_MODE=true in .env.local.",
      }
    }
    return result
  }

  const campaign = parseMarketingCampaignResponse(
    result.content,
    input.durationDays,
  )

  if (!campaign) {
    return {
      ok: false,
      error: "AI returned invalid JSON",
      raw: result.content,
    }
  }

  return { ok: true, campaign }
}
