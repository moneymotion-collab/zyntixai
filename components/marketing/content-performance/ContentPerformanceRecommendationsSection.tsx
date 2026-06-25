import {
  Calendar,
  Lightbulb,
  Megaphone,
  Repeat,
  Target,
  type LucideIcon,
} from "lucide-react"
import type { ContentPerformanceRecommendations } from "@/lib/marketing/content-performance/types"

type RecommendationItem = {
  label: string
  value: string
  icon: LucideIcon
  accent: string
}

function buildItems(
  recommendations: ContentPerformanceRecommendations,
): RecommendationItem[] {
  return [
    {
      label: "Best content type to repeat",
      value: recommendations.bestContentType,
      icon: Repeat,
      accent: "from-violet-500 to-indigo-500",
    },
    {
      label: "Best platform",
      value: recommendations.bestPlatform,
      icon: Target,
      accent: "from-blue-500 to-cyan-500",
    },
    {
      label: "Suggested next post",
      value: recommendations.suggestedNextPost,
      icon: Lightbulb,
      accent: "from-amber-500 to-orange-500",
    },
    {
      label: "Suggested CTA",
      value: recommendations.suggestedCta,
      icon: Megaphone,
      accent: "from-rose-500 to-pink-500",
    },
    {
      label: "Posting focus this week",
      value: recommendations.weeklyFocus,
      icon: Calendar,
      accent: "from-emerald-500 to-teal-500",
    },
  ]
}

export default function ContentPerformanceRecommendationsSection({
  recommendations,
}: {
  recommendations: ContentPerformanceRecommendations
}) {
  const items = buildItems(recommendations)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

      <div className="p-5 sm:p-6">
        <h2 className="text-xl font-bold text-slate-950">Recommendations</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Data-driven next steps for FitCore AI marketing
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {items.map((item) => {
            const Icon = item.icon

            return (
              <article
                key={item.label}
                className="rounded-xl border border-slate-200 bg-slate-50/80 p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.accent} text-white`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-base font-semibold leading-relaxed text-slate-900">
                      {item.value}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
