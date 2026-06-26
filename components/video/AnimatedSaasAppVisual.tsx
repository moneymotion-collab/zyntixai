"use client";

import type { CSSProperties } from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  AiCoachPanel,
  BusinessAnalyticsPanel,
  MarketingAiPanel,
  MembersPanel,
  NutritionPanel,
  PlatformOverviewPanel,
  ProblemPanel,
  ProgressPanel,
  SessionsPanel,
  WorkoutsPanel,
} from "@/components/video/PlatformModulePanels";
import {
  resolveSaasVisualVariant,
  SAAS_VARIANT_LABELS,
  SAAS_VARIANT_PATHS,
  type SaasVisualVariant,
} from "@/lib/video/resolve-saas-visual-variant";

const FONT = "system-ui, -apple-system, Segoe UI, sans-serif";

const SIDEBAR_ITEMS: Array<{ id: SaasVisualVariant; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "members", label: "Members" },
  { id: "workouts", label: "Workouts" },
  { id: "nutrition", label: "Nutrition" },
  { id: "progress", label: "Progress" },
  { id: "sessions", label: "Sessions" },
  { id: "marketing_ai", label: "Marketing AI" },
  { id: "analytics", label: "Analytics" },
  { id: "ai_coach", label: "AI Coach" },
];

type AnimatedSaasAppVisualProps = {
  sceneText: string;
  visualDescription?: string;
  sceneIndex?: number;
  brandLabel?: string;
  imageUrl?: string | null;
  module?: string;
  forceVariant?: SaasVisualVariant;
  /** Showcase mode: full app chrome visible, minimal crop/zoom, no floating overlays. */
  presentation?: "showcase" | "premium";
};

function resolveImageSrc(imageUrl: string) {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  const publicPath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
  return staticFile(publicPath);
}

function cardIdleMotion(frame: number, index: number) {
  const floatY = interpolate(Math.sin((frame + index * 18) / 14), [-1, 1], [-4, 4]);
  const scale = interpolate(Math.sin((frame + index * 11) / 20), [-1, 1], [0.985, 1.015]);
  return { floatY, scale };
}

function GlowBackdrop({ frame }: { frame: number }) {
  const pulseA = interpolate(Math.sin(frame / 22), [-1, 1], [0.22, 0.38]);
  const pulseB = interpolate(Math.sin(frame / 17 + 1.2), [-1, 1], [0.14, 0.28]);
  const driftX = interpolate(Math.sin(frame / 32), [-1, 1], [-18, 18]);
  const driftY = interpolate(Math.sin(frame / 26), [-1, 1], [-12, 12]);

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "50%",
          width: 520,
          height: 520,
          marginLeft: -260 + driftX,
          marginTop: driftY,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(99,102,241,${pulseA}) 0%, rgba(99,102,241,0) 68%)`,
          filter: "blur(48px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          right: "8%",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(56,189,248,${pulseB}) 0%, rgba(56,189,248,0) 70%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "4%",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(167,139,250,${pulseB * 0.85}) 0%, transparent 72%)`,
          filter: "blur(32px)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

function FloatingAccentCard({
  label,
  value,
  sublabel,
  color,
  frame,
  index,
  fps,
  style,
}: {
  label: string;
  value: string;
  sublabel?: string;
  color: string;
  frame: number;
  index: number;
  fps: number;
  style: CSSProperties;
}) {
  const opacity = staggerOpacity(frame, index + 2, fps);
  const enterY = staggerY(frame, index + 2, fps, 22);
  const { floatY, scale } = cardIdleMotion(frame, index + 4);

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 20,
        padding: "12px 14px",
        borderRadius: 16,
        minWidth: 118,
        background: "rgba(15,23,42,0.82)",
        border: "1px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(14px)",
        boxShadow: `0 16px 40px rgba(0,0,0,0.38), 0 0 0 1px ${color}33, inset 0 1px 0 rgba(255,255,255,0.12)`,
        opacity,
        transform: `translateY(${enterY + floatY}px) scale(${scale})`,
        ...style,
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>
        {label}
      </div>
      <div style={{ marginTop: 4, fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: FONT, letterSpacing: -0.5 }}>
        {value}
      </div>
      {sublabel ? (
        <div style={{ marginTop: 4, fontSize: 10, fontWeight: 600, color, fontFamily: FONT }}>
          {sublabel}
        </div>
      ) : null}
    </div>
  );
}

