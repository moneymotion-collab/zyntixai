import {
  CalendarDays,
  Clapperboard,
  Images,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import type { CalendarSummary } from "@/lib/marketing/calendar-types"
import { formatEstimatedReach } from "@/lib/marketing/calendar-display"

type SummaryCardConfig = {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  accent: string
}

function buildSummaryCards(summary: CalendarSummary): SummaryCardConfig[] {
  return [
    {
      label: "Total Planned Posts",
      value: String(summary.totalPlannedPosts),
      hint: "Scheduled across the month",
      icon: CalendarDays,
      accent: "from-violet-500 to-indigo-500",
    },
    {
      label: "Estimated Reach",
      value: formatEstimatedReach(summary.estimatedReach),
      hint: "Projected audience impressions",
      icon: TrendingUp,
      accent: "from-emerald-500 to-teal-500",
    },
    {
      label: "Reels",
      value: String(summary.reels),
      hint: "Short-form video content",
      icon: Clapperboard,
      accent: "from-pink-500 to-rose-500",
    },
    {
      label: "Carousels",
      value: String(summary.carousels),
      hint: "Multi-slide educational posts",
      icon: Images,
      accent: "from-amber-400 to-orange-500",
    },
    {
      label: "Stories",
      value: String(summary.stories),
      hint: "Ephemeral & testimonial posts",
      icon: Sparkles,
      accent: "from-cyan-400 to-blue-500",
    },
  ]
}

function SummaryStatCard({ card }: { card: SummaryCardConfig }) {
  const Icon = card.icon

  return (
    <article className="group relative overflow-hidden rounded-3xl border-2 border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/60 ring-1 ring-gray-950/[0.04] transition duration-300 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50 sm:p-7">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${card.accent} opacity-[0.12] blur-2xl transition duration-300 group-hover:opacity-[0.2]`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-base font-semibold text-gray-700">{card.label}</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {card.value}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{card.hint}</p>
        </div>

        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-md ring-2 ring-white`}
        >
          <Icon className="h-7 w-7" strokeWidth={2.25} />
        </div>
      </div>
    </article>
  )
}

export default function CalendarSummaryBar({
  summary,
}: {
  summary: CalendarSummary
}) {
  const cards = buildSummaryCards(summary)

  return (
    <section className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50/80 via-white to-cyan-50/40 p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
          Monthly overview
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Content at a glance
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <SummaryStatCard key={card.label} card={card} />
        ))}
      </div>
    </section>
  )
}
