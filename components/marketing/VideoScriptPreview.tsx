"use client"

import type { ComponentType, ReactNode } from "react"
import { Player } from "@remotion/player"
import {
  ArrowRightLeft,
  Calendar,
  Clapperboard,
  Clock,
  Download,
  Film,
  Hash,
  ImageIcon,
  LayoutTemplate,
  Loader2,
  Megaphone,
  MessageSquare,
  Music2,
  Mic,
  Sparkles,
  UserRound,
  MousePointer2,
  Target,
  Lightbulb,
  Route,
  Layers,
  Scan,
} from "lucide-react"
import {
  isRenderCompleted,
  isRenderProcessing,
} from "@/lib/video/render-pipeline"
import RenderOutputStatus from "@/components/marketing/RenderOutputStatus"
import FitCoreVideoTemplate from "@/components/video/FitCoreVideoTemplate"
import PremiumWorkflowScene, {
  type PremiumWorkflowSceneProps,
} from "@/components/video/PremiumWorkflowScene"
import {
  buildFitCorePlayerProps,
  fitCorePreviewDurationInFrames,
} from "@/lib/video/build-render-props"
import { ShowcaseScenePreview } from "@/components/marketing/ShowcaseScenePreview"
import type { MarketingVideo, VideoScript, VideoScriptScene } from "@/lib/marketing/video-script-types"
import {
  GENERATOR_VIDEO_STYLE_LABELS,
  isGeneratorVideoStyle,
} from "@/lib/marketing/video-styles"
import {
  APP_SHOWCASE_SCENE_BEATS,
  getShowcaseBeatForIndex,
} from "@/lib/marketing/showcase-workflow-beats"
import { isAppShowcaseStyle } from "@/lib/marketing/video-styles"
import { isWorkflowDirectorStyle } from "@/lib/marketing/app-workflow-director"

type VideoScriptPreviewProps = {
  script: VideoScript
  videoProject?: MarketingVideo
  mascotImageUrl?: string | null
  thumbnailUrl?: string | null
  videoUrl?: string | null
  loading: boolean
  renderingVideo?: boolean
  generatingImages?: boolean
  workflowType?: string | null
  workflowSummary?: string | null
  onGenerateImages: () => void
  onGenerateVoiceover?: () => void
  onRenderVideo: () => void
  onRenderFinalVideo?: () => void
  renderingFinalVideo?: boolean
  onAddToCalendar?: () => void
  addingToCalendar?: boolean
  onSchedule?: () => void
  scheduling?: boolean
  generatingVoiceover?: boolean
}

function PreviewField({
  label,
  children,
  className = "",
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      {children}
    </div>
  )
}

function SectionCard({
  title,
  icon: Icon,
  children,
  className = "",
  dark = false,
}: {
  title: string
  icon: ComponentType<{ className?: string }>
  children: ReactNode
  className?: string
  dark?: boolean
}) {
  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm ${
        dark
          ? "border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]"
          : "border-slate-200/80 bg-white"
      } ${className}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${
            dark ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-950 text-white"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <h3 className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
          {title}
        </h3>
      </div>
      {children}
    </section>
  )
}

function getStyleLabel(style: string): string {
  return isGeneratorVideoStyle(style)
    ? GENERATOR_VIDEO_STYLE_LABELS[style]
    : style
}

