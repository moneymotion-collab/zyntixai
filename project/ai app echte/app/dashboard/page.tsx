import {
  Activity,
  Brain,
  Calendar,
  Dumbbell,
  TrendingUp,
  Users,
} from "lucide-react"
import ProtectedShell from "../components/ProtectedShell"
import RevenueChart from "@/components/charts/revenue-chart"

const stats = [
  { label: "Total Members", value: "1,248", icon: Users },
  { label: "Revenue", value: "€18,430", icon: TrendingUp },
  { label: "Appointments", value: "84", icon: Calendar },
  { label: "Active Plans", value: "321", icon: Dumbbell },
]

export default function DashboardPage() {
  return (
    <ProtectedShell>
      <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-card to-dark text-white">

        {/* TOPBAR */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Fitness Dashboard</h1>
            <p className="text-zinc-400 mt-1">Welcome back coach 👋</p>
          </div>

          <div className="flex items-center gap-4">
            <input
              placeholder="Search..."
              className="bg-card border border-zinc-800 rounded-xl px-4 py-2 outline-none"
            />
            <div className="w-10 h-10 rounded-full bg-primary"></div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-gradient-to-b from-card to-dark border border-zinc-800 hover:border-primary/40 hover:scale-[1.02] transition-all duration-300 p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">{label}</p>
                  <h2 className="text-3xl font-bold mt-2">{value}</h2>
                </div>

                <div className="bg-primary/10 p-3 rounded-xl">
                  <Icon className="text-primary w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* CHART */}
          <div className="xl:col-span-2 bg-card rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Activity className="text-primary w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold">Revenue Overview</h3>
            </div>

            <RevenueChart />
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            {/* UPCOMING */}
            <div className="bg-card rounded-2xl p-6 border border-zinc-800">
              <h3 className="text-xl font-semibold mb-6">Upcoming Sessions</h3>

              <div className="space-y-4">
                <div className="bg-dark hover:bg-card/60 transition-colors p-4 rounded-xl">
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-zinc-400">
                    Personal Training Ã¢â‚¬Â¢ 14:00
                  </p>
                </div>

                <div className="bg-dark hover:bg-card/60 transition-colors p-4 rounded-xl">
                  <p className="font-medium">Sarah Smith</p>
                  <p className="text-sm text-zinc-400">
                    Fitness Check Ã¢â‚¬Â¢ 16:30
                  </p>
                </div>
              </div>
            </div>

            {/* AI INSIGHT */}
            <div className="bg-card rounded-2xl p-6 border border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <Brain className="text-primary w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold">AI Insight</h3>
              </div>

              <p className="text-sm text-zinc-400">
                3 members have not booked a session this week. Send them a check-in nudge.
              </p>
            </div>

          </div>

        </div>

      </main>
    </ProtectedShell>
  )
}