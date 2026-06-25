"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react"
import type { DemoProductTourStep } from "@/lib/tour/demo-product-tour"

type SpotlightRect = {
  top: number
  left: number
  width: number
  height: number
}

type DemoProductTourProps = {
  step: DemoProductTourStep
  currentStep: number
  totalSteps: number
  targetRect: SpotlightRect | null
  canGoPrevious: boolean
  isLastStep: boolean
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
}

export default function DemoProductTour({
  step,
  currentStep,
  totalSteps,
  targetRect,
  canGoPrevious,
  isLastStep,
  onNext,
  onPrevious,
  onSkip,
}: DemoProductTourProps) {
  const Icon = step.icon
  const padding = 10

  const spotlight = targetRect
    ? {
        top: Math.max(8, targetRect.top - padding),
        left: Math.max(8, targetRect.left - padding),
        width: targetRect.width + padding * 2,
        height: targetRect.height + padding * 2,
      }
    : null

  return (
    <AnimatePresence>
      <motion.div
        key="demo-product-tour"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[9998]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-tour-title"
        aria-describedby="demo-tour-description"
      >
        <div className="absolute inset-0" aria-hidden />

        <div className="pointer-events-none absolute inset-0">
          {spotlight ? (
            <>
              <div
                className="absolute rounded-2xl bg-black/10"
                style={{
                  top: 0,
                  left: 0,
                  right: 0,
                  height: spotlight.top,
                  background: "rgba(0,0,0,0.72)",
                }}
              />
              <div
                className="absolute"
                style={{
                  top: spotlight.top,
                  left: 0,
                  width: spotlight.left,
                  height: spotlight.height,
                  background: "rgba(0,0,0,0.72)",
                }}
              />
              <div
                className="absolute"
                style={{
                  top: spotlight.top,
                  left: spotlight.left + spotlight.width,
                  right: 0,
                  height: spotlight.height,
                  background: "rgba(0,0,0,0.72)",
                }}
              />
              <div
                className="absolute"
                style={{
                  top: spotlight.top + spotlight.height,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.72)",
                }}
              />
              <div
                className="absolute rounded-2xl border-2 border-cyan-400/70 shadow-[0_0_0_4px_rgba(6,182,212,0.12),0_0_32px_rgba(6,182,212,0.25)]"
                style={{
                  top: spotlight.top,
                  left: spotlight.left,
                  width: spotlight.width,
                  height: spotlight.height,
                }}
              />
            </>
          ) : (
            <div className="absolute inset-0 bg-black/72 backdrop-blur-[2px]" />
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="pointer-events-auto fixed inset-x-4 bottom-6 z-[9999] mx-auto max-w-xl sm:inset-x-auto sm:right-8 sm:bottom-8 sm:left-auto"
        >
          <div className="relative overflow-hidden rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-[#0c1220]/95 via-[#0a101c]/98 to-[#111827]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 left-8 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/25 to-indigo-500/20 text-cyan-200">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300/90">
                      Guided Product Tour
                    </p>
                    <p className="text-xs text-slate-400">
                      Step {currentStep} of {totalSteps}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onSkip}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                  aria-label="Skip tour"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 flex gap-1.5">
                {Array.from({ length: totalSteps }, (_, index) => (
                  <span
                    key={index}
                    className={[
                      "h-1 flex-1 rounded-full transition-colors",
                      index < currentStep
                        ? "bg-gradient-to-r from-cyan-400 to-indigo-400"
                        : "bg-white/10",
                    ].join(" ")}
                  />
                ))}
              </div>

              <h2
                id="demo-tour-title"
                className="text-xl font-bold tracking-tight text-white sm:text-2xl"
              >
                {step.title}
              </h2>
              <p
                id="demo-tour-description"
                className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-[15px]"
              >
                {step.description}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onSkip}
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                >
                  Skip Tour
                </button>

                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onPrevious}
                    disabled={!canGoPrevious}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(6,182,212,0.25)] transition hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLastStep ? (
                      <>
                        <Sparkles className="h-4 w-4" aria-hidden />
                        Finish Tour
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
