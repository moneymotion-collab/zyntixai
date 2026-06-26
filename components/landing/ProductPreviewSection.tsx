"use client"

import { motion } from "framer-motion"
import {
  BarChart3,
  Calendar,
  Dumbbell,
  LineChart,
  Megaphone,
  Sparkles,
  TrendingUp,
  Users,
  Utensils,
  Video,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  landingContainerClass,
  landingSectionClass,
} from "@/components/landing/landing-layout"

type FeatureCallout = {
  label: string
  description: string
  icon: LucideIcon
  accent: string
  iconBg: string
  position: string
  floatDelay: number
}

const FEATURE_CALLOUTS: FeatureCallout[] = [
  {
    label: "Members",
    description: "Manage every client in one place",
    icon: Users,
    accent: "text-indigo-300",
    iconBg: "from-indigo-500/25 to-indigo-600/10",
    position:
      "left-0 top-[8%] -translate-x-2 sm:-translate-x-6 lg:-translate-x-10",
    floatDelay: 0,
  },
  {
    label: "Workouts",
    description: "Build & assign training plans",
    icon: Dumbbell,
    accent: "text-blue-300",
    iconBg: "from-blue-500/25 to-blue-600/10",
    position:
      "right-0 top-[12%] translate-x-2 sm:translate-x-6 lg:translate-x-10",
    floatDelay: 0.4,
  },
  {
    label: "Nutrition",
    description: "Personalized meal planning",
    icon: Utensils,
    accent: "text-emerald-300",
    iconBg: "from-emerald-500/25 to-emerald-600/10",
    position:
      "left-0 top-[42%] -translate-x-2 sm:-translate-x-8 lg:-translate-x-12",
    floatDelay: 0.8,
  },
  {
    label: "Progress",
    description: "Track goals & check-ins",
    icon: TrendingUp,
    accent: "text-cyan-300",
    iconBg: "from-cyan-500/25 to-cyan-600/10",
    position:
      "right-0 top-[46%] translate-x-2 sm:translate-x-8 lg:translate-x-12",
    floatDelay: 1.2,
  },
  {
    label: "Marketing AI",
    description: "Content & campaigns on autopilot",
    icon: Sparkles,
    accent: "text-violet-300",
    iconBg: "from-violet-500/25 to-violet-600/10",
    position:
      "left-0 bottom-[10%] -translate-x-2 sm:-translate-x-6 lg:-translate-x-10",
    floatDelay: 1.6,
  },
  {
    label: "Video Generator",
    description: "Create scroll-stopping reels",
    icon: Video,
    accent: "text-rose-300",
    iconBg: "from-rose-500/25 to-rose-600/10",
    position:
      "right-0 bottom-[8%] translate-x-2 sm:translate-x-6 lg:translate-x-10",
    floatDelay: 2,
  },
]

function FloatingCallout({
  label,
  description,
  icon: Icon,
  accent,
  iconBg,
  position,
  floatDelay,
}: FeatureCallout) {
  return (
    <motion.div
      className={`absolute z-20 hidden w-52 lg:block xl:w-56 ${position}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: floatDelay * 0.15, ease: "easeOut" }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 4 + floatDelay * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatDelay,
        }}
        className="rounded-2xl border border-white/12 bg-[#0c1019]/90 p-4 shadow-[0_16px_48px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-xl"
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${iconBg} ring-1 ring-white/10`}
          >
            <Icon className={`h-4 w-4 ${accent}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
              {description}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function MobileCalloutGrid() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:mt-8 sm:grid-cols-3 lg:hidden">
      {FEATURE_CALLOUTS.map(
        ({ label, description, icon: Icon, accent, iconBg }) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm"
          >
            <div
              className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${iconBg}`}
            >
              <Icon className={`h-3.5 w-3.5 ${accent}`} />
            </div>
            <p className="text-xs font-semibold text-white">{label}</p>
            <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
              {description}
            </p>
          </div>
        ),
      )}
    </div>
  )
}

