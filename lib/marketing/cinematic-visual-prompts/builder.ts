import {
  CINEMATIC_NEGATIVE_CONSTRAINTS,
  CINEMATIC_VISUAL_EXAMPLES,
} from "@/lib/marketing/cinematic-visual-prompts/examples"
import type {
  BuildCinematicPromptInput,
  CinematicVisualMode,
} from "@/lib/marketing/cinematic-visual-prompts/types"
import {
  applyFitCoreBrandVisualIdentity,
  buildFitCoreBrandedScenePrompt,
  buildFitCoreVisualIdentityDirectorBlock,
} from "@/lib/marketing/visual-identity"

export function buildCinematicImagePrompt(
  input: BuildCinematicPromptInput,
): string {
  return buildCinematicPrompt({ ...input, mode: "image" })
}

export function buildCinematicMotionPrompt(
  input: BuildCinematicPromptInput,
): string {
  return buildCinematicPrompt({ ...input, mode: "motion" })
}

export function buildCinematicCommercialPrompt(
  input: BuildCinematicPromptInput,
): string {
  return buildCinematicPrompt({ ...input, mode: "commercial" })
}

export function buildCinematicPrompt(input: BuildCinematicPromptInput): string {
  const mode = input.mode ?? "image"

  return buildFitCoreBrandedScenePrompt(
    {
      sceneDirection:
        input.sceneDirection.trim() ||
        "Premium fitness coaching commercial scene.",
      onScreenText: input.onScreenText,
      storyBeat: input.storyBeat,
      cameraMotion: input.cameraMotion,
      characterAction: input.characterAction,
    },
    {
      mode,
      mascotName: input.mascotName,
      mascotDescription: input.mascotDescription,
      mascotStyle: input.mascotStyle,
      includeMascot: true,
    },
  )
}

export function buildCinematicDirectorRules(): string {
  const exampleBlock = CINEMATIC_VISUAL_EXAMPLES.map(
    (example) =>
      `- ${example.label}: visual="${example.sceneDirection}" | image_prompt="${example.imagePrompt}"`,
  ).join("\n")

  return `${buildFitCoreVisualIdentityDirectorBlock()}

CINEMATIC VISUAL ENGINE (default — avoid direct app screenshots):
- visual and image_prompt must describe cinematic scenes, environments, and characters — NOT flat UI screenshots
- Use metaphorical product moments (glowing dashboard in dark office) instead of literal app captures
- Optimize every scene for: (1) image generation, (2) motion scenes, (3) premium commercial video ads
- ${CINEMATIC_NEGATIVE_CONSTRAINTS}

Reference cinematic scenes:
${exampleBlock}

Example image_prompt:
"${CINEMATIC_VISUAL_EXAMPLES[0]?.imagePrompt ?? ""}"`
}

export function buildCinematicVisualFromModule(
  moduleLabel: string,
  sceneText: string,
): string {
  const key = moduleLabel.trim().toLowerCase()

  const moduleVisuals: Record<string, string> = {
    dashboard:
      "Fitness business owner at standing desk, holographic command center glowing electric blue in dark modern office",
    members:
      "Coach reviewing client profiles on laptop in professional gym lounge, warm cinematic lighting",
    workouts:
      "Coach building training program on tablet beside gym floor, athletes training in soft background blur",
    nutrition:
      "Nutrition coach planning meal templates on glowing screen in clean wellness studio",
    sessions:
      "Coach checking calendar on phone between sessions in premium gym reception area",
    marketing:
      "Coach creating social content on laptop with creative studio lighting, content calendar mood on screen glow",
    analytics:
      "Gym owner studying growth metrics on illuminated display in dark office, confident results moment",
    "marketing ai":
      "Modern AI content studio glowing in dark office, coach directing creative workflow",
    "ai coach":
      "Coach speaking with AI assistant interface as soft blue holographic glow in modern training facility",
    progress:
      "Athletic transformation montage moment — coach celebrating client milestone in gym",
    problem:
      "Busy coach overwhelmed by messages, tabs, and notifications — chaotic before state",
    platform_overview:
      "Wide cinematic shot of unified coaching command center environment, premium fitness business",
  }

  for (const [pattern, visual] of Object.entries(moduleVisuals)) {
    if (key.includes(pattern)) return visual
  }

  return sceneText.trim()
    ? applyFitCoreBrandVisualIdentity(
        `Cinematic commercial scene illustrating: ${sceneText.trim()}`,
        { mode: "commercial" },
      )
    : buildFitCoreBrandedScenePrompt(
        { sceneDirection: "Premium fitness coaching commercial environment" },
        { mode: "commercial" },
      )
}

export function resolveCinematicSceneImagePrompt(input: {
  visual?: string
  text?: string
  image_prompt?: string
  story_beat?: string
  camera_motion?: string
  character_action?: string
  module?: string
  mascotName?: string
  mascotDescription?: string
  mascotStyle?: string
}): string {
  const explicit = input.image_prompt?.trim()
  if (explicit && !looksLikeScreenshotPrompt(explicit)) {
    return explicit
  }

  const sceneDirection =
    input.visual?.trim() ||
    (input.module
      ? buildCinematicVisualFromModule(input.module, input.text ?? "")
      : "") ||
    input.text?.trim() ||
    "Premium fitness coaching commercial scene."

  return buildCinematicImagePrompt({
    sceneDirection,
    onScreenText: input.text,
    storyBeat: input.story_beat,
    cameraMotion: input.camera_motion,
    characterAction: input.character_action,
    mascotName: input.mascotName,
    mascotDescription: input.mascotDescription,
    mascotStyle: input.mascotStyle,
    mode: "image",
  })
}

function looksLikeScreenshotPrompt(prompt: string): boolean {
  const lower = prompt.toLowerCase()
  return (
    lower.includes("screenshot") ||
    lower.includes("ui screenshot") ||
    lower.includes("flat app capture") ||
    lower.includes("/app-showcase/")
  )
}
