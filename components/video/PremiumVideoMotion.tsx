"use client";

import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  REELS_FEATURE_BADGES_HEIGHT,
  REELS_FEATURE_BADGES_TOP,
  REELS_HEADER_HEIGHT,
  REELS_HEADER_TOP,
  REELS_MAX_TEXT_Y,
  REELS_SAFE_BOTTOM,
  REELS_SCENE_TEXT_SIDE,
  REELS_SCENE_TEXT_TOP,
  REELS_SIDE_PADDING,
  REELS_TEXT_BOTTOM_INSET,
} from "@/lib/video/reels-safe-layout";
import {
  badgeIndexForVariant,
  PLATFORM_MODULE_BADGES,
} from "@/lib/video/platform-showcase";
import type { SaasVisualVariant } from "@/lib/video/resolve-saas-visual-variant";

export const FEATURE_BADGES = PLATFORM_MODULE_BADGES;

function staggerIn(
  frame: number,
  index: number,
  fps: number,
  step = 0.07,
  duration = 0.32,
) {
  const start = Math.round(index * fps * step);
  const end = start + Math.round(fps * duration);
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function MovingGradientBackground() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cycle = fps * 6;
  const t = (frame % cycle) / cycle;
  const angle = 158 + interpolate(Math.sin(frame / 38), [-1, 1], [-10, 10]);
  const driftX = interpolate(Math.sin(frame / 42), [-1, 1], [-6, 6]);
  const driftY = interpolate(Math.cos(frame / 36), [-1, 1], [-5, 5]);
  const blobA = interpolate(t, [0, 0.5, 1], [18, 32, 18]);
  const blobB = interpolate(t, [0, 0.5, 1], [72, 58, 72]);

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#0a0a0f" }}>
      <div
        style={{
          position: "absolute",
          inset: "-20%",
          background: `linear-gradient(${angle}deg, #0a0a0f 0%, #111827 ${blobA}%, #1e1b4b ${blobB}%, #312e81 100%)`,
          transform: `translate(${driftX}%, ${driftY}%) scale(1.08)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "20%",
          width: "70%",
          height: "45%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)",
          transform: `translate(${driftX * 2}%, ${driftY * 2}%)`,
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          right: "10%",
          width: "55%",
          height: "38%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56,189,248,0.16) 0%, transparent 72%)",
          transform: `translate(${-driftX * 1.5}%, ${-driftY * 1.5}%)`,
          filter: "blur(36px)",
        }}
      />
    </AbsoluteFill>
  );
}

export function SceneTransition({
  durationInFrames,
  children,
  moduleIndex = 0,
}: {
  durationInFrames: number;
  children: ReactNode;
  moduleIndex?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const transitionFrames = Math.max(4, Math.min(10, Math.round(fps * 0.22)));
  const slideFromRight = moduleIndex % 2 === 1;

  const fadeIn = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const slideX = interpolate(
    frame,
    [0, transitionFrames],
    [slideFromRight ? 28 : -28, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const slideY = interpolate(frame, [0, transitionFrames], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const flash =
    frame < transitionFrames
      ? interpolate(frame, [0, transitionFrames], [0.55, 0], {
          extrapolateRight: "clamp",
        })
      : 0;

  const exitFrames = Math.max(3, Math.round(fps * 0.12));
  const exitScale =
    durationInFrames > exitFrames + transitionFrames
      ? interpolate(
          frame,
          [durationInFrames - exitFrames, durationInFrames],
          [1, 0.97],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      : 1;

  return (
    <AbsoluteFill
      style={{
        opacity: fadeIn,
        transform: `translate(${slideX}px, ${slideY}px) scale(${exitScale})`,
      }}
    >
      {children}
      {flash > 0 ? (
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            background: `rgba(255,255,255,${flash * 0.12})`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
}

export function FeatureBadgeRow({
  activeIndex,
  compact = true,
  showAllModules = false,
}: {
  activeIndex: number;
  compact?: boolean;
  showAllModules?: boolean;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const safeActive =
    ((activeIndex % FEATURE_BADGES.length) + FEATURE_BADGES.length) %
    FEATURE_BADGES.length;

  return (
    <div
      style={{
        position: "absolute",
        top: REELS_FEATURE_BADGES_TOP,
        left: REELS_SCENE_TEXT_SIDE,
        right: REELS_SCENE_TEXT_SIDE,
        height: REELS_FEATURE_BADGES_HEIGHT,
        display: "flex",
        alignItems: showAllModules ? "flex-start" : "center",
        justifyContent: showAllModules ? "center" : compact ? "flex-start" : "center",
        gap: showAllModules ? 4 : 6,
        overflowX: "hidden",
        flexWrap: showAllModules ? "wrap" : compact ? "nowrap" : "wrap",
        maskImage: showAllModules
          ? undefined
          : "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
      }}
    >
      {FEATURE_BADGES.map((badge, index) => {
        const active = index === safeActive;
        const opacity = staggerIn(frame, index, fps, 0.04, 0.24);
        const y = interpolate(staggerIn(frame, index, fps, 0.04, 0.24), [0, 1], [8, 0]);

        return (
          <div
            key={badge.label}
            style={{
              opacity: active ? 1 : opacity * 0.55,
              transform: `translateY(${y}px) scale(${active ? 1.05 : 1})`,
              padding: showAllModules ? "4px 8px" : compact ? "5px 10px" : "6px 12px",
              borderRadius: 999,
              fontSize: showAllModules ? 9 : compact ? 10 : 11,
              fontWeight: 700,
              letterSpacing: 0.2,
              fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
              whiteSpace: "nowrap",
              flexShrink: 0,
              color: active ? "#fff" : "rgba(255,255,255,0.55)",
              background: active
                ? `linear-gradient(135deg, ${badge.color}cc, ${badge.color}88)`
                : "rgba(255,255,255,0.06)",
              border: active
                ? `1px solid ${badge.color}`
                : "1px solid rgba(255,255,255,0.1)",
              boxShadow: active
                ? `0 6px 20px ${badge.color}44, inset 0 1px 0 rgba(255,255,255,0.2)`
                : "none",
            }}
          >
            {badge.label}
          </div>
        );
      })}
    </div>
  );
}

export function VideoProgressBar({ progress }: { progress: number }) {
  const frame = useCurrentFrame();
  const clamped = Math.min(1, Math.max(0, progress));
  const shimmer = interpolate(Math.sin(frame / 8), [-1, 1], [0.85, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: REELS_SCENE_TEXT_SIDE,
        right: REELS_SCENE_TEXT_SIDE,
        bottom: REELS_SAFE_BOTTOM - 28,
        height: 6,
        borderRadius: 999,
        background: "rgba(255,255,255,0.12)",
        overflow: "hidden",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.25)",
        zIndex: 4,
      }}
    >
      <div
        style={{
          width: `${clamped * 100}%`,
          height: "100%",
          borderRadius: 999,
          background: "linear-gradient(90deg, #38bdf8, #818cf8, #a78bfa)",
          boxShadow: `0 0 12px rgba(129,140,248,${0.35 * shimmer})`,
        }}
      />
    </div>
  );
}

export function featureBadgeIndexFromVariant(
  variant: string,
  sceneIndex: number,
): number {
  return badgeIndexForVariant(variant as SaasVisualVariant);
}

export function PremiumBrandMark({
  brandName,
  tagline = "For coaches & gyms",
}: {
  brandName: string;
  tagline?: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, Math.round(fps * 0.35)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: REELS_HEADER_TOP,
        left: REELS_SIDE_PADDING,
        right: REELS_SIDE_PADDING,
        height: REELS_HEADER_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        zIndex: 3,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.14)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            background: "linear-gradient(135deg, #38bdf8, #818cf8)",
            boxShadow: "0 0 12px rgba(56,189,248,0.5)",
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 0.4,
            color: "#fff",
            fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          }}
        >
          {brandName}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          }}
        >
          · {tagline}
        </span>
      </div>
    </div>
  );
}

export function PremiumHeadline({
  text,
  variant = "scene",
  delaySeconds = 0.18,
}: {
  text: string;
  variant?: "hook" | "scene" | "cta";
  delaySeconds?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = Math.round(fps * delaySeconds);
  const enterFrames = Math.round(fps * (variant === "hook" ? 0.45 : 0.5));

  const opacity = interpolate(
    frame,
    [delay, delay + enterFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const translateY = interpolate(
    frame,
    [delay, delay + enterFrames],
    [variant === "hook" ? 90 : 72, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scale = interpolate(
    frame,
    [delay, delay + enterFrames],
    [0.92, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const fontSize =
    variant === "hook" ? 62 : variant === "cta" ? 44 : 50;
  const top =
    variant === "cta"
      ? REELS_SCENE_TEXT_TOP - 24
      : REELS_SCENE_TEXT_TOP;

  return (
    <div
      style={{
        position: "absolute",
        left: REELS_SCENE_TEXT_SIDE,
        right: REELS_SCENE_TEXT_SIDE,
        top,
        maxHeight: REELS_MAX_TEXT_Y - top,
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
        textAlign: "center",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        fontSize,
        fontWeight: 900,
        lineHeight: 1.08,
        letterSpacing: variant === "hook" ? -1.8 : -1.2,
        textShadow: "0 10px 48px rgba(0,0,0,0.6)",
        overflow: "hidden",
        zIndex: 2,
      }}
    >
      {text}
    </div>
  );
}

export function CtaButtonBlock({ label }: { label: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = Math.round(fps * 0.35);
  const enter = Math.round(fps * 0.4);

  const opacity = interpolate(frame, [delay, delay + enter], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [delay, delay + enter], [48, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = interpolate(Math.sin(frame / 10), [-1, 1], [1, 1.04]);
  const glow = interpolate(Math.sin(frame / 12), [-1, 1], [0.35, 0.65]);

  return (
    <div
      style={{
        position: "absolute",
        left: REELS_SCENE_TEXT_SIDE,
        right: REELS_SCENE_TEXT_SIDE,
        bottom: REELS_TEXT_BOTTOM_INSET,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
        zIndex: 3,
      }}
    >
      <div
        style={{
          transform: `scale(${pulse})`,
          padding: "18px 36px",
          borderRadius: 999,
          background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #a78bfa 100%)",
          border: "1px solid rgba(255,255,255,0.35)",
          boxShadow: `0 16px 48px rgba(99,102,241,${glow}), inset 0 1px 0 rgba(255,255,255,0.35)`,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: -0.3,
          color: "#fff",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          textAlign: "center",
          maxWidth: "100%",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function CoachTrustLine() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [Math.round(fps * 0.5), Math.round(fps * 0.9)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: REELS_SCENE_TEXT_SIDE,
        right: REELS_SCENE_TEXT_SIDE,
        bottom: REELS_SAFE_BOTTOM - 52,
        textAlign: "center",
        opacity,
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.45)",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        zIndex: 2,
      }}
    >
      Gyms · Trainers · Online coaches · One platform
    </div>
  );
}
