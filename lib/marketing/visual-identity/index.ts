export {
  FITCORE_BRAND_NAME,
  FITCORE_DEFAULT_LAYOUT_STYLE,
  FITCORE_PRODUCT_NAME,
  FITCORE_VISUAL_CAMERA_DEFAULTS,
  FITCORE_VISUAL_COLORS,
  FITCORE_VISUAL_ENVIRONMENTS,
  FITCORE_VISUAL_IDENTITY,
  getFitCoreBrandSignature,
  getFitCorePaletteLine,
} from "@/lib/marketing/visual-identity/tokens"
export { FITCORE_VISUAL_PILLARS } from "@/lib/marketing/visual-identity/types"
export {
  applyFitCoreBrandVisualIdentity,
  buildFitCoreBrandedScenePrompt,
  buildFitCoreMascotPortraitPrompt,
  buildFitCoreBrandSuffix,
  buildFitCoreThumbnailPrompt,
  buildFitCoreVisualIdentityDirectorBlock,
} from "@/lib/marketing/visual-identity/prompt"
export type {
  FitCoreBrandVisualContext,
  FitCoreVisualColorTokens,
  FitCoreVisualIdentity,
  FitCoreVisualIdentityMode,
  FitCoreVisualPillar,
} from "@/lib/marketing/visual-identity/types"
