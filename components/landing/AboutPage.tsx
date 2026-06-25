import Link from "next/link"
import { ArrowRight, Sparkles, Target, Users, Zap } from "lucide-react"
import MarketingPageShell from "@/components/landing/MarketingPageShell"
import {
  LANDING_FOOTER_CTA,
  LANDING_SECONDARY_CTA,
} from "@/components/landing/landing-cta"
import {
  landingCtaPrimaryClass,
  landingCtaSecondaryClass,
} from "@/components/landing/landing-layout"
import { FITCORE_AI_BRAND_NAME, FITCORE_AI_DESCRIPTION } from "@/lib/brand/fitcore-ai"

const VISION_POINTS = [
  {
    title: "One workspace",
    description:
      "Replace fragmented tools with a single command center for coaching delivery and growth.",
    icon: Zap,
  },
  {
    title: "Coach-first design",
    description:
      "Built around real workflows — clients, programming, progress, and marketing — not generic CRM features.",
    icon: Users,
  },
  {
    title: "AI where it helps",
    description:
      "Practical AI for content, campaigns, and video — so coaches spend less time on admin and more time coaching.",
    icon: Sparkles,
  },
  {
    title: "Scale with confidence",
    description:
      "From solo coaches to multi-coach teams, with clear plans as your business grows.",
    icon: Target,
  },
] as const

export default function AboutPage() {
  return (
    <MarketingPageShell
      badge="About"
      title={`What is ${FITCORE_AI_BRAND_NAME}?`}
      description={FITCORE_AI_DESCRIPTION}
    >
      <div className="space-y-6">
        <div className="glass-panel rounded-2xl border-white/12 p-5 sm:p-8">
          <h2 className="text-lg font-bold text-white sm:text-xl">Our mission</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
            We believe fitness coaches should spend their time transforming
            lives — not fighting spreadsheets, disconnected apps, and content
            burnout. {FITCORE_AI_BRAND_NAME} exists to give coaches one
            intelligent platform for client delivery, progress tracking, and
            business growth.
          </p>
        </div>

        <div className="glass-panel rounded-2xl border-white/12 p-5 sm:p-8">
          <h2 className="text-lg font-bold text-white sm:text-xl">Who it&apos;s for</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-400 sm:text-base">
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
              Personal trainers managing in-person and hybrid clients
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
              Online coaches delivering remote programming and nutrition
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
              Gym owners and studio operators standardizing coach workflows
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
              Coaching businesses ready to scale with AI-powered marketing
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-5 text-center text-lg font-bold text-white sm:text-xl">
            Product vision
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {VISION_POINTS.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/20">
                  <Icon className="h-5 w-5 text-indigo-300" />
                </div>
                <p className="font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 pt-4 sm:flex-row sm:justify-center">
          <Link href={LANDING_FOOTER_CTA.href} className={landingCtaPrimaryClass}>
            {LANDING_FOOTER_CTA.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={LANDING_SECONDARY_CTA.href} className={landingCtaSecondaryClass}>
            {LANDING_SECONDARY_CTA.label}
          </Link>
        </div>
      </div>
    </MarketingPageShell>
  )
}
