"use client";

import { Mic } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
  deriveSceneVisualLayer,
  getLayoutBackgroundGradient,
  type SceneLayoutStyle,
} from "@/lib/marketing/scene-visual-layer";
import type { VideoScriptScene } from "@/lib/marketing/video-script-types";

export type ShowcaseScenePreviewProps = {
  scene: VideoScriptScene;
  index: number;
  className?: string;
  /** storyboard = wide SaaS demo card; compact = narrow animatic thumb */
  variant?: "storyboard" | "compact";
  showNarration?: boolean;
};

function BrowserMockupFrame({
  url,
  children,
  layout,
}: {
  url: string;
  children: ReactNode;
  layout: SceneLayoutStyle;
}) {
  const shellClass: Record<SceneLayoutStyle, string> = {
    premium_saas:
      "rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.35),0_0_0_1px_rgba(15,23,42,0.04)]",
    glass_card:
      "rounded-2xl border border-white/25 bg-white/10 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.55)] backdrop-blur-md",
    floating_dashboard:
      "rounded-2xl border border-slate-200/60 bg-white shadow-[0_32px_80px_-28px_rgba(15,23,42,0.45)] -rotate-[0.6deg]",
    split_story:
      "rounded-xl border border-slate-200/80 bg-white shadow-[0_16px_48px_-20px_rgba(15,23,42,0.3)]",
    dark_commercial:
      "rounded-2xl border border-slate-700/80 bg-slate-950 shadow-[0_28px_72px_-24px_rgba(0,0,0,0.75),0_0_0_1px_rgba(99,102,241,0.2)]",
  };

  return (
    <div className={`overflow-hidden ${shellClass[layout]}`}>
      <div className="flex items-center gap-2.5 border-b border-slate-200/80 bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] px-3.5 py-2.5">
        <div className="flex shrink-0 gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] shadow-sm" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] shadow-sm" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] shadow-sm" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 shadow-inner">
          <span className="text-[10px] text-slate-400">🔒</span>
          <span className="truncate text-[11px] font-medium text-slate-500">{url}</span>
        </div>
      </div>
      <div className="relative overflow-hidden bg-slate-950">{children}</div>
    </div>
  );
}

