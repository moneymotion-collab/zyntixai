import { APP_SHOWCASE_STYLE, isAppShowcaseStyle } from "@/lib/marketing/video-styles"
import { isWorkflowDirectorStyle } from "@/lib/marketing/app-workflow-director"
import type { VideoScriptScene } from "@/lib/marketing/video-script-types"
import {
  APP_SHOWCASE_BASE_PATH,
  FITCORE_SHOWCASE_ASSETS,
  FITCORE_SHOWCASE_ASSET_KEYS,
  getShowcaseAsset,
  isShowcaseScreenshotAvailable,
  moduleToAssetKey,
  resolveAssetKeyFromModuleLabel,
  resolveShowcaseAssetForModule,
  PRIMARY_SHOWCASE_SCREENSHOT_KEYS,
  WORKFLOW_SCENE_ASSET_RESOLUTION,
  type FitCoreShowcaseAssetKey,
} from "@/lib/marketing/workflow-scene-asset-resolver"
import {
  MODULE_DEFAULT_ASSET,
  resolveSceneModule,
} from "@/lib/video/resolve-scene-module"
import {
  SHOWCASE_WORKFLOW_BEATS,
  type PlatformModule,
} from "@/lib/marketing/showcase-workflow-beats"

export {
  APP_SHOWCASE_BASE_PATH,
  resolveWorkflowSceneAsset,
  resolveAssetKeyFromModuleLabel,
  resolveAssetKeyFromWorkflowStep,
  resolveShowcaseAssetForModule,
  resolveWorkflowStepFromModule,
  isShowcaseScreenshotAvailable,
  WORKFLOW_SCENE_ASSET_RESOLUTION,
  PRIMARY_SHOWCASE_SCREENSHOT_KEYS,
  FITCORE_SHOWCASE_ASSETS,
  FITCORE_SHOWCASE_ASSET_KEYS,
  getShowcaseAsset,
  moduleToAssetKey,
} from "@/lib/marketing/workflow-scene-asset-resolver"

export type {
  ResolvedWorkflowSceneAsset,
  WorkflowSceneStepId,
  PrimaryShowcaseScreenshotKey,
  FitCoreShowcaseAssetKey as ResolverAssetKey,
} from "@/lib/marketing/workflow-scene-asset-resolver"

export { APP_SHOWCASE_BASE_PATH as SHOWCASE_BASE_PATH }

export type { FitCoreShowcaseAssetKey }

export type FitCoreShowcaseAsset = {
  asset_key: FitCoreShowcaseAssetKey
  asset_url: string
}

function getWorkflowModuleAssetKeys(): Array<FitCoreShowcaseAssetKey | null> {
  return SHOWCASE_WORKFLOW_BEATS.map((beat) => moduleToAssetKey(beat.module))
}

export function getShowcaseAssetForModule(
  module: PlatformModule | string,
): FitCoreShowcaseAsset {
  const resolved = resolveShowcaseAssetForModule(module)
  if (resolved) {
    return {
      asset_key: resolved.asset_key,
      asset_url: resolved.asset_url,
    }
  }

  const assetKey = moduleToAssetKey(module) ?? "dashboard"
  return getShowcaseAsset(assetKey)
}

export function resolveShowcaseAssetForScene(
  scene: VideoScriptScene,
  _index = 0,
): FitCoreShowcaseAsset | null {
  const module = resolveSceneModule({
    module: scene.module,
    text: scene.text ?? scene.overlay_text,
    visual: scene.visual,
    narration: scene.narration,
  })

  const moduleLabel =
    module === "marketing"
      ? "marketing ai"
      : module === "ai_coach"
        ? "video generator"
        : module

  if (scene.module?.trim() || module) {
    const resolved = resolveShowcaseAssetForModule(moduleLabel)
    if (resolved) {
      return {
        asset_key: resolved.asset_key,
        asset_url: resolved.asset_url,
      }
    }

    const fromModule = moduleToAssetKey(moduleLabel)
    if (fromModule) {
      return getShowcaseAsset(fromModule)
    }
  }

  const defaultUrl = MODULE_DEFAULT_ASSET[module]
  if (defaultUrl) {
    const key = defaultUrl.split("/").pop()?.replace(".png", "") ?? "dashboard"
    if (FITCORE_SHOWCASE_ASSET_KEYS.includes(key as FitCoreShowcaseAssetKey)) {
      return getShowcaseAsset(key as FitCoreShowcaseAssetKey)
    }
    return {
      asset_key: key as FitCoreShowcaseAssetKey,
      asset_url: defaultUrl,
    }
  }

  return null
}

export function attachShowcaseAssetToScene(
  scene: VideoScriptScene,
  index = 0,
): VideoScriptScene {
  const asset = resolveShowcaseAssetForScene(scene, index)
  if (!asset) return scene

  return {
    ...scene,
    asset_key: asset.asset_key,
    asset_url: asset.asset_url,
  }
}

export function mapShowcaseAssetsToScenes(
  scenes: VideoScriptScene[],
  style?: string | null,
): VideoScriptScene[] {
  if (!isWorkflowDirectorStyle(style) && !isAppShowcaseStyle(style)) {
    return scenes
  }

  return scenes.map((scene, index) => attachShowcaseAssetToScene(scene, index))
}

export function getVideoSceneAssetFields(scene: VideoScriptScene): {
  asset_key?: string
  asset_url?: string
  image_url?: string
  ui_focus_area?: string
  cursor_action?: string
  overlay_text?: string
  narration?: string
  professional_purpose?: string
} {
  const asset_key = scene.asset_key?.trim() || null
  const asset_url = scene.asset_url?.trim() || null
  const ui_focus_area = scene.ui_focus_area?.trim() || null
  const cursor_action = scene.cursor_action?.trim() || null
  const overlay_text = scene.overlay_text?.trim() || null
  const narration = scene.narration?.trim() || null
  const professional_purpose = scene.professional_purpose?.trim() || null

  return {
    ...(asset_key ? { asset_key } : {}),
    ...(asset_url ? { asset_url } : {}),
    ...(ui_focus_area ? { ui_focus_area } : {}),
    ...(cursor_action ? { cursor_action } : {}),
    ...(overlay_text ? { overlay_text } : {}),
    ...(narration ? { narration } : {}),
    ...(professional_purpose ? { professional_purpose } : {}),
  }
}

export { APP_SHOWCASE_STYLE, isAppShowcaseStyle }
