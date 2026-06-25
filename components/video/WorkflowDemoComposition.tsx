"use client";

import type { CSSProperties } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  deriveSceneVisualLayer,
  getLayoutBackgroundGradient,
  type SceneLayoutStyle,
} from "@/lib/marketing/scene-visual-layer";
import type { SubtitleTrack } from "@/lib/subtitles/types";
import TikTokCaptions from "@/components/video/TikTokCaptions";
import {
  REELS_APP_FRAME_STYLE,
  REELS_APP_VISUAL_INSET,
  REELS_FULL_BLEED_COVER,
  REELS_MAX_TEXT_Y,
  REELS_MIN_TEXT_Y,
  REELS_SAFE_BOTTOM,
  REELS_SAFE_TOP,
  REELS_SIDE_PADDING,
} from "@/lib/video/reels-safe-layout";

type WorkflowDemoScene = {
  duration?: number;
  animation_duration?: number;
  animation_type?: string;
  caption_position?: string;
  highlight_style?: string;
  asset_url?: string;
  image_url?: string;
  imageUrl?: string;
  overlay_text?: string;
  narration?: string;
  text?: string;
  ui_focus_area?: string;
  crop_focus?: string;
  highlight_area?: string;
  blur_background?: boolean;
  zoom_level?: number;
  layout_style?: SceneLayoutStyle | string;
  asset_key?: string;
  workflow_step?: string;
  module?: string;
  camera_motion?: string;
};

export type WorkflowDemoCompositionProps = {
  scenes: WorkflowDemoScene[];
  hook: string;
  cta: string;
  voiceoverUrl?: string;
  subtitles?: SubtitleTrack;
};

function resolveImageSrc(imageUrl: string) {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  const publicPath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
  return staticFile(publicPath);
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function durationSeconds(scene: WorkflowDemoScene): number {
  const fromAnimation = scene.animation_duration;
  const fromScene = scene.duration;
  return clampNumber(fromAnimation ?? fromScene, 3, 1, 30);
}

function BrowserChrome({ url }: { url: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        background: "linear-gradient(180deg, #2a2a35 0%, #1e1e28 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ display: "flex", gap: 6 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
          <div
            key={color}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: color,
            }}
          />
        ))}
      </div>
      <div
        style={{
          flex: 1,
          marginLeft: 8,
          padding: "5px 12px",
          borderRadius: 8,
          background: "rgba(0,0,0,0.35)",
          fontSize: 12,
          color: "rgba(255,255,255,0.55)",
          fontFamily: "system-ui, sans-serif",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {url}
      </div>
    </div>
  );
}

function HighlightOverlay({
  highlight,
  frame,
  style,
}: {
  highlight: ReturnType<typeof deriveSceneVisualLayer>["highlight"];
  frame: number;
  style: string;
}) {
  const pulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.94, 1.06]);

  const baseBox: CSSProperties = {
    position: "absolute",
    left: `${highlight.x * 100}%`,
    top: `${highlight.y * 100}%`,
    width: `${highlight.width * 100}%`,
    height: `${highlight.height * 100}%`,
    borderRadius: 12,
    pointerEvents: "none",
  };

  if (style === "spotlight") {
    return (
      <>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(2,6,23,0.55)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            ...baseBox,
            boxShadow:
              "0 0 0 9999px rgba(2,6,23,0.55), 0 0 0 4px rgba(34, 211, 238, 0.25), 0 0 42px rgba(34,211,238,0.55)",
            border: "2px solid rgba(34, 211, 238, 0.85)",
            transform: `scale(${pulse})`,
            transformOrigin: "center center",
          }}
        />
      </>
    );
  }

  if (style === "border") {
    return (
      <div
        style={{
          ...baseBox,
          border: "3px solid rgba(148, 163, 184, 0.9)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
        }}
      />
    );
  }

  if (style === "glow") {
    return (
      <div
        style={{
          ...baseBox,
          border: "2.5px solid rgba(34, 211, 238, 0.9)",
          boxShadow:
            "0 0 0 5px rgba(34, 211, 238, 0.16), 0 0 34px rgba(34, 211, 238, 0.55)",
        }}
      />
    );
  }

  // pulse (default)
  return (
    <div
      style={{
        ...baseBox,
        border: "2.5px solid rgba(34, 211, 238, 0.9)",
        boxShadow:
          "0 0 0 5px rgba(34, 211, 238, 0.16), 0 0 34px rgba(34, 211, 238, 0.55)",
        transform: `scale(${pulse})`,
        transformOrigin: "center center",
      }}
    />
  );
}

