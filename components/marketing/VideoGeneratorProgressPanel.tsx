"use client"

import { motion } from "framer-motion"
import { Check, Clapperboard, Film, ImageIcon, Loader2 } from "lucide-react"
import type { VideoGenerationPhase } from "@/lib/marketing/generation-stages"
import type { MarketingGenerationStage } from "@/lib/marketing/generation-stages"
import type { VideoScriptScene } from "@/lib/marketing/video-script-types"

type VideoGeneratorProgressPanelProps = {
  phase: VideoGenerationPhase
  stages: MarketingGenerationStage[]
  activeStep: number
  title?: string
  subtitle?: string
  scenes?: VideoScriptScene[]
  activeSceneIndex?: number
  pipelineActiveStep?: number
}

function stageStatus(index: number, activeStep: number) {
  if (index < activeStep) return "done" as const
  if (index === activeStep) return "current" as const
  return "pending" as const
}

type StoryboardFrameModel = {
  index: number
  scene: VideoScriptScene | undefined
  imageUrl: string | null | undefined
  status: "pending" | "current" | "done"
}

function buildStoryboardFrame(
  index: number,
  phase: VideoGenerationPhase,
  scenes: VideoScriptScene[],
  activeStep: number,
  activeSceneIndex: number,
  stages: MarketingGenerationStage[],
  frameCount: number,
): StoryboardFrameModel {
  const scene = scenes[index]
  const imageUrl = scene?.imageUrl ?? scene?.image_url ?? scene?.asset_url

  if (phase === "script") {
    const revealed = index <= Math.min(activeStep + 1, frameCount - 1)
    return {
      index,
      scene,
      imageUrl: null,
      status: revealed
        ? index <= activeStep
          ? "done"
          : "current"
        : "pending",
    }
  }

  if (phase === "visuals") {
    return {
      index,
      scene,
      imageUrl,
      status:
        index < activeSceneIndex
          ? "done"
          : index === activeSceneIndex
            ? "current"
            : "pending",
    }
  }

  if (phase === "render") {
    const renderProgressRatio = (activeStep + 0.5) / Math.max(stages.length, 1)
    const doneThrough = Math.floor(renderProgressRatio * frameCount)
    return {
      index,
      scene,
      imageUrl,
      status:
        index < doneThrough
          ? "done"
          : index === doneThrough
            ? "current"
            : "pending",
    }
  }

  return {
    index,
    scene,
    imageUrl,
    status: "pending",
  }
}

function sceneLabel(scene: VideoScriptScene | undefined, index: number) {
  return (
    scene?.story_beat?.trim() ||
    scene?.module?.trim() ||
    scene?.overlay_text?.trim() ||
    scene?.text?.trim().slice(0, 42) ||
    `Scene ${index + 1}`
  )
}

function StoryboardFrame({
  index,
  status,
  label,
  imageUrl,
}: {
  index: number
  status: "pending" | "current" | "done"
  label: string
  imageUrl?: string | null
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: "easeOut" }}
      className={`group relative shrink-0 overflow-hidden rounded-xl border ${
        status === "current"
          ? "border-cyan-400/60 shadow-[0_0_24px_-4px_rgba(34,211,238,0.45)]"
          : status === "done"
            ? "border-emerald-500/40"
            : "border-white/10"
      }`}
      style={{ width: "9.5rem" }}
    >
      <div className="relative aspect-[9/16] bg-gradient-to-br from-slate-900 via-slate-950 to-black">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover opacity-90"
          />
        ) : (
          <>
            <div className="absolute inset-0 storyboard-shimmer bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.06)_50%,transparent_75%)] bg-[length:200%_100%]" />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2.5">
              <div className="mb-2 flex items-center gap-1.5">
                {status === "current" ? (
                  <Loader2 className="h-3 w-3 animate-spin text-cyan-300" />
                ) : status === "done" ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <ImageIcon className="h-3 w-3 text-slate-500" />
                )}
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            </div>
          </>
        )}

        {status === "current" ? (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-cyan-400/50"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
      </div>

      <p className="truncate border-t border-white/5 bg-black/40 px-2 py-1.5 text-[10px] font-medium text-slate-300">
        {label}
      </p>
    </motion.div>
  )
}