function ScreenshotViewport({
  screenshotUrl,
  layer,
  index,
  aspectClass,
  showHighlight,
}: {
  screenshotUrl: string;
  layer: ReturnType<typeof deriveSceneVisualLayer>;
  index: number;
  aspectClass: string;
  showHighlight: boolean;
}) {
  return (
    <div className={`relative overflow-hidden ${aspectClass}`}>
      <img
        src={screenshotUrl}
        alt={`Scene ${index + 1} product UI`}
        className="h-full w-full object-cover transition-transform duration-700"
        style={{
          objectPosition: `${layer.crop.x * 100}% ${layer.crop.y * 100}%`,
          transform: `scale(${layer.zoom_level})`,
          transformOrigin: `${layer.crop.x * 100}% ${layer.crop.y * 100}%`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-slate-950/5" />
      {showHighlight ? <HighlightBox layer={layer} /> : null}
    </div>
  );
}

function HighlightBox({
  layer,
}: {
  layer: ReturnType<typeof deriveSceneVisualLayer>;
}) {
  const { highlight } = layer;

  return (
    <>
      <div
        className="pointer-events-none absolute rounded-md border-2 border-indigo-400/90 shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_0_24px_rgba(99,102,241,0.35)]"
        style={{
          left: `${highlight.x * 100}%`,
          top: `${highlight.y * 100}%`,
          width: `${highlight.width * 100}%`,
          height: `${highlight.height * 100}%`,
        }}
      >
        <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-indigo-400 shadow-md" />
      </div>
      {highlight.label ? (
        <span
          className="pointer-events-none absolute max-w-[70%] truncate rounded-md border border-indigo-300/50 bg-slate-900/90 px-2 py-0.5 text-[9px] font-semibold text-indigo-100 shadow-lg backdrop-blur-sm"
          style={{
            left: `${(highlight.x + highlight.width / 2) * 100}%`,
            top: `${Math.max(0, highlight.y * 100 - 3)}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          {highlight.label}
        </span>
      ) : null}
    </>
  );
}

function NarrationLine({ narration }: { narration: string }) {
  return (
    <div className="flex gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
        <Mic className="h-3 w-3" />
      </div>
      <p className="text-sm leading-relaxed text-slate-600 italic">&ldquo;{narration}&rdquo;</p>
    </div>
  );
}

export function ShowcaseScenePreview({
  scene,
  index,
  className = "",
  variant = "storyboard",
  showNarration = true,
}: ShowcaseScenePreviewProps) {
  const screenshotUrl = scene.imageUrl || scene.asset_url?.trim() || null;
  const headline = scene.overlay_text?.trim() || scene.text?.trim() || "";
  const narration = scene.narration?.trim() || "";
  const layer = deriveSceneVisualLayer(scene, index);
  const layout = layer.layout_style;
  const background = getLayoutBackgroundGradient(layout, index);
  const browserUrl = `app.fitcorecoach.com/${scene.asset_key ?? scene.workflow_step ?? "dashboard"}`;
  const isCompact = variant === "compact";
  const aspectClass = isCompact ? "aspect-[4/3]" : "aspect-[16/10]";
  const showHighlight = Boolean(
    scene.highlight_area?.trim() || scene.ui_focus_area?.trim(),
  );

  const containerClass = isCompact
    ? "mx-auto w-full max-w-[280px]"
    : "w-full";

  if (!screenshotUrl) {
    return (
      <div
        className={`flex flex-col gap-3 overflow-hidden ${containerClass} ${className}`}
      >
        <div className="flex flex-col overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 shadow-inner">
          <div className={`flex flex-col justify-center gap-4 p-5 sm:p-6 ${isCompact ? "min-h-[280px]" : "min-h-[220px]"}`}>
            {headline ? (
              <h4 className="text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
                {headline}
              </h4>
            ) : null}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-600" />
                  <span className="h-2 w-2 rounded-full bg-slate-600" />
                  <span className="h-2 w-2 rounded-full bg-slate-600" />
                </div>
                <div className="h-5 flex-1 rounded-md bg-white/10" />
              </div>
              <div className={`flex items-center justify-center bg-slate-900/50 ${aspectClass}`}>
                <p className="px-4 text-center text-xs text-slate-400">
                  Screenshot pending — generate images to preview
                </p>
              </div>
            </div>
          </div>
        </div>
        {showNarration && narration ? <NarrationLine narration={narration} /> : null}
      </div>
    );
  }

  const frameStyle: CSSProperties = { background };

  const headlineBlock = headline ? (
    <h4
      className={
        isCompact
          ? "text-center text-lg font-black leading-[1.08] tracking-tight text-white drop-shadow-md"
          : "text-2xl font-bold leading-[1.12] tracking-tight text-white sm:text-[1.65rem]"
      }
    >
      {headline}
    </h4>
  ) : null;

  return (
    <div className={`flex flex-col gap-3 ${containerClass} ${className}`}>
      <div
        className={`relative overflow-hidden rounded-2xl ring-1 ring-black/10 ${
          isCompact ? "" : "shadow-[0_24px_80px_-32px_rgba(15,23,42,0.45)]"
        }`}
        style={frameStyle}
      >
        {layer.blur_background ? (
          <>
            <img
              src={screenshotUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-[0.35] saturate-125"
            />
            <div className="pointer-events-none absolute inset-0 bg-slate-950/40" />
          </>
        ) : null}

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 20%, rgba(99,102,241,0.18) 0%, transparent 55%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

        <div className={`relative ${isCompact ? "p-3" : "p-5 sm:p-6"}`}>
          {layout === "split_story" ? (
            <div className="flex flex-col gap-4">
              {headlineBlock ? <div className="px-1">{headlineBlock}</div> : null}
              <BrowserMockupFrame url={browserUrl} layout={layout}>
                <ScreenshotViewport
                  screenshotUrl={screenshotUrl}
                  layer={layer}
                  index={index}
                  aspectClass={aspectClass}
                  showHighlight={showHighlight}
                />
              </BrowserMockupFrame>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {headlineBlock ? <div className="px-0.5">{headlineBlock}</div> : null}
              <BrowserMockupFrame url={browserUrl} layout={layout}>
                <ScreenshotViewport
                  screenshotUrl={screenshotUrl}
                  layer={layer}
                  index={index}
                  aspectClass={aspectClass}
                  showHighlight={showHighlight}
                />
              </BrowserMockupFrame>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
              {layer.layout_style.replace(/_/g, " ")}
            </span>
            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[10px] font-medium text-white/75 backdrop-blur-sm">
              {layer.zoom_level.toFixed(2)}× zoom
            </span>
            {layer.crop_focus ? (
              <span className="max-w-[52%] truncate rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-[10px] text-white/65 backdrop-blur-sm">
                {layer.crop_focus}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {showNarration && narration ? <NarrationLine narration={narration} /> : null}
    </div>
  );
}

export default ShowcaseScenePreview;
