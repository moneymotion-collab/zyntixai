"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import DemoVideoPlayer from "@/components/landing/DemoVideoPlayer"
import {
  DEMO_FEATURE_HIGHLIGHTS,
  DEMO_SHOWCASE_MODULES,
  DEMO_VIDEO_SUBHEADLINE,
} from "@/components/landing/landing-demo-video"
import {
  LANDING_CTA_FOOTNOTE,
  LANDING_HERO_CTA,
  LANDING_SECONDARY_CTA,
} from "@/components/landing/landing-cta"
import {
  landingContainerClass,
  landingCtaPrimaryClass,
  landingCtaSecondaryClass,
  landingHeadingClass,
  landingSectionClass,
  landingSubheadingClass,
} from "@/components/landing/landing-layout"

export default function DemoVideoSection() {
  return (
    <section
      id="demo-video"
      className={`${landingSectionClass} scroll-mt-20 sm:scroll-mt-24`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/12 blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      </div>

      <div className={`${landingContainerClass} max-w-6xl`}>
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="badge-premium mb-6 inline-flex">
            <Sparkles className="h-3 w-3" />
            Product Demo
          </span>
          <h2 className={landingHeadingClass}>
            See <span className="text-gradient">ZyntixAI</span> in Action
          </h2>
          <p className={landingSubheadingClass}>{DEMO_VIDEO_SUBHEADLINE}</p>
        </motion.div>

        <motion.div
          className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-12 lg:gap-8"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        >
          <div className="relative lg:col-span-7 xl:col-span-8">
            <div className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-b from-indigo-500/20 via-violet-500/10 to-transparent blur-2xl lg:-inset-4" />
            <div className="glass-panel relative overflow-hidden rounded-2xl border-white/12 shadow-[0_32px_100px_rgba(0,0,0,0.55)] sm:rounded-3xl">
              <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.03] px-4 py-2.5 sm:px-5 sm:py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="mx-auto truncate text-[11px] text-slate-500 sm:text-xs">
                  ZyntixAI — Product Demo
                </span>
              </div>
              <DemoVideoPlayer />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
              {DEMO_SHOWCASE_MODULES.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300"
                >
                  <Icon className="h-3.5 w-3.5 text-indigo-400" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-3 lg:col-span-5 lg:justify-center xl:col-span-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              What you&apos;ll see
            </p>
            {DEMO_FEATURE_HIGHLIGHTS.map(
              ({ label, description, icon: Icon, accent }) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-white/10 ${accent}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </aside>
        </motion.div>

        <motion.div
          className="mx-auto mt-10 max-w-xl text-center sm:mt-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
        >
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link href={LANDING_HERO_CTA.href} className={landingCtaPrimaryClass}>
              {LANDING_HERO_CTA.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={LANDING_SECONDARY_CTA.href}
              className={landingCtaSecondaryClass}
            >
              {LANDING_SECONDARY_CTA.label}
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500 sm:text-sm">
            {LANDING_CTA_FOOTNOTE}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
