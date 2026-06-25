import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import {
  createChatCompletion,
  isAiQuotaError,
} from "@/lib/ai-coach/openai"
import { DEFAULT_CAMPAIGN_TARGET_AUDIENCE } from "@/lib/marketing/campaign-content-types"
import { buildMockStoryStructure } from "@/lib/marketing/story-structure/mock-script"
import {
  buildStoryStructureUserPrompt,
  STORY_STRUCTURE_SYSTEM_PROMPT,
} from "@/lib/marketing/story-structure/story-prompt"
import {
  parseStoryStructureResponse,
  type GenerateStoryStructureInput,
  type StoryStructureSceneOutput,
} from "@/lib/marketing/story-structure/types"

export async function generateStoryStructure(
  input: GenerateStoryStructureInput,
): Promise<
  | {
      ok: true
      hook: string
      cta: string
      scenes: StoryStructureSceneOutput[]
      warning?: string
    }
  | { ok: false; error: string; raw?: string }
> {
  if (isAiMockMode()) {
    const mock = buildMockStoryStructure(input.campaignName, input.topic)
    return { ok: true, ...mock }
  }

  const userPrompt = buildStoryStructureUserPrompt(input)

  const result = await createChatCompletion(
    [
      { role: "system", content: STORY_STRUCTURE_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    { prompt: userPrompt },
  )

  if (!result.ok) {
    if (isAiQuotaError(result.error, result.status)) {
      const mock = buildMockStoryStructure(input.campaignName, input.topic)
      return {
        ok: true,
        ...mock,
        warning:
          "OpenAI quota reached — showing sample story structure. Add billing at platform.openai.com or set AI_MOCK_MODE=true in .env.local.",
      }
    }
    return result
  }

  const scenes = parseStoryStructureResponse(result.content)

  if (!scenes) {
    return {
      ok: false,
      error: "AI returned invalid story structure JSON",
      raw: result.content,
    }
  }

  let parsedRecord: Record<string, unknown> = {}
  try {
    parsedRecord = JSON.parse(result.content) as Record<string, unknown>
  } catch {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      parsedRecord = JSON.parse(jsonMatch[0]) as Record<string, unknown>
    }
  }

  const hook =
    typeof parsedRecord.hook === "string"
      ? parsedRecord.hook.trim()
      : scenes[0]?.text ?? ""
  const cta =
    typeof parsedRecord.cta === "string"
      ? parsedRecord.cta.trim()
      : scenes[scenes.length - 1]?.text ?? ""

  if (!hook || !cta) {
    return {
      ok: false,
      error: "Story structure response missing hook or CTA",
      raw: result.content,
    }
  }

  return { ok: true, hook, cta, scenes }
}

export function buildStoryStructureUserPromptBlock(
  input: GenerateStoryStructureInput,
): string {
  const audience = input.targetAudience.trim() || DEFAULT_CAMPAIGN_TARGET_AUDIENCE
  const topic = input.topic?.trim() || input.campaignName

  return `Apply the Story Structure Engine to this video:

Campaign / brand: ${input.campaignName}
Topic: ${topic}
Target audience: ${audience}
Platform: ${input.platform}
Goal: ${input.goal}

Use the 7-scene narrative flow: Hook → Problem → Why it happens → Solution → Features → Results → CTA.
Each scene must connect logically to the previous scene.`
}
