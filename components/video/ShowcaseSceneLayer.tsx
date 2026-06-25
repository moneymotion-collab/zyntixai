"use client";

import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { CSSProperties } from "react";
import {
  deriveSceneVisualLayer,
  getLayoutBackgroundGradient,
  type SceneLayoutStyle,
} from "@/lib/marketing/scene-visual-layer";
import {
  REELS_APP_FRAME_STYLE,
  REELS_APP_VISUAL_INSET,
  REELS_APP_VISUAL_TOP,
  REELS_FULL_BLEED_COVER,
  REELS_MIN_TEXT_Y,
} from "@/lib/video/reels-safe-layout";

export type ShowcaseSceneLayerProps = {
  imageUrl: string;
  headline: string;
  durationFrames: number;
  sceneIndex?: number;
  overlay_text?: string;
  asset_key?: string;
  crop_focus?: string;
  highlight_area?: string;
  blur_background?: boolean;
  zoom_level?: number;
  layout_style?: string;
  ui_focus_area?: string;
  camera_motion?: string;
  workflow_step?: string;
  module?: string;
};

function resolveImageSrc(imageUrl: string) {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  const publicPath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
  return staticFile(publicPath);
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

function HighlightRing({
  highlight,
  frame,
}: {
  highlight: ReturnType<typeof deriveSceneVisualLayer>["highlight"];
  frame: number;
}) {
  const pulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.94, 1.04]);
  const labelOpacity = interpolate(frame, [12, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: `${highlight.x * 100}%`,
          top: `${highlight.y * 100}%`,
          width: `${highlight.width * 100}%`,
          height: `${highlight.height * 100}%`,
          borderRadius: 10,
          border: "2.5px solid rgba(34, 211, 238, 0.9)",
          boxShadow:
            "0 0 0 4px rgba(34, 211, 238, 0.15), 0 0 28px rgba(34, 211, 238, 0.45)",
          transform: `scale(${pulse})`,
          transformOrigin: "center center",
          pointerEvents: "none",
        }}
      />
      {highlight.label ? (
        <div
          style={{
            position: "absolute",
            left: `${(highlight.x + highlight.width / 2) * 100}%`,
            top: `${Math.max(0, highlight.y * 100 - 4)}%`,
            transform: "translate(-50%, -100%)",
            opacity: labelOpacity,
            pointerEvents: "none",
            maxWidth: "72%",
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: 6,
              background: "rgba(15, 23, 42, 0.88)",
              border: "1px solid rgba(34, 211, 238, 0.45)",
              fontSize: 11,
              fontWeight: 700,
              color: "#a5f3fc",
              fontFamily: "system-ui, sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}
          >
            {highlight.label}
          </span>
        </div>
      ) : null}
    </>
  );
}

function ScreenshotPane({
  imageUrl,
  layer,
  zoom,
  frame,
}: {
  imageUrl: string;
  layer: ReturnType<typeof deriveSceneVisualLayer>;
  zoom: number;
  frame: number;
}) {
  const objectPosition = `${layer.crop.x * 100}% ${layer.crop.y * 100}%`;
  const transformOrigin = objectPosition;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <Img
        src={resolveImageSrc(imageUrl)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition,
          transform: `scale(${zoom})`,
          transformOrigin,
        }}
      />
      <HighlightRing highlight={layer.highlight} frame={frame} />
    </div>
  );
}

function layoutFrameStyle(layout: SceneLayoutStyle): CSSProperties {
  switch (layout) {
    case "glass_card":
      return {
        width: "100%",
        height: "100%",
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.2)",
        background: "rgba(255,255,255,0.06)",
        boxShadow:
          "0 32px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px)",
        overflow: "hidden",
      };
    case "floating_dashboard":
      return {
        width: "100%",
        height: "100%",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 40px 100px rgba(0,0,0,0.55)",
        transform: "perspective(1200px) rotateX(3deg) rotateY(-2deg)",
        overflow: "hidden",
      };
    case "split_story":
      return {
        width: "100%",
        height: "100%",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
        overflow: "hidden",
      };
    case "dark_commercial":
      return {
        width: "100%",
        height: "100%",
        borderRadius: 20,
        border: "1px solid rgba(99,102,241,0.35)",
        boxShadow:
          "0 36px 96px rgba(0,0,0,0.65), 0 0 0 1px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
        overflow: "hidden",
      };
    case "premium_saas":
    default:
      return {
        width: "100%",
        height: "100%",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow:
          "0 28px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
        overflow: "hidden",
      };
  }
}

