import {
  buildPlatformShowcaseScenes,
  calcPlatformShowcaseDurationInFrames,
  DEFAULT_PLATFORM_CTA,
  DEFAULT_PLATFORM_HOOK,
  mergeScriptIntoShowcase,
  shouldUsePlatformShowcase,
  showcaseBeatBodySeconds,
} from "@/lib/video/platform-showcase";

export type PremiumReelScene = {
  text: string;
  duration: number;
  module?: string;
  variant?: string;
  visual_description?: string;
  image_url?: string;
  screenshot_url?: string;
  asset_url?: string;
};

export const PREMIUM_REEL_HOOK_SECONDS = 0;
export const PREMIUM_REEL_CTA_SECONDS = 2.5;

export const DEFAULT_COACH_HOOK = DEFAULT_PLATFORM_HOOK;

export const DEFAULT_COACH_CTA = DEFAULT_PLATFORM_CTA;

/** @deprecated Use buildPlatformShowcaseScenes() */
export const COACH_DEFAULT_BODY_SCENES: PremiumReelScene[] =
  buildPlatformShowcaseScenes();

export function resolvePremiumHook(
  explicitHook: string | undefined,
  scenes: PremiumReelScene[],
  brandName: string,
): string {
  const fromProp = explicitHook?.trim();
  if (fromProp) return fromProp;
  const fromFirst = scenes[0]?.text?.trim();
  if (fromFirst) return fromFirst;
  return brandName.trim()
    ? `${brandName.trim()} — built for coaches`
    : DEFAULT_COACH_HOOK;
}

export function resolvePremiumCta(explicitCta: string | undefined): string {
  const trimmed = explicitCta?.trim();
  return trimmed || DEFAULT_COACH_CTA;
}

/** Strip hook/CTA duplicates so intro/outro beats stay dedicated. */
export function dedupeBodyScenes(
  scenes: PremiumReelScene[],
  hook: string,
  cta: string,
): PremiumReelScene[] {
  let body = [...scenes];
  const hookNorm = hook.trim().toLowerCase();
  const ctaNorm = cta.trim().toLowerCase();

  if (body.length > 0 && body[0].text.trim().toLowerCase() === hookNorm) {
    body = body.slice(1);
  }
  if (
    body.length > 0 &&
    body[body.length - 1].text.trim().toLowerCase() === ctaNorm
  ) {
    body = body.slice(0, -1);
  }

  return body.length > 0 ? body : buildPlatformShowcaseScenes();
}

export function resolveShowcaseScenes(
  scenes: PremiumReelScene[] | undefined,
): PremiumReelScene[] {
  const normalized = scenes ?? [];
  if (shouldUsePlatformShowcase(normalized)) {
    return mergeScriptIntoShowcase(normalized);
  }
  return normalized.length > 0 ? normalized : buildPlatformShowcaseScenes();
}

export function calcPremiumReelDurationInFrames(
  bodyScenes: { duration: number }[],
  fps: number,
  includeCta = true,
  useShowcase = true,
): number {
  if (useShowcase && bodyScenes.length >= 6) {
    return calcPlatformShowcaseDurationInFrames(fps);
  }

  const bodySeconds = bodyScenes.reduce(
    (sum, scene) => sum + (scene.duration > 0 ? scene.duration : 3),
    0,
  );
  const totalSeconds =
    PREMIUM_REEL_HOOK_SECONDS +
    (bodySeconds > 0 ? bodySeconds : showcaseBeatBodySeconds()) +
    (includeCta ? PREMIUM_REEL_CTA_SECONDS : 0);

  return Math.max(fps * 5, Math.round(totalSeconds * fps));
}
