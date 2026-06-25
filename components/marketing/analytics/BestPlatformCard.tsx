import { Globe } from "lucide-react"
import type { PlatformStat } from "@/lib/marketing/analytics/build-performance-summary"

function formatCount(value: number): string {
  if (value >= 10_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  }
  return value.toLocaleString()
}

function formatMultiplier(ratio: number): string {
  if (ratio >= 10) return `${Math.round(ratio)}x`
  return `${Math.round(ratio * 10) / 10}x`
}

export default function BestPlatformCard({
  platformStats,
}: {
  platformStats: PlatformStat[]
}) {
  const leader = platformStats[0] ?? null
  const runnerUp = platformStats[1] ?? null
  const viewMultiplier =
    leader && runnerUp && runnerUp.views > 0
      ? leader.views / runnerUp.views
      : null

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md">
          <Globe className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Best Platform</h2>
          <p className="mt-1 text-base font-medium text-slate-600">
            Highest reach and engagement
          </p>
        </div>
      </div>

      {leader ? (
        <div className="space-y-5">
          <div>
            <p className="text-3xl font-bold text-slate-950 sm:text-4xl">
              {leader.platform}
            </p>
            <p className="mt-2 text-lg font-semibold text-blue-700">
              {formatCount(leader.views)} views · {leader.avgEngagementRate}% engagement
            </p>
          </div>

          {runnerUp && viewMultiplier ? (
            <p className="rounded-2xl bg-blue-50 px-4 py-3 text-base font-semibold text-blue-950">
              {formatMultiplier(viewMultiplier)} more views than {runnerUp.platform}
            </p>
          ) : null}

          {platformStats.length > 1 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {platformStats.slice(0, 3).map((stat) => (
                <div
                  key={stat.platform}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <p className="text-base font-bold text-slate-900">{stat.platform}</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-slate-950">
                    {formatCount(stat.views)}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-600">
                    {stat.avgEngagementRate}% engagement
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-base font-medium text-slate-500">
          No platform data available yet.
        </p>
      )}
    </article>
  )
}
