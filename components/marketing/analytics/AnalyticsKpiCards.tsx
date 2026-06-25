import {
  Eye,
  Heart,
  Radio,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react"
import {
  formatAnalyticsCount,
  type AnalyticsKpiTrend,
  type AnalyticsKpis,
} from "@/lib/marketing/analytics/analytics-kpis"

type KpiConfig = {
  label: string
  value: string
  hint: string
  trend: AnalyticsKpiTrend
  icon: LucideIcon
  accent: string
  bar: string
}

function buildCards(kpis: AnalyticsKpis): KpiConfig[] {
  return [
    {
      label: "Total Reach",
      value: formatAnalyticsCount(kpis.totalReach),
      hint: "Unique accounts reached",
      trend: kpis.reachTrend,
      icon: Radio,
      accent: "from-violet-600 to-indigo-500",
      bar: "from-violet-500 via-indigo-500 to-blue-500",
    },
    {
      label: "Total Views",
      value: formatAnalyticsCount(kpis.totalViews),
      hint: "Content impressions",
      trend: kpis.viewsTrend,
      icon: Eye,
      accent: "from-blue-600 to-cyan-500",
      bar: "from-blue-500 via-sky-500 to-cyan-400",
    },
    {
      label: "Total Likes",
      value: formatAnalyticsCount(kpis.totalLikes),
      hint: "Audience reactions",
      trend: kpis.likesTrend,
      icon: Heart,
      accent: "from-rose-500 to-pink-500",
      bar: "from-rose-500 via-pink-500 to-fuchsia-400",
    },
    {
      label: "Engagement Rate",
      value: `${kpis.engagementRate}%`,
      hint: "Likes + comments per view",
      trend: kpis.engagementTrend,
      icon: TrendingUp,
      accent: "from-emerald-500 to-teal-500",
      bar: "from-emerald-500 via-teal-500 to-cyan-400",
    },
    {
      label: "Follower Growth",
      value: `+${formatAnalyticsCount(kpis.followerGrowth)}`,
      hint: kpis.followerGrowthLabel,
      trend: kpis.followerTrend,
      icon: Users,
      accent: "from-amber-500 to-orange-500",
      bar: "from-amber-500 via-orange-500 to-rose-400",
    },
  ]
}

function TrendBadge({ trend }: { trend: AnalyticsKpiTrend }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-bold tabular-nums ${
        trend.positive
          ? "bg-emerald-100 text-emerald-800"
          : "bg-rose-100 text-rose-800"
      }`}
    >
      {trend.label}
    </span>
  )
}

export default function AnalyticsKpiCards({ kpis }: { kpis: AnalyticsKpis }) {
  const cards = buildCards(kpis)

  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <article
            key={card.label}
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-7"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.bar}`}
            />

            <div className="relative flex items-start justify-between gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-md`}
              >
                <Icon className="h-7 w-7" strokeWidth={2.25} />
              </div>

              <TrendBadge trend={card.trend} />
            </div>

            <div className="relative mt-6">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-600">
                {card.label}
              </p>
              <p className="mt-3 text-4xl font-bold tracking-tight text-slate-950 tabular-nums sm:text-[2.75rem] sm:leading-none">
                {card.value}
              </p>
              <p className="mt-3 text-base font-medium leading-snug text-slate-600">
                {card.hint}
              </p>
            </div>
          </article>
        )
      })}
    </section>
  )
}
