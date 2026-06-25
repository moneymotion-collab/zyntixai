import {
  Bookmark,
  Eye,
  Heart,
  MessageCircle,
  Radio,
  Share2,
  TrendingUp,
  Users,
  FileText,
  type LucideIcon,
} from "lucide-react"
import {
  formatAnalyticsCount,
} from "@/lib/marketing/content-performance/analytics-engine"
import type { ContentPerformanceKpis } from "@/lib/marketing/content-performance/types"

type KpiConfig = {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  accent: string
  bar: string
}

function buildCards(kpis: ContentPerformanceKpis): KpiConfig[] {
  return [
    {
      label: "Total Reach",
      value: formatAnalyticsCount(kpis.totalReach),
      hint: "Estimated unique accounts reached",
      icon: Radio,
      accent: "from-violet-600 to-indigo-500",
      bar: "from-violet-500 via-indigo-500 to-blue-500",
    },
    {
      label: "Total Views",
      value: formatAnalyticsCount(kpis.totalViews),
      hint: "Content impressions",
      icon: Eye,
      accent: "from-blue-600 to-cyan-500",
      bar: "from-blue-500 via-sky-500 to-cyan-400",
    },
    {
      label: "Total Likes",
      value: formatAnalyticsCount(kpis.totalLikes),
      hint: "Audience reactions",
      icon: Heart,
      accent: "from-rose-500 to-pink-500",
      bar: "from-rose-500 via-pink-500 to-fuchsia-400",
    },
    {
      label: "Total Comments",
      value: formatAnalyticsCount(kpis.totalComments),
      hint: "Conversations started",
      icon: MessageCircle,
      accent: "from-violet-600 to-indigo-500",
      bar: "from-violet-500 via-indigo-500 to-blue-500",
    },
    {
      label: "Total Shares",
      value: formatAnalyticsCount(kpis.totalShares),
      hint: "Times content was shared",
      icon: Share2,
      accent: "from-amber-500 to-orange-500",
      bar: "from-amber-500 via-orange-500 to-rose-400",
    },
    {
      label: "Total Saves",
      value: formatAnalyticsCount(kpis.totalSaves),
      hint: "Bookmarked by audience",
      icon: Bookmark,
      accent: "from-teal-500 to-emerald-500",
      bar: "from-teal-500 via-emerald-500 to-green-400",
    },
    {
      label: "Followers Gained",
      value: `+${formatAnalyticsCount(kpis.followersGained)}`,
      hint: "New followers from tracked posts",
      icon: Users,
      accent: "from-fuchsia-500 to-purple-500",
      bar: "from-fuchsia-500 via-purple-500 to-violet-400",
    },
    {
      label: "Avg. Engagement Rate",
      value: `${kpis.averageEngagementRate}%`,
      hint: "Across all tracked posts",
      icon: TrendingUp,
      accent: "from-emerald-500 to-teal-500",
      bar: "from-emerald-500 via-teal-500 to-cyan-400",
    },
    {
      label: "Posts Tracked",
      value: formatAnalyticsCount(kpis.totalPostsTracked),
      hint: "Performance records",
      icon: FileText,
      accent: "from-slate-600 to-slate-500",
      bar: "from-slate-500 via-slate-400 to-slate-300",
    },
  ]
}

export default function ContentPerformanceKpiCards({
  kpis,
}: {
  kpis: ContentPerformanceKpis
}) {
  const cards = buildCards(kpis)

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <article
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.bar}`}
            />

            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} text-white shadow-sm`}
              >
                <Icon className="h-5 w-5" strokeWidth={2.25} />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 tabular-nums sm:text-3xl">
                {card.value}
              </p>
              <p className="mt-1.5 text-sm font-medium text-slate-500">
                {card.hint}
              </p>
            </div>
          </article>
        )
      })}
    </section>
  )
}
