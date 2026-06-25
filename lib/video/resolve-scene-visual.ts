export type SceneVisualFields = {
  text?: string
  visual_description?: string
  visual?: string
  image_url?: string
  imageUrl?: string
  screenshot_url?: string
  screenshotUrl?: string
  asset_url?: string
  assetUrl?: string
}

export type ResolvedSceneVisual = {
  selectedUrl: string | null
  usedFallback: boolean
  source: "image_url" | "screenshot_url" | "asset_url" | "fallback"
}

function cleanUrl(value: string | undefined | null): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/** Pick the best renderable visual URL for a scene (AI-generated image only by default). */
export function resolveSceneVisualUrl(scene: SceneVisualFields): ResolvedSceneVisual {
  const imageUrl = cleanUrl(scene.image_url) ?? cleanUrl(scene.imageUrl)
  if (imageUrl) {
    return { selectedUrl: imageUrl, usedFallback: false, source: "image_url" }
  }

  return { selectedUrl: null, usedFallback: true, source: "fallback" }
}

export function sceneVisualDescription(scene: SceneVisualFields): string {
  return (
    cleanUrl(scene.visual_description) ??
    cleanUrl(scene.visual) ??
    ""
  )
}

export function logSceneVisualDebug(
  sceneIndex: number,
  scene: SceneVisualFields,
  resolved: ResolvedSceneVisual,
): void {
  console.log("[FitCoreVideoTemplate] scene visual", {
    sceneIndex,
    currentScene: {
      text: scene.text?.trim() ?? "",
      visual_description: sceneVisualDescription(scene) || undefined,
      image_url: cleanUrl(scene.image_url) ?? cleanUrl(scene.imageUrl) ?? undefined,
      screenshot_url:
        cleanUrl(scene.screenshot_url) ?? cleanUrl(scene.screenshotUrl) ?? undefined,
      asset_url: cleanUrl(scene.asset_url) ?? cleanUrl(scene.assetUrl) ?? undefined,
    },
    selectedVisualUrl: resolved.selectedUrl,
    usedFallbackVisual: resolved.usedFallback,
    visualSource: resolved.source,
  })
}
