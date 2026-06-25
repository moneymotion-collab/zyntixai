import { STORY_STRUCTURE_SCENES } from "@/lib/marketing/story-structure/scenes"
import { buildStoryStructureDirectorBlock } from "@/lib/marketing/story-structure/prompt"
import {
  STORY_STRUCTURE_SCENE_COUNT,
  type GenerateStoryStructureInput,
} from "@/lib/marketing/story-structure/types"
import { DEFAULT_CAMPAIGN_TARGET_AUDIENCE } from "@/lib/marketing/campaign-content-types"
import {
  appendLearningContext,
  LEARNING_CONTEXT_SYSTEM_RULES,
} from "@/lib/marketing/learning/build-learning-context"

export const STORY_STRUCTURE_SYSTEM_PROMPT = `You are a narrative video strategist for fitness businesses and online coaches.
You build 7-scene story structures that follow a proven conversion arc.
Always respond in valid JSON only — no markdown, no commentary.

${LEARNING_CONTEXT_SYSTEM_RULES}`

export function buildStoryStructureUserPrompt(
  input: GenerateStoryStructureInput,
): string {
  const audience = input.targetAudience.trim() || DEFAULT_CAMPAIGN_TARGET_AUDIENCE
  const topic = input.topic?.trim() || input.campaignName
  const sceneLabels = STORY_STRUCTURE_SCENES.map((scene) => scene.label).join(
    " | ",
  )

  return appendLearningContext(
    `Create a 7-scene story structure for this campaign.

Campaign name: ${input.campaignName}
Topic: ${topic}
Target audience: ${audience}
Platform: ${input.platform}
Goal: ${input.goal}

${buildStoryStructureDirectorBlock()}

Return ONLY JSON:

{
  "hook": "",
  "cta": "",
  "scenes": [
    {
      "order": 1,
      "story_beat": "${sceneLabels}",
      "role": "hook",
      "text": "",
      "narrative_purpose": ""
    }
  ]
}

Rules:
- Provide exactly ${STORY_STRUCTURE_SCENE_COUNT} scenes numbered order 1 through ${STORY_STRUCTURE_SCENE_COUNT}
- story_beat must be one of: ${sceneLabels}
- role must be one of: hook, problem, why_it_happens, solution, features, results, cta
- Each text: max 12 words, scroll-stopping, spoken tone for ${input.platform}
- hook field must match scene 1 text
- cta field must match scene 7 text
- narrative_purpose explains why this beat exists in the arc
- Scenes must read as one continuous story when read in order`,
    input.learningContext,
  )
}