function computeAnimatedTransform(input: {
  animationType: string;
  progress: number; // 0..1
  highlight: ReturnType<typeof deriveSceneVisualLayer>["highlight"];
}): { transform: string; transformOrigin?: string } {
  const { animationType, progress, highlight } = input;

  const ease = (t: number) => t * (2 - t);
  const t = ease(progress);

  switch (animationType) {
    case "pan_left": {
      const x = interpolate(t, [0, 1], [18, -18]);
      const s = interpolate(t, [0, 1], [1.04, 1.08]);
      return { transform: `translateX(${x}px) scale(${s})`, transformOrigin: "50% 50%" };
    }
    case "pan_right": {
      const x = interpolate(t, [0, 1], [-18, 18]);
      const s = interpolate(t, [0, 1], [1.04, 1.08]);
      return { transform: `translateX(${x}px) scale(${s})`, transformOrigin: "50% 50%" };
    }
    case "slide_up": {
      const y = interpolate(t, [0, 1], [42, 0]);
      const s = interpolate(t, [0, 1], [1.02, 1.06]);
      return { transform: `translateY(${y}px) scale(${s})`, transformOrigin: "50% 60%" };
    }
    case "dashboard_focus": {
      // Move and zoom towards the highlight box center.
      const cx = highlight.x + highlight.width / 2;
      const cy = highlight.y + highlight.height / 2;
      const tx = interpolate(t, [0, 1], [0, (0.5 - cx) * 160]);
      const ty = interpolate(t, [0, 1], [0, (0.5 - cy) * 220]);
      const s = interpolate(t, [0, 1], [1.04, 1.18]);
      return { transform: `translate(${tx}px, ${ty}px) scale(${s})`, transformOrigin: "50% 50%" };
    }
    case "zoom_highlight": {
      const s = interpolate(t, [0, 1], [1.04, 1.16]);
      return { transform: `scale(${s})`, transformOrigin: "50% 45%" };
    }
    case "split_reveal": {
      const s = interpolate(t, [0, 1], [1.02, 1.06]);
      return { transform: `scale(${s})`, transformOrigin: "50% 50%" };
    }
    case "slow_zoom":
    default: {
      const s = interpolate(t, [0, 1], [1.03, 1.10]);
      return { transform: `scale(${s})`, transformOrigin: "50% 50%" };
    }
  }
}

