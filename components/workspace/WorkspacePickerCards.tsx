"use client"

import { Building2, Sparkles } from "lucide-react"
import { FITCORE_AI_BRAND_NAME } from "@/lib/brand/fitcore-ai"
import type { WorkspaceMode } from "@/lib/workspace/workspace-mode"
import { demoMemberCountPhrase } from "@/lib/demo/demo-copy"

type WorkspacePickerCardsProps = {
  selected: WorkspaceMode
  onSelect: (mode: WorkspaceMode) => void
  onContinue?: (mode: WorkspaceMode) => void
  loading?: boolean
  loadingMode?: WorkspaceMode | null
  compact?: boolean
}

const CARD_COPY = {
  live: {
    title: "My Workspace",
    description:
      "Your real gym — members, plans, marketing, and progress you manage day to day.",
    features: ["Your members & data", "Full coach tools", "Start fresh or continue"],
    icon: Building2,
    accent: "from-indigo-500/20 to-blue-500/10 border-indigo-400/25",
    iconAccent: "from-indigo-500/30 to-blue-500/20 text-indigo-200",
    cta: "Open My Workspace",
  },
  demo: {
    title: "Explore Demo Workspace",
    description: `A fully populated ${FITCORE_AI_BRAND_NAME} environment with ${demoMemberCountPhrase()}, workouts, marketing, and analytics.`,
    features: [`${demoMemberCountPhrase()}`, "Marketing & video samples", "Safe to explore & reset"],
    icon: Sparkles,
    accent: "from-cyan-500/20 via-indigo-500/10 to-violet-500/15 border-cyan-400/30",
    iconAccent: "from-cyan-500/30 to-violet-500/20 text-cyan-200",
    cta: "Explore Demo",
  },
} as const

export default function WorkspacePickerCards({
  selected,
  onSelect,
  onContinue,
  loading = false,
  loadingMode = null,
  compact = false,
}: WorkspacePickerCardsProps) {
  return (
    <div
      className={
        compact
          ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
          : "grid grid-cols-1 gap-5 sm:grid-cols-2"
      }
    >
      {(["live", "demo"] as const).map((mode) => {
        const copy = CARD_COPY[mode]
        const Icon = copy.icon
        const isSelected = selected === mode
        const isLoading = loading && loadingMode === mode

        return (
          <button
            key={mode}
            type="button"
            onClick={() => onSelect(mode)}
            className={[
              "group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 sm:p-6",
              "bg-gradient-to-br backdrop-blur-xl",
              copy.accent,
              isSelected
                ? "ring-2 ring-white/20 shadow-[0_16px_48px_rgba(99,102,241,0.18)] scale-[1.01]"
                : "opacity-90 hover:opacity-100 hover:scale-[1.005]",
            ].join(" ")}
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.04] blur-2xl" />

            <div className="relative flex items-start gap-4">
              <div
                className={[
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
                  copy.iconAccent,
                ].join(" ")}
              >
                <Icon className="h-6 w-6" aria-hidden />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {mode === "demo" ? "Product demo" : "Production"}
                </p>
                <h3 className="mt-1 text-lg font-bold tracking-tight text-white sm:text-xl">
                  {copy.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300/90">
                  {copy.description}
                </p>

                <ul className="mt-4 space-y-1.5">
                  {copy.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-xs text-slate-400 sm:text-sm"
                    >
                      <span className="h-1 w-1 shrink-0 rounded-full bg-cyan-400/80" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isSelected && onContinue ? (
                  <p className="mt-5 text-sm font-semibold text-white">
                    {isLoading ? "Setting up…" : "Selected"}
                  </p>
                ) : null}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
