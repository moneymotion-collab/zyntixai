import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import {
  createChatCompletion,
  isAiQuotaError,
} from "@/lib/ai-coach/openai"
import {
  buildHookLibraryUserPrompt,
  HOOK_LIBRARY_SYSTEM_PROMPT,
} from "@/lib/marketing/hook-library/prompt"
import { buildMockHookLibrary } from "@/lib/marketing/hook-library/mock-hooks"
import {
  parseHookLibraryResponse,
  type GenerateHookLibraryInput,
  type HookLibraryItem,
} from "@/lib/marketing/hook-library/types"

export async function generateHookLibrary(
  input: GenerateHookLibraryInput,
): Promise<
  | { ok: true; hooks: HookLibraryItem[]; warning?: string }
  | { ok: false; error: string; raw?: string }
> {
  if (isAiMockMode()) {
    return {
      ok: true,
      hooks: buildMockHookLibrary(input.campaignName, input.targetAudience),
    }
  }

  const userPrompt = buildHookLibraryUserPrompt(input)

  const result = await createChatCompletion(
    [
      { role: "system", content: HOOK_LIBRARY_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    { prompt: userPrompt },
  )

  if (!result.ok) {
    if (isAiQuotaError(result.error, result.status)) {
      return {
        ok: true,
        hooks: buildMockHookLibrary(input.campaignName, input.targetAudience),
        warning:
          "OpenAI quota reached — showing sample hooks. Add billing at platform.openai.com or set AI_MOCK_MODE=true in .env.local.",
      }
    }
    return result
  }

  const hooks = parseHookLibraryResponse(result.content)

  if (!hooks) {
    return {
      ok: false,
      error: "AI returned invalid hook library JSON",
      raw: result.content,
    }
  }

  return { ok: true, hooks }
}
