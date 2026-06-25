import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import {
  createChatCompletion,
  isAiQuotaError,
} from "@/lib/ai-coach/openai"
import {
  buildMockCampaignContent,
  parseCampaignContentResponse,
  type CampaignContentItem,
  type GenerateCampaignContentInput,
} from "@/lib/marketing/campaign-content-types"
import {
  buildCampaignStrategistUserPrompt,
  CAMPAIGN_STRATEGIST_SYSTEM_PROMPT,
} from "@/lib/marketing/campaign-strategist-prompt"

const CHUNK_SIZE = 14

async function generateCampaignChunk(
  input: GenerateCampaignContentInput,
  startDay: number,
  endDay: number,
): Promise<
  | { ok: true; items: CampaignContentItem[] }
  | { ok: false; error: string; raw?: string; status?: number }
> {
  if (isAiMockMode()) {
    const allItems = buildMockCampaignContent(
      input.campaignName,
      input.targetAudience,
      input.platform,
      input.campaignGoal,
      input.durationDays,
    )
    return {
      ok: true,
      items: allItems.filter(
        (item) => item.day >= startDay && item.day <= endDay,
      ),
    }
  }

  const userPrompt = buildCampaignStrategistUserPrompt(input, startDay, endDay)

  const result = await createChatCompletion(
    [
      { role: "system", content: CAMPAIGN_STRATEGIST_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    { prompt: userPrompt },
  )

  if (!result.ok) {
    return result
  }

  const items = parseCampaignContentResponse(
    result.content,
    input.durationDays,
    startDay,
    endDay,
  )

  if (!items) {
    return {
      ok: false,
      error: "AI returned invalid JSON",
      raw: result.content,
    }
  }

  return { ok: true, items }
}

export async function generateCampaignContent(
  input: GenerateCampaignContentInput,
): Promise<
  | { ok: true; items: CampaignContentItem[]; warning?: string }
  | { ok: false; error: string; raw?: string }
> {
  if (isAiMockMode()) {
    return {
      ok: true,
      items: buildMockCampaignContent(
        input.campaignName,
        input.targetAudience,
        input.platform,
        input.campaignGoal,
        input.durationDays,
      ),
    }
  }

  const chunks: { startDay: number; endDay: number }[] = []

  for (let start = 1; start <= input.durationDays; start += CHUNK_SIZE) {
    chunks.push({
      startDay: start,
      endDay: Math.min(start + CHUNK_SIZE - 1, input.durationDays),
    })
  }

  const allItems: CampaignContentItem[] = []
  let warning: string | undefined

  for (const chunk of chunks) {
    const result = await generateCampaignChunk(
      input,
      chunk.startDay,
      chunk.endDay,
    )

    if (!result.ok) {
      if (isAiQuotaError(result.error, result.status)) {
        const mockItems = buildMockCampaignContent(
          input.campaignName,
          input.targetAudience,
          input.platform,
          input.campaignGoal,
          input.durationDays,
        )
        return {
          ok: true,
          items: mockItems,
          warning:
            "OpenAI quota reached — showing sample campaign content. Add billing at platform.openai.com or set AI_MOCK_MODE=true in .env.local.",
        }
      }

      return result
    }

    allItems.push(...result.items)
  }

  allItems.sort((left, right) => left.day - right.day)

  return { ok: true, items: allItems, warning }
}
