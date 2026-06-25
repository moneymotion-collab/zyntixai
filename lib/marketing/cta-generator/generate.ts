import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import {
  createChatCompletion,
  isAiQuotaError,
} from "@/lib/ai-coach/openai"
import {
  buildCtaGeneratorUserPrompt,
  CTA_GENERATOR_SYSTEM_PROMPT,
} from "@/lib/marketing/cta-generator/prompt"
import { buildMockCtaGenerator } from "@/lib/marketing/cta-generator/mock-ctas"
import {
  parseCtaGeneratorResponse,
  type GenerateCtaGeneratorInput,
  type CtaGeneratorItem,
} from "@/lib/marketing/cta-generator/types"

export async function generateCtaLibrary(
  input: GenerateCtaGeneratorInput,
): Promise<
  | { ok: true; ctas: CtaGeneratorItem[]; warning?: string }
  | { ok: false; error: string; raw?: string }
> {
  if (isAiMockMode()) {
    return {
      ok: true,
      ctas: buildMockCtaGenerator(input.campaignName, input.brandName),
    }
  }

  const userPrompt = buildCtaGeneratorUserPrompt(input)

  const result = await createChatCompletion(
    [
      { role: "system", content: CTA_GENERATOR_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    { prompt: userPrompt },
  )

  if (!result.ok) {
    if (isAiQuotaError(result.error, result.status)) {
      return {
        ok: true,
        ctas: buildMockCtaGenerator(input.campaignName, input.brandName),
        warning:
          "OpenAI quota reached — showing sample CTAs. Add billing at platform.openai.com or set AI_MOCK_MODE=true in .env.local.",
      }
    }
    return result
  }

  const ctas = parseCtaGeneratorResponse(result.content)

  if (!ctas) {
    return {
      ok: false,
      error: "AI returned invalid CTA generator JSON",
      raw: result.content,
    }
  }

  return { ok: true, ctas }
}
