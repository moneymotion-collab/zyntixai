"use client";

import { interpolate } from "remotion";

const FONT = "system-ui, -apple-system, Segoe UI, sans-serif";

function staggerOpacity(frame: number, index: number, fps: number) {
  const start = Math.round(index * fps * 0.11);
  const end = start + Math.round(fps * 0.38);
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function MiniCard({
  label,
  value,
  color,
  frame,
  index,
  fps,
}: {
  label: string;
  value: string;
  color: string;
  frame: number;
  index: number;
  fps: number;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: "12px 10px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.08)",
        border: `1px solid ${color}44`,
        opacity: staggerOpacity(frame, index, fps),
      }}
    >
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: FONT }}>{value}</div>
    </div>
  );
}

export function ProblemPanel({ frame, fps }: { frame: number; fps: number }) {
  const tools = ["Sheets", "WhatsApp", "Calendly", "Notes", "Canva", "Stripe"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: FONT }}>
        Too many tools. One tired coach.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {tools.map((tool, i) => (
          <div
            key={tool}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.35)",
              fontSize: 11,
              fontWeight: 600,
              color: "#fca5a5",
              fontFamily: FONT,
              opacity: staggerOpacity(frame, i, fps),
              transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (i + 2)}deg)`,
            }}
          >
            {tool}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 8,
          padding: "14px",
          borderRadius: 14,
          background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(56,189,248,0.15))",
          border: "1px solid rgba(129,140,248,0.4)",
          opacity: staggerOpacity(frame, 6, fps),
          textAlign: "center",
          fontSize: 13,
          fontWeight: 700,
          color: "#e0e7ff",
          fontFamily: FONT,
        }}
      >
        → Replace all of this with ZyntixAI
      </div>
    </div>
  );
}

export function PlatformOverviewPanel({ frame, fps }: { frame: number; fps: number }) {
  const modules = [
    { label: "Members", color: "#38bdf8" },
    { label: "Workouts", color: "#818cf8" },
    { label: "Nutrition", color: "#34d399" },
    { label: "Sessions", color: "#22d3ee" },
    { label: "Marketing AI", color: "#f472b6" },
    { label: "Analytics", color: "#fbbf24" },
    { label: "Progress", color: "#a78bfa" },
    { label: "AI Coach", color: "#10b981" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: FONT }}>
        Complete Fitness Business Platform
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {modules.map((mod, i) => (
          <div
            key={mod.label}
            style={{
              padding: "12px",
              borderRadius: 12,
              background: `${mod.color}18`,
              border: `1px solid ${mod.color}55`,
              opacity: staggerOpacity(frame, i, fps),
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
              fontFamily: FONT,
            }}
          >
            {mod.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MembersPanel({ frame, fps }: { frame: number; fps: number }) {
  const members = [
    { name: "Sarah K.", goal: "Fat loss", status: "Active" },
    { name: "Mike R.", goal: "Strength", status: "Check-in" },
    { name: "Lisa M.", goal: "Hypertrophy", status: "Active" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: FONT }}>Members CRM</div>
      {members.map((m, i) => (
        <div
          key={m.name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 14px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            opacity: staggerOpacity(frame, i + 1, fps),
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: FONT }}>{m.name}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>{m.goal}</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#38bdf8", fontFamily: FONT }}>{m.status}</span>
        </div>
      ))}
    </div>
  );
}

export function WorkoutsPanel({ frame, fps }: { frame: number; fps: number }) {
  const blocks = ["Warm-up", "Squat 4×8", "RDL 3×10", "Core finisher"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: FONT }}>Program Builder</div>
      {blocks.map((block, i) => (
        <div
          key={block}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(129,140,248,0.12)",
            border: "1px solid rgba(129,140,248,0.35)",
            opacity: staggerOpacity(frame, i + 1, fps),
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            fontFamily: FONT,
          }}
        >
          {block}
        </div>
      ))}
    </div>
  );
}

export function NutritionPanel({ frame, fps }: { frame: number; fps: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: FONT }}>Nutrition Plans</div>
      <div style={{ display: "flex", gap: 8 }}>
        <MiniCard label="Protein" value="165g" color="#34d399" frame={frame} index={1} fps={fps} />
        <MiniCard label="Carbs" value="220g" color="#38bdf8" frame={frame} index={2} fps={fps} />
        <MiniCard label="Fat" value="62g" color="#a78bfa" frame={frame} index={3} fps={fps} />
      </div>
      {["High-protein breakfast", "Post-workout meal", "Evening snack"].map((meal, i) => (
        <div
          key={meal}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.06)",
            opacity: staggerOpacity(frame, i + 4, fps),
            fontSize: 12,
            fontWeight: 600,
            color: "#fff",
            fontFamily: FONT,
          }}
        >
          {meal}
        </div>
      ))}
    </div>
  );
}

export function ProgressPanel({ frame, fps }: { frame: number; fps: number }) {
  const bars = [42, 55, 48, 68, 72, 85, 78];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: FONT }}>Progress Tracking</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 90 }}>
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${interpolate(frame, [Math.round(fps * 0.2 + i * 4), Math.round(fps * 0.6 + i * 4)], [0, h], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%`,
              borderRadius: 6,
              background: "linear-gradient(180deg, #a78bfa, #6366f1)",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <MiniCard label="Compliance" value="92%" color="#34d399" frame={frame} index={8} fps={fps} />
        <MiniCard label="New PRs" value="14" color="#818cf8" frame={frame} index={9} fps={fps} />
      </div>
    </div>
  );
}

