"use client";

import { Crosshair, Mic, MousePointer2, Target } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
  deriveSceneVisualLayer,
  getLayoutBackgroundGradient,
  parseSceneLayoutStyle,
  type SceneLayoutStyle,
} from "@/lib/marketing/scene-visual-layer";

export type PremiumWorkflowSceneProps = {
  assetUrl: string;
  overlayText: string;
  narration: string;
  uiFocusArea: string;
  cursorAction: string;
  professionalPurpose: string;
  cropFocus: string;
  highlightArea: string;
  zoomLevel: number;
  layoutStyle: string;
  /** Shown inside the browser frame when assetUrl is missing */
  imagePromptFallback?: string;
  /** Optional slug for browser chrome URL bar */
  assetKey?: string;
  /** Show pulsing highlight ring over the UI focus area */
  showHighlight?: boolean;
  sceneIndex?: number;
  className?: string;
};

function assetKeyFromUrl(url: string): string {
  const match = url.match(/\/([^/]+)\.(png|jpe?g|webp)$/i);
  return match?.[1]?.replace(/_/g, "-") ?? "dashboard";
}

function BrowserFrame({
  url,
  layout,
  children,
}: {
  url: string;
  layout: SceneLayoutStyle;
  children: ReactNode;
}) {
  const shellClass: Record<SceneLayoutStyle, string> = {
    premium_saas:
      "rounded-xl border border-slate-200/80 bg-white shadow-[0_16px_48px_-16px_rgba(15,23,42,0.4)]",
    glass_card:
      "rounded-xl border border-white/20 bg-white/10 shadow-[0_20px_56px_-20px_rgba(0,0,0,0.55)] backdrop-blur-md",
    floating_dashboard:
      "rounded-xl border border-slate-200/60 bg-white shadow-[0_24px_64px_-24px_rgba(15,23,42,0.5)]",
    split_story:
      "rounded-lg border border-slate-200/80 bg-white shadow-[0_12px_40px_-16px_rgba(15,23,42,0.35)]",
    dark_commercial:
      "rounded-xl border border-indigo-500/30 bg-slate-950 shadow-[0_24px_64px_-20px_rgba(0,0,0,0.7)]",
  };

  return (
    <div className={`overflow-hidden ${shellClass[layout]}`}>
      <div className="flex items-center gap-2 border-b border-slate-200/80 bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] px-3 py-2">
        <div className="flex shrink-0 gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-slate-200/80 bg-white px-2 py-0.5">
          <span className="text-[9px] text-slate-400">🔒</span>
          <span className="truncate text-[10px] font-medium text-slate-500">{url}</span>
        </div>
      </div>
      <div className="relative overflow-hidden bg-slate-950">{children}</div>
    </div>
  );
}

