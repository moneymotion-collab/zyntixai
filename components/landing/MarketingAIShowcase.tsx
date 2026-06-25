"use client"

import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Lightbulb,
  PenLine,
  Send,
  Sparkles,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  landingContainerClass,
  landingSectionClass,
} from "@/components/landing/landing-layout"

type WorkflowStep = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  accent: string
  iconBg: string
  glow: string
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: "ideas",
    title: "Generate Ideas",
    description: "AI suggests viral content angles for your niche",
    icon: Lightbulb,
    accent: "text-amber-300",
    iconBg: "from-amber-500/30 to-orange-500/15",
    glow: "from-amber-500/30",
  },
  {
    id: "posts",
    title: "Create Posts",
    description: "Turn ideas into captions, hooks & visuals",
    icon: PenLine,
    accent: "text-violet-300",
    iconBg: "from-violet-500/30 to-purple-500/15",
    glow: "from-violet-500/30",
  },
  {
    id: "schedule",
    title: "Schedule Content",
    description: "Plan your Instagram content calendar",
    icon: Calendar,
    accent: "text-blue-300",
    iconBg: "from-blue-500/30 to-cyan-500/15",
    glow: "from-blue-500/30",
  },
  {
    id: "publish",
    title: "Publish",
    description: "Push live to Instagram Reels",
    icon: Send,
    accent: "text-emerald-300",
    iconBg: "from-emerald-500/30 to-teal-500/15",
    glow: "from-emerald-500/30",
  },
  {
    id: "analyze",
    title: "Analyze Results",
    description: "Track engagement and refine your strategy",
    icon: BarChart3,
    accent: "text-rose-300",
    iconBg: "from-rose-500/30 to-pink-500/15",
    glow: "from-rose-500/30",
  },
]

function WorkflowConnector({
  index,
  vertical = false,
}: {
  index: number
  vertical?: boolean
}) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${
        vertical ? "h-10 w-full py-1" : "h-full w-10 px-1 lg:w-14"
      }`}
      aria-hidden
    >
      {vertical ? (
        <div className="relative flex h-full w-px flex-col items-center">
          <motion.div
            className="absolute inset-0 w-px bg-gradient-to-b from-indigo-500/40 via-violet-500/30 to-transparent"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: reduceMotion ? 0 : 0.5,
              delay: index * 0.12 + 0.2,
              ease: "easeOut",
            }}
            style={{ originY: 0 }}
          />
          <motion.div
            className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]"
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12 + 0.35 }}
          />
        </div>
      ) : (
        <div className="relative flex w-full items-center">
          <motion.div
            className="h-px flex-1 bg-gradient-to-r from-indigo-500/40 via-violet-500/30 to-indigo-500/40"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: reduceMotion ? 0 : 0.5,
              delay: index * 0.12 + 0.2,
              ease: "easeOut",
            }}
            style={{ originX: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12 + 0.4, type: "spring", stiffness: 300 }}
          >
            <ArrowRight className="h-4 w-4 text-violet-400/80" />
          </motion.div>
          {!reduceMotion ? (
            <motion.div
              className="pointer-events-none absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,0.9)]"
              animate={{ left: ["0%", "85%"], opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                delay: index * 0.5 + 1,
                ease: "easeInOut",
              }}
            />
          ) : null}
        </div>
      )}
    </div>
  )
}

function WorkflowStepCard({
  step,
  index,
}: {
  step: WorkflowStep
  index: number
}) {
  const Icon = step.icon

  return (
    <motion.div
      className="group relative flex-1"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.55,
        delay: index * 0.1,
        ease: "easeOut",
      }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-white/18 hover:shadow-[0_16px_48px_rgba(99,102,241,0.15)] sm:p-6">
        <div
          className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${step.glow} to-transparent opacity-50 blur-2xl transition-opacity duration-500 group-hover:opacity-80`}
        />

        <div className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-4 flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-transform duration-300 group-hover:scale-110 ${step.iconBg}`}
            >
              <Icon className={`h-5 w-5 ${step.accent}`} />
            </div>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-bold tabular-nums text-slate-500 ring-1 ring-white/10">
              {index + 1}
            </span>
          </div>

          <h3 className="text-base font-bold tracking-tight text-white transition-colors group-hover:text-indigo-50 sm:text-lg">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400 transition-colors group-hover:text-slate-300">
            {step.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function MarketingAIShowcase() {
  return (
    <section className={landingSectionClass}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[450px] w-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[350px] w-[500px] rounded-full bg-indigo-600/8 blur-[100px]" />
      </div>

      <div className={landingContainerClass}>
        <motion.div
          className="mx-auto mb-14 max-w-2xl text-center sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="badge-premium mb-6 inline-flex">
            <Sparkles className="h-3 w-3" />
            Marketing AI
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            From Idea to{" "}
            <span className="text-gradient">Insight</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            A complete content pipeline — generate, create, schedule, publish,
            and analyze without leaving FitCore AI.
          </p>
        </motion.div>

        {/* Desktop horizontal workflow */}
        <div className="hidden lg:block">
          <div className="flex items-stretch">
            {WORKFLOW_STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-1 items-stretch">
                <WorkflowStepCard step={step} index={index} />
                {index < WORKFLOW_STEPS.length - 1 ? (
                  <WorkflowConnector index={index} />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile / tablet vertical workflow */}
        <div className="lg:hidden">
          <div className="mx-auto max-w-md">
            {WORKFLOW_STEPS.map((step, index) => (
              <div key={step.id}>
                <WorkflowStepCard step={step} index={index} />
                {index < WORKFLOW_STEPS.length - 1 ? (
                  <WorkflowConnector index={index} vertical />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Flow summary pill */}
        <motion.div
          className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-2 sm:mt-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
        >
          {WORKFLOW_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm">
                {step.title}
              </span>
              {index < WORKFLOW_STEPS.length - 1 ? (
                <ArrowRight className="h-3 w-3 text-violet-500/60" />
              ) : null}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