export function SessionsPanel({ frame, fps }: { frame: number; fps: number }) {
  const slots = [
    { time: "09:00", client: "Sarah — PT", type: "In-person" },
    { time: "11:30", client: "Mike — Check-in", type: "Online" },
    { time: "17:00", client: "Group HIIT", type: "Studio" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: FONT }}>Session Calendar</div>
      {slots.map((slot, i) => (
        <div
          key={slot.time}
          style={{
            display: "flex",
            gap: 12,
            padding: "12px",
            borderRadius: 12,
            background: "rgba(34,211,238,0.1)",
            border: "1px solid rgba(34,211,238,0.3)",
            opacity: staggerOpacity(frame, i + 1, fps),
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 800, color: "#22d3ee", fontFamily: FONT, minWidth: 44 }}>{slot.time}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: FONT }}>{slot.client}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>{slot.type}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketingAiPanel({ frame, fps }: { frame: number; fps: number }) {
  const ideas = ["Client transformation reel", "90-sec warm-up fix", "Meal prep myth bust"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: FONT }}>Marketing AI</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>
        Content ideas · Video scripts · Social calendar
      </div>
      {ideas.map((idea, i) => (
        <div
          key={idea}
          style={{
            padding: "12px 14px",
            borderRadius: 14,
            background: "rgba(244,114,182,0.12)",
            border: "1px solid rgba(244,114,182,0.35)",
            opacity: staggerOpacity(frame, i + 1, fps),
            fontSize: 12,
            fontWeight: 600,
            color: "#fff",
            fontFamily: FONT,
          }}
        >
          {idea}
        </div>
      ))}
    </div>
  );
}

export function BusinessAnalyticsPanel({ frame, fps }: { frame: number; fps: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: FONT }}>Business Analytics</div>
      <div style={{ display: "flex", gap: 8 }}>
        <MiniCard label="MRR" value="$18.2k" color="#fbbf24" frame={frame} index={0} fps={fps} />
        <MiniCard label="Retention" value="96%" color="#34d399" frame={frame} index={1} fps={fps} />
        <MiniCard label="Fill rate" value="94%" color="#38bdf8" frame={frame} index={2} fps={fps} />
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>
        Revenue · Members · Sessions · Marketing ROI
      </div>
    </div>
  );
}

export function AiCoachPanel({ frame, fps }: { frame: number; fps: number }) {
  const messages = [
    { role: "coach", text: "Which clients need check-ins today?" },
    { role: "ai", text: "3 clients missed sessions — draft re-engagement messages?" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: FONT }}>AI Coach</div>
      {messages.map((msg, i) => (
        <div
          key={i}
          style={{
            alignSelf: msg.role === "ai" ? "flex-start" : "flex-end",
            maxWidth: "88%",
            padding: "10px 12px",
            borderRadius: 14,
            background: msg.role === "ai" ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.2)",
            border: `1px solid ${msg.role === "ai" ? "rgba(16,185,129,0.35)" : "rgba(99,102,241,0.4)"}`,
            opacity: staggerOpacity(frame, i + 1, fps),
            fontSize: 11,
            fontWeight: 600,
            color: "#fff",
            fontFamily: FONT,
          }}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}