function FloatingAccentCards({ frame, fps }: { frame: number; fps: number }) {
  return (
    <>
      <FloatingAccentCard
        label="Growth"
        value="+24%"
        sublabel="This month"
        color="#34d399"
        frame={frame}
        index={0}
        fps={fps}
        style={{ top: "6%", right: "2%" }}
      />
      <FloatingAccentCard
        label="Live"
        value="128"
        sublabel="Active members"
        color="#818cf8"
        frame={frame}
        index={1}
        fps={fps}
        style={{ top: "20%", left: "0%" }}
      />
      <FloatingAccentCard
        label="Engagement"
        value="8.4%"
        sublabel="Top 10% niche"
        color="#38bdf8"
        frame={frame}
        index={2}
        fps={fps}
        style={{ bottom: "14%", right: "1%" }}
      />
    </>
  );
}

const PREMIUM_DEVICE_SHADOW =
  "0 4px 8px rgba(0,0,0,0.18), 0 20px 48px rgba(0,0,0,0.42), 0 56px 100px rgba(49,46,129,0.38), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.18)";

function usePremiumDeviceMotion(
  frame: number,
  fps: number,
  durationInFrames: number,
  subtle = false,
) {
  const floatY = interpolate(Math.sin(frame / 20), [-1, 1], subtle ? [-3, 3] : [-8, 8]);
  const tiltY = interpolate(Math.sin(frame / 30), [-1, 1], subtle ? [-1.5, -1] : [-5, -3.5]);
  const tiltX = interpolate(Math.sin(frame / 24 + 0.8), [-1, 1], subtle ? [0.4, 0.8] : [1.8, 3]);
  const enterScale = interpolate(frame, [0, Math.round(fps * 0.55)], [subtle ? 0.97 : 0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const duration = Math.max(durationInFrames, fps * 2);
  const maxZoom = subtle ? 1.015 : 1.08;
  const slowZoom = interpolate(frame, [0, duration], [1, maxZoom], {
    extrapolateRight: "clamp",
  });
  const enterOpacity = interpolate(frame, [0, Math.round(fps * 0.35)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return {
    floatY,
    tiltY,
    tiltX,
    scale: enterScale * slowZoom,
    opacity: enterOpacity,
    transform: `
      translateY(${floatY}px)
      rotateY(${tiltY}deg)
      rotateX(${tiltX}deg)
      scale(${enterScale * slowZoom})
    `,
  };
}

function staggerOpacity(frame: number, index: number, fps: number) {
  const start = Math.round(index * fps * 0.11);
  const end = start + Math.round(fps * 0.38);
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function staggerY(frame: number, index: number, fps: number, distance = 16) {
  const start = Math.round(index * fps * 0.11);
  const end = start + Math.round(fps * 0.42);
  return interpolate(frame, [start, end], [distance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function Badge({
  label,
  color,
  style,
}: {
  label: string;
  color: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.2,
        color: "#fff",
        background: color,
        boxShadow: `0 4px 14px ${color}55`,
        fontFamily: FONT,
        ...style,
      }}
    >
      {label}
    </span>
  );
}

function KpiCard({
  label,
  value,
  delta,
  frame,
  index,
  fps,
  accent,
}: {
  label: string;
  value: string;
  delta: string;
  frame: number;
  index: number;
  fps: number;
  accent: string;
}) {
  const opacity = staggerOpacity(frame, index, fps);
  const y = staggerY(frame, index, fps);
  const { floatY, scale } = cardIdleMotion(frame, index);
  const barWidth = interpolate(
    frame,
    [Math.round(fps * 0.35 + index * fps * 0.1), Math.round(fps * 1.1 + index * fps * 0.1)],
    [0, 58 + index * 12],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        flex: 1,
        padding: "14px 12px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 10px 28px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.1)",
        opacity,
        transform: `translateY(${y + floatY}px) scale(${scale})`,
      }}
    >
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 22,
          fontWeight: 800,
          color: "#fff",
          fontFamily: FONT,
          letterSpacing: -0.5,
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 6,
          height: 6,
          borderRadius: 4,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 4,
            background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.2))`,
            width: `${barWidth}%`,
            boxShadow: `0 0 12px ${accent}66`,
          }}
        />
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 10,
          fontWeight: 600,
          color: accent,
          fontFamily: FONT,
        }}
      >
        {delta}
      </div>
    </div>
  );
}

function BarChart({
  frame,
  fps,
  values,
  accent,
}: {
  frame: number;
  fps: number;
  values: number[];
  accent: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
      {values.map((target, i) => {
        const grow = interpolate(
          frame,
          [Math.round(fps * 0.2 + i * fps * 0.06), Math.round(fps * 0.65 + i * fps * 0.06)],
          [0, target],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${grow}%`,
              borderRadius: 6,
              background: `linear-gradient(180deg, ${accent}, rgba(99,102,241,0.55))`,
              boxShadow: `0 8px 20px ${accent}44, 0 0 16px ${accent}22`,
            }}
          />
        );
      })}
    </div>
  );
}

