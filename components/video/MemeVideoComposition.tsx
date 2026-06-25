"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import ShowcaseSceneLayer from "@/components/video/ShowcaseSceneLayer";
import TikTokCaptions from "@/components/video/TikTokCaptions";
import {
  MASCOT_THEME_COLORS,
  FITCORE_COACH_MASCOT,
} from "@/lib/marketing/brand-mascot";
import type { SceneLayoutStyle } from "@/lib/marketing/scene-visual-layer";
import {
  normalizeVideoStyle,
  type VideoStyle,
} from "@/lib/marketing/video-styles";
import type { SubtitleTrack } from "@/lib/subtitles/types";
import {
  buildDefaultFallbackScenes,
  computeVideoDurationSeconds,
  logRenderCompositionDebug,
  normalizeSceneItem,
  parseScriptInput,
  resolveRenderScript,
  type RenderScene,
} from "@/lib/video/parse-render-script";
import {
  REELS_FULL_BLEED_COVER,
  REELS_MIN_TEXT_Y,
  REELS_SAFE_BOTTOM,
  REELS_SAFE_TOP,
  REELS_SIDE_PADDING,
  REELS_TEXT_BOTTOM_INSET,
} from "@/lib/video/reels-safe-layout";

type Scene = RenderScene;

type Props = {
  hook: string;
  scenes: Scene[];
  cta: string;
  title?: string;
  style?: string;
  voiceoverUrl?: string;
  subtitles?: SubtitleTrack;
  usedFallback?: boolean;
  script?: unknown;
};

type SceneTheme = {
  background: string;
  color: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  textTransform: "none" | "uppercase";
  border?: string;
  borderRadius?: number;
  padding?: number;
  boxShadow?: string;
  showMascotBadge?: boolean;
};

const ROOT_BACKGROUND =
  "linear-gradient(165deg, #0f172a 0%, #1e3a5f 42%, #312e81 100%)";

const HOOK_SECONDS = 2;
const CTA_SECONDS = 2;

function getSceneTheme(style: VideoStyle, sceneIndex: number): SceneTheme {
  switch (style) {
    case "meme_kinetic":
      return {
        background: "linear-gradient(135deg, #ff006e, #8338ec)",
        color: "#ffffff",
        fontSize: 64,
        fontWeight: 900,
        letterSpacing: -1,
        textTransform: "none",
      };
    case "problem_solution":
      return sceneIndex % 2 === 0
        ? {
            background: "linear-gradient(180deg, #2b0505, #5c1010)",
            color: "#ffb4b4",
            fontSize: 54,
            fontWeight: 900,
            letterSpacing: -1,
            textTransform: "none",
          }
        : {
            background: "linear-gradient(180deg, #052b14, #0f5c2d)",
            color: "#b4ffcf",
            fontSize: 54,
            fontWeight: 900,
            letterSpacing: -1,
            textTransform: "none",
          };
    case "premium_ad":
      return {
        background: "linear-gradient(180deg, #1a1208, #3d2e14)",
        color: "#f5d76e",
        fontSize: 52,
        fontWeight: 700,
        letterSpacing: 0,
        textTransform: "none",
      };
    case "saas_demo":
      return {
        background: "linear-gradient(180deg, #e2e8f0, #93c5fd)",
        color: "#0f172a",
        fontSize: 48,
        fontWeight: 700,
        letterSpacing: -1,
        textTransform: "none",
        border: "2px solid #64748b",
        borderRadius: 24,
        padding: 64,
      };
    case "app_showcase":
      return {
        background: "linear-gradient(180deg, #6366f1, #312e81)",
        color: "#ffffff",
        fontSize: 44,
        fontWeight: 700,
        letterSpacing: -1,
        textTransform: "none",
        border: "8px solid rgba(255,255,255,0.18)",
        borderRadius: 40,
        padding: 72,
      };
    case "mascot_story":
      return {
        background: `linear-gradient(180deg, ${MASCOT_THEME_COLORS.black}, #0a1628)`,
        color: MASCOT_THEME_COLORS.white,
        fontSize: 50,
        fontWeight: 800,
        letterSpacing: -1,
        textTransform: "none",
        border: `2px solid ${MASCOT_THEME_COLORS.neonBlue}`,
        borderRadius: 28,
        padding: 64,
        boxShadow: `0 0 32px ${MASCOT_THEME_COLORS.neonBlueGlow}`,
        showMascotBadge: true,
      };
    case "viral_caption":
    default:
      return {
        background: "linear-gradient(180deg, #1e293b, #4338ca)",
        color: "#ffffff",
        fontSize: 58,
        fontWeight: 900,
        letterSpacing: -2,
        textTransform: "uppercase",
      };
  }
}

function resolveImageSrc(imageUrl: string) {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  const publicPath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
  return staticFile(publicPath);
}

function resolveSceneImage(scene: Scene): string | undefined {
  return scene.imageUrl?.trim() || scene.asset_url?.trim() || undefined;
}

