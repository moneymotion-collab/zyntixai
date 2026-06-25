import type { VideoScriptScene } from "@/lib/marketing/video-script-types"
import { STORY_STRUCTURE_SCENES } from "@/lib/marketing/story-structure/scenes"
import { storyBeatForRole } from "@/lib/marketing/story-structure/prompt"
import {
  STORY_STRUCTURE_SCENE_COUNT,
  type StoryStructureSceneId,
} from "@/lib/marketing/story-structure/types"

export function alignScenesToStoryStructure(
  scenes: VideoScriptScene[],
): VideoScriptScene[] {
  if (scenes.length === 0) return scenes

  const aligned = scenes.slice(0, STORY_STRUCTURE_SCENE_COUNT).map((scene, index) => {
    const plan = STORY_STRUCTURE_SCENES[index]
    if (!plan) return scene

    return {
      ...scene,
      story_beat: storyBeatForRole(plan.id as StoryStructureSceneId),
      professional_purpose:
        scene.professional_purpose?.trim() || plan.purpose,
    }
  })

  while (aligned.length < STORY_STRUCTURE_SCENE_COUNT) {
    const plan = STORY_STRUCTURE_SCENES[aligned.length]
    if (!plan) break

    aligned.push({
      text: plan.label,
      visual: `Visual direction for ${plan.label.toLowerCase()} beat.`,
      image_prompt: "",
      camera_motion: "slow zoom in",
      transition: "cross dissolve",
      duration: 4,
      story_beat: plan.label,
      professional_purpose: plan.purpose,
    })
  }

  return aligned
}

export function isStoryStructureScript(scenes: VideoScriptScene[]): boolean {
  if (scenes.length !== STORY_STRUCTURE_SCENE_COUNT) return false

  return STORY_STRUCTURE_SCENES.every((plan, index) => {
    const beat = scenes[index]?.story_beat?.trim().toLowerCase() ?? ""
    return (
      beat === plan.label.toLowerCase() ||
      beat === plan.id.replace(/_/g, " ")
    )
  })
}