function ContentIdeasPanel({ frame, fps }: { frame: number; fps: number }) {
  const ideas = [
    { title: "90-second warm-up fix", score: 92, tag: "Viral" },
    { title: "Client check-in reel", score: 87, tag: "Trending" },
    { title: "Meal prep myth bust", score: 84, tag: "Educational" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: FONT }}>
            AI Content Ideas
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>
            Generated for your coaching niche
          </div>
        </div>
        <Badge label="Generate +" color="#6366f1" />
      </div>
      {ideas.map((idea, i) => {
        const opacity = staggerOpacity(frame, i + 1, fps);
        const x = staggerY(frame, i + 1, fps, 20);
        const { floatY, scale } = cardIdleMotion(frame, i + 2);
        const pulse = interpolate(Math.sin((frame + i * 10) / 12), [-1, 1], [0.98, 1.02]);
        return (
          <div
            key={idea.title}
            style={{
              padding: "14px 16px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 12px 28px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
              opacity,
              transform: `translateX(${x}px) translateY(${floatY}px) scale(${scale * pulse})`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: FONT }}>
                {idea.title}
              </div>
              <Badge label={`${idea.score}`} color="#06b6d4" />
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <Badge label={idea.tag} color="#8b5cf6" />
              <Badge label="Reel script" color="#334155" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarPanel({ frame, fps }: { frame: number; fps: number }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const blocks = [
    { day: 1, label: "Reel draft", status: "Draft", color: "#f59e0b" },
    { day: 2, label: "Client wins", status: "Scheduled", color: "#6366f1" },
    { day: 4, label: "Nutrition tips", status: "Scheduled", color: "#6366f1" },
    { day: 6, label: "Launch CTA", status: "Ready", color: "#10b981" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: FONT }}>
          Content Calendar
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>
          Plan posts across the week
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 10 }}>
        {days.map((day, i) => (
          <div
            key={day}
            style={{
              textAlign: "center",
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.45)",
              fontFamily: FONT,
              opacity: staggerOpacity(frame, i, fps),
            }}
          >
            {day}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 6,
          minHeight: 160,
        }}
      >
        {Array.from({ length: 7 }).map((_, dayIndex) => {
          const block = blocks.find((b) => b.day === dayIndex);
          const opacity = staggerOpacity(frame, dayIndex + 2, fps);
          return (
            <div
              key={dayIndex}
              style={{
                borderRadius: 10,
                padding: 6,
                minHeight: 72,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                opacity,
              }}
            >
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: FONT }}>
                {dayIndex + 10}
              </div>
              {block ? (
                <div
                  style={{
                    marginTop: 6,
                    padding: "6px 6px",
                    borderRadius: 8,
                    background: `${block.color}22`,
                    border: `1px solid ${block.color}55`,
                  }}
                >
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#fff", fontFamily: FONT }}>
                    {block.label}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Badge label={block.status} color={block.color} />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnalyticsPanel({ frame, fps }: { frame: number; fps: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: FONT }}>
          Hook & Engagement Analytics
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>
          Track what resonates with your audience
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <KpiCard
          label="Avg. engagement"
          value="8.4%"
          delta="+2.1% vs last week"
          frame={frame}
          index={0}
          fps={fps}
          accent="#38bdf8"
        />
        <KpiCard
          label="Hook score"
          value="91"
          delta="Top 10% niche"
          frame={frame}
          index={1}
          fps={fps}
          accent="#a78bfa"
        />
      </div>
      <div
        style={{
          padding: 14,
          borderRadius: 14,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          opacity: staggerOpacity(frame, 3, fps),
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", fontFamily: FONT }}>
          Weekly reach
        </div>
        <BarChart frame={frame} fps={fps} values={[42, 58, 48, 72, 65, 88, 76]} accent="#38bdf8" />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Strong hook", "High saves", "Reel optimized"].map((tag, i) => (
          <span
            key={tag}
            style={{
              opacity: staggerOpacity(frame, i + 4, fps),
              padding: "5px 10px",
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 600,
              color: "#cffafe",
              background: "rgba(6,182,212,0.2)",
              border: "1px solid rgba(6,182,212,0.35)",
              fontFamily: FONT,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function PublishingPanel({ frame, fps }: { frame: number; fps: number }) {
  const posts = [
    { title: "Warm-up routine reel", status: "Published", color: "#10b981", time: "2h ago" },
    { title: "Client transformation", status: "Scheduled", color: "#6366f1", time: "Fri 9:00" },
    { title: "Nutrition Q&A", status: "Draft", color: "#f59e0b", time: "Editing" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: FONT }}>
          Publishing Pipeline
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>
          Draft → schedule → publish in one flow
        </div>
      </div>
      {posts.map((post, i) => {
        const opacity = staggerOpacity(frame, i + 1, fps);
        const { floatY, scale } = cardIdleMotion(frame, i + 3);
        const pulse = interpolate(Math.sin((frame + i * 14) / 16), [-1, 1], [1, 1.03]);
        return (
          <div
            key={post.title}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "14px 16px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
              opacity,
              transform: `translateY(${floatY}px) scale(${post.status === "Published" ? scale * pulse : scale})`,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: FONT }}>
                {post.title}
              </div>
              <div style={{ marginTop: 4, fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: FONT }}>
                {post.time}
              </div>
            </div>
            <Badge label={post.status} color={post.color} />
          </div>
        );
      })}
      <div
        style={{
          marginTop: 4,
          padding: "12px 14px",
          borderRadius: 12,
          background: "linear-gradient(90deg, rgba(16,185,129,0.2), rgba(99,102,241,0.15))",
          border: "1px solid rgba(16,185,129,0.35)",
          opacity: staggerOpacity(frame, 5, fps),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: "#6ee7b7", fontFamily: FONT }}>
          Auto-publish enabled
        </span>
        <Badge label="Live" color="#10b981" />
      </div>
    </div>
  );
}

function DashboardPanel({ frame, fps }: { frame: number; fps: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", fontFamily: FONT }}>
          Coach Command Center
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>
          Members, sessions, and growth at a glance
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <KpiCard
          label="Active members"
          value="128"
          delta="+12 this month"
          frame={frame}
          index={0}
          fps={fps}
          accent="#38bdf8"
        />
        <KpiCard
          label="Sessions booked"
          value="46"
          delta="94% fill rate"
          frame={frame}
          index={1}
          fps={fps}
          accent="#818cf8"
        />
        <KpiCard
          label="Revenue"
          value="$18.2k"
          delta="+24% MoM"
          frame={frame}
          index={2}
          fps={fps}
          accent="#a78bfa"
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { label: "Retention", value: "96%", color: "#34d399" },
          { label: "NPS", value: "72", color: "#fbbf24" },
        ].map((stat, i) => {
          const opacity = staggerOpacity(frame, i + 3, fps);
          const { floatY, scale } = cardIdleMotion(frame, i + 6);
          return (
            <div
              key={stat.label}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${stat.color}44`,
                opacity,
                transform: `translateY(${floatY}px) scale(${scale})`,
              }}
            >
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontFamily: FONT }}>
                {stat.label}
              </div>
              <div style={{ marginTop: 4, fontSize: 16, fontWeight: 800, color: stat.color, fontFamily: FONT }}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          padding: 14,
          borderRadius: 16,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
          opacity: staggerOpacity(frame, 4, fps),
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", fontFamily: FONT }}>
          Weekly activity
        </div>
        <BarChart frame={frame} fps={fps} values={[38, 55, 44, 68, 52, 82, 64]} accent="#6366f1" />
      </div>
    </div>
  );
}

function VariantContent({
  variant,
  frame,
  fps,
  imageUrl,
  showFullScreenshot = false,
}: {
  variant: SaasVisualVariant;
  frame: number;
  fps: number;
  imageUrl?: string | null;
  showFullScreenshot?: boolean;
}) {
  if (imageUrl) {
    const opacity = interpolate(frame, [0, 15], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const kenBurns = showFullScreenshot
      ? 1
      : interpolate(frame, [0, fps * 4], [1, 1.04], {
          extrapolateRight: "clamp",
        });
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 12,
          overflow: "hidden",
          opacity,
          background: "rgba(15,23,42,0.95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img
          src={resolveImageSrc(imageUrl)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: showFullScreenshot ? "contain" : "cover",
            objectPosition: "center top",
            transform: kenBurns === 1 ? undefined : `scale(${kenBurns})`,
            transformOrigin: "center top",
          }}
        />
      </div>
    );
  }

  switch (variant) {
    case "problem":
      return <ProblemPanel frame={frame} fps={fps} />;
    case "platform_overview":
      return <PlatformOverviewPanel frame={frame} fps={fps} />;
    case "members":
      return <MembersPanel frame={frame} fps={fps} />;
    case "workouts":
      return <WorkoutsPanel frame={frame} fps={fps} />;
    case "nutrition":
      return <NutritionPanel frame={frame} fps={fps} />;
    case "progress":
      return <ProgressPanel frame={frame} fps={fps} />;
    case "sessions":
      return <SessionsPanel frame={frame} fps={fps} />;
    case "marketing_ai":
      return <MarketingAiPanel frame={frame} fps={fps} />;
    case "ai_coach":
      return <AiCoachPanel frame={frame} fps={fps} />;
    case "content_ideas":
      return <ContentIdeasPanel frame={frame} fps={fps} />;
    case "calendar":
      return <CalendarPanel frame={frame} fps={fps} />;
    case "analytics":
      return <BusinessAnalyticsPanel frame={frame} fps={fps} />;
    case "publishing":
      return <PublishingPanel frame={frame} fps={fps} />;
    default:
      return <DashboardPanel frame={frame} fps={fps} />;
  }
}

function Sidebar({
  variant,
  frame,
  fps,
  compact = false,
}: {
  variant: SaasVisualVariant;
  frame: number;
  fps: number;
  compact?: boolean;
}) {
  const slide = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: compact ? 132 : 148,
        flexShrink: 0,
        padding: compact ? "10px 8px" : "16px 10px",
        background: "rgba(0,0,0,0.28)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        opacity: slide,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 18,
          padding: "0 6px",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg, #38bdf8, #818cf8)",
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: FONT }}>
          ZyntixAI
        </span>
      </div>
      {SIDEBAR_ITEMS.map((item, i) => {
        const active =
          item.id === variant ||
          (variant === "platform_overview" && item.id === "dashboard") ||
          (variant === "problem" && item.id === "dashboard") ||
          (["content_ideas", "calendar", "publishing"].includes(variant) &&
            item.id === "marketing_ai");
        const opacity = staggerOpacity(frame, i, fps);
        return (
          <div
            key={item.label}
            style={{
              marginBottom: compact ? 4 : 6,
              padding: compact ? "6px 8px" : "8px 10px",
              borderRadius: 10,
              fontSize: compact ? 10 : 11,
              fontWeight: active ? 700 : 500,
              color: active ? "#fff" : "rgba(255,255,255,0.55)",
              background: active ? "rgba(99,102,241,0.35)" : "transparent",
              border: active ? "1px solid rgba(129,140,248,0.45)" : "1px solid transparent",
              fontFamily: FONT,
              opacity,
              lineHeight: 1.2,
            }}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
}

function TopBar({
  title,
  frame,
  fps,
  compact = false,
}: {
  title: string;
  frame: number;
  fps: number;
  compact?: boolean;
}) {
  const opacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: compact ? 8 : 16,
        opacity,
      }}
    >
      <div style={{ fontSize: compact ? 14 : 16, fontWeight: 800, color: "#fff", fontFamily: FONT }}>
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 120,
            height: 28,
            borderRadius: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #38bdf8, #6366f1)",
          }}
        />
      </div>
    </div>
  );
}

function BrowserChrome({ url }: { url: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
        <div
          key={color}
          style={{ width: 10, height: 10, borderRadius: "50%", background: color }}
        />
      ))}
      <div
        style={{
          flex: 1,
          marginLeft: 8,
          padding: "5px 12px",
          borderRadius: 8,
          background: "rgba(0,0,0,0.35)",
          fontSize: 11,
          color: "rgba(255,255,255,0.5)",
          fontFamily: FONT,
        }}
      >
        {url}
      </div>
    </div>
  );
}

export default function AnimatedSaasAppVisual({
  sceneText,
  visualDescription = "",
  sceneIndex = 0,
  brandLabel = "ZyntixAI",
  imageUrl,
  module,
  forceVariant,
  presentation = "showcase",
}: AnimatedSaasAppVisualProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const isShowcase = presentation === "showcase";

  const variant =
    forceVariant ??
    resolveSaasVisualVariant({
      text: sceneText,
      visual_description: visualDescription,
      sceneIndex,
      module,
    });

  const motion = usePremiumDeviceMotion(frame, fps, durationInFrames, isShowcase);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "visible",
      }}
    >
      <GlowBackdrop frame={frame} />
      {!isShowcase ? <FloatingAccentCards frame={frame} fps={fps} /> : null}

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: isShowcase ? "stretch" : "center",
          justifyContent: "center",
          perspective: isShowcase ? 1200 : 1400,
        }}
      >
        <div
          style={{
            width: isShowcase ? "100%" : "106%",
            height: "100%",
            opacity: motion.opacity,
            transform: motion.transform,
            transformStyle: "preserve-3d",
            borderRadius: isShowcase ? 20 : 24,
            overflow: "hidden",
            background:
              "linear-gradient(155deg, #0f172a 0%, #1e1b4b 48%, #312e81 100%)",
            boxShadow: PREMIUM_DEVICE_SHADOW,
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 42%, transparent 100%)",
            }}
          />
          <div
            style={{
              position: "relative",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              padding: isShowcase ? "6px 6px 4px" : "10px 10px 8px",
            }}
          >
            {!isShowcase ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  gap: 8,
                  marginBottom: 8,
                  padding: "5px 11px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.16)",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: FONT }}>
                  {brandLabel}
                </span>
                <Badge label={SAAS_VARIANT_LABELS[variant]} color="#6366f1" />
              </div>
            ) : null}

            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(15,23,42,0.72)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <BrowserChrome url={SAAS_VARIANT_PATHS[variant]} />
              <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
                <Sidebar variant={variant} frame={frame} fps={fps} compact={isShowcase} />
                <div
                  style={{
                    flex: 1,
                    padding: isShowcase ? "8px 10px 10px" : "12px 14px 14px",
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <TopBar title={SAAS_VARIANT_LABELS[variant]} frame={frame} fps={fps} compact={isShowcase} />
                  <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                    <VariantContent
                      variant={variant}
                      frame={frame}
                      fps={fps}
                      imageUrl={imageUrl}
                      showFullScreenshot={isShowcase}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