function AnimatedHeadline({
  text,
  localFrame,
  fps,
}: {
  text: string;
  localFrame: number;
  fps: number;
}) {
  const inFrames = Math.round(fps * 0.4);
  const opacity = interpolate(localFrame, [0, inFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(localFrame, [0, inFrames], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        transform: `translateY(${y}px)`,
        opacity,
        padding: "14px 18px",
        borderRadius: 18,
        background: "rgba(2, 6, 23, 0.72)",
        border: "1px solid rgba(148, 163, 184, 0.22)",
        boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
        maxWidth: "86%",
      }}
    >
      <div
        style={{
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          fontSize: 54,
          fontWeight: 900,
          letterSpacing: -1.2,
          lineHeight: 1.02,
          color: "white",
          textShadow: "0 2px 26px rgba(0,0,0,0.45)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function CaptionPill({
  text,
  localFrame,
  fps,
}: {
  text: string;
  localFrame: number;
  fps: number;
}) {
  const inFrames = Math.round(fps * 0.35);
  const opacity = interpolate(localFrame, [0, inFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        padding: "12px 14px",
        borderRadius: 14,
        background: "rgba(15, 23, 42, 0.82)",
        border: "1px solid rgba(34, 211, 238, 0.22)",
        boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
        maxWidth: "88%",
      }}
    >
      <div
        style={{
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: -0.2,
          lineHeight: 1.2,
          color: "rgba(236, 254, 255, 0.92)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function SceneFrame({
  scene,
  index,
  startFrame,
  durationInFrames,
  totalFrames,
}: {
  scene: WorkflowDemoScene;
  index: number;
  startFrame: number;
  durationInFrames: number;
  totalFrames: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  const fadeFrames = Math.min(Math.round(fps * 0.35), Math.floor(durationInFrames / 3));
  const fadeIn = interpolate(localFrame, [0, fadeFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(localFrame, [durationInFrames - fadeFrames, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = fadeIn * fadeOut;

  const imageUrl =
    scene.image_url?.trim() ||
    scene.imageUrl?.trim() ||
    scene.asset_url?.trim() ||
    "";

  const headline = (scene.overlay_text ?? scene.text ?? "").trim();
  const caption = (scene.narration ?? "").trim();

  const visualLayer = deriveSceneVisualLayer(
    {
      crop_focus: scene.crop_focus,
      highlight_area: scene.highlight_area,
      ui_focus_area: scene.ui_focus_area,
      asset_key: scene.asset_key,
      workflow_step: scene.workflow_step,
      module: scene.module,
      zoom_level: scene.zoom_level,
      layout_style: scene.layout_style,
      blur_background: scene.blur_background,
      camera_motion: scene.camera_motion,
    },
    index,
  );

  const animationType = (scene.animation_type ?? "slow_zoom").trim() || "slow_zoom";
  const highlightStyle = (scene.highlight_style ?? "pulse").trim() || "pulse";
  const captionPosition = (scene.caption_position ?? "bottom").trim() || "bottom";

  const progress = durationInFrames <= 1 ? 1 : localFrame / (durationInFrames - 1);
  const transform = computeAnimatedTransform({
    animationType,
    progress,
    highlight: visualLayer.highlight,
  });

  const chromeUrl = scene.asset_key ? `fitcore.app/${scene.asset_key}` : "fitcore.app";
  const background = getLayoutBackgroundGradient(visualLayer.layout_style);

  const captionY =
    captionPosition === "top"
      ? REELS_MIN_TEXT_Y + 70
      : captionPosition === "middle"
        ? 900
        : REELS_MAX_TEXT_Y - 140;

  const headlineY =
    captionPosition === "top" ? 820 : REELS_MIN_TEXT_Y + 20;

  const splitMaskWidth = interpolate(localFrame, [0, Math.round(fps * 0.9)], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ background }} />

      <div
        style={{
          ...REELS_APP_FRAME_STYLE,
          flexDirection: "column",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.28)",
        }}
      >
        <BrowserChrome url={chromeUrl} />

        <div style={{ position: "relative", flex: 1, width: "100%", minHeight: 0, overflow: "hidden" }}>
          {imageUrl ? (
            <div style={{ position: "absolute", inset: 0, transform: transform.transform, transformOrigin: transform.transformOrigin }}>
              <Img
                src={resolveImageSrc(imageUrl)}
                style={{
                  ...REELS_FULL_BLEED_COVER,
                  filter: visualLayer.blur_background ? "saturate(1.02) contrast(1.03)" : "none",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(226,232,240,0.8)",
                fontFamily: "system-ui, sans-serif",
                fontSize: 18,
                padding: 28,
                textAlign: "center",
              }}
            >
              No screenshot available for this scene.
            </div>
          )}

          {animationType === "split_reveal" ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: "rgba(2,6,23,0.18)",
                clipPath: `inset(0 ${100 - splitMaskWidth}% 0 0 round 0px)`,
              }}
            />
          ) : null}

          <HighlightOverlay
            highlight={visualLayer.highlight}
            frame={localFrame}
            style={highlightStyle}
          />
        </div>
      </div>

      {headline ? (
        <div
          style={{
            position: "absolute",
            top: headlineY,
            left: REELS_APP_VISUAL_INSET,
            right: REELS_APP_VISUAL_INSET,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <AnimatedHeadline text={headline} localFrame={localFrame} fps={fps} />
        </div>
      ) : null}

      {caption ? (
        <div
          style={{
            position: "absolute",
            top: captionY,
            left: REELS_SIDE_PADDING,
            right: REELS_SIDE_PADDING,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CaptionPill text={caption} localFrame={localFrame} fps={fps} />
        </div>
      ) : null}

      {/* Hook / CTA framing (subtle, keeps it professional) */}
      {index === 0 ? (
        <div
          style={{
            position: "absolute",
            left: 70,
            right: 70,
            bottom: 86,
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            fontSize: 18,
            fontWeight: 600,
            color: "rgba(226,232,240,0.75)",
            letterSpacing: 0.2,
          }}
        >
          {totalFrames > 0 ? "" : ""}
        </div>
      ) : null}
    </AbsoluteFill>
  );
}

export default function WorkflowDemoComposition({
  scenes,
  hook,
  cta,
  voiceoverUrl,
  subtitles,
}: WorkflowDemoCompositionProps) {
  const { fps } = useVideoConfig();
  const overlapFrames = Math.round(fps * 0.35);

  const durations = scenes.map((scene) => Math.max(1, Math.round(durationSeconds(scene) * fps)));
  const starts: number[] = [];
  let cursor = 0;
  for (let i = 0; i < durations.length; i += 1) {
    starts.push(cursor);
    cursor += durations[i] - (i === durations.length - 1 ? 0 : overlapFrames);
  }

  const totalFrames = cursor + (durations[durations.length - 1] ?? 0);

  return (
    <AbsoluteFill style={{ backgroundColor: "#020617" }}>
      {voiceoverUrl ? <Audio src={voiceoverUrl} /> : null}

      {/* Intro hook card (quick) */}
      <Sequence from={0} durationInFrames={Math.min(Math.round(fps * 1.2), 45)}>
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(1200px 900px at 50% 30%, rgba(34,211,238,0.18), rgba(2,6,23,1) 60%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: REELS_SAFE_TOP,
            paddingBottom: REELS_SAFE_BOTTOM,
            paddingLeft: REELS_SIDE_PADDING,
            paddingRight: REELS_SIDE_PADDING,
          }}
        >
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <AnimatedHeadline text={hook} localFrame={useCurrentFrame()} fps={fps} />
          </div>
        </AbsoluteFill>
      </Sequence>

      {scenes.map((scene, index) => {
        const from = starts[index] + Math.round(fps * 1.2); // shift scenes after intro
        const durationInFrames = durations[index];
        return (
          <Sequence key={`${index}-${scene.workflow_step ?? scene.asset_key ?? "scene"}`} from={from} durationInFrames={durationInFrames}>
            <SceneFrame
              scene={scene}
              index={index}
              startFrame={from}
              durationInFrames={durationInFrames}
              totalFrames={totalFrames}
            />
          </Sequence>
        );
      })}

      {/* Outro CTA (quick) */}
      <Sequence from={Math.max(0, Math.round(fps * 1.2) + cursor)} durationInFrames={Math.round(fps * 1.3)}>
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(1200px 900px at 50% 30%, rgba(99,102,241,0.18), rgba(2,6,23,1) 60%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: REELS_SAFE_TOP,
            paddingBottom: REELS_SAFE_BOTTOM,
            paddingLeft: REELS_SIDE_PADDING,
            paddingRight: REELS_SIDE_PADDING,
          }}
        >
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <AnimatedHeadline text={cta} localFrame={useCurrentFrame()} fps={fps} />
          </div>
        </AbsoluteFill>
      </Sequence>
      {subtitles?.phrases.length ? (
        <TikTokCaptions track={subtitles} position="center" />
      ) : null}
    </AbsoluteFill>
  );
}

