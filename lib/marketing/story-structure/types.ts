import { STORY_STRUCTURE_SCENES } from "@/lib/marketing/story-structure/scenes"

export const STORY_STRUCTURE_SCENE_IDS = [
  "hook",
  "problem",
  "why_it_happens",
  "solution",
  "features",
  "results",
  "cta",
] as const

export type StoryStructureSceneId = (typeof STORY_STRUCTURE_SCENE_IDS)[number]

export const STORY_STRUCTURE_SCENE_COUNT = STORY_STRUCTURE_SCENE_IDS.length

export type StoryStructureScenePlan = {
  id: StoryStructureSceneId
  order: number
  label: string
  narrativeRole: string
  purpose: string
  flowHint: string
}

export type StoryStructureSceneOutput = {
  order: number
  story_beat: string
  role: StoryStructureSceneId
  text: string
  narrative_purpose: string
}

export type GenerateStoryStructureInput = {
  campaignName: string
  targetAudience: string
  platform: string
  goal: string
  topic?: string
  learningContext?: string | null
}

export type StoryStructureResult = {
  campaign_name: string
  target_audience: string
  platform: string
  goal: string
  hook: string
  cta: string
  scenes: StoryStructureSceneOutput[]
}

const STORY_BEAT_ALIASES: Record<string, StoryStructureSceneId> = {
  hook: "hook",
  problem: "problem",
  pain: "problem",
  "pain point": "problem",
  "why it happens": "why_it_happens",
  "why it happens?": "why_it_happens",
  "root cause": "why_it_happens",
  cause: "why_it_happens",
  solution: "solution",
  fix: "solution",
  features: "features",
  feature: "features",
  capabilities: "features",
  results: "results",
  proof: "results",
  transformation: "results",
  cta: "cta",
  "call to action": "cta",
}

export function normalizeStoryStructureRole(
  value: string,
): StoryStructureSceneId | null {
  const key = value.trim().toLowerCase()
  if (STORY_STRUCTURE_SCENE_IDS.includes(key as StoryStructureSceneId)) {
    return key as StoryStructureSceneId
  }
  return STORY_BEAT_ALIASES[key] ?? null
}

export function normalizeStoryStructureScene(
  value: unknown,
  fallbackOrder?: number,
): StoryStructureSceneOutput | null {
  if (typeof value !== "object" || value === null) return null

  const record = value as Record<string, unknown>
  const order =
    typeof record.order === "number"
      ? record.order
      : fallbackOrder ?? Number.NaN
  const text =
    typeof record.text === "string"
      ? record.text.trim()
      : typeof record.on_screen_text === "string"
        ? record.on_screen_text.trim()
        : ""
  const narrative_purpose =
    typeof record.narrative_purpose === "string"
      ? record.narrative_purpose.trim()
      : typeof record.purpose === "string"
        ? record.purpose.trim()
        : ""
  const storyBeatRaw =
    typeof record.story_beat === "string"
      ? record.story_beat
      : typeof record.storyBeat === "string"
        ? record.storyBeat
        : typeof record.label === "string"
          ? record.label
          : ""
  const roleRaw =
    typeof record.role === "string" ? record.role : storyBeatRaw

  const role = normalizeStoryStructureRole(String(roleRaw))

  if (
    !Number.isInteger(order) ||
    order < 1 ||
    order > STORY_STRUCTURE_SCENE_COUNT ||
    !text ||
    !role
  ) {
    return null
  }

  const plan = STORY_STRUCTURE_SCENES.find((scene) => scene.id === role)
  if (!plan) return null

  return {
    order,
    story_beat: plan.label,
    role,
    text,
    narrative_purpose: narrative_purpose || plan.purpose,
  }
}

export function parseStoryStructureResponse(
  raw: string,
): StoryStructureSceneOutput[] | null {
  const trimmed = raw.trim()
  let parsed: unknown

  try {
    parsed = JSON.parse(trimmed)
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return null
    }
  }

  if (typeof parsed !== "object" || parsed === null) return null
  const record = parsed as Record<string, unknown>

  const source = Array.isArray(record.scenes)
    ? record.scenes
    : Array.isArray(record.items)
      ? record.items
      : null

  if (!source) return null

  const scenes = source
    .map((item, index) => normalizeStoryStructureScene(item, index + 1))
    .filter((item): item is StoryStructureSceneOutput => item !== null)
    .sort((left, right) => left.order - right.order)

  if (scenes.length !== STORY_STRUCTURE_SCENE_COUNT) return null

  for (let index = 0; index < scenes.length; index += 1) {
    if (scenes[index]?.order !== index + 1) return null
  }

  return scenes
}
