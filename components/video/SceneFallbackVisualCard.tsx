"use client";

import type { CSSProperties } from "react";

const FEATURE_TAG_SETS = [
  ["AI Coach", "Workouts", "Analytics"],
  ["Members", "Nutrition", "Sessions"],
  ["Marketing AI", "Calendar", "Progress"],
  ["Video Studio", "Content Ideas", "Insights"],
] as const;

type SceneFallbackVisualCardProps = {
  sceneIndex?: number;
  visualDescription?: string;
  brandLabel?: string;
};

function floatingCardStyle(
  top: string,
  left: string,
  width: number,
  rotate: number,
  delay = 0,
): CSSProperties {
  return {
    position: "absolute",
    top,
    left,
    width,
    padding: "14px 16px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.22)",
    boxShadow: "0 18px 48px rgba(0,0,0,0.35)",
    backdropFilter: "blur(12px)",
    transform: `rotate(${rotate}deg)`,
    animationDelay: `${delay}ms`,
  };
}

export default function SceneFallbackVisualCard({
  sceneIndex = 0,
  visualDescription = "",
  brandLabel = "ZyntixAI",
}: SceneFallbackVisualCardProps) {
  const tagSet = FEATURE_TAG_SETS[sceneIndex % FEATURE_TAG_SETS.length];
  const headline =
    visualDescription.trim() ||
    "All-in-one coaching platform — members, workouts, and growth in one dashboard.";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 28,
        overflow: "hidden",
        background:
          "linear-gradient(145deg, #0f172a 0%, #1e1b4b 42%, #312e81 72%, #1d4ed8 100%)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "rgba(56,189,248,0.18)",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -60,
          left: -40,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "rgba(168,85,247,0.2)",
          filter: "blur(36px)",
        }}
      />

      <div style={{ position: "relative", padding: "28px 28px 20px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.18)",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg, #38bdf8, #818cf8)",
              boxShadow: "0 4px 14px rgba(56,189,248,0.4)",
            }}
          />
          <span
            style={{
              fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: -0.5,
              color: "#ffffff",
            }}
          >
            {brandLabel}
          </span>
        </div>

        <div
          style={{
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(15,23,42,0.55)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
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
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: color,
                }}
              />
            ))}
            <div
              style={{
                flex: 1,
                marginLeft: 8,
                padding: "5px 12px",
                borderRadius: 8,
                background: "rgba(0,0,0,0.35)",
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              app.zyntixai.com/dashboard
            </div>
          </div>

          <div
            style={{
              position: "relative",
              height: 280,
              padding: 20,
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(30,27,75,0.85) 100%)",
            }}
          >
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {["Active Members", "Sessions", "Revenue"].map((label, i) => (
                <div
                  key={label}
                  style={{
                    flex: 1,
                    padding: "12px 10px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.45)",
                      marginBottom: 6,
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: `linear-gradient(90deg, ${
                        ["#38bdf8", "#818cf8", "#a78bfa"][i]
                      }, rgba(255,255,255,0.15))`,
                      width: `${[72, 58, 84][i]}%`,
                    }}
                  />
                </div>
              ))}
            </div>

            <div
              style={{
                height: 120,
                borderRadius: 14,
                background:
                  "linear-gradient(135deg, rgba(56,189,248,0.12), rgba(129,140,248,0.12))",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.55)",
                  marginBottom: 8,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                Weekly activity
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 64 }}>
                {[40, 62, 48, 78, 55, 88, 70].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      borderRadius: 4,
                      background: "linear-gradient(180deg, #38bdf8, #6366f1)",
                      opacity: 0.85,
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={floatingCardStyle("8%", "58%", 140, 4, 0)}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#67e8f9",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                +24% growth
              </div>
            </div>
            <div style={floatingCardStyle("52%", "4%", 120, -3, 120)}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#c4b5fd",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                AI insights
              </div>
            </div>
          </div>
        </div>

        <p
          style={{
            marginTop: 16,
            marginBottom: 14,
            fontSize: 15,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.72)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {headline.slice(0, 120)}
          {headline.length > 120 ? "…" : ""}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {tagSet.map((tag) => (
            <span
              key={tag}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.16)",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