function HighlightPulse({
  highlight,
}: {
  highlight: ReturnType<typeof deriveSceneVisualLayer>["highlight"];
}) {
  return (
    <>
      <div
        className="pointer-events-none absolute animate-pulse rounded-md border-2 border-cyan-400/90 shadow-[0_0_0_4px_rgba(34,211,238,0.12),0_0_28px_rgba(34,211,238,0.35)]"
        style={{
          left: `${highlight.x * 100}%`,
          top: `${highlight.y * 100}%`,
          width: `${highlight.width * 100}%`,
          height: `${highlight.height * 100}%`,
        }}
      />
      {highlight.label ? (
        <span
          className="pointer-events-none absolute max-w-[75%] truncate rounded-md border border-cyan-300/40 bg-slate-900/90 px-1.5 py-0.5 text-[8px] font-semibold text-cyan-100 shadow-lg backdrop-blur-sm"
          style={{
            left: `${(highlight.x + highlight.width / 2) * 100}%`,
            top: `${Math.max(0, highlight.y * 100 - 2)}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          {highlight.label}
        </span>
      ) : null}
    </>
  );
}

function DemoNote({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  if (!value.trim()) return null;

  return (
    <div className="flex items-start gap-1.5 rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 backdrop-blur-sm">
      <span className="mt-0.5 text-indigo-300/90">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-semibold uppercase tracking-wider text-white/45">
          {label}
        </p>
        <p className="truncate text-[10px] leading-snug text-white/80">{value}</p>
      </div>
    </div>
  );
}

function FramedScreenshot({
  assetUrl,
  imagePromptFallback,
  layer,
  showHighlight,
}: {
  assetUrl: string;
  imagePromptFallback?: string;
  layer: ReturnType<typeof deriveSceneVisualLayer>;
  showHighlight: boolean;
}) {
  const hasImage = Boolean(assetUrl.trim());
  const fallbackPrompt = imagePromptFallback?.trim() || "";
  const hasFramedContent = hasImage || Boolean(fallbackPrompt);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden">
      {hasImage ? (
        <img
          src={assetUrl}
          alt="Product UI screenshot"
          className="h-full w-full object-cover"
          style={{
            objectPosition: `${layer.crop.x * 100}% ${layer.crop.y * 100}%`,
            transform: `scale(${layer.zoom_level})`,
            transformOrigin: `${layer.crop.x * 100}% ${layer.crop.y * 100}%`,
          }}
        />
      ) : fallbackPrompt ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-4">
          <p className="line-clamp-[8] text-center text-[10px] leading-relaxed text-slate-300">
            {fallbackPrompt}
          </p>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
          <p className="px-4 text-center text-[10px] text-slate-400">
            Screenshot pending — generate images to preview
          </p>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-slate-950/10" />
      {showHighlight && hasFramedContent ? (
        <HighlightPulse highlight={layer.highlight} />
      ) : null}
    </div>
  );
}

export function PremiumWorkflowScene({
  assetUrl,
  overlayText,
  narration,
  uiFocusArea,
  cursorAction,
  professionalPurpose,
  cropFocus,
  highlightArea,
  zoomLevel,
  layoutStyle,
  imagePromptFallback,
  assetKey,
  showHighlight = true,
  sceneIndex = 0,
  className = "",
}: PremiumWorkflowSceneProps) {
  const layout = parseSceneLayoutStyle(layoutStyle);
  const background = getLayoutBackgroundGradient(layout, sceneIndex);
  const resolvedAssetKey = assetKey?.trim() || assetKeyFromUrl(assetUrl);
  const browserUrl = `app.zyntixai.com/${resolvedAssetKey}`;

  const layer = deriveSceneVisualLayer(
    {
      crop_focus: cropFocus,
      highlight_area: highlightArea,
      zoom_level: zoomLevel,
      layout_style: layout,
      ui_focus_area: uiFocusArea,
      asset_key: resolvedAssetKey,
    },
    sceneIndex,
  );

  const frameStyle: CSSProperties = { background };
  const shouldHighlight =
    showHighlight && Boolean(highlightArea.trim() || uiFocusArea.trim());

  return (
    <article
      className={`mx-auto flex w-full max-w-[360px] flex-col overflow-hidden rounded-3xl shadow-[0_32px_96px_-32px_rgba(0,0,0,0.65)] ring-1 ring-white/10 ${className}`}
      style={{ aspectRatio: "9 / 16" }}
    >
      <div className="relative flex h-full min-h-0 flex-col" style={frameStyle}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(99,102,241,0.22) 0%, transparent 60%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/35" />

        <div className="relative flex min-h-0 flex-1 flex-col gap-3 p-4 pt-5">
          {overlayText.trim() ? (
            <header className="shrink-0 px-0.5">
              <h2 className="text-center text-xl font-black leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
                {overlayText}
              </h2>
            </header>
          ) : null}

          <div className="min-h-0 flex-1">
            <BrowserFrame url={browserUrl} layout={layout}>
              <FramedScreenshot
                assetUrl={assetUrl}
                imagePromptFallback={imagePromptFallback}
                layer={layer}
                showHighlight={shouldHighlight}
              />
            </BrowserFrame>
          </div>

          <div className="shrink-0 space-y-1.5">
            <DemoNote
              icon={<Target className="h-3 w-3" />}
              label="UI focus"
              value={uiFocusArea}
            />
            <DemoNote
              icon={<MousePointer2 className="h-3 w-3" />}
              label="Cursor"
              value={cursorAction}
            />
            <DemoNote
              icon={<Crosshair className="h-3 w-3" />}
              label="Crop"
              value={cropFocus}
            />
            {professionalPurpose.trim() ? (
              <p className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-[10px] leading-snug text-white/65 backdrop-blur-sm">
                {professionalPurpose}
              </p>
            ) : null}
          </div>

          {narration.trim() ? (
            <footer className="shrink-0">
              <div className="flex gap-2 rounded-xl border border-white/12 bg-black/30 px-2.5 py-2 backdrop-blur-sm">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-500/80 text-white">
                  <Mic className="h-2.5 w-2.5" />
                </div>
                <p className="text-[11px] leading-relaxed text-white/75 italic">
                  &ldquo;{narration}&rdquo;
                </p>
              </div>
            </footer>
          ) : null}

          <div className="flex shrink-0 flex-wrap gap-1">
            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-white/80">
              {layout.replace(/_/g, " ")}
            </span>
            <span className="rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-[8px] text-white/60">
              {layer.zoom_level.toFixed(2)}×
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default PremiumWorkflowScene;
