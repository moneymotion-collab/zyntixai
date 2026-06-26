"use client"

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import {
  COACH_DASHBOARD_GRID_GAP,
  DashboardSectionHeader,
} from "@/components/coach-dashboard/coach-dashboard-ui"
import GlassCard from "@/components/ui/glass-card"
import { FEATURE_HIGHLIGHTS } from "@/lib/copy/feature-highlights"

export default function FeatureHighlightCards() {
  return (
    <section aria-label="Why coaches use ZyntixAI" className="mb-0">
      <DashboardSectionHeader
        eyebrow="Platform highlights"
        title="Why coaches use ZyntixAI"
        description="Everything you need to coach clients, grow your brand, and run a modern fitness business — in one premium workspace."
        badge={
          <span className="badge-premium">
            <Sparkles className="h-3 w-3 text-cyan-300" aria-hidden />
            ZyntixAI
          </span>
        }
      />

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 ${COACH_DASHBOARD_GRID_GAP}`}
      >
        {FEATURE_HIGHLIGHTS.map((feature) => {
          const Icon = feature.icon

          return (
            <Link
              key={feature.id}
              href={feature.href}
              className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06080f]"
            >
              <GlassCard
                hover
                as="article"
                className="relative flex h-full flex-col overflow-hidden bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-5 sm:p-6"
              >
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${feature.glow} to-transparent opacity-80 blur-2xl transition-opacity duration-300 group-hover:opacity-100`}
                />

                <div className="relative flex flex-1 flex-col">
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-[transform,box-shadow] duration-200 group-hover:scale-105 group-hover:shadow-[0_8px_24px_rgba(99,102,241,0.15)] ${feature.accent}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>

                  <h3 className="text-base font-bold tracking-tight text-white transition-colors group-hover:text-cyan-50 sm:text-[1.05rem]">
                    {feature.title}
                  </h3>

                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400 transition-colors group-hover:text-slate-300">
                    {feature.description}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300/90 transition-all group-hover:gap-2 group-hover:text-cyan-200">
                    Explore
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </div>
              </GlassCard>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
