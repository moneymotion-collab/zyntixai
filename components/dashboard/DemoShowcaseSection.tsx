"use client"

import Link from "next/link"
import {
  ArrowRight,
  Camera,
  Play,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { useIsDemoWorkspace } from "@/app/hooks/useIsDemoWorkspace"
import { DashboardSectionHeader } from "@/components/coach-dashboard/coach-dashboard-ui"
import GlassCard from "@/components/ui/glass-card"
import {
  DEMO_SHOWCASE_CAMPAIGNS,
  DEMO_SHOWCASE_MARKETING,
  DEMO_SHOWCASE_VIDEO,
} from "@/lib/demo/demo-showcase-content"

function VideoPlaceholder() {
  return (
    <Link
      href={DEMO_SHOWCASE_VIDEO.href}
      className="group relative block aspect-video overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c1424] via-[#0a101c] to-[#111827] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,102,241,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 top-8 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] shadow-[0_8px_32px_rgba(6,182,212,0.2)] transition duration-300 group-hover:scale-105 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/15">
          <Play
            className="ml-1 h-7 w-7 text-cyan-200 transition group-hover:text-white"
            aria-hidden
          />
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300/90">
          Video preview
        </p>
        <h3 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
          {DEMO_SHOWCASE_VIDEO.title}
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400 transition group-hover:text-slate-300">
          {DEMO_SHOWCASE_VIDEO.description}
        </p>

        <span className="badge-premium mt-5">
          <Sparkles className="h-3 w-3 text-cyan-300" aria-hidden />
          {DEMO_SHOWCASE_VIDEO.duration} showcase
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md">
        <span className="text-xs font-medium text-slate-400">
          Watch FitCore AI in Action
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 transition group-hover:text-cyan-200">
          Open video generator
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </Link>
  )
}

function CampaignExampleCard({
  campaign,
}: {
  campaign: (typeof DEMO_SHOWCASE_CAMPAIGNS)[number]
}) {
  const Icon = campaign.icon

  return (
    <Link
      href={campaign.href}
      className="group block rounded-xl border border-white/10 bg-white/[0.03] p-4 transition duration-200 hover:border-violet-400/25 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br ${campaign.accent}`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-white transition group-hover:text-violet-100">
              {campaign.title}
            </h4>
            <span className="badge-soft border-violet-400/20 bg-violet-500/10 text-[10px] text-violet-200">
              {campaign.status}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400 group-hover:text-slate-300">
            {campaign.description}
          </p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            {campaign.platform}
          </p>
        </div>
      </div>
    </Link>
  )
}

function MarketingExampleCard({
  example,
}: {
  example: (typeof DEMO_SHOWCASE_MARKETING)[number]
}) {
  return (
    <Link
      href={example.href}
      className="group block rounded-xl border border-white/10 bg-white/[0.03] p-4 transition duration-200 hover:border-cyan-400/25 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-soft border-cyan-400/20 bg-cyan-500/10 text-[10px] text-cyan-200">
              {example.format}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              {example.category}
            </span>
          </div>
          <h4 className="mt-2 font-semibold leading-snug text-white transition group-hover:text-cyan-50">
            {example.title}
          </h4>
        </div>
        <Camera
          className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-cyan-300"
          aria-hidden
        />
      </div>
      <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300/90">
        <TrendingUp className="h-3.5 w-3.5" aria-hidden />
        {example.metric}
      </p>
    </Link>
  )
}

export default function DemoShowcaseSection() {
  const { isDemoWorkspace, loading } = useIsDemoWorkspace()

  if (loading || !isDemoWorkspace) {
    return null
  }

  return (
    <section aria-label="Platform preview" className="mb-0">
      <GlassCard className="relative overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative">
          <DashboardSectionHeader
            eyebrow="Platform preview"
            title="Watch FitCore AI in Action"
            description="Explore sample campaigns and marketing content from a fully loaded coaching workspace."
          />

          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <VideoPlaceholder />

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-violet-300/90">
                  Demo campaign examples
                </h3>
                <div className="space-y-3">
                  {DEMO_SHOWCASE_CAMPAIGNS.map((campaign) => (
                    <CampaignExampleCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300/90">
                  Marketing examples
                </h3>
                <div className="space-y-3">
                  {DEMO_SHOWCASE_MARKETING.map((example) => (
                    <MarketingExampleCard key={example.id} example={example} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </section>
  )
}
