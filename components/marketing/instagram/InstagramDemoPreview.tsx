"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  Calendar,
  ChevronRight,
  Eye,
  Film,
  Grid3X3,
  Heart,
  ImageIcon,
  Lightbulb,
  Link2,
  MessageCircle,
  PenLine,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserRound,
  X,
  Zap,
} from "lucide-react"
import GlassCard from "@/components/ui/glass-card"
import type {
  InstagramDemoPreviewData,
  InstagramDemoPreviewPost,
  InstagramPostPerformance,
} from "@/lib/marketing/instagram-demo-preview-types"
import {
  getViralScoreStyles,
  getViralScoreTier,
} from "@/lib/marketing/viral-score"

const GRADIENTS = [
  "from-violet-600 via-fuchsia-500 to-orange-400",
  "from-cyan-500 via-blue-600 to-indigo-700",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-rose-500 via-pink-500 to-purple-600",
  "from-amber-400 via-orange-500 to-red-500",
  "from-indigo-600 via-violet-600 to-fuchsia-500",
  "from-teal-500 via-emerald-600 to-lime-500",
  "from-sky-500 via-blue-500 to-indigo-600",
  "from-orange-500 via-rose-500 to-purple-600",
] as const

const CATEGORY_ACCENTS: Record<string, string> = {
  Transformation: "border-rose-400/30 bg-rose-500/15 text-rose-200",
  Workout: "border-cyan-400/30 bg-cyan-500/15 text-cyan-200",
  Nutrition: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
  "Client Win": "border-amber-400/30 bg-amber-500/15 text-amber-200",
  Motivation: "border-violet-400/30 bg-violet-500/15 text-violet-200",
}

const WORKFLOW_STEPS = [
  {
    id: "idea",
    title: "Generate Idea",
    description: "AI suggests viral angles for your niche",
    icon: Lightbulb,
    accent: "from-amber-500/30 to-orange-500/15 text-amber-300",
  },
  {
    id: "create",
    title: "Create Content",
    description: "Captions, hooks & visuals in one flow",
    icon: PenLine,
    accent: "from-violet-500/30 to-purple-500/15 text-violet-300",
  },
  {
    id: "schedule",
    title: "Schedule",
    description: "Plan your calendar with smart timing",
    icon: Calendar,
    accent: "from-blue-500/30 to-cyan-500/15 text-blue-300",
  },
  {
    id: "publish",
    title: "Publish",
    description: "Push live to Instagram instantly",
    icon: Send,
    accent: "from-emerald-500/30 to-teal-500/15 text-emerald-300",
  },
  {
    id: "analyze",
    title: "Analyze",
    description: "Track reach, saves & viral scores",
    icon: BarChart3,
    accent: "from-rose-500/30 to-pink-500/15 text-rose-300",
  },
] as const

const BEFORE_ITEMS = [
  "Inconsistent posting — weeks without content",
  "Low engagement — posts reach only friends",
  "No strategy — random ideas, no calendar",
] as const

const AFTER_ITEMS = [
  "Content calendar — 30 days planned ahead",
  "Scheduled posts — publish while you coach",
  "Analytics dashboard — reach, saves & trends",
  "AI optimization — viral scores on every post",
] as const

