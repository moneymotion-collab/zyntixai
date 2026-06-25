import { STORY_STRUCTURE_SCENES } from "@/lib/marketing/story-structure/scenes"
import {
  STORY_STRUCTURE_SCENE_COUNT,
  type StoryStructureSceneId,
} from "@/lib/marketing/story-structure/types"

export function buildStoryStructureDirectorBlock(): string {
  const sceneGuide = STORY_STRUCTURE_SCENES.map((scene) => {
    return `Scene ${scene.order} (story_beat: "${scene.label}"):
- Role: ${scene.narrativeRole}
- Purpose: ${scene.purpose}
- Narrative flow: ${scene.flowHint}`
  }).join("\n\n")

  return `STORY STRUCTURE ENGINE — EXACTLY ${STORY_STRUCTURE_SCENE_COUNT} scenes in this narrative order:

${sceneGuide}

Story Structure rules:
- Output EXACTLY ${STORY_STRUCTURE_SCENE_COUNT} scenes — no more, no fewer
- Every scene MUST include story_beat matching the label above exactly ("Hook", "Problem", "Why it happens", "Solution", "Features", "Results", "CTA")
- Scenes must follow a continuous narrative flow — each scene logically leads to the next
- Scene 1 text must reinforce the top-level hook field
- Scene 7 text must reinforce the top-level cta field
- Duration: 3–5 seconds per scene (integer), total ~30–40 seconds
- On-screen text (text field): max 12 words per scene — spoken, punchy, mobile-first
- Problem in scene 2 must connect to the hook in scene 1
- Why it happens must explain the problem from scene 2
- Solution must resolve the root cause from scene 3
- Features must demonstrate the solution from scene 4
- Results must prove the features from scene 5 work
- CTA must close the loop opened in scene 1`
}

export function buildStoryStructureFlowSummary(): string {
  return STORY_STRUCTURE_SCENES.map((scene) => scene.label).join(" → ")
}

export function isStoryStructureCompatibleStyle(style?: string): boolean {
  if (!style) return true
  return style !== "app_showcase" && style !== "saas_demo"
}

export function storyBeatForRole(role: StoryStructureSceneId): string {
  return STORY_STRUCTURE_SCENES.find((scene) => scene.id === role)?.label ?? role
}
