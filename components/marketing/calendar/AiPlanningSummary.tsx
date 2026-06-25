import type { ReactNode } from "react"
import {
  Bot,
  CalendarRange,
  Clock3,
  Sparkles,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import { CalendarFormatBadge } from "@/components/marketing/calendar/CalendarBadges"
import type { AiPlanningSummary } from "@/lib/marketing/calendar-ai-planning"

type PlanningMetricProps = {
  label: string
  value: ReactNode
  hint: string
  icon: LucideIcon
  accent: string
}

function PlanningMetric({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: PlanningMetricProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
      <div
        className={`pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${accent} opacity-25 blur-2xl`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-violet-100/80">
            {label}
          </p>
          <div className="mt-3 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {value}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-violet-100/70">{hint}</p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg ring-2 ring-white/20`}
        >
          <Icon className="h-6 w-6" strokeWidth={2.25} />
        </div>
      </div>
    </article>
  )
}

export default function AiPlanningSummarySection({
  planning,
}: {
  planning: AiPlanningSummary
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-violet-400/30 bg-gradient-to-br from-gray-950 via-violet-950 to-indigo-950 p-7 shadow-2xl shadow-violet-950/30 sm:p-9">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.22),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(34,211,238,0.12),_transparent_50%)]" />

      <div className="relative mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-lg shadow-violet-500/40 ring-2 ring-white/20">
            <Bot className="h-7 w-7" strokeWidth={2} />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/15 px-3.5 py-1.5 text-sm font-bold uppercase tracking-[0.14em] text-violet-100">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              AI Planning Summary
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Your content plan, optimized
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-violet-100/75">
              Smart scheduling insights based on your calendar, platforms, and
              content mix.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          Live analysis
        </div>
      </div>

      <div className="relative grid gap-5 sm:grid-cols-2">
        <PlanningMetric
          label="Planned Days"
          value={planning.plannedDays}
          hint={
            planning.plannedDays === 1
              ? "Day with scheduled content"
              : "Days with scheduled content"
          }
          icon={CalendarRange}
          accent="from-violet-500 to-purple-600"
        />
        <PlanningMetric
          label="Estimated Reach"
          value={planning.estimatedReachLabel}
          hint="Projected audience impressions"
          icon={TrendingUp}
          accent="from-emerald-500 to-teal-500"
        />
        <PlanningMetric
          label="Recommended Posting Window"
          value={
            <span className="text-2xl sm:text-3xl">{planning.recommendedPostingWindow}</span>
          }
          hint={planning.recommendedPostingHint}
          icon={Clock3}
          accent="from-amber-500 to-orange-500"
        />
        <PlanningMetric
          label="Best Content Type"
          value={<CalendarFormatBadge format={planning.bestContentType} size="default" />}
          hint={planning.bestContentTypeHint}
          icon={Target}
          accent="from-cyan-500 to-blue-500"
        />
      </div>

      <div className="relative mt-8 flex items-start gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
        <p className="text-base leading-relaxed text-violet-50">{planning.insight}</p>
      </div>
    </section>
  )
}