export default function ProductPreviewSection() {
  return (
    <section className={landingSectionClass}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </div>

      <div className={`${landingContainerClass} lg:py-32`}>
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-indigo-400">
            Platform Overview
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Everything Coaches Need{" "}
            <span className="text-gradient">In One Platform</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            From client onboarding to AI-powered content — your entire coaching
            workflow, unified in a single premium dashboard.
          </p>
        </motion.div>

        <div className="relative mx-auto mt-10 max-w-6xl sm:mt-20">
          {FEATURE_CALLOUTS.map((callout) => (
            <FloatingCallout key={callout.label} {...callout} />
          ))}

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          >
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-b from-indigo-500/15 via-violet-500/8 to-transparent blur-3xl" />

            <div className="glass-panel relative overflow-hidden rounded-2xl border-white/12 shadow-[0_32px_100px_rgba(0,0,0,0.55)] sm:rounded-3xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-3 border-b border-white/8 bg-white/[0.03] px-5 py-3.5">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="mx-auto flex h-8 w-full max-w-md items-center justify-center rounded-lg bg-white/[0.04] px-4 text-xs text-slate-500">
                  app.zyntixai.com/dashboard
                </div>
              </div>

              <div className="grid min-h-0 sm:min-h-[480px] sm:grid-cols-12">
                {/* Sidebar */}
                <div className="hidden border-r border-white/6 bg-white/[0.02] p-4 sm:col-span-2 sm:block lg:col-span-2">
                  <div className="mb-6 flex items-center gap-2 px-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                      <Dumbbell className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-white">
                      ZyntixAI
                    </span>
                  </div>
                  <nav className="space-y-1">
                    {[
                      { label: "Dashboard", active: true, icon: BarChart3 },
                      { label: "Members", active: false, icon: Users },
                      { label: "Workouts", active: false, icon: Dumbbell },
                      { label: "Nutrition", active: false, icon: Utensils },
                      { label: "Progress", active: false, icon: LineChart },
                      { label: "Marketing", active: false, icon: Megaphone },
                    ].map(({ label, active, icon: Icon }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs ${
                          active
                            ? "bg-indigo-500/15 font-medium text-indigo-200 ring-1 ring-indigo-400/20"
                            : "text-slate-500"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </div>
                    ))}
                  </nav>
                </div>

                {/* Main area */}
                <div className="space-y-4 p-4 sm:col-span-10 sm:space-y-5 sm:p-6 lg:col-span-10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Monday, June 22</p>
                      <h3 className="text-lg font-semibold text-white sm:text-xl">
                        Coach Command Center
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-400/25">
                        AI Active
                      </span>
                      <span className="hidden rounded-full bg-white/[0.04] px-3 py-1 text-[11px] text-slate-400 ring-1 ring-white/8 sm:inline-flex">
                        48 clients
                      </span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "Active Members", value: "48", delta: "+3" },
                      { label: "Workout Plans", value: "124", delta: "+12" },
                      { label: "Check-in Rate", value: "92%", delta: "+5%" },
                      { label: "Content Posted", value: "36", delta: "+8" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5 sm:p-4"
                      >
                        <p className="text-[10px] text-slate-500 sm:text-xs">
                          {stat.label}
                        </p>
                        <div className="mt-1.5 flex items-end justify-between">
                          <p className="text-xl font-bold text-white sm:text-2xl">
                            {stat.value}
                          </p>
                          <span className="text-[10px] font-medium text-emerald-400">
                            {stat.delta}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Content grid */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {/* Members panel */}
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 sm:col-span-1">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="text-xs font-medium text-slate-300">
                            Members
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">Today</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { name: "Sarah Mitchell", status: "Checked in" },
                          { name: "James Kowalski", status: "Workout due" },
                          { name: "Emma Laurent", status: "Plan updated" },
                        ].map(({ name, status }) => (
                          <div
                            key={name}
                            className="flex items-center gap-2.5 rounded-lg bg-white/[0.03] px-2.5 py-2"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/20 text-[10px] font-semibold text-indigo-200">
                              {name.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs text-slate-300">
                                {name}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {status}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress chart */}
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 sm:col-span-1">
                      <div className="mb-3 flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="text-xs font-medium text-slate-300">
                          Progress
                        </span>
                      </div>
                      <div className="flex h-28 items-end gap-1.5">
                        {[35, 55, 42, 70, 58, 85, 72, 90, 68, 95, 80, 88].map(
                          (h, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-sm bg-gradient-to-t from-cyan-600/50 to-cyan-400/70"
                              style={{ height: `${h}%` }}
                            />
                          ),
                        )}
                      </div>
                      <p className="mt-2 text-[10px] text-slate-500">
                        Avg. client adherence — last 12 weeks
                      </p>
                    </div>

                    {/* Marketing / Video panel */}
                    <div className="space-y-3 sm:col-span-1">
                      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                          <span className="text-xs font-medium text-slate-300">
                            Marketing AI
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-400">
                          3 campaigns ready to publish
                        </p>
                        <div className="mt-2 flex gap-1.5">
                          {["IG", "TT", "YT"].map((p) => (
                            <span
                              key={p}
                              className="rounded-md bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-300"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Video className="h-3.5 w-3.5 text-rose-400" />
                          <span className="text-xs font-medium text-slate-300">
                            Video Generator
                          </span>
                        </div>
                        <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-rose-500/10 to-violet-500/10 ring-1 ring-white/8">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                            <Video className="h-3.5 w-3.5 text-rose-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15">
                        <Dumbbell className="h-4 w-4 text-blue-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-300">
                          Upper Body Strength
                        </p>
                        <p className="text-[10px] text-slate-500">
                          6 exercises · 45 min · 12 clients assigned
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
                        <Utensils className="h-4 w-4 text-emerald-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-300">
                          High Protein Meal Plan
                        </p>
                        <p className="text-[10px] text-slate-500">
                          2,100 kcal · 8 clients · Updated today
                        </p>
                      </div>
                      <Calendar className="hidden h-3.5 w-3.5 text-slate-600 sm:block" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <MobileCalloutGrid />
        </div>
      </div>
    </section>
  )
}