function truncate(text: string, max: number) {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

function formatUsername(username: string) {
  const clean = username.replace(/^@/, "")
  return `@${clean}`
}

function defaultPerformance(index: number): InstagramPostPerformance {
  const reach = 12 + index * 2.3
  return {
    reach: `${reach.toFixed(1)}K`,
    engagement: `${(6.5 + index * 0.4).toFixed(1)}%`,
    saves: `${340 + index * 120}`,
  }
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function SectionLabel({
  children,
  icon: Icon,
}: {
  children: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400">
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
      {children}
    </p>
  )
}

function ViralScoreBadge({
  score,
  large = false,
}: {
  score: number | null
  large?: boolean
}) {
  if (score == null) {
    return (
      <span
        className={`rounded-full border border-white/15 bg-white/10 font-semibold text-white/70 backdrop-blur-sm ${
          large ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]"
        }`}
      >
        Unscored
      </span>
    )
  }

  const tier = getViralScoreTier(score)
  const styles = getViralScoreStyles(tier)
  const isHigh = tier === "high"

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-bold backdrop-blur-sm ${
        large ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]"
      } ${
        isHigh
          ? "border-emerald-400/40 bg-gradient-to-r from-emerald-500/25 to-cyan-500/20 text-emerald-100 shadow-[0_0_20px_rgba(52,211,153,0.2)]"
          : styles.badge
      }`}
    >
      <Sparkles className={large ? "h-3.5 w-3.5" : "h-3 w-3"} aria-hidden />
      {score}
      {isHigh ? (
        <span className="ml-0.5 text-[9px] font-semibold uppercase tracking-wider opacity-80">
          Viral
        </span>
      ) : null}
    </span>
  )
}

function CategoryBadge({ category }: { category: string | null }) {
  const style =
    CATEGORY_ACCENTS[category ?? ""] ??
    "border-white/15 bg-white/10 text-slate-300"

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${style}`}
    >
      {category || "Fitness"}
    </span>
  )
}

function MetricPill({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  accent: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/25 px-2.5 py-1.5 backdrop-blur-sm">
      <Icon className={`h-3.5 w-3.5 shrink-0 ${accent}`} aria-hidden />
      <div className="min-w-0">
        <p className="text-[9px] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="text-xs font-bold tabular-nums text-white">{value}</p>
      </div>
    </div>
  )
}

function PostGradient({
  index,
  category,
  contentType,
}: {
  index: number
  category: string | null
  contentType: string | null
}) {
  const gradient = GRADIENTS[index % GRADIENTS.length]
  const isVideo =
    (contentType ?? "").toLowerCase().includes("reel") ||
    (category ?? "").toLowerCase() === "workout"

  return (
    <div
      className={`relative flex aspect-square w-full items-center justify-center bg-gradient-to-br ${gradient}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(0,0,0,0.25),transparent_50%)]" />
      {isVideo ? (
        <div className="absolute right-2 top-2 rounded-md bg-black/50 p-1 backdrop-blur-sm">
          <Film className="h-3.5 w-3.5 text-white" aria-hidden />
        </div>
      ) : null}
      <div className="relative flex flex-col items-center gap-2 px-3 text-white/90">
        {isVideo ? (
          <Film className="h-6 w-6 drop-shadow-md" aria-hidden />
        ) : (
          <ImageIcon className="h-6 w-6 drop-shadow-md" aria-hidden />
        )}
        <span className="text-center text-[9px] font-bold uppercase tracking-[0.16em] text-white/85">
          {category || "Fitness"}
        </span>
      </div>
    </div>
  )
}

function PerformanceOverlay({
  post,
  index,
}: {
  post: InstagramDemoPreviewPost
  index: number
}) {
  const metrics = post.performance ?? defaultPerformance(index)

  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-2 pt-8">
      <div className="mb-2 flex items-center justify-between gap-1">
        <ViralScoreBadge score={post.viral_score} />
        <CategoryBadge category={post.category} />
      </div>
      <div className="grid grid-cols-3 gap-1">
        <MetricPill icon={Eye} label="Reach" value={metrics.reach} accent="text-cyan-300" />
        <MetricPill
          icon={Heart}
          label="Engage"
          value={metrics.engagement}
          accent="text-rose-300"
        />
        <MetricPill
          icon={Bookmark}
          label="Saves"
          value={metrics.saves}
          accent="text-amber-300"
        />
      </div>
    </div>
  )
}

function InstagramPostCard({
  post,
  index,
  active,
  onSelect,
}: {
  post: InstagramDemoPreviewPost
  index: number
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-sm text-left transition ring-offset-2 ring-offset-[#0b0f17] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
        active ? "ring-2 ring-cyan-400" : ""
      }`}
      aria-label={`Preview post: ${post.title}`}
      aria-pressed={active}
    >
      <PostGradient
        index={index}
        category={post.category}
        contentType={post.content_type}
      />

      <div className="absolute left-1.5 top-1.5 opacity-100 transition group-hover:opacity-0">
        <ViralScoreBadge score={post.viral_score} />
      </div>

      <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
        <PerformanceOverlay post={post} index={index} />
      </div>
    </button>
  )
}