export default function VideoGeneratorProgressPanel({
  phase,
  stages,
  activeStep,
  title,
  subtitle,
  scenes = [],
  activeSceneIndex = 0,
  pipelineActiveStep,
}: VideoGeneratorProgressPanelProps) {
  const frameCount = scenes.length > 0 ? scenes.length : 4
  const stageCount = Math.max(stages.length, 1)
  const frames: StoryboardFrameModel[] = Array.from(
    { length: frameCount },
    (_, index) =>
      buildStoryboardFrame(
        index,
        phase,
        scenes,
        activeStep,
        activeSceneIndex,
        stages,
        frameCount,
      ),
  )

  const sceneProgress =
    phase === "visuals"
      ? Math.min(
          100,
          Math.round(((activeSceneIndex + 0.4) / frameCount) * 100),
        )
      : null

  const mainProgress = Math.min(
    100,
    Math.round(((activeStep + 0.35) / stageCount) * 100),
  )

  const renderProgress =
    phase === "render"
      ? Math.min(100, Math.round(((activeStep + 0.5) / stageCount) * 100))
      : null

  const pipelineStep = pipelineActiveStep ?? (phase === "script" ? 0 : phase === "visuals" ? 2 : 3)
  const currentStage = stages[Math.min(activeStep, stageCount - 1)]

  const phaseIcon =
    phase === "render" ? Film : phase === "visuals" ? ImageIcon : Clapperboard

  const PhaseIcon = phaseIcon

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-[#0a1020] to-slate-950 p-5 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)] sm:p-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 shadow-sm">
          <PhaseIcon className="h-5 w-5 animate-pulse" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">
            {title ??
              (phase === "script"
                ? "Building your video storyboard"
                : phase === "visuals"
                  ? "Generating scene visuals"
                  : "Rendering your video")}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {subtitle ??
              (phase === "script"
                ? "Crafting hook, scenes, and image prompts from your brief."
                : phase === "visuals"
                  ? "AI is creating visuals for each storyboard frame."
                  : "Composing scenes into your final export.")}
          </p>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Storyboard
          </p>
          {phase === "visuals" ? (
            <p className="text-xs font-medium tabular-nums text-cyan-300/90">
              Scene {Math.min(activeSceneIndex + 1, frameCount)} of {frameCount}
            </p>
          ) : null}
        </div>

        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scrollbar-thin">
          {frames.map(({ index, scene, imageUrl, status }) => (
            <StoryboardFrame
              key={index}
              index={index}
              status={status}
              label={sceneLabel(scene, index)}
              imageUrl={imageUrl}
            />
          ))}
        </div>
      </div>

      {phase === "visuals" && sceneProgress !== null ? (
        <div className="relative mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-400">Scene progress</span>
            <span className="tabular-nums text-cyan-300">{sceneProgress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
              animate={{ width: `${sceneProgress}%` }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </div>
        </div>
      ) : null}

      <div className="relative mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-400">
            {phase === "render" ? "Render progress" : "Generation progress"}
          </span>
          <span className="tabular-nums text-slate-400">
            {(phase === "render" ? renderProgress : mainProgress) ?? mainProgress}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className={`h-full rounded-full ${
              phase === "render"
                ? "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400"
                : "bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500"
            }`}
            animate={{
              width: `${(phase === "render" ? renderProgress : mainProgress) ?? mainProgress}%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="relative mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-medium text-cyan-100">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          <span>{currentStage?.label ?? "Thinking..."}</span>
          <ThinkingDots />
        </p>
      </div>

      <div className="relative mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Pipeline
        </p>
        <ol className="grid gap-2 sm:grid-cols-2">
          {[
            { id: "hook", label: "Generating hook..." },
            { id: "scenes", label: "Creating scenes..." },
            { id: "visuals", label: "Generating visuals..." },
            { id: "render", label: "Rendering final video..." },
          ].map((step, index) => {
            const status =
              index < pipelineStep
                ? "done"
                : index === pipelineStep
                  ? "current"
                  : "pending"

            return (
              <li key={step.id} className="flex items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                    status === "done"
                      ? "bg-emerald-500 text-white"
                      : status === "current"
                        ? "bg-cyan-500 text-white shadow-sm shadow-cyan-500/30"
                        : "border border-white/10 bg-white/[0.03] text-slate-500"
                  }`}
                >
                  {status === "done" ? (
                    <Check className="h-3 w-3" />
                  ) : status === "current" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`text-xs ${
                    status === "done"
                      ? "text-emerald-300/90"
                      : status === "current"
                        ? "font-medium text-white"
                        : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <ol className="relative mt-4 space-y-2">
        {stages.map((stage, index) => {
          const status = stageStatus(index, activeStep)

          return (
            <li key={stage.id} className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                  status === "done"
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                    : status === "current"
                      ? "bg-violet-500 text-white shadow-sm shadow-violet-500/30"
                      : "border border-white/10 bg-white/[0.03] text-slate-500"
                }`}
              >
                {status === "done" ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : status === "current" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`text-sm transition-colors duration-300 ${
                  status === "done"
                    ? "text-emerald-300"
                    : status === "current"
                      ? "font-medium text-white"
                      : "text-slate-500"
                }`}
              >
                {stage.label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function ThinkingDots() {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-1 w-1 animate-pulse rounded-full bg-current opacity-70"
          style={{ animationDelay: `${index * 180}ms` }}
        />
      ))}
    </span>
  )
}
