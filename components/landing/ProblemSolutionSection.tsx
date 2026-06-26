"use client"

import { motion } from "framer-motion"
import {
  ArrowRight,
  Calendar,
  FileSpreadsheet,
  FileText,
  MessageCircle,
  Palette,
  Sparkles,
  X,
  Zap,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  landingContainerClass,
  landingSectionClass,
} from "@/components/landing/landing-layout"

const FRAGMENTED_TOOLS: {
  label: string
  description: string
  icon: LucideIcon
}[] = [
  {
    label: "Excel",
    description: "Client spreadsheets & tracking",
    icon: FileSpreadsheet,
  },
  {
    label: "WhatsApp",
    description: "Endless message threads",
    icon: MessageCircle,
  },
  {
    label: "Google Docs",
    description: "Scattered workout plans",
    icon: FileText,
  },
  {
    label: "Canva",
    description: "Manual content creation",
    icon: Palette,
  },
  {
    label: "Scheduling Tools",
    description: "Separate booking apps",
    icon: Calendar,
  },
]

const SOLUTION_FEATURES = [
  "Client management & communication",
  "Workout & nutrition planning",
  "Progress tracking & check-ins",
  "AI marketing & content creation",
  "Scheduling & video generation",
] as const

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
}

export default function ProblemSolutionSection() {
  return (
    <section className={landingSectionClass}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-rose-600/8 blur-[100px]" />
        <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-indigo-600/12 blur-[100px]" />
      </div>

      <div className={landingContainerClass}>
        <motion.div
          className="mx-auto mb-14 max-w-2xl text-center sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-slate-500">
            The Problem
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Stop Juggling{" "}
            <span className="text-slate-400">Five Different Tools</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-slate-400 sm:text-base">
            If you coach clients for a living, scattered tools are costing you
            time, clients, and revenue.
          </p>
        </motion.div>

        <div className="relative grid gap-6 lg:grid-cols-2 lg:gap-0">
          {/* Problems — left */}
          <motion.div
            className="relative lg:pr-8"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="h-full rounded-2xl border border-rose-500/15 bg-gradient-to-br from-rose-950/40 via-[#0c1019] to-[#06080f] p-6 sm:rounded-3xl sm:p-8 lg:rounded-r-none lg:border-r-0">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 ring-1 ring-rose-400/25">
                  <X className="h-4 w-4 text-rose-400" strokeWidth={2.5} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-rose-400/80">
                    The Problem
                  </p>
                  <h3 className="text-lg font-semibold text-white sm:text-xl">
                    Coaches use
                  </h3>
                </div>
              </div>

              <ul className="space-y-3">
                {FRAGMENTED_TOOLS.map((tool, i) => {
                  const Icon = tool.icon
                  return (
                    <motion.li
                      key={tool.label}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeIn}
                      className="flex items-center gap-4 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3.5 transition-colors hover:border-rose-500/20 hover:bg-rose-500/[0.04]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-white/8">
                        <Icon className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-200">
                          {tool.label}
                        </p>
                        <p className="text-xs text-slate-500">
                          {tool.description}
                        </p>
                      </div>
                      <X
                        className="h-3.5 w-3.5 shrink-0 text-rose-500/50"
                        strokeWidth={2.5}
                      />
                    </motion.li>
                  )
                })}
              </ul>

              <p className="mt-6 text-sm leading-relaxed text-slate-500">
                Context switching, lost data, and hours wasted every week keeping
                everything in sync.
              </p>
            </div>
          </motion.div>

          {/* Divider arrow — desktop */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-[#0c1019] shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-4 ring-[#06080f]">
              <ArrowRight className="h-5 w-5 text-indigo-400" />
            </div>
          </div>

          {/* Solution — right */}
          <motion.div
            className="relative lg:pl-8"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="relative h-full overflow-hidden rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/50 via-[#0c1019] to-violet-950/30 p-6 shadow-[0_24px_80px_rgba(99,102,241,0.12)] sm:rounded-3xl sm:p-8 lg:rounded-l-none lg:border-l-0">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />

              <div className="relative">
                <div className="mb-6 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                    <Sparkles className="h-4 w-4 text-white" />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-400">
                      The Solution
                    </p>
                    <h3 className="text-lg font-semibold text-white sm:text-xl">
                      ZyntixAI
                    </h3>
                  </div>
                </div>

                <p className="text-xl font-bold leading-snug text-white sm:text-2xl">
                  Centralizes{" "}
                  <span className="text-gradient">everything</span> in one
                  platform.
                </p>

                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  One workspace for your entire coaching business — no more
                  tab-switching, no more lost client data.
                </p>

                <ul className="mt-8 space-y-3">
                  {SOLUTION_FEATURES.map((feature, i) => (
                    <motion.li
                      key={feature}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeIn}
                      className="flex items-center gap-3 rounded-xl border border-indigo-400/15 bg-indigo-500/[0.06] px-4 py-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
                        <Zap className="h-3 w-3 text-emerald-400" />
                      </span>
                      <span className="text-sm text-slate-200">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-8 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
                  <div className="flex -space-x-2">
                    {["E", "W", "G", "C", "S"].map((letter, i) => (
                      <span
                        key={letter}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0c1019] bg-slate-700/80 text-[10px] font-semibold text-slate-400"
                        style={{ zIndex: 5 - i }}
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-indigo-400" />
                  <span className="badge-premium shrink-0">
                    <Sparkles className="h-3 w-3" />
                    ZyntixAI
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
