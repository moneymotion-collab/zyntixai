"use client"

import { Check, Loader2, Sparkles } from "lucide-react"
import type { MarketingGenerationStage } from "@/lib/marketing/generation-stages"

type MarketingGenerationStagePanelProps = {
  stages: MarketingGenerationStage[]
  activeStep: number
  title?: string
  subtitle?: string
  variant?: "light" | "dark"
}

function stageStatus(index: number, activeStep: number) {
  if (index < activeStep) return "done" as const
  if (index === activeStep) return "current" as const
  return "pending" as const
}

export default function MarketingGenerationStagePanel({
  stages,
  activeStep,
  title = "Marketing AI is working",
  subtitle = "Crafting on-brand content tailored to your audience.",
  variant = "light",
}: MarketingGenerationStagePanelProps) {
  const progress = Math.min(
    100,
    Math.round(((activeStep + 0.35) / stages.length) * 100),
  )
  const currentStage = stages[Math.min(activeStep, stages.length - 1)]
  const isDark = variant === "dark"

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm sm:p-6 ${
        isDark
          ? "border-white/10 bg-gradient-to-br from-violet-500/[0.08] via-[#0b1224] to-cyan-500/[0.06]"
          : "border-violet-100 bg-gradient-to-br from-violet-50 via-white to-cyan-50"
      }`}
      aria-busy="true"
      aria-live="polite"
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${
          isDark ? "bg-violet-500/15" : "bg-violet-300/25"
        }`}
        aria-hidden
      />

      <div className="relative flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
            isDark
              ? "border-violet-400/20 bg-violet-500/15 text-violet-300"
              : "border-violet-200 bg-white text-violet-600"
          }`}
        >
          <Sparkles className="h-5 w-5 animate-pulse" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </p>
          <p
            className={`mt-1 text-sm ${
              isDark ? "text-slate-400" : "text-gray-500"
            }`}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div className="relative mt-5">
        <div
          className={`h-1.5 overflow-hidden rounded-full ${
            isDark ? "bg-white/10" : "bg-violet-100"
          }`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p
          className={`mt-2 text-xs font-medium tabular-nums ${
            isDark ? "text-slate-500" : "text-gray-500"
          }`}
        >
          {progress}% complete
        </p>
      </div>

      <div
        className={`relative mt-4 rounded-xl border px-4 py-3 ${
          isDark
            ? "border-cyan-500/20 bg-cyan-500/[0.06]"
            : "border-cyan-200/80 bg-cyan-50/70"
        }`}
      >
        <p
          className={`flex items-center gap-2 text-sm font-medium ${
            isDark ? "text-cyan-200" : "text-cyan-900"
          }`}
        >
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          <span>{currentStage?.label ?? "Thinking..."}</span>
          <ThinkingDots />
        </p>
      </div>

      <ol className="relative mt-5 space-y-2.5">
        {stages.map((stage, index) => {
          const status = stageStatus(index, activeStep)

          return (
            <li key={stage.id} className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                  status === "done"
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                    : status === "current"
                      ? isDark
                        ? "bg-violet-500 text-white shadow-sm shadow-violet-500/30"
                        : "bg-violet-600 text-white shadow-sm shadow-violet-500/25"
                      : isDark
                        ? "border border-white/10 bg-white/[0.03] text-slate-500"
                        : "border border-gray-200 bg-white text-gray-400"
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
                    ? isDark
                      ? "text-emerald-300"
                      : "text-emerald-700"
                    : status === "current"
                      ? isDark
                        ? "font-medium text-white"
                        : "font-medium text-gray-900"
                      : isDark
                        ? "text-slate-500"
                        : "text-gray-500"
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
