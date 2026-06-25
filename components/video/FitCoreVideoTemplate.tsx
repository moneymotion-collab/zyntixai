"use client";

import { useEffect, useMemo } from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import AnimatedSaasAppVisual from "@/components/video/AnimatedSaasAppVisual";
import {
  CoachTrustLine,
  CtaButtonBlock,
  FeatureBadgeRow,
  featureBadgeIndexFromVariant,
  MovingGradientBackground,
  PremiumBrandMark,
  PremiumHeadline,
  SceneTransition,
  VideoProgressBar,
} from "@/components/video/PremiumVideoMotion";
import {
  calcPlatformShowcaseDurationInFrames,
  PLATFORM_SHOWCASE_CTA_SECONDS,
  resolveShowcaseVariant,
} from "@/lib/video/platform-showcase";
import {
  resolvePremiumCta,
  resolveShowcaseScenes,
  type PremiumReelScene,
} from "@/lib/video/premium-reel-ad";
import {
  logSceneModuleDebug,
  resolveModuleAlignedVisual,
  resolveSceneModule,
} from "@/lib/video/resolve-scene-module";
import { sceneVisualDescription } from "@/lib/video/resolve-scene-visual";
import {
  REELS_APP_FRAME_STYLE,
  REELS_CANVAS_STYLE,
  REELS_FPS,
} from "@/lib/video/reels-safe-layout";

export type FitCoreVideoScene = PremiumReelScene;

export type FitCoreVideoTemplateProps = {
  title?: string;
  brandName?: string;
  hook?: string;
  scenes?: FitCoreVideoScene[];
  cta?: string;
};

const DEFAULT_TITLE = "FitCore AI";

function AppMockup({
  scene,
  sceneIndex,
  brandLabel,
}: {
  scene: FitCoreVideoScene;
  sceneIndex: number;
  brandLabel: string;
}) {
  const mapping = useMemo(
    () => resolveModuleAlignedVisual(scene),
    [scene],
  );
  const module = useMemo(() => resolveSceneModule(scene), [scene]);
  const visualDescription = sceneVisualDescription(scene);
  const variant = mapping.variant;

  useEffect(() => {
    logSceneModuleDebug(sceneIndex, scene, mapping);
  }, [sceneIndex, scene, mapping]);

  return (
    <div style={{ ...REELS_APP_FRAME_STYLE, overflow: "visible" }}>
      <div style={{ width: "100%", height: "100%" }}>
        <AnimatedSaasAppVisual
          sceneText={scene.text}
          visualDescription={visualDescription}
          sceneIndex={sceneIndex}
          brandLabel={brandLabel}
          imageUrl={mapping.selectedUrl}
          module={module}
          forceVariant={variant}
          presentation="showcase"
        />
      </div>
    </div>
  );
}

function VisualBeat({
  scene,
  sceneIndex,
  brandLabel,
  headline,
  headlineVariant = "scene",
  durationFrames,
}: {
  scene: FitCoreVideoScene;
  sceneIndex: number;
  brandLabel: string;
  headline: string;
  headlineVariant?: "hook" | "scene" | "cta";
  durationFrames: number;
}) {
  const variant = resolveShowcaseVariant(scene);
  const badgeIndex = featureBadgeIndexFromVariant(variant, sceneIndex);

  return (
    <SceneTransition durationInFrames={durationFrames} moduleIndex={sceneIndex}>
      <FeatureBadgeRow activeIndex={badgeIndex} showAllModules />
      <AppMockup scene={scene} sceneIndex={sceneIndex} brandLabel={brandLabel} />
      <PremiumHeadline
        text={headline}
        variant={headlineVariant}
        delaySeconds={sceneIndex === 0 ? 0.1 : 0.16}
      />
    </SceneTransition>
  );
}

export default function FitCoreVideoTemplate({
  title,
  brandName,
  scenes,
  cta: ctaProp,
}: FitCoreVideoTemplateProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const projectTitle = title?.trim() || brandName?.trim() || DEFAULT_TITLE;
  const brandLabel = brandName?.trim() || projectTitle;
  const ctaText = useMemo(() => resolvePremiumCta(ctaProp), [ctaProp]);

  const showcaseScenes = useMemo(
    () => resolveShowcaseScenes(scenes),
    [scenes],
  );

  const ctaFrames = Math.round(PLATFORM_SHOWCASE_CTA_SECONDS * fps);

  const bodyTimeline = useMemo(() => {
    let cursor = 0;
    return showcaseScenes.map((scene, index) => {
      const durationFrames = Math.max(1, Math.round(scene.duration * fps));
      const entry = {
        index,
        scene,
        text: scene.text,
        from: cursor,
        durationFrames,
      };
      cursor += durationFrames;
      return entry;
    });
  }, [showcaseScenes, fps]);

  const ctaFrom =
    bodyTimeline.length > 0
      ? bodyTimeline[bodyTimeline.length - 1].from +
        bodyTimeline[bodyTimeline.length - 1].durationFrames
      : 0;

  const ctaScene = showcaseScenes.find((s) => s.module === "platform_overview") ??
    showcaseScenes.find((s) => s.module === "dashboard") ??
    showcaseScenes[0];

  const progress = durationInFrames > 0 ? frame / durationInFrames : 0;

  return (
    <AbsoluteFill
      style={{
        ...REELS_CANVAS_STYLE,
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        overflow: "hidden",
      }}
    >
      <MovingGradientBackground />
      <PremiumBrandMark brandName={brandLabel} tagline="Complete fitness platform" />

      {bodyTimeline.map((entry) => (
        <Sequence
          key={`${entry.scene.module ?? "scene"}-${entry.index}`}
          from={entry.from}
          durationInFrames={entry.durationFrames}
        >
          <VisualBeat
            scene={entry.scene}
            sceneIndex={entry.index}
            brandLabel={brandLabel}
            headline={entry.text}
            headlineVariant={entry.index === 0 ? "hook" : "scene"}
            durationFrames={entry.durationFrames}
          />
        </Sequence>
      ))}

      <Sequence from={ctaFrom} durationInFrames={ctaFrames}>
        <SceneTransition durationInFrames={ctaFrames} moduleIndex={bodyTimeline.length}>
          <FeatureBadgeRow activeIndex={0} showAllModules />
          <AppMockup
            scene={{
              ...ctaScene,
              module: "platform_overview",
              text: ctaText,
              visual_description:
                "FitCore AI unified platform — members, workouts, nutrition, marketing and analytics",
            }}
            sceneIndex={bodyTimeline.length}
            brandLabel={brandLabel}
          />
          <PremiumHeadline
            text="Replace every tool. Run your business on FitCore AI."
            variant="cta"
            delaySeconds={0.1}
          />
          <CtaButtonBlock label={ctaText} />
          <CoachTrustLine />
        </SceneTransition>
      </Sequence>

      <VideoProgressBar progress={progress} />
    </AbsoluteFill>
  );
}

export function calcFitCoreVideoTemplateDuration(
  scenes: FitCoreVideoScene[] | undefined,
  _title?: string,
  _cta?: string,
): number {
  const resolved = resolveShowcaseScenes(scenes);
  if (resolved.length >= 6) {
    return calcPlatformShowcaseDurationInFrames(REELS_FPS);
  }
  const bodySeconds = resolved.reduce((sum, s) => sum + (s.duration || 3), 0);
  return Math.round((bodySeconds + PLATFORM_SHOWCASE_CTA_SECONDS) * REELS_FPS);
}
