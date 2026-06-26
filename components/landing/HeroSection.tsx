"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  Check,
  Dumbbell,
  Play,
  Sparkles,
  Users,
  Video,
} from "lucide-react"

import {
  LANDING_CTA_FOOTNOTE,
  LANDING_HERO_CTA,
  LANDING_SECONDARY_CTA,
  LANDING_TERTIARY_CTA,
} from "@/components/landing/landing-cta"
import { ZyntixLogoFull } from "@/components/brand/FitCoreLogo"
import {
  landingContainerClass,
  landingCtaPrimaryClass,
  landingCtaSecondaryClass,
} from "@/components/landing/landing-layout"

const TRUST_INDICATORS = [
  { label: "Client Management", icon: Users },
  { label: "Workout Builder", icon: Dumbbell },
  { label: "Marketing AI", icon: Sparkles },
  { label: "Video Generator", icon: Video },
] as const

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
}

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#06080f]" />
        <div className="absolute left-1/2 top-0 h-[600px] w-[1200px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -left-32 top-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/15 blur-[100px]" />
        <div className="absolute -right-32 top-1/3 h-[350px] w-[350px] rounded-full bg-violet-600/15 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className={`${landingContainerClass} pb-12 pt-12 sm:pb-28 sm:pt-24 lg:pb-32 lg:pt-28`}>
        {/* Content */}
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-8 flex justify-center"
          >
            <ZyntixLogoFull size="xl" className="mx-auto" priority />
          </motion.div>

          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-8 inline-flex"
          >
            <span className="badge-premium">
              <Sparkles className="h-3 w-3" />
              7-Day Free Trial
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-[clamp(1.75rem,6vw,4.5rem)] font-bold leading-[1.1] tracking-tight text-white"
          >
            Run Your Entire Coaching Business{" "}
            <span className="text-gradient">With AI</span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mx-auto mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-slate-400 sm:mt-6 sm:text-xl"
          >
            Manage clients, workouts, nutrition, progress, marketing and content
            creation from one powerful platform.
          </motion.p>

          <motion.p
            custom={2.5}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mx-auto mt-3 max-w-xl text-sm font-medium text-indigo-300/90 sm:mt-4 sm:text-base"
          >
            Built for personal trainers, online coaches &amp; gym owners
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-8 flex w-full max-w-sm flex-col items-stretch gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4"
          >
            <Link href={LANDING_HERO_CTA.href} className={`group ${landingCtaPrimaryClass}`}>
              {LANDING_HERO_CTA.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link href={LANDING_SECONDARY_CTA.href} className={landingCtaSecondaryClass}>
              {LANDING_SECONDARY_CTA.label}
            </Link>

            <a href={LANDING_TERTIARY_CTA.href} className={landingCtaSecondaryClass}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                <Play className="h-3.5 w-3.5 fill-current text-white" />
              </span>
              {LANDING_TERTIARY_CTA.label}
            </a>
          </motion.div>

          <motion.p
            custom={3.5}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-3 text-xs text-slate-500 sm:text-sm"
          >
            {LANDING_CTA_FOOTNOTE}
          </motion.p>

          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-8 grid w-full max-w-md grid-cols-2 gap-x-3 gap-y-3 sm:mt-12 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-x-8"
          >
            {TRUST_INDICATORS.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-left text-xs text-slate-400 sm:text-sm"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/25">
                  <Check className="h-3 w-3 text-emerald-400" strokeWidth={3} />
                </span>
                <Icon className="hidden h-3.5 w-3.5 text-indigo-400 sm:block" />
                <span className="min-w-0 leading-snug">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Product preview mockup */}
        <motion.div
          id="product-preview"
          custom={5}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative mx-auto mt-10 max-w-5xl sm:mt-20"
        >
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-b from-indigo-500/20 via-violet-500/10 to-transparent blur-2xl sm:-inset-4" />

          <div className="glass-panel relative overflow-hidden rounded-2xl border-white/12 shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:rounded-3xl">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.03] px-4 py-3 sm:px-5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="mx-auto flex h-7 w-full max-w-xs items-center justify-center rounded-lg bg-white/[0.04] px-3 text-[11px] text-slate-500 sm:max-w-sm">
                app.zyntixai.com/dashboard
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="grid gap-3 p-3 sm:grid-cols-12 sm:gap-5 sm:p-6">
              {/* Sidebar preview */}
              <div className="hidden space-y-2 sm:col-span-3 sm:block">
                <div className="flex items-center gap-2 rounded-xl bg-indigo-500/15 px-3 py-2 ring-1 ring-indigo-400/25">
                  <Dumbbell className="h-3.5 w-3.5 text-indigo-300" />
                  <span className="text-xs font-medium text-indigo-100">
                    Dashboard
                  </span>
                </div>
                {["Clients", "Workouts", "Marketing", "Analytics"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-xl px-3 py-2 text-xs text-slate-500"
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>

              {/* Main content preview */}
              <div className="space-y-4 sm:col-span-9">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Good morning</p>
                    <p className="text-sm font-semibold text-white sm:text-base">
                      Coach Dashboard
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-400/25">
                    AI Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                  {[
                    { label: "Active Clients", value: "48", color: "indigo" },
                    { label: "Workouts", value: "124", color: "blue" },
                    { label: "Check-ins", value: "92%", color: "emerald" },
                    { label: "Content", value: "36", color: "violet" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-white/8 bg-white/[0.03] p-2.5 sm:p-3"
                    >
                      <p className="text-[10px] text-slate-500 sm:text-xs">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-base font-bold text-white sm:text-xl">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="hidden gap-3 sm:grid sm:grid-cols-2">
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="text-xs font-medium text-slate-300">
                        Recent Clients
                      </span>
                    </div>
                    <div className="space-y-2">
                      {["Sarah M.", "James K.", "Emma L."].map((name) => (
                        <div
                          key={name}
                          className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2.5 py-1.5"
                        >
                          <span className="text-xs text-slate-400">{name}</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <BarChart3 className="h-3.5 w-3.5 text-violet-400" />
                      <span className="text-xs font-medium text-slate-300">
                        Weekly Progress
                      </span>
                    </div>
                    <div className="flex h-16 items-end gap-1.5">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-gradient-to-t from-indigo-600/60 to-indigo-400/80"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
