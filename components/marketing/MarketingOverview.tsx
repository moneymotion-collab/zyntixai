import type { MarketingDashboardStats } from "@/lib/marketing/marketing-dashboard-stats"

export default function MarketingOverview({
  stats,
}: {
  stats: MarketingDashboardStats
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">📊 Overview</h2>

      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-gray-50 px-4 py-3">
          <dt className="text-sm text-gray-500">Total posts</dt>
          <dd className="mt-1 text-2xl font-semibold text-gray-900">
            {stats.totalPosts}
          </dd>
        </div>

        <div className="rounded-xl border bg-gray-50 px-4 py-3">
          <dt className="text-sm text-gray-500">Avg viral score</dt>
          <dd className="mt-1 text-2xl font-semibold text-gray-900">
            {stats.avgViralScore != null ? `${stats.avgViralScore}/100` : "—"}
          </dd>
        </div>

        <div className="rounded-xl border bg-gray-50 px-4 py-3">
          <dt className="text-sm text-gray-500">Engagement rate</dt>
          <dd className="mt-1 text-2xl font-semibold text-gray-900">
            {stats.engagementRate}%
          </dd>
        </div>
      </dl>
    </section>
  )
}