function usesPremiumVisualLayer(
  style: VideoStyle,
  scene: Scene,
  usedFallback: boolean,
): boolean {
  if (usedFallback) return false;
  if (!resolveSceneImage(scene)) return false;

  return (
    style === "app_showcase" ||
    style === "saas_demo" ||
    Boolean(scene.asset_key) ||
    Boolean(scene.layout_style || scene.crop_focus || scene.highlight_area)
  );
}

function TextScene({
  text,
  theme,
  imageUrl,
  title,
  isCta,
}: {
  text: string;
  theme: SceneTheme;
  imageUrl?: string;
  title?: string;
  isCta?: boolean;
}) {
  const frame = useCurrentFrame();
  const displayText = text.trim() || title || "FitCore AI";

  const scale = interpolate(frame, [0, 12], [0.85, 1], {
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: theme.background,
        color: theme.color,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: REELS_SAFE_TOP,
        paddingBottom: REELS_SAFE_BOTTOM,
        paddingLeft: REELS_SIDE_PADDING,
        paddingRight: REELS_SIDE_PADDING,
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {imageUrl ? (
        <>
          <Img
            src={resolveImageSrc(imageUrl)}
            style={REELS_FULL_BLEED_COVER}
          />
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.72) 0%, rgba(15,23,42,0.45) 45%, rgba(15,23,42,0.82) 100%)",
            }}
          />
        </>
      ) : null}

      {title ? (
        <div
          style={{
            position: "absolute",
            top: REELS_MIN_TEXT_Y,
            left: REELS_SIDE_PADDING,
            right: REELS_SIDE_PADDING,
            textAlign: "center",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
            textShadow: "0 2px 12px rgba(0,0,0,0.45)",
          }}
        >
          {title}
        </div>
      ) : null}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          transform: `scale(${scale})`,
          opacity,
          fontSize: isCta ? Math.round(theme.fontSize * 0.92) : theme.fontSize,
          fontWeight: theme.fontWeight,
          lineHeight: 1.08,
          letterSpacing: theme.letterSpacing,
          textTransform: theme.textTransform,
          border: theme.border,
          borderRadius: theme.borderRadius,
          padding: theme.border ? 32 : 0,
          width: theme.border ? "82%" : "88%",
          boxShadow: theme.boxShadow,
          textShadow: "0 4px 24px rgba(0,0,0,0.55)",
        }}
      >
        {theme.showMascotBadge ? (
          <div
            style={{
              marginBottom: 24,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: MASCOT_THEME_COLORS.neonBlue,
            }}
          >
            {FITCORE_COACH_MASCOT.name}
          </div>
        ) : null}
        {isCta ? (
          <div
            style={{
              marginBottom: 16,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: 0.9,
            }}
          >
            Call to action
          </div>
        ) : null}
        {displayText}
      </div>
    </AbsoluteFill>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <div
      style={{
        position: "absolute",
        left: REELS_SIDE_PADDING,
        right: REELS_SIDE_PADDING,
        bottom: REELS_TEXT_BOTTOM_INSET + 24,
        height: 10,
        borderRadius: 999,
        background: "rgba(255,255,255,0.18)",
        overflow: "hidden",
        zIndex: 20,
      }}
    >
      <div
        style={{
          width: `${clamped * 100}%`,
          height: "100%",
          borderRadius: 999,
          background: "linear-gradient(90deg, #38bdf8, #a78bfa)",
        }}
      />
    </div>
  );
}

type TimelineEntry = {
  from: number;
  durationFrames: number;
  sceneIndex: number;
  text: string;
  isCta: boolean;
  scene: Scene;
};

