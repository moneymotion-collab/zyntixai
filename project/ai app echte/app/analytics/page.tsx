import { BarChart3, TrendingUp, Users } from "lucide-react"
import ProtectedShell from "../components/ProtectedShell"
import { analyticsData } from "@/lib/fake-data"

export default function AnalyticsPage() {
  const maxRevenue = Math.max(...analyticsData.map((item) => item.revenue))
  const maxMembers = Math.max(...analyticsData.map((item) => item.members))
  const latest = analyticsData[analyticsData.length - 1]

  return (
    <ProtectedShell>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
              FITAI
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Analytics</h1>
            <p className="mt-2 text-gray-400">
              Track revenue, member growth, and engagement over time.
            </p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <KpiCard
            label="MRR"
            value={`EUR ${latest.revenue.toLocaleString()}`}
            trend="+18%"
            icon={TrendingUp}
            accent="text-cyan-400"
          />
          <KpiCard
            label="Active Members"
            value={latest.members.toString()}
            trend="+12%"
            icon={Users}
            accent="text-blue-400"
          />
          <KpiCard
            label="Engagement Score"
            value={`${latest.engagement}%`}
            trend="+5 pts"
            icon={BarChart3}
            accent="text-purple-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-bold">Revenue Growth</h2>
            <p className="mt-1 text-gray-400">Monthly overview</p>
            <div className="mt-8 flex h-[260px] items-end justify-between gap-3 rounded-3xl bg-[#0b1224] p-6">
              {analyticsData.map((item) => (
                <div
                  key={item.month}
                  className="flex flex-1 flex-col items-center"
                >
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-cyan-500 to-cyan-300"
                    style={{
                      height: `${(item.revenue / maxRevenue) * 200}px`,
                    }}
                  />
                  <p className="mt-3 text-sm text-gray-400">{item.month}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-bold">Member Growth</h2>
            <p className="mt-1 text-gray-400">Total active members per month</p>
            <div className="mt-8 flex h-[260px] items-end justify-between gap-3 rounded-3xl bg-[#0b1224] p-6">
              {analyticsData.map((item) => (
                <div
                  key={item.month}
                  className="flex flex-1 flex-col items-center"
                >
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-blue-500 to-purple-400"
                    style={{
                      height: `${(item.members / maxMembers) * 200}px`,
                    }}
                  />
                  <p className="mt-3 text-sm text-gray-400">{item.month}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </ProtectedShell>
  )
}

function KpiCard({
  label,
  value,
  trend,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  trend: string
  icon: typeof TrendingUp
  accent: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-400">{label}</p>
        <Icon className={accent} />
      </div>
      <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{value}</h2>
      <p className="mt-2 text-sm text-green-400">{trend}</p>
    </div>
  )
}