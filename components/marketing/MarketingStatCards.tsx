import {
  BarChart3,
  FileText,
  Flame,
  Send,
  type LucideIcon,
} from "lucide-react"
import type { MarketingDashboardStats } from "@/lib/marketing/marketing-dashboard-stats"

type StatCardConfig = {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  accent: string
}

function buildStatCards(stats: MarketingDashboardStats): StatCardConfig[] {
  return [
    {
      label: "Generated posts",
      value: String(stats.generatedPosts),
      hint: "Total AI-created content",
      icon: FileText,
      accent: "from-blue-500 to-cyan-500",
    },
    {
      label: "Published posts",
      value: String(stats.publishedPosts),
      hint: "Live on your channels",
      icon: Send,
      accent: "from-emerald-500 to-teal-500",
    },
    {
      label: "Avg viral score",
      value: stats.avgViralScore != null ? `${stats.avgViralScore}` : "—",
      hint: stats.avgViralScore != null ? "Out of 100" : "Score posts to unlock",
      icon: Flame,
      accent: "from-orange-500 to-rose-500",
    },
    {
      label: "Engagement rate",
      value: `${stats.engagementRate}%`,
      hint: "Across tracked analytics",
      icon: BarChart3,
      accent: "from-violet-500 to-purple-500",
    },
  ]
}

export default function MarketingStatCards({
  stats,
}: {
  stats: MarketingDashboardStats
}) {
  const cards = buildStatCards(stats)

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <article
            key={card.label}
            className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
          >
            <div
              className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${card.accent} opacity-10 blur-2xl transition group-hover:opacity-20`}
            />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-gray-400">{card.hint}</p>
              </div>

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} text-white shadow-sm`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}
