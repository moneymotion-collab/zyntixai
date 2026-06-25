import {
  CalendarClock,
  CheckCircle2,
  FileEdit,
  Flame,
  type LucideIcon,
} from "lucide-react"
import {
  formatAverageViralScore,
  type PublishingSummary,
} from "@/lib/marketing/publishing-summary"
import {
  VIDEO_METRIC_LABEL,
  VIDEO_METRIC_VALUE,
  VIDEO_SECTION_LABEL,
  VIDEO_SECTION_TITLE,
} from "@/components/marketing/scheduled/scheduled-video-styles"

type SummaryCardConfig = {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  accent: string
}

function buildSummaryCards(summary: PublishingSummary): SummaryCardConfig[] {
  const avgScore = formatAverageViralScore(summary.averageViralScore)

  return [
    {
      label: "Published Posts",
      value: String(summary.published),
      hint: "Live on your channels",
      icon: CheckCircle2,
      accent: "from-emerald-500 to-teal-500",
    },
    {
      label: "Scheduled Posts",
      value: String(summary.scheduled),
      hint: "Queued for publishing",
      icon: CalendarClock,
      accent: "from-amber-400 to-orange-500",
    },
    {
      label: "Draft Posts",
      value: String(summary.draft),
      hint: "Awaiting review & approval",
      icon: FileEdit,
      accent: "from-slate-500 to-gray-700",
    },
    {
      label: "Average Viral Score",
      value: avgScore,
      hint:
        summary.averageViralScore != null
          ? `Across ${summary.scoredPosts} scored posts · /100`
          : "Score posts to unlock average",
      icon: Flame,
      accent: "from-violet-500 to-fuchsia-500",
    },
  ]
}

function SummaryStatCard({ card }: { card: SummaryCardConfig }) {
  const Icon = card.icon

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-8 shadow-[0_8px_40px_rgba(15,23,42,0.06)] ring-1 ring-gray-950/[0.03] transition duration-300 hover:border-violet-200/80 hover:shadow-[0_16px_48px_rgba(15,23,42,0.1)] sm:p-9">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-gradient-to-br ${card.accent} opacity-[0.14] blur-2xl transition duration-300 group-hover:opacity-[0.22]`}
      />

      <div className="relative flex items-start justify-between gap-5">
        <div className="min-w-0">
          <p className={VIDEO_METRIC_LABEL}>{card.label}</p>
          <p className={`mt-4 ${VIDEO_METRIC_VALUE}`}>{card.value}</p>
          <p className="mt-3 text-base font-medium leading-relaxed text-gray-500 sm:text-lg">
            {card.hint}
          </p>
        </div>

        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-lg ring-2 ring-white sm:h-[4.5rem] sm:w-[4.5rem]`}
        >
          <Icon className="h-8 w-8" strokeWidth={2.25} />
        </div>
      </div>
    </article>
  )
}

export default function PublishingSummary({
  summary,
}: {
  summary: PublishingSummary
}) {
  const cards = buildSummaryCards(summary)

  return (
    <section className="rounded-3xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-violet-50/30 p-8 shadow-[0_8px_40px_rgba(15,23,42,0.04)] sm:p-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={`${VIDEO_SECTION_LABEL} text-violet-600`}>
            Publishing summary
          </p>
          <h2 className={`mt-3 ${VIDEO_SECTION_TITLE}`}>Pipeline at a glance</h2>
        </div>
        <p className="text-lg font-semibold text-gray-500">
          {summary.totalPosts} posts in queue
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {cards.map((card) => (
          <SummaryStatCard key={card.label} card={card} />
        ))}
      </div>
    </section>
  )
}
