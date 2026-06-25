import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock3,
  Flame,
  MessageSquare,
  Users,
} from "lucide-react"
import ProtectedShell from "../components/ProtectedShell"
import { dashboardStats, recentActivities } from "../../lib/fake-data"

const statIcons = [Users, Calendar, MessageSquare, Flame]
const statColors = [
  "text-blue-400",
  "text-purple-400",
  "text-pink-400",
  "text-orange-400",
]

export default function FitnessDashboardPreview() {
  return (
    <ProtectedShell>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>

            <p className="mt-2 text-gray-400">
              Welcome back, manage your coaching business with AI.
            </p>
          </div>

          <button className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 transition hover:bg-white/10">
            <Bell className="h-5 w-5" />
            Notifications
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat, index) => {
            const Icon = statIcons[index] ?? Users

            return (
              <div
                key={stat.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-400">{stat.title}</p>
                  <Icon className={statColors[index] ?? "text-cyan-400"} />
                </div>

                <h2 className="mt-4 text-4xl font-bold">{stat.value}</h2>

                <p
                  className={`mt-2 text-sm ${
                    stat.positive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {stat.change}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 xl:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">AI Workflow Automation</h2>

                <p className="mt-1 text-gray-400">
                  Your automated customer journey
                </p>
              </div>

              <div className="rounded-xl bg-green-500/20 px-4 py-2 text-sm text-green-400">
                Active
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                    <Users className="text-blue-400" />
                  </div>

                  <div>
                    <h3 className="font-semibold">New Lead Entered</h3>

                    <p className="text-sm text-gray-400">
                      Instagram DM received
                    </p>
                  </div>
                </div>

                <CheckCircle2 className="text-green-400" />
              </div>

              <div className="flex justify-center">
                <div className="h-8 w-[2px] bg-white/10" />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                    <MessageSquare className="text-purple-400" />
                  </div>

                  <div>
                    <h3 className="font-semibold">AI Follow-Up Message</h3>

                    <p className="text-sm text-gray-400">
                      Sent automatically after 5 minutes
                    </p>
                  </div>
                </div>

                <Clock3 className="text-yellow-400" />
              </div>

              <div className="flex justify-center">
                <div className="h-8 w-[2px] bg-white/10" />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                    <Calendar className="text-green-400" />
                  </div>

                  <div>
                    <h3 className="font-semibold">Appointment Booked</h3>

                    <p className="text-sm text-gray-400">
                      Client selected available time slot
                    </p>
                  </div>
                </div>

                <CheckCircle2 className="text-green-400" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-5 text-xl font-bold">Today&apos;s Tasks</h2>

              <div className="space-y-4">
                <div className="rounded-2xl bg-[#111] p-4">
                  <p className="font-medium">Check new leads</p>

                  <p className="mt-1 text-sm text-gray-400">
                    14 new messages waiting
                  </p>
                </div>

                <div className="rounded-2xl bg-[#111] p-4">
                  <p className="font-medium">Upload transformation post</p>

                  <p className="mt-1 text-sm text-gray-400">
                    Scheduled by AI content planner
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-5 text-xl font-bold">Live Activity</h2>

              <div className="space-y-4 text-sm">
                {recentActivities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex justify-between gap-4">
                    <p className="text-gray-300">{activity.activity}</p>

                    <span className="shrink-0 text-gray-500">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedShell>
  )
}