export default function ShowcaseSceneLayer({
  imageUrl,
  headline,
  durationFrames,
  sceneIndex = 0,
  asset_key,
  crop_focus,
  highlight_area,
  blur_background,
  zoom_level,
  layout_style,
  ui_focus_area,
  camera_motion,
  workflow_step,
  module,
}: ShowcaseSceneLayerProps) {
  const frame = useCurrentFrame();
  const layer = deriveSceneVisualLayer(
    {
      crop_focus,
      highlight_area,
      blur_background,
      zoom_level,
      layout_style,
      ui_focus_area,
      camera_motion,
      asset_key,
      workflow_step,
      module,
    },
    sceneIndex,
  );

  const background = getLayoutBackgroundGradient(layer.layout_style, sceneIndex);
  const browserUrl = `app.fitcorecoach.com/${asset_key ?? workflow_step ?? "dashboard"}`;
  const isSplitStory = layer.layout_style === "split_story";

  const zoom = interpolate(
    frame,
    [0, durationFrames],
    [1, layer.zoom_level],
    { extrapolateRight: "clamp" },
  );

  const headlineOpacity = interpolate(frame, [6, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headlineY = interpolate(frame, [6, 18], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const frameOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  const frameScale = interpolate(frame, [0, 14], [0.94, 1], {
    extrapolateRight: "clamp",
  });

  const frameY = interpolate(frame, [0, 14], [24, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background,
        overflow: "hidden",
      }}
    >
      {layer.blur_background ? (
        <Img
          src={resolveImageSrc(imageUrl)}
          style={{
            ...REELS_FULL_BLEED_COVER,
            width: "110%",
            height: "110%",
            filter: "blur(28px) brightness(0.45)",
            transform: "scale(1.1)",
          }}
        />
      ) : null}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(99,102,241,0.18) 0%, transparent 70%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "8%",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "rgba(99,102,241,0.12)",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "6%",
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "rgba(34,211,238,0.1)",
          filter: "blur(36px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.35) 100%)",
          pointerEvents: "none",
        }}
      />

      {isSplitStory && headline ? (
        <div
          style={{
            position: "absolute",
            top: REELS_MIN_TEXT_Y,
            left: REELS_APP_VISUAL_INSET,
            right: REELS_APP_VISUAL_INSET,
            opacity: headlineOpacity,
            transform: `translateY(${headlineY}px)`,
            zIndex: 2,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 50,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              color: "#ffffff",
              textAlign: "center",
              textShadow: "0 4px 24px rgba(0,0,0,0.5)",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {headline}
          </p>
        </div>
      ) : null}

      <div
        style={{
          ...REELS_APP_FRAME_STYLE,
          top: isSplitStory ? REELS_APP_VISUAL_TOP + 120 : REELS_APP_FRAME_STYLE.top,
          height: isSplitStory
            ? REELS_APP_FRAME_STYLE.height - 120
            : REELS_APP_FRAME_STYLE.height,
          opacity: frameOpacity,
          transform: `translateY(${frameY}px) scale(${frameScale})`,
        }}
      >
        <div
          style={{
            ...layoutFrameStyle(layer.layout_style),
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
          }}
        >
          <BrowserChrome url={browserUrl} />
          <div style={{ position: "relative", flex: 1, width: "100%", minHeight: 0 }}>
            <ScreenshotPane
              imageUrl={imageUrl}
              layer={layer}
              zoom={zoom}
              frame={frame}
            />
            {!isSplitStory && headline ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  top: "auto",
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.88) 100%)",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  padding: "24px 20px 20px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 34,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: -1,
                    color: "#ffffff",
                    textAlign: "center",
                    textShadow: "0 4px 20px rgba(0,0,0,0.6)",
                    fontFamily: "system-ui, sans-serif",
                    opacity: headlineOpacity,
                    transform: `translateY(${headlineY}px)`,
                  }}
                >
                  {headline}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
