import fs from "fs"
import path from "path"
import {
  WORKFLOW_SCENE_ASSET_RESOLUTION,
  type FitCoreShowcaseAssetKey,
  type ResolvedWorkflowSceneAsset,
  type WorkflowSceneStepId,
} from "@/lib/marketing/workflow-scene-asset-resolver"

const APP_SHOWCASE_DIR = path.join(process.cwd(), "public", "app-showcase")

export function getShowcaseScreenshotPath(
  assetKey: FitCoreShowcaseAssetKey,
): string {
  return path.join(APP_SHOWCASE_DIR, `${assetKey}.png`)
}

export function isShowcaseScreenshotAvailableOnDisk(
  assetKey: FitCoreShowcaseAssetKey,
): boolean {
  try {
    return fs.existsSync(getShowcaseScreenshotPath(assetKey))
  } catch {
    return false
  }
}

function buildAsset(key: FitCoreShowcaseAssetKey): {
  asset_key: FitCoreShowcaseAssetKey
  asset_url: string
} {
  return {
    asset_key: key,
    asset_url: `/app-showcase/${key}.png`,
  }
}

/** Server-only resolver that picks the first candidate screenshot that exists on disk. */
export function resolveWorkflowSceneAssetOnDisk(
  stepId: WorkflowSceneStepId,
): ResolvedWorkflowSceneAsset {
  const candidates = WORKFLOW_SCENE_ASSET_RESOLUTION[stepId]
  const preferredKey = candidates[0]

  for (const key of candidates) {
    if (isShowcaseScreenshotAvailableOnDisk(key)) {
      const asset = buildAsset(key)
      return {
        stepId,
        asset_key: asset.asset_key,
        asset_url: asset.asset_url,
        preferredKey,
        usedFallback: key !== preferredKey,
        screenshotAvailable: true,
      }
    }
  }

  const asset = buildAsset(preferredKey)
  return {
    stepId,
    asset_key: asset.asset_key,
    asset_url: asset.asset_url,
    preferredKey,
    usedFallback: candidates.length > 1,
    screenshotAvailable: false,
  }
}

export function resolveFirstAvailableScreenshotKey(
  candidates: readonly FitCoreShowcaseAssetKey[],
): FitCoreShowcaseAssetKey {
  for (const key of candidates) {
    if (isShowcaseScreenshotAvailableOnDisk(key)) {
      return key
    }
  }
  return candidates[0]
}
