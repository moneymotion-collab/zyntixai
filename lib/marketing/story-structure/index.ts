export {
  alignScenesToStoryStructure,
  isStoryStructureScript,
} from "@/lib/marketing/story-structure/align"
export { generateStoryStructure } from "@/lib/marketing/story-structure/generate"
export { buildStoryStructureUserPromptBlock } from "@/lib/marketing/story-structure/generate"
export { MOCK_STORY_STRUCTURE_SCENES } from "@/lib/marketing/story-structure/mock-script"
export {
  buildStoryStructureDirectorBlock,
  buildStoryStructureFlowSummary,
  isStoryStructureCompatibleStyle,
  storyBeatForRole,
} from "@/lib/marketing/story-structure/prompt"
export {
  getStoryStructureLabel,
  getStoryStructureScene,
  STORY_STRUCTURE_SCENES,
} from "@/lib/marketing/story-structure/scenes"
export {
  STORY_STRUCTURE_SCENE_COUNT,
  STORY_STRUCTURE_SCENE_IDS,
  normalizeStoryStructureRole,
  normalizeStoryStructureScene,
  parseStoryStructureResponse,
  type GenerateStoryStructureInput,
  type StoryStructureResult,
  type StoryStructureSceneId,
  type StoryStructureSceneOutput,
  type StoryStructureScenePlan,
} from "@/lib/marketing/story-structure/types"
