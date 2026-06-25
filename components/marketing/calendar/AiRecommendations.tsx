import type { ReactNode } from "react"
import {
  CalendarDays,
  Lightbulb,
  Megaphone,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import type { AiCalendarRecommendation } from "@/lib/marketing/calendar-ai-planning"

const RECOMMENDATION_ICONS: Record<string, LucideIcon> = {
  "transformation-content": TrendingUp,
  "reels-mon-thu": CalendarDays,
  "cta-usage": Megaphone,
}

const RECOMMENDATION_ACCENTS: Record<string, string> = {
  "transformation-content": "from-emerald-500 to-teal-500",
  "reels-mon-thu": "from-violet-500 to-indigo-500",
  "cta-usage": "from-amber-500 to-orange-500",
}

function RecommendationCard({
  recommendation,
  index,
}: {
  recommendation: AiCalendarRecommendation
  index: number
}) {
  const Icon = RECOMMENDATION_ICONS[recommendation.id] ?? Lightbulb
  const accent =
    RECOMMENDATION_ACCENTS[recommendation.id] ?? "from-violet-500 to-purple-600"

  return (
    <article className="relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-md sm:p-7">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl`}
      />

      <div className="relative flex gap-5">
        <div className="flex shrink-0 flex-col items-center gap-3">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-md ring-2 ring-white`}
          >
            <Icon className="h-7 w-7" strokeWidth={2.25} />
          </div>
          <span className="text-sm font-bold tabular-nums text-gray-300">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold tracking-tight text-gray-900">
              {recommendation.title}
            </h3>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-bold uppercase tracking-wide text-violet-700">
              {recommendation.impact}
            </span>
          </div>
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            {recommendation.description}
          </p>
        </div>
      </div>
    </article>
  )
}

export default function AiRecommendationsSection({
  recommendations,
  header,
}: {
  recommendations: AiCalendarRecommendation[]
  header?: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white via-violet-50/40 to-cyan-50/30 p-7 shadow-md sm:p-9">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md">
            <Lightbulb className="h-7 w-7" strokeWidth={2} />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1.5 text-sm font-bold uppercase tracking-[0.12em] text-violet-700">
              <Sparkles className="h-4 w-4" />
              AI Recommendations
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {header ?? "Actions to improve this month"}
            </h2>
            <p className="mt-2 text-base text-gray-600">
              Personalized suggestions based on your current calendar mix.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5">
        {recommendations.map((recommendation, index) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}
