import ProtectedShell from "../components/ProtectedShell"
import { analyticsData } from "../../lib/fake-data"

export default function AnalyticsPage() {
  const maxRevenue = Math.max(...analyticsData.map((item) => item.revenue))

  return (
    <ProtectedShell>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Analytics</h1>
          <p className="mt-2 text-gray-400">
            Track revenue, client growth, and engagement over time.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold">Revenue Growth</h2>
          <p className="mt-1 text-gray-400">Monthly overview</p>

          <div className="mt-8 flex h-[280px] items-end justify-between gap-4 rounded-3xl bg-[#111] p-6">
            {analyticsData.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center">
                <div
                  className="w-full rounded-t-2xl bg-cyan-400"
                  style={{ height: `${(item.revenue / maxRevenue) * 220}px` }}
                />
                <p className="mt-3 text-sm text-gray-400">{item.month}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </ProtectedShell>
  )
}
