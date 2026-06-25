import type { LearningProfileView } from "@/lib/marketing/learning/fetch-learning-run-client"
import {
  BarChart3,
  Clock,
  Layers,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"

function StatTile({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  icon: typeof TrendingUp
  accent: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${accent} text-white`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 truncate text-lg font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function LearningProfileCard({
  profile,
}: {
  profile: LearningProfileView
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
              Learning Profile
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Your content intelligence snapshot
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Based on {profile.post_count} tracked post
              {profile.post_count === 1 ? "" : "s"} ·{" "}
              {profile.total_views.toLocaleString()} total views
            </p>
          </div>
          {profile.created_at ? (
            <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Updated {new Date(profile.created_at).toLocaleDateString()}
            </span>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Avg engagement"
            value={`${profile.average_engagement_rate}%`}
            icon={TrendingUp}
            accent="from-emerald-500 to-teal-500"
          />
          <StatTile
            label="Best platform"
            value={profile.best_platform ?? "—"}
            icon={Target}
            accent="from-blue-500 to-cyan-500"
          />
          <StatTile
            label="Best content type"
            value={profile.best_content_type ?? "—"}
            icon={Layers}
            accent="from-violet-500 to-indigo-500"
          />
          <StatTile
            label="Best posting window"
            value={profile.best_posting_time}
            icon={Clock}
            accent="from-amber-500 to-orange-500"
          />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <Sparkles className="h-4 w-4" />
              Top performer
            </div>
            {profile.best_performing_posts[0] ? (
              <div className="mt-3">
                <p className="font-semibold text-slate-900">
                  {profile.best_performing_posts[0].title}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {profile.best_performing_posts[0].engagementRate}% engagement ·{" "}
                  {profile.best_performing_posts[0].platform}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No top post identified yet.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <BarChart3 className="h-4 w-4" />
              Total engagement
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {profile.total_engagement.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Likes, comments, shares, and saves combined
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
