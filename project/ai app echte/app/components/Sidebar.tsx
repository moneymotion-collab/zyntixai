"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  BarChart3,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  LayoutDashboard,
  Menu,
  Salad,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Members", href: "/members", icon: Users },
  { name: "Sessions", href: "/sessions", icon: CalendarClock },
  { name: "Workout Plans", href: "/workouts", icon: Dumbbell },
  { name: "Nutrition", href: "/nutrition", icon: Salad },
  { name: "AI Coach", href: "/ai-coach", icon: Sparkles },
  { name: "Progress Tracking", href: "/progress", icon: TrendingUp },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (typeof document === "undefined") return
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#0F172A]/80 text-white shadow-lg backdrop-blur-md transition hover:bg-[#1E293B] lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col justify-between border-r border-white/10 bg-[#0F172A] transition-all duration-300",
          "lg:sticky lg:top-0 lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "lg:w-[90px] w-[280px]" : "w-[280px]",
        ].join(" ")}
      >
        <div>
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
            <div
              className={`flex items-center gap-3 ${
                collapsed ? "lg:w-full lg:justify-center" : ""
              }`}
            >
              <div className="rounded-2xl bg-cyan-500 p-3">
                <Dumbbell className="text-black" size={22} />
              </div>

              {(!collapsed || mobileOpen) && (
                <div className={collapsed ? "lg:hidden" : ""}>
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    FITAI
                  </h1>
                  <p className="text-xs text-gray-400">Fitness CRM System</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="text-gray-400 transition hover:text-white lg:hidden"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>

            {!collapsed && (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="hidden text-gray-400 transition hover:text-white lg:inline-flex"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={20} />
              </button>
            )}
          </div>

          {collapsed && (
            <div className="hidden justify-center py-4 lg:flex">
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                className="rounded-xl bg-[#1E293B] p-2 text-white transition hover:bg-[#334155]"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          <nav className="space-y-1.5 px-4 py-6">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(`${item.href}/`)
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={[
                    "group flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-200",
                    isActive
                      ? "bg-cyan-500 font-semibold text-black shadow-lg shadow-cyan-500/20"
                      : "text-gray-300 hover:bg-[#1E293B] hover:text-white",
                  ].join(" ")}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    size={20}
                    className={
                      isActive
                        ? "text-black"
                        : "text-gray-400 group-hover:text-white"
                    }
                  />

                  <span
                    className={[
                      "text-sm",
                      collapsed ? "lg:hidden" : "",
                    ].join(" ")}
                  >
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4">
          <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5">
            <div className={collapsed ? "lg:hidden" : ""}>
              <h3 className="text-lg font-bold text-white">Upgrade to Pro</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Unlock AI automations, advanced analytics & smart workflows.
              </p>
              <button className="mt-5 w-full rounded-2xl bg-white py-3 font-semibold text-black transition hover:scale-[1.02]">
                Upgrade
              </button>
            </div>

            {collapsed && (
              <div className="hidden justify-center lg:flex">
                <div className="rounded-2xl bg-white/20 p-3">
                  <Activity className="text-white" size={22} />
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}