export default function MemeVideoComposition({
  hook,
  scenes: rawScenes,
  cta,
  title: rawTitle,
  style,
  voiceoverUrl,
  subtitles,
  usedFallback: usedFallbackProp,
  script,
}: Props) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const videoStyle = normalizeVideoStyle(style);
  const lastLoggedScene = useRef(-1);

  const resolved = useMemo(() => {
    const parsedScript = parseScriptInput(script);

    if (rawScenes?.length) {
      const normalizedScenes = rawScenes
        .map((scene) => normalizeSceneItem(scene))
        .filter((scene): scene is Scene => scene != null);

      const scenes =
        normalizedScenes.length > 0
          ? normalizedScenes
          : buildDefaultFallbackScenes({
              title: rawTitle,
              prompt: undefined,
            });

      return {
        hook: hook?.trim() || scenes[0]?.text || rawTitle || "FitCore AI",
        cta:
          cta?.trim() ||
          scenes[scenes.length - 1]?.text ||
          "Create. Plan. Publish. Grow.",
        title: rawTitle?.trim() || "FitCore AI",
        scenes,
        usedFallback:
          usedFallbackProp ?? normalizedScenes.length === 0,
        parsedScript,
        style: style ?? undefined,
      };
    }

    return resolveRenderScript({
      script,
      title: rawTitle,
      hook,
      cta,
      style,
      dbScenes: [],
    });
  }, [script, rawTitle, hook, cta, style, rawScenes, usedFallbackProp]);

  const usedFallback = usedFallbackProp ?? resolved.usedFallback;
  const title = rawTitle?.trim() || resolved.title || "FitCore AI";
  const resolvedHook = resolved.hook || hook || title;
  const resolvedCta = resolved.cta || cta || "Create. Plan. Publish. Grow.";
  const bodyScenes = resolved.scenes;

  const durationSeconds = computeVideoDurationSeconds(
    resolvedHook,
    bodyScenes,
    resolvedCta,
    HOOK_SECONDS,
    CTA_SECONDS,
  );

  const compositionProps = useMemo(
    () => ({
      title,
      hook: resolvedHook,
      cta: resolvedCta,
      style: videoStyle,
      sceneCount: bodyScenes.length,
      usedFallback,
      voiceoverUrl: voiceoverUrl ?? null,
    }),
    [
      title,
      resolvedHook,
      resolvedCta,
      videoStyle,
      bodyScenes.length,
      usedFallback,
      voiceoverUrl,
    ],
  );

  useEffect(() => {
    logRenderCompositionDebug("MemeVideoComposition", {
      parsedScript: resolved.parsedScript,
      scenes: bodyScenes,
      hook: resolvedHook,
      cta: resolvedCta,
      title,
      durationSeconds,
      compositionProps,
    });
  }, [
    resolved.parsedScript,
    bodyScenes,
    resolvedHook,
    resolvedCta,
    title,
    durationSeconds,
    compositionProps,
  ]);

  const allScenes = useMemo(
    () => [
      { text: resolvedHook, duration: HOOK_SECONDS, isHook: true },
      ...bodyScenes.map((scene) => ({ ...scene, isHook: false })),
      { text: resolvedCta, duration: CTA_SECONDS, isCta: true },
    ],
    [resolvedHook, bodyScenes, resolvedCta],
  );

  const timeline = useMemo(() => {
    const entries: TimelineEntry[] = [];
    let startFrame = 0;

    allScenes.forEach((scene, index) => {
      const durationFrames = Math.max(1, Math.round(scene.duration * fps));
      entries.push({
        from: startFrame,
        durationFrames,
        sceneIndex: index,
        text: scene.text,
        isCta: "isCta" in scene && Boolean(scene.isCta),
        scene,
      });
      startFrame += durationFrames;
    });

    return entries;
  }, [allScenes, fps]);

  const activeEntry =
    timeline.find(
      (entry) =>
        frame >= entry.from && frame < entry.from + entry.durationFrames,
    ) ?? timeline[timeline.length - 1];

  useEffect(() => {
    if (!activeEntry) return;
    if (lastLoggedScene.current === activeEntry.sceneIndex) return;

    lastLoggedScene.current = activeEntry.sceneIndex;
    logRenderCompositionDebug("MemeVideoComposition", {
      parsedScript: resolved.parsedScript,
      scenes: bodyScenes,
      hook: resolvedHook,
      cta: resolvedCta,
      title,
      durationSeconds,
      compositionProps,
      frame,
      sceneIndex: activeEntry.sceneIndex,
    });
  }, [
    activeEntry,
    bodyScenes,
    compositionProps,
    durationSeconds,
    frame,
    resolved.parsedScript,
    resolvedCta,
    resolvedHook,
    title,
  ]);

  const progress = durationInFrames > 0 ? frame / durationInFrames : 0;

  return (
    <AbsoluteFill style={{ background: ROOT_BACKGROUND }}>
      {voiceoverUrl ? <Audio src={voiceoverUrl} /> : null}

      {timeline.map((entry) => {
        const sceneIndex = Math.max(0, entry.sceneIndex - 1);
        const premiumLayer =
          !entry.isCta &&
          entry.sceneIndex > 0 &&
          usesPremiumVisualLayer(videoStyle, entry.scene, usedFallback);

        return (
          <Sequence
            key={`scene-${entry.sceneIndex}`}
            from={entry.from}
            durationInFrames={entry.durationFrames}
          >
            {premiumLayer ? (
              <ShowcaseSceneLayer
                imageUrl={resolveSceneImage(entry.scene)!}
                headline={entry.scene.overlay_text?.trim() || entry.text}
                asset_key={entry.scene.asset_key}
                crop_focus={entry.scene.crop_focus}
                highlight_area={entry.scene.highlight_area}
                blur_background={entry.scene.blur_background}
                zoom_level={entry.scene.zoom_level}
                layout_style={entry.scene.layout_style as SceneLayoutStyle | string}
                ui_focus_area={entry.scene.ui_focus_area}
                camera_motion={entry.scene.camera_motion}
                workflow_step={entry.scene.workflow_step}
                module={entry.scene.module}
                durationFrames={entry.durationFrames}
                sceneIndex={sceneIndex}
              />
            ) : (
              <TextScene
                text={entry.text}
                theme={getSceneTheme(videoStyle, entry.sceneIndex)}
                imageUrl={
                  usedFallback ? undefined : resolveSceneImage(entry.scene)
                }
                title={title}
                isCta={entry.isCta}
              />
            )}
          </Sequence>
        );
      })}

      <ProgressBar progress={progress} />

      {subtitles?.phrases.length ? (
        <TikTokCaptions track={subtitles} position="center" />
      ) : null}
    </AbsoluteFill>
  );
}