function formatWorkflowTypeLabel(workflowType: string): string {
  return workflowType
    .replace(/_workflow$/, "")
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function isShowcaseDemoStyle(style: string): boolean {
  return isAppShowcaseStyle(style) || style === "saas_demo"
}

function isWorkflowStoryboardScript(script: VideoScript): boolean {
  return (
    isWorkflowDirectorStyle(String(script.style)) ||
    Boolean(script.workflow_type?.trim())
  )
}

const IMAGE_STATUS_STYLES: Record<
  string,
  { label: string; className: string; dotClassName: string }
> = {
  pending: {
    label: "Pending",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    dotClassName: "bg-slate-400",
  },
  generating: {
    label: "Generating",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    dotClassName: "bg-amber-500 animate-pulse",
  },
  ready: {
    label: "Ready",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dotClassName: "bg-emerald-500",
  },
  failed: {
    label: "Failed",
    className: "border-red-200 bg-red-50 text-red-700",
    dotClassName: "bg-red-500",
  },
}

function resolveSceneImageStatus(
  scene: VideoScriptScene,
  generatingImages: boolean,
): string {
  if (generatingImages && scene.image_prompt?.trim() && !scene.imageUrl) {
    return "generating"
  }
  if (scene.image_status?.trim()) {
    return scene.image_status.trim().toLowerCase()
  }
  if (scene.imageUrl || scene.asset_url?.trim()) {
    return "ready"
  }
  return "pending"
}

function SceneImageStatusBadge({ status }: { status: string }) {
  const config = IMAGE_STATUS_STYLES[status] ?? IMAGE_STATUS_STYLES.pending

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClassName}`} />
      {config.label}
    </span>
  )
}

function DirectorNote({
  icon: Icon,
  label,
  value,
  variant = "default",
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  variant?: "default" | "narration" | "purpose"
}) {
  const base =
    variant === "narration"
      ? "rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3"
      : variant === "purpose"
        ? "rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"
        : "rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3"

  return (
    <div className={base}>
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p
        className={`text-sm leading-relaxed ${
          variant === "narration"
            ? "italic text-slate-700"
            : variant === "purpose"
              ? "text-slate-600"
              : "font-medium text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function FitCoreTemplatePlayer({
  script,
  videoProject,
  borderRadius = 16,
  className = "",
}: {
  script: VideoScript
  videoProject?: MarketingVideo
  borderRadius?: number
  className?: string
}) {
  const inputProps = buildFitCorePlayerProps(script, videoProject ?? null)
  const durationInFrames = fitCorePreviewDurationInFrames(inputProps)

  return (
    <div className={`mx-auto w-full max-w-[440px] ${className}`}>
      <Player
        component={FitCoreVideoTemplate}
        inputProps={inputProps}
        durationInFrames={durationInFrames}
        compositionWidth={1080}
        compositionHeight={1920}
        fps={30}
        controls
        style={{
          width: "100%",
          aspectRatio: "9 / 16",
          borderRadius,
          overflow: "hidden",
          boxShadow: "0 24px 64px -24px rgba(15,23,42,0.45)",
        }}
      />
    </div>
  )
}

function mapSceneToPremiumWorkflowProps(
  scene: VideoScriptScene,
  index: number,
): PremiumWorkflowSceneProps {
  const assetUrl = scene.imageUrl?.trim() || scene.asset_url?.trim() || ""
  const uiFocusArea =
    scene.ui_focus_area?.trim() || "Primary action button"

  return {
    assetUrl,
    imagePromptFallback:
      scene.image_prompt?.trim() || scene.visual?.trim() || "",
    overlayText: scene.overlay_text?.trim() || scene.text?.trim() || "",
    narration: scene.narration?.trim() || "",
    uiFocusArea,
    cursorAction:
      scene.cursor_action?.trim() || "Highlight the primary UI element",
    professionalPurpose: scene.professional_purpose?.trim() || "",
    cropFocus:
      scene.crop_focus?.trim() || uiFocusArea || scene.asset_key?.trim() || "",
    highlightArea: scene.highlight_area?.trim() || uiFocusArea,
    zoomLevel: scene.zoom_level ?? 1.12,
    layoutStyle: scene.layout_style?.trim() || "premium_saas",
    assetKey: scene.asset_key?.trim(),
    sceneIndex: index,
  }
}

function WorkflowSceneFrame({
  scene,
  index,
  imageStatus,
  style,
}: {
  scene: VideoScriptScene
  index: number
  imageStatus: string
  style: string
}) {
  if (isShowcaseDemoStyle(style)) {
    return (
      <PremiumWorkflowScene
        {...mapSceneToPremiumWorkflowProps(scene, index)}
      />
    )
  }

  if (scene.imageUrl || scene.asset_url?.trim()) {
    return <ShowcaseScenePreview scene={scene} index={index} variant="compact" />
  }

  const headline = scene.overlay_text?.trim() || scene.text?.trim() || ""

  return (
    <div className="mx-auto flex w-full max-w-[280px] flex-col overflow-hidden rounded-[1.25rem] border border-dashed border-slate-300 bg-gradient-to-br from-slate-100 via-white to-cyan-50/30 shadow-inner">
      <div className="border-b border-slate-200/80 bg-white/90 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            {imageStatus === "generating" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Asset pending
            </p>
            <p className="text-xs font-medium text-slate-600">
              {headline || "Generate images to preview screenshot"}
            </p>
          </div>
        </div>
      </div>
      <div className="flex aspect-[9/16] flex-col justify-end p-4">
        {headline ? (
          <p className="text-lg font-black leading-tight text-slate-900">{headline}</p>
        ) : null}
        <p className="mt-2 line-clamp-6 text-xs leading-relaxed text-slate-500">
          {scene.image_prompt?.trim() || scene.visual || "No visual direction yet."}
        </p>
      </div>
    </div>
  )
}