function SelectedPostPanel({ post }: { post: InstagramDemoPreviewPost | null }) {
  if (!post) return null

  const metrics = post.performance ?? defaultPerformance(0)

  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <ViralScoreBadge score={post.viral_score} large />
        <CategoryBadge category={post.category} />
        {post.content_type ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            {post.content_type}
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 text-lg font-semibold tracking-tight text-white sm:text-xl">
        {post.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        {post.caption}
      </p>
      {post.hashtags ? (
        <p className="mt-3 text-sm font-medium text-cyan-300/90">{post.hashtags}</p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/80">
            Viral Score
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-100">
            {post.viral_score ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300/80">
            Reach
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-cyan-100">
            {metrics.reach}
          </p>
        </div>
        <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-300/80">
            Engagement
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-rose-100">
            {metrics.engagement}
          </p>
        </div>
        <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300/80">
            Saves
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-amber-100">
            {metrics.saves}
          </p>
        </div>
      </div>

      {post.viral_reason ? (
        <p className="mt-4 rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-xs leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-300">AI insight: </span>
          {post.viral_reason}
        </p>
      ) : null}
    </GlassCard>
  )
}

function ProfileAvatar() {
  return (
    <div className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 p-[2.5px] shadow-lg shadow-violet-500/25" />
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#101622]">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-violet-500/15 to-fuchsia-500/20" />
        <UserRound
          className="relative h-10 w-10 text-violet-200/90"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0b0f17] bg-gradient-to-br from-cyan-400 to-violet-500">
        <Zap className="h-3 w-3 text-white" aria-hidden />
      </div>
    </div>
  )
}

function BeforeAfterSection() {
  return (
    <section aria-labelledby="before-after-heading">
      <SectionLabel icon={TrendingUp}>Transformation</SectionLabel>
      <h2
        id="before-after-heading"
        className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl"
      >
        Before vs After FitCore AI
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">
        See how coaches go from scattered posting to a system that grows their
        audience on autopilot.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <GlassCard className="relative overflow-hidden border-rose-500/15 p-6">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rose-500/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-400/25 bg-rose-500/15">
                <TrendingDown className="h-5 w-5 text-rose-300" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-300/80">
                  Before
                </p>
                <h3 className="text-lg font-bold text-white">Before FitCore AI</h3>
              </div>
            </div>
            <ul className="mt-5 space-y-3">
              {BEFORE_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-slate-400"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/15">
                    <X className="h-3 w-3 text-rose-400" aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>

        <GlassCard className="relative overflow-hidden border-emerald-500/20 p-6 shadow-[0_0_40px_rgba(52,211,153,0.08)]">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/15">
                <TrendingUp className="h-5 w-5 text-emerald-300" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
                  After
                </p>
                <h3 className="text-lg font-bold text-white">After FitCore AI</h3>
              </div>
            </div>
            <ul className="mt-5 space-y-3">
              {AFTER_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-slate-300"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <Sparkles className="h-3 w-3 text-emerald-400" aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
      </div>
    </section>
  )
}

function ContentWorkflowSection() {
  return (
    <section aria-labelledby="workflow-heading">
      <SectionLabel icon={Zap}>Content Workflow</SectionLabel>
      <h2
        id="workflow-heading"
        className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl"
      >
        From idea to insight in five steps
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">
        Every post flows through FitCore AI — generate, create, schedule,
        publish, and analyze without leaving the platform.
      </p>

      <div className="mt-6 hidden lg:flex lg:items-stretch">
        {WORKFLOW_STEPS.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.id} className="flex flex-1 items-stretch">
              <GlassCard hover className="flex flex-1 flex-col p-5">
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${step.accent}`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <span className="text-[11px] font-bold tabular-nums text-slate-500">
                  Step {index + 1}
                </span>
                <h3 className="mt-1 font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {step.description}
                </p>
              </GlassCard>
              {index < WORKFLOW_STEPS.length - 1 ? (
                <div
                  className="flex w-10 shrink-0 items-center justify-center"
                  aria-hidden
                >
                  <ArrowRight className="h-4 w-4 text-violet-400/70" />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="mt-6 space-y-3 lg:hidden">
        {WORKFLOW_STEPS.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.id}>
              <GlassCard className="flex items-center gap-4 p-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${step.accent}`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Step {index + 1}
                  </p>
                  <h3 className="font-bold text-white">{step.title}</h3>
                  <p className="text-xs text-slate-400">{step.description}</p>
                </div>
              </GlassCard>
              {index < WORKFLOW_STEPS.length - 1 ? (
                <div className="flex justify-center py-1" aria-hidden>
                  <ChevronRight className="h-4 w-4 rotate-90 text-violet-400/50" />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {WORKFLOW_STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300">
              {step.title}
            </span>
            {index < WORKFLOW_STEPS.length - 1 ? (
              <ArrowRight className="h-3 w-3 text-violet-500/60" aria-hidden />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}

function RealAccountSection() {
  return (
    <section aria-labelledby="real-account-heading">
      <SectionLabel icon={InstagramIcon}>Your Account</SectionLabel>
      <h2
        id="real-account-heading"
        className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl"
      >
        Real FitCore AI Account
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">
        Connect your @fitcore_ai_app Instagram to display live performance data
        alongside this demo showcase.
      </p>

      <GlassCard className="relative mt-6 overflow-hidden p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="relative flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-orange-500/20 shadow-[0_8px_32px_rgba(236,72,153,0.15)]">
            <InstagramIcon className="h-8 w-8 text-pink-200" />
          </div>

          <p className="mt-5 max-w-md text-base font-medium text-slate-300">
            Your real Instagram results will appear here.
          </p>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Link @fitcore_ai_app or your coaching account in settings to sync
            reach, engagement, and viral scores from live posts.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-400/50 hover:from-cyan-500/30 hover:to-violet-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <Link2 className="h-4 w-4" aria-hidden />
              Connect Instagram
            </Link>
            <span className="badge-premium">
              <Sparkles className="h-3 w-3" aria-hidden />
              Coming soon: live sync
            </span>
          </div>

          <div className="mt-8 grid w-full max-w-lg grid-cols-3 gap-3">
            {["Reach", "Engagement", "Saves"].map((label) => (
              <div
                key={label}
                className="skeleton-shimmer flex h-16 flex-col items-center justify-center rounded-xl border border-white/8"
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </section>
  )
}

export default function InstagramDemoPreview({
  data,
}: {
  data: InstagramDemoPreviewData
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    data.posts[0]?.id ?? null,
  )

  const selectedPost = useMemo(
    () =>
      data.posts.find((post) => post.id === selectedId) ??
      data.posts[0] ??
      null,
    [data.posts, selectedId],
  )

  const bioLines = data.profile.bio.split("\n")
  const showcasePosts = data.posts.slice(0, 9)
  const avgViralScore = Math.round(
    showcasePosts.reduce((sum, p) => sum + (p.viral_score ?? 0), 0) /
      showcasePosts.length,
  )

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Section 1 & 2 & 3: Profile + Grid + AI Performance */}
      <section aria-labelledby="profile-showcase-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel icon={InstagramIcon}>Instagram Showcase</SectionLabel>
            <h2
              id="profile-showcase-heading"
              className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl"
            >
              Your Instagram, powered by AI
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Preview exactly what your coaching profile could look like with
              FitCore AI — premium content, viral scores, and real performance
              metrics on every post.
            </p>
          </div>
          <span className="badge-premium">
            <Sparkles className="h-3 w-3" aria-hidden />
            AI-Optimized
          </span>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#070b14] shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
          <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />

          <div className="relative grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-10">
            {/* Phone-style profile */}
            <div className="mx-auto w-full max-w-[400px]">
              <div className="overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#0b0f17] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                  <div className="flex items-center gap-2 text-white">
                    <Grid3X3 className="h-4 w-4 text-slate-400" aria-hidden />
                    <span className="text-sm font-semibold">
                      {formatUsername(data.profile.username)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Heart className="h-4 w-4" aria-hidden />
                    <MessageCircle className="h-4 w-4" aria-hidden />
                  </div>
                </div>

                <div className="px-4 py-5 sm:px-5">
                  <div className="flex items-start gap-4">
                    <ProfileAvatar />

                    <div className="grid flex-1 grid-cols-3 gap-1 text-center">
                      <div>
                        <p className="text-lg font-bold tabular-nums text-white">
                          {data.profile.postsCount}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                          Posts
                        </p>
                      </div>
                      <div>
                        <p className="text-lg font-bold tabular-nums text-white">
                          {data.profile.followersCount}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                          Followers
                        </p>
                      </div>
                      <div>
                        <p className="text-lg font-bold tabular-nums text-white">
                          {data.profile.followingCount}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                          Following
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-semibold text-white">
                      {data.profile.displayName}
                    </p>
                    <div className="mt-1 space-y-0.5 text-sm leading-relaxed text-slate-300">
                      {bioLines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-white/8 py-2 text-center text-xs font-semibold text-white">
                      Follow
                    </div>
                    <div className="rounded-lg bg-white/8 py-2 text-center text-xs font-semibold text-white">
                      Message
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 border-y border-white/8 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <div className="border-r border-white/8 py-3 text-white">
                    Posts
                  </div>
                  <div className="border-r border-white/8 py-3">Reels</div>
                  <div className="py-3">Tagged</div>
                </div>

                <div className="grid grid-cols-3 gap-0.5 bg-black p-0.5">
                  {showcasePosts.map((post, index) => (
                    <InstagramPostCard
                      key={post.id}
                      post={post}
                      index={index}
                      active={selectedPost?.id === post.id}
                      onSelect={() => setSelectedId(post.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* AI Performance sidebar */}
            <div className="flex flex-col gap-5">
              <GlassCard className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">
                      AI Performance Layer
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Hover any post for live metrics. Click to pin details.
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-2 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/80">
                      Avg Viral Score
                    </p>
                    <p className="text-2xl font-bold tabular-nums text-emerald-100">
                      {avgViralScore}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {showcasePosts.map((post, index) => {
                    const metrics =
                      post.performance ?? defaultPerformance(index)
                    return (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => setSelectedId(post.id)}
                        className={`rounded-xl border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                          selectedPost?.id === post.id
                            ? "border-cyan-400/40 bg-cyan-500/10"
                            : "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <ViralScoreBadge score={post.viral_score} />
                          <CategoryBadge category={post.category} />
                        </div>
                        <p className="mt-2 line-clamp-1 text-xs font-semibold text-white">
                          {truncate(post.title, 36)}
                        </p>
                        <div className="mt-2 flex gap-2 text-[10px] tabular-nums text-slate-400">
                          <span>{metrics.reach}</span>
                          <span>·</span>
                          <span>{metrics.engagement}</span>
                          <span>·</span>
                          <span>{metrics.saves} saves</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </GlassCard>

              <SelectedPostPanel post={selectedPost} />
            </div>
          </div>
        </div>
      </section>

      <BeforeAfterSection />
      <ContentWorkflowSection />
      <RealAccountSection />
    </div>
  )
}
