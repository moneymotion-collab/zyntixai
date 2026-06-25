import type {
  VideoScriptMascot,
  VideoScriptScene,
} from "@/lib/marketing/video-script-types"
import {
  buildCinematicDirectorRules,
  CINEMATIC_VISUAL_EXAMPLES,
  resolveCinematicSceneImagePrompt,
} from "@/lib/marketing/cinematic-visual-prompts"
import {
  buildFitCoreMascotPortraitPrompt,
  buildFitCoreThumbnailPrompt,
} from "@/lib/marketing/visual-identity"

type MascotContext = Pick<VideoScriptMascot, "name" | "description" | "style">

export const SCENE_IMAGE_PROMPT_EXAMPLE =
  CINEMATIC_VISUAL_EXAMPLES[0]?.imagePrompt ??
  "Cinematic medium shot of a fitness coach working late behind a laptop in a dim modern gym office, warm desk lamp and cool blue screen glow, shallow depth of field, premium commercial photography, vertical 9:16."

export function buildSceneImagePromptDirectorRules(): string {
  return buildCinematicDirectorRules()
}

export function buildMascotImagePrompt(mascot: MascotContext): string {
  return buildFitCoreMascotPortraitPrompt(
    mascot.description,
    mascot.style,
    mascot.name,
  )
}

export function buildThumbnailImagePrompt(
  mascot: MascotContext | undefined,
  thumbnailVisual: string,
  thumbnailTitle: string,
  thumbnailText: string,
): string {
  return buildFitCoreThumbnailPrompt(
    thumbnailVisual,
    thumbnailTitle,
    thumbnailText,
    {
      includeMascot: Boolean(mascot),
      mascotName: mascot?.name,
      mascotDescription: mascot?.description,
      mascotStyle: mascot?.style,
    },
  )
}

export type FallbackSceneImagePromptInput = {
  mascotName: string
  mascotDescription?: string
  mascotStyle?: string
  visual: string
  videoStyle?: string
}

export function buildFallbackSceneImagePrompt({
  mascotName,
  mascotDescription,
  mascotStyle,
  visual,
  videoStyle,
}: FallbackSceneImagePromptInput): string {
  const resolvedVisual = visual.trim() || "Premium fitness SaaS marketing scene."
  const descriptionPart = mascotDescription?.trim()
    ? ` ${mascotDescription.trim()}.`
    : ""
  const brandStylePart = [videoStyle?.trim(), mascotStyle?.trim()]
    .filter(Boolean)
    .join(", ")

  return [
    `Modern 3D cartoon commercial scene featuring ${mascotName.trim() || "the brand mascot"}.${descriptionPart}`,
    `${resolvedVisual}.`,
    brandStylePart
      ? `${brandStylePart}, premium fitness commercial, cinematic lighting, shallow depth of field, vertical 9:16.`
      : "Premium fitness commercial style, cinematic lighting, shallow depth of field, vertical 9:16.",
    "No flat app screenshots, real celebrities, public figures, logos or copyrighted characters.",
  ].join(" ")
}

export function resolveSceneImagePrompt(
  scene: Pick<
    VideoScriptScene,
    | "image_prompt"
    | "visual"
    | "text"
    | "camera_motion"
    | "character_action"
    | "story_beat"
    | "module"
  >,
  mascot?: MascotContext,
  videoStyle?: string,
): string {
  return resolveCinematicSceneImagePrompt({
    image_prompt: scene.image_prompt,
    visual: scene.visual,
    text: scene.text,
    story_beat: scene.story_beat,
    camera_motion: scene.camera_motion,
    character_action: scene.character_action,
    module: scene.module,
    mascotName: mascot?.name,
    mascotDescription: mascot?.description,
    mascotStyle: mascot?.style ?? videoStyle,
  })
}

export function enrichScenesWithImagePrompts(
  scenes: VideoScriptScene[],
  mascot?: VideoScriptMascot,
  videoStyle?: string,
): VideoScriptScene[] {
  return scenes.map((scene) => ({
    ...scene,
    image_prompt: resolveSceneImagePrompt(scene, mascot, videoStyle),
  }))
}

export type EnsureSceneImagePromptsContext = {
  mascotName: string
  mascotDescription?: string
  mascotStyle?: string
  videoStyle?: string
}

export function ensureSceneImagePrompts(
  scenes: VideoScriptScene[],
  context: EnsureSceneImagePromptsContext,
): VideoScriptScene[] {
  return scenes.map((scene) => {
    const existing = scene.image_prompt?.trim()
    if (existing) {
      return { ...scene, image_prompt: existing }
    }

    const visual =
      scene.visual?.trim() ||
      scene.text?.trim() ||
      "Premium fitness SaaS marketing scene."

    return {
      ...scene,
      image_prompt: buildFallbackSceneImagePrompt({
        mascotName: context.mascotName,
        mascotDescription: context.mascotDescription,
        mascotStyle: context.mascotStyle,
        visual,
        videoStyle: context.videoStyle,
      }),
    }
  })
}

export function buildSceneImagePrompt(
  mascot: MascotContext | undefined,
  sceneVisual: string,
  sceneText: string,
  cameraMotion?: string,
  characterAction?: string,
): string {
  const mascotLine = mascot
    ? `Include the brand mascot (${mascot.name}): ${mascot.description}. Style: ${mascot.style}.`
    : "Original brand-safe fitness marketing visual."

  const cameraLine = cameraMotion?.trim()
    ? `Camera: ${cameraMotion.trim()}.`
    : "Cinematic framing."

  const actionLine = characterAction?.trim()
    ? `Character action: ${characterAction.trim()}.`
    : ""

  return [
    "Vertical social media ad frame, cinematic, high quality, vertical 9:16 composition.",
    mascotLine,
    `Scene direction: ${sceneVisual || sceneText}.`,
    actionLine,
    cameraLine,
    "Premium fitness commercial style, cinematic lighting, shallow depth of field.",
    "Black, white, and electric blue accent palette.",
    "No flat app screenshots, text overlays, watermarks, celebrity likeness, or logos.",
  ]
    .filter(Boolean)
    .join(" ")
}