function WorkflowSceneStoryboardCard({
  scene,
  index,
  style,
  generatingImages,
  totalScenes,
}: {
  scene: VideoScriptScene
  index: number
  style: string
  generatingImages: boolean
  totalScenes: number
}) {
  const showcaseBeat =
    style === "app_showcase" ? getShowcaseBeatForIndex(index) : null
  const appShowcaseModule =
    scene.module ?? showcaseBeat?.module ?? APP_SHOWCASE_SCENE_BEATS[index]?.beat
  const imageStatus = resolveSceneImageStatus(scene, generatingImages)
  const stepLabel =
    scene.workflow_step?.trim() ||
    scene.asset_key?.trim() ||
    appShowcaseModule ||
    `Scene ${index + 1}`

  return (
    <article className="relative pl-0 md:pl-8">
      <div className="absolute bottom-0 left-[11px] top-0 hidden w-px bg-gradient-to-b from-cyan-500/50 via-slate-200 to-transparent md:block" />
      <div className="absolute left-0 top-8 hidden h-6 w-6 items-center justify-center rounded-full border-2 border-cyan-500 bg-white text-[10px] font-bold text-cyan-700 shadow-sm md:flex">
        {index + 1}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_40px_-16px_rgba(15,23,42,0.18)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              Scene {String(index + 1).padStart(2, "0")}
            </span>
            <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-200">
              {stepLabel.replace(/_/g, " ")}
            </span>
            {scene.story_beat ?? showcaseBeat?.storyBeat ? (
              <span className="hidden rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-slate-400 sm:inline">
                {scene.story_beat ?? showcaseBeat?.storyBeat}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <SceneImageStatusBadge status={imageStatus} />
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white">
              <Clock className="h-3 w-3" />
              {scene.duration}s
            </span>
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="border-b border-slate-100 bg-[#fafbfc] p-5 xl:border-b-0 xl:border-r">
            <WorkflowSceneFrame
              scene={scene}
              index={index}
              imageStatus={imageStatus}
              style={style}
            />
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg bg-slate-100 px-2.5 py-2 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Zoom
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-700">
                  {scene.zoom_level ?? "1.10"}×
                </p>
              </div>
              <div className="rounded-lg bg-slate-100 px-2.5 py-2 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Blur BG
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-700">
                  {scene.blur_background === false ? "Off" : "On"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-100 px-2.5 py-2 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Animation
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-700">
                  {scene.animation_type?.replace(/_/g, " ") || "—"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-100 px-2.5 py-2 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Duration
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-700">
                  {scene.animation_duration ?? scene.duration ?? "—"}s
                </p>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg bg-slate-100 px-2.5 py-2 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Camera
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-700">
                  {scene.camera_motion || "—"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-100 px-2.5 py-2 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Transition
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-700">
                  {scene.transition || "—"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-100 px-2.5 py-2 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Caption
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-700 capitalize">
                  {scene.caption_position || "—"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-100 px-2.5 py-2 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Highlight
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-700 capitalize">
                  {scene.highlight_style || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-5">
            <DirectorNote
              icon={Target}
              label="UI focus area"
              value={scene.ui_focus_area?.trim() || "Primary action button"}
            />
            <DirectorNote
              icon={Scan}
              label="Crop focus"
              value={scene.crop_focus?.trim() || "Center on primary UI action"}
            />
            <DirectorNote
              icon={Layers}
              label="Layout style"
              value={scene.layout_style?.replace(/_/g, " ") || "premium saas"}
            />
            <DirectorNote
              icon={MousePointer2}
              label="Highlight area"
              value={scene.highlight_area?.trim() || scene.ui_focus_area?.trim() || "Primary action button"}
            />
            <DirectorNote
              icon={MousePointer2}
              label="Cursor action"
              value={scene.cursor_action?.trim() || "Highlight the active UI element"}
            />
            <DirectorNote
              icon={Lightbulb}
              label="Professional purpose"
              value={
                scene.professional_purpose?.trim() ||
                "Demonstrate product value in this workflow step."
              }
              variant="purpose"
            />

            {isAppShowcaseStyle(style) &&
            (scene.character_action ?? showcaseBeat?.characterAction) ? (
              <DirectorNote
                icon={UserRound}
                label="Mascot action"
                value={scene.character_action ?? showcaseBeat?.characterAction ?? ""}
              />
            ) : null}
          </div>
        </div>

        {index < totalScenes - 1 ? (
          <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50/80 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            <ArrowRightLeft className="h-3 w-3" />
            {scene.transition || "Cut"} → next beat
          </div>
        ) : null}
      </div>
    </article>
  )
}

function ScenePreviewCard({
  scene,
  index,
  style,
  generatingImages,
}: {
  scene: VideoScriptScene
  index: number
  style: string
  generatingImages: boolean
}) {
  const showcaseBeat =
    style === "app_showcase" ? getShowcaseBeatForIndex(index) : null
  const imageStatus = resolveSceneImageStatus(scene, generatingImages)
  const displayOverlay = scene.overlay_text?.trim() || scene.text

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-xl bg-slate-950 px-2.5 text-xs font-bold text-white">
          {String(index + 1).padStart(2, "0")}
        </span>
        <SceneImageStatusBadge status={imageStatus} />
      </div>
      <div className="p-5">
        <PreviewField label="Scene text">
          <p className="text-base font-semibold text-slate-900">{displayOverlay}</p>
        </PreviewField>
        <PreviewField label="Visual" className="mt-4">
          <p className="text-sm text-slate-600">{scene.visual || "—"}</p>
        </PreviewField>
      </div>
    </article>
  )
}

function PipelineActions({
  videoProject,
  loading,
  renderingVideo = false,
  generatingImages,
  generatingVoiceover = false,
  hasSceneImages,
  isOnCalendar,
  onGenerateImages,
  onRenderVideo,
  onRenderFinalVideo,
  renderingFinalVideo = false,
  onAddToCalendar,
  addingToCalendar,
  onSchedule,
  scheduling = false,
}: {
  videoProject?: MarketingVideo
  loading: boolean
  renderingVideo?: boolean
  generatingImages: boolean
  generatingVoiceover?: boolean
  hasSceneImages: boolean
  isOnCalendar: boolean
  onGenerateImages: () => void
  onRenderVideo: () => void
  onRenderFinalVideo?: () => void
  renderingFinalVideo?: boolean
  onAddToCalendar?: () => void
  addingToCalendar?: boolean
  onSchedule?: () => void
  scheduling?: boolean
}) {
  if (!videoProject) return null

  const finalStatus = videoProject.final_render_status?.trim().toLowerCase() || ""
  const canRenderFinal = Boolean(videoProject.id) && Boolean(onRenderFinalVideo)

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onGenerateImages}
        disabled={generatingImages || loading || !videoProject.id}
        className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-50"
      >
        {generatingImages ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
        Generate Scene Images
      </button>
      <button
        type="button"
        onClick={onRenderVideo}
        disabled={loading || renderingVideo || !videoProject.id}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 disabled:opacity-50"
      >
        {renderingVideo ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Film className="h-4 w-4" />
        )}
        Render Remotion video
      </button>
      {canRenderFinal ? (
        <button
          type="button"
          onClick={onRenderFinalVideo}
          disabled={loading || renderingVideo || renderingFinalVideo || !videoProject.id}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900 transition hover:border-emerald-300 disabled:opacity-50"
        >
          {renderingFinalVideo ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Film className="h-4 w-4" />
          )}
          Render Final Video
          {finalStatus ? (
            <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
              {finalStatus}
            </span>
          ) : null}
        </button>
      ) : null}
      {onAddToCalendar ? (
        <button
          type="button"
          onClick={onAddToCalendar}
          disabled={loading || addingToCalendar || !videoProject.id}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-900 transition hover:border-cyan-300 disabled:opacity-50"
        >
          {addingToCalendar ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Calendar className="h-4 w-4" />
          )}
          {isOnCalendar ? "Open draft" : "Save as Draft"}
        </button>
      ) : null}
      {onSchedule ? (
        <button
          type="button"
          onClick={onSchedule}
          disabled={loading || scheduling || !videoProject.id}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 transition hover:border-amber-300 disabled:opacity-50"
        >
          {scheduling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
          Add to Schedule
        </button>
      ) : null}
    </div>
  )
}

function VoiceoverPreview({
  voiceoverUrl,
  voiceoverScript,
  voiceName,
}: {
  voiceoverUrl: string
  voiceoverScript?: string | null
  voiceName: string
}) {
  return (
    <SectionCard title="Generated Voiceover" icon={Mic}>
      <audio
        src={voiceoverUrl}
        controls
        preload="metadata"
        className="w-full rounded-xl border border-slate-200 bg-white"
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-600">
          Voice: <span className="font-semibold text-slate-900">{voiceName}</span>
        </p>
        <a
          href={voiceoverUrl}
          download
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-slate-300"
        >
          <Download className="h-4 w-4" />
          Download
        </a>
      </div>

      {voiceoverScript?.trim() ? (
        <PreviewField label="Script preview" className="mt-4">
          <details className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <summary className="cursor-pointer text-xs font-semibold text-slate-700">
              View script
            </summary>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {voiceoverScript.trim()}
            </p>
          </details>
        </PreviewField>
      ) : null}
    </SectionCard>
  )
}

function VoiceoverSection({
  videoProject,
  generatingVoiceover = false,
  onGenerateVoiceover,
}: {
  videoProject?: MarketingVideo
  generatingVoiceover?: boolean
  onGenerateVoiceover?: () => void
}) {
  if (!videoProject) return null

  const status = videoProject.voiceover_status?.trim().toLowerCase() || "pending"
  const voiceoverUrl = videoProject.voiceover_url?.trim() || ""
  const voiceoverScript = videoProject.voiceover_script ?? null

  const isReady = status === "ready" && Boolean(voiceoverUrl)
  const isGenerating = generatingVoiceover || status === "generating"
  const isPending = status === "pending" || !videoProject.voiceover_status?.trim()

  if (!isReady && !isGenerating && !isPending) {
    // Failed or unknown status: don't show this section unless ready/pending/generating.
    return null
  }

  if (isReady) {
    return (
      <VoiceoverPreview
        voiceoverUrl={voiceoverUrl}
        voiceoverScript={voiceoverScript}
        voiceName="OpenAI TTS (auto)"
      />
    )
  }

  if (isGenerating) {
    return (
      <SectionCard title="Generated Voiceover" icon={Mic}>
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-amber-700" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-900">
              Generating voiceover…
            </p>
            <p className="text-xs text-amber-800">
              This usually takes a few seconds. The audio player will appear when it’s ready.
            </p>
          </div>
        </div>
      </SectionCard>
    )
  }

  if (isPending && onGenerateVoiceover) {
    return (
      <SectionCard title="Generated Voiceover" icon={Mic}>
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">
            No voiceover generated yet.
          </p>
          <button
            type="button"
            onClick={onGenerateVoiceover}
            disabled={generatingVoiceover}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-900 transition hover:border-violet-300 disabled:opacity-50"
          >
            {generatingVoiceover ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            Generate Voiceover
          </button>
        </div>
      </SectionCard>
    )
  }

  return null
}

function WorkflowStoryboardPreview({
  script,
  videoProject,
  mascotImageUrl,
  thumbnailUrl,
  videoUrl,
  loading,
  renderingVideo = false,
  generatingImages,
  workflowType,
  workflowSummary,
  onGenerateImages,
  onGenerateVoiceover,
  onRenderVideo,
  onRenderFinalVideo,
  renderingFinalVideo,
  onAddToCalendar,
  addingToCalendar,
  generatingVoiceover,
  onSchedule,
  scheduling,
}: VideoScriptPreviewProps) {
  const resolvedWorkflowType =
    workflowType?.trim() || script.workflow_type?.trim() || ""
  const resolvedWorkflowSummary =
    workflowSummary?.trim() || script.workflow_summary?.trim() || ""
  const resolvedThumbnailUrl = thumbnailUrl ?? videoProject?.thumbnail_url ?? null
  const resolvedVideoUrl = videoUrl ?? videoProject?.video_url ?? null
  const previewRenderStatus =
    renderingVideo || isRenderProcessing(videoProject?.render_status)
      ? "processing"
      : videoProject?.render_status
  const finalRenderStatus =
    renderingFinalVideo || isRenderProcessing(videoProject?.final_render_status)
      ? "processing"
      : videoProject?.final_render_status
  const finalVideoUrl = videoProject?.final_render_url?.trim() || ""
  const hasSceneImages = script.scenes.some(
    (scene) => scene.imageUrl || scene.asset_url?.trim(),
  )
  const isOnCalendar = Boolean(videoProject?.content_post_id)
  const totalDuration =
    script.scenes.reduce((total, scene) => total + scene.duration, 0) + 4
  const hasFinalVideo = isRenderCompleted(finalRenderStatus, finalVideoUrl)

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-100 via-white to-slate-50 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.25)]">
      <div className="border-b border-slate-800/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-6 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Workflow Intelligence
              </span>
              {resolvedWorkflowType ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                  <Route className="h-3.5 w-3.5" />
                  {formatWorkflowTypeLabel(resolvedWorkflowType)}
                </span>
              ) : null}
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-300">
                {getStyleLabel(String(script.style))}
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              SaaS commercial storyboard
            </h2>
            {resolvedWorkflowSummary ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                {resolvedWorkflowSummary}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {script.scenes.length} scenes
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              ~{totalDuration}s
            </span>
            {script.musicMood ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                <Music2 className="h-3 w-3" />
                {script.musicMood}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300/80">
            Opening hook
          </p>
          <p className="mt-2 text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
            {script.hook}
          </p>
        </div>

        {videoProject ? (
          <div className="mt-5">
            <PipelineActions
              videoProject={videoProject}
              loading={loading}
              renderingVideo={renderingVideo}
              generatingImages={generatingImages ?? false}
              generatingVoiceover={generatingVoiceover ?? false}
              hasSceneImages={hasSceneImages}
              isOnCalendar={isOnCalendar}
              onGenerateImages={onGenerateImages}
              onRenderVideo={onRenderVideo}
              onRenderFinalVideo={onRenderFinalVideo}
              renderingFinalVideo={renderingFinalVideo}
              onAddToCalendar={onAddToCalendar}
              addingToCalendar={addingToCalendar}
              onSchedule={onSchedule}
              scheduling={scheduling}
            />
          </div>
        ) : null}
      </div>

      <div className="border-b border-slate-200/80 bg-slate-950 px-6 py-8">
        <div className="mx-auto max-w-[440px]">
          <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300/80">
            Live platform preview
          </p>
          <FitCoreTemplatePlayer
            script={script}
            videoProject={videoProject}
            borderRadius={20}
          />
          <p className="mt-3 text-center text-xs text-slate-400">
            Full app layout — sidebar, modules &amp; content visible in every scene
          </p>
        </div>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        <aside className="space-y-4">
          {resolvedVideoUrl || previewRenderStatus ? (
            <RenderOutputStatus
              title="Rendered video"
              status={previewRenderStatus}
              videoUrl={resolvedVideoUrl}
              renderError={videoProject?.render_error}
              renderStartedAt={videoProject?.render_started_at}
              renderFinishedAt={videoProject?.render_finished_at}
              processingLabel="Rendering Remotion preview…"
            />
          ) : null}
          {finalRenderStatus || finalVideoUrl ? (
            <>
              <RenderOutputStatus
                title="Final render"
                status={finalRenderStatus}
                videoUrl={finalVideoUrl}
                renderError={videoProject?.final_render_error}
                renderStartedAt={videoProject?.render_started_at}
                renderFinishedAt={videoProject?.render_finished_at}
                processingLabel="Rendering final video…"
              />
              {hasFinalVideo ? (
                <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                  <a
                    href={finalVideoUrl}
                    download
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-slate-300"
                  >
                    <Download className="h-4 w-4" />
                    Download final video
                  </a>
                  {onAddToCalendar ? (
                    <button
                      type="button"
                      onClick={onAddToCalendar}
                      disabled={loading || addingToCalendar || !videoProject?.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-900 transition hover:border-cyan-300 disabled:opacity-50"
                    >
                      {addingToCalendar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Calendar className="h-4 w-4" />
                      )}
                      Save as Draft
                    </button>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}
        </aside>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {script.mascot ? (
              <SectionCard title="Brand mascot" icon={UserRound} dark>
                <div className="flex gap-4">
                  {mascotImageUrl ? (
                    <img
                      src={mascotImageUrl}
                      alt={script.mascot.name}
                      className="h-24 w-24 shrink-0 rounded-2xl border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5">
                      <UserRound className="h-8 w-8 text-slate-500" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-white">{script.mascot.name}</p>
                    <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-slate-400">
                      {script.mascot.description}
                    </p>
                    {script.mascot.personality ? (
                      <p className="mt-2 text-xs text-cyan-300/90">
                        Voice: {script.mascot.personality}
                      </p>
                    ) : null}
                  </div>
                </div>
              </SectionCard>
            ) : null}

            <SectionCard title="Cover thumbnail" icon={LayoutTemplate}>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-lg">
                <div className="relative aspect-[9/16] max-h-[320px] w-full">
                  {resolvedThumbnailUrl ? (
                    <img
                      src={resolvedThumbnailUrl}
                      alt="Video thumbnail"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
                      <LayoutTemplate className="h-10 w-10 text-slate-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-lg font-black uppercase leading-tight tracking-tight text-white">
                      {script.thumbnail_title}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-cyan-200">
                      {script.thumbnail_text}
                    </p>
                  </div>
                </div>
              </div>
              {script.thumbnail_visual ? (
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  {script.thumbnail_visual}
                </p>
              ) : null}
            </SectionCard>
          </div>

          <VoiceoverSection
            videoProject={videoProject}
            generatingVoiceover={generatingVoiceover}
            onGenerateVoiceover={onGenerateVoiceover}
          />

          <section>
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Clapperboard className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Scene storyboard</h3>
                <p className="text-xs text-slate-500">
                  Premium product demo beats · {script.scenes.length} frames
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {script.scenes.map((scene, index) => (
                <WorkflowSceneStoryboardCard
                  key={`${scene.workflow_step ?? scene.text}-${index}`}
                  scene={scene}
                  index={index}
                  style={String(script.style)}
                  generatingImages={generatingImages ?? false}
                  totalScenes={script.scenes.length}
                />
              ))}
            </div>
          </section>

          <SectionCard title="Animated Preview" icon={Film}>
            <FitCoreTemplatePlayer
              script={script}
              videoProject={videoProject}
              borderRadius={20}
              className="max-w-[480px]"
            />
          </SectionCard>

          <SectionCard title="Closing & publish" icon={MessageSquare}>
            <PreviewField label="CTA">
              <p className="text-lg font-bold text-slate-950">{script.cta}</p>
            </PreviewField>
            {script.caption ? (
              <PreviewField label="Caption" className="mt-4">
                <p className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-sm leading-relaxed text-slate-700">
                  {script.caption}
                </p>
              </PreviewField>
            ) : null}
            {script.hashtags?.length ? (
              <PreviewField label="Hashtags" className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {script.hashtags.map((tag) => {
                    const normalized = tag.startsWith("#") ? tag : `#${tag}`
                    return (
                      <span
                        key={normalized}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                      >
                        <Hash className="h-3 w-3 text-slate-400" />
                        {normalized.replace(/^#/, "")}
                      </span>
                    )
                  })}
                </div>
              </PreviewField>
            ) : null}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

export default function VideoScriptPreview(props: VideoScriptPreviewProps) {
  const { script, generatingImages = false, generatingVoiceover = false } = props

  if (isWorkflowStoryboardScript(script)) {
    return <WorkflowStoryboardPreview {...props} />
  }

  const hasSceneImages = script.scenes.some((scene) => scene.imageUrl)
  const resolvedVideoUrl = props.videoUrl ?? props.videoProject?.video_url ?? null
  const previewRenderStatus =
    props.renderingVideo || isRenderProcessing(props.videoProject?.render_status)
      ? "processing"
      : props.videoProject?.render_status
  const finalRenderStatus =
    props.renderingFinalVideo ||
    isRenderProcessing(props.videoProject?.final_render_status)
      ? "processing"
      : props.videoProject?.final_render_status
  const resolvedThumbnailUrl =
    props.thumbnailUrl ?? props.videoProject?.thumbnail_url ?? null
  const isOnCalendar = Boolean(props.videoProject?.content_post_id)
  const totalDuration =
    script.scenes.reduce((total, scene) => total + scene.duration, 0) + 4
  const finalVideoUrl = props.videoProject?.final_render_url?.trim() || ""
  const hasFinalVideo = isRenderCompleted(finalRenderStatus, finalVideoUrl)

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50/80 shadow-sm">
      <div className="border-b border-gray-200/80 bg-white px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
              Script preview
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-950">
              Generated video script
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
              <Sparkles className="h-3.5 w-3.5" />
              {getStyleLabel(String(script.style))}
            </span>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
              ~{totalDuration}s
            </span>
          </div>
        </div>
        <div className="mt-5">
          <PipelineActions
            videoProject={props.videoProject}
            loading={props.loading}
            renderingVideo={props.renderingVideo}
            generatingImages={generatingImages}
            generatingVoiceover={generatingVoiceover}
            hasSceneImages={hasSceneImages}
            isOnCalendar={isOnCalendar}
            onGenerateImages={props.onGenerateImages}
            onRenderVideo={props.onRenderVideo}
            onRenderFinalVideo={props.onRenderFinalVideo}
            renderingFinalVideo={props.renderingFinalVideo}
            onAddToCalendar={props.onAddToCalendar}
            addingToCalendar={props.addingToCalendar}
            onSchedule={props.onSchedule}
            scheduling={props.scheduling}
          />
        </div>
      </div>

      <div className="border-b border-gray-200/80 bg-slate-950 px-6 py-8">
        <div className="mx-auto max-w-[440px]">
          <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300/80">
            Live platform preview
          </p>
          <FitCoreTemplatePlayer
            script={script}
            videoProject={props.videoProject}
            borderRadius={20}
          />
        </div>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        <aside className="space-y-4">
          {props.mascotImageUrl ? (
            <SectionCard title="Mascot asset" icon={UserRound}>
              <img
                src={props.mascotImageUrl}
                alt="Generated mascot"
                className="w-full rounded-xl border border-gray-200 object-cover"
              />
            </SectionCard>
          ) : null}
          {resolvedVideoUrl || previewRenderStatus ? (
            <RenderOutputStatus
              title="Rendered video"
              status={previewRenderStatus}
              videoUrl={resolvedVideoUrl}
              renderError={props.videoProject?.render_error}
              renderStartedAt={props.videoProject?.render_started_at}
              renderFinishedAt={props.videoProject?.render_finished_at}
              processingLabel="Rendering Remotion preview…"
            />
          ) : null}
          {finalRenderStatus || finalVideoUrl ? (
            <>
              <RenderOutputStatus
                title="Final render"
                status={finalRenderStatus}
                videoUrl={finalVideoUrl}
                renderError={props.videoProject?.final_render_error}
                renderStartedAt={props.videoProject?.render_started_at}
                renderFinishedAt={props.videoProject?.render_finished_at}
                processingLabel="Rendering final video…"
              />
              {hasFinalVideo ? (
                <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                  <a
                    href={finalVideoUrl}
                    download
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-gray-300"
                  >
                    <Download className="h-4 w-4" />
                    Download final video
                  </a>
                  {props.onAddToCalendar ? (
                    <button
                      type="button"
                      onClick={props.onAddToCalendar}
                      disabled={props.loading || props.addingToCalendar || !props.videoProject?.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-900 transition hover:border-cyan-300 disabled:opacity-50"
                    >
                      {props.addingToCalendar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Calendar className="h-4 w-4" />
                      )}
                      Save as Draft
                    </button>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}
        </aside>

        <div className="space-y-4">
          <SectionCard title="Opening" icon={Megaphone}>
            <PreviewField label="Hook">
              <p className="text-2xl font-bold leading-tight tracking-tight text-gray-950">
                {script.hook}
              </p>
            </PreviewField>
          </SectionCard>

          {script.mascot ? (
            <SectionCard title="Mascot" icon={UserRound}>
              <PreviewField label="Mascot name">
                <p className="text-base font-semibold text-gray-900">
                  {script.mascot.name}
                </p>
              </PreviewField>
            </SectionCard>
          ) : null}

          <SectionCard title="Thumbnail" icon={LayoutTemplate}>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-950">
              <div className="relative aspect-[9/16] max-h-[420px] w-full">
                {resolvedThumbnailUrl ? (
                  <img
                    src={resolvedThumbnailUrl}
                    alt="Generated thumbnail"
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-2xl font-black uppercase text-white">
                    {script.thumbnail_title}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-blue-200">
                    {script.thumbnail_text}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          <VoiceoverSection
            videoProject={props.videoProject}
            generatingVoiceover={generatingVoiceover}
            onGenerateVoiceover={props.onGenerateVoiceover}
          />

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-gray-900">Scene breakdown</h3>
            </div>
            <div className="space-y-4">
              {script.scenes.map((scene, index) => (
                <ScenePreviewCard
                  key={`${scene.text}-${index}`}
                  scene={scene}
                  index={index}
                  style={String(script.style)}
                  generatingImages={generatingImages}
                />
              ))}
            </div>
          </section>

          <SectionCard title="Closing" icon={MessageSquare}>
            <PreviewField label="CTA">
              <p className="text-lg font-bold text-gray-950">{script.cta}</p>
            </PreviewField>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
