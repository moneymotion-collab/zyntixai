import type {
  MarketingVideo,
  VideoScript,
  VideoScriptScene,
} from "@/lib/marketing/video-script-types"
import {
  buildPlatformShowcaseScenes,
  calcPlatformShowcaseDurationInFrames,
  DEFAULT_PLATFORM_CTA,
  mergeScriptIntoShowcase,
  shouldUsePlatformShowcase,
} from "@/lib/video/platform-showcase"
import {
  moduleToVisualVariant,
  resolveModuleAlignedVisual,
  resolveSceneModule,
} from "@/lib/video/resolve-scene-module"
import {
  sceneVisualDescription,
  type SceneVisualFields,
} from "@/lib/video/resolve-scene-visual"

export type FitCoreTemplateScene = {
  text: string
  duration: number
  module?: string
  variant?: string
  visual_description?: string
  image_url?: string
  screenshot_url?: string
  asset_url?: string
}

export type FitCoreRenderProps = {
  title: string
  brandName: string
  hook: string
  scenes: FitCoreTemplateScene[]
  cta: string
}

type ProjectFields = {
  id: string
  brand_name: string | null
  prompt: string | null
  hook: string | null
  cta: string | null
}

function sceneText(scene: {
  text?: string
  overlay_text?: string
  narration?: string
}): string {
  return (
    scene.text?.trim() ||
    scene.overlay_text?.trim() ||
    scene.narration?.trim() ||
    ""
  )
}

function cleanOptional(value: string | undefined | null): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/** Map a script/db scene to Remotion template scene props (text, duration, visuals). */
export function mapSceneToFitCoreTemplateScene(
  scene: VideoScriptScene | SceneVisualFields & {
    text?: string
    overlay_text?: string
    narration?: string
    duration?: number
    visual?: string
    module?: string
  },
): FitCoreTemplateScene | null {
  const text = sceneText(scene)
  if (!text) return null

  const module = resolveSceneModule(scene)
  const variant = moduleToVisualVariant(module)
  const aligned = resolveModuleAlignedVisual({
    ...scene,
    text,
    module,
  })
  const visual_description = cleanOptional(sceneVisualDescription(scene))

  const image_url =
    aligned.source === "image_url" && aligned.selectedUrl
      ? aligned.selectedUrl
      : undefined
  const screenshot_url =
    aligned.source === "screenshot_url" && aligned.selectedUrl
      ? aligned.selectedUrl
      : undefined
  const asset_url =
    aligned.selectedUrl &&
    (aligned.source === "asset_url" || aligned.usedFallback)
      ? aligned.selectedUrl
      : undefined

  return {
    text,
    duration:
      typeof scene.duration === "number" && scene.duration > 0
        ? Math.min(30, scene.duration)
        : 3,
    module,
    variant,
    ...(visual_description ? { visual_description } : {}),
    ...(image_url ? { image_url } : {}),
    ...(screenshot_url ? { screenshot_url } : {}),
    ...(asset_url ? { asset_url } : {}),
  }
}

function alignFitCoreTemplateScene(scene: FitCoreTemplateScene): FitCoreTemplateScene {
  const module = resolveSceneModule(scene)
  const aligned = resolveModuleAlignedVisual({ ...scene, module })

  return {
    ...scene,
    module,
    variant: aligned.variant,
    ...(aligned.source === "image_url" && aligned.selectedUrl
      ? { image_url: aligned.selectedUrl }
      : aligned.source === "screenshot_url" && aligned.selectedUrl
        ? { screenshot_url: aligned.selectedUrl }
        : aligned.selectedUrl
          ? { asset_url: aligned.selectedUrl }
          : {}),
  }
}

/** Build Remotion props — defaults to 30s full-platform showcase. */
export function buildFitCoreRenderPropsFromProject(
  project: ProjectFields,
  script: VideoScript,
): FitCoreRenderProps {
  const brandName = project.brand_name?.trim() || "FitCore AI"
  const title = brandName || script.hook?.trim() || "FitCore AI"
  const explicitHook = project.hook?.trim() || script.hook?.trim() || ""
  const cta = project.cta?.trim() || script.cta?.trim() || DEFAULT_PLATFORM_CTA

  const scriptScenes = (script.scenes ?? [])
    .map((scene) => mapSceneToFitCoreTemplateScene(scene))
    .filter((scene): scene is FitCoreTemplateScene => scene != null)

  let scenes: FitCoreTemplateScene[]
  if (shouldUsePlatformShowcase(scriptScenes)) {
    scenes = mergeScriptIntoShowcase(scriptScenes)
  } else if (scriptScenes.length > 0) {
    scenes = scriptScenes.map((scene) => alignFitCoreTemplateScene(scene))
  } else {
    scenes = buildPlatformShowcaseScenes()
  }

  const hook =
    explicitHook ||
    scenes.find((s) => s.module === "problem")?.text ||
    scenes[0]?.text ||
    "Coaches juggle 6+ apps to run their business"

  return {
    title,
    brandName,
    hook,
    scenes,
    cta,
  }
}

export function fitCorePreviewDurationInFrames(
  props: Pick<FitCoreRenderProps, "scenes" | "hook" | "cta">,
  fps = 30,
): number {
  if (!props.scenes?.length || props.scenes.length >= 6) {
    return calcPlatformShowcaseDurationInFrames(fps)
  }
  const bodySeconds = props.scenes.reduce(
    (sum, scene) => sum + (scene.duration > 0 ? scene.duration : 3),
    0,
  )
  return Math.round((bodySeconds + 2.5) * fps)
}

/** Player props for in-app preview — uses project + script only, no demo data. */
export function buildFitCorePlayerProps(
  script: VideoScript,
  videoProject?: Pick<
    MarketingVideo,
    "id" | "brand_name" | "prompt" | "hook" | "cta"
  > | null,
): FitCoreRenderProps {
  return buildFitCoreRenderPropsFromProject(
    {
      id: videoProject?.id ?? "",
      brand_name: videoProject?.brand_name ?? null,
      prompt: videoProject?.prompt ?? null,
      hook: videoProject?.hook ?? script.hook,
      cta: videoProject?.cta ?? script.cta,
    },
    script,
  )
}
