"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    name: "Appointments",
    href: "/appointments",
    icon: CalendarDays,
  },
  {
    name: "AI Messages",
    href: "/ai-messages",
    icon: MessageSquare,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`sticky top-0 flex h-screen flex-col justify-between border-r border-white/10 bg-[#0F172A] transition-all duration-300 ${
        collapsed ? "w-[90px]" : "w-[280px]"
      }`}
    >
      <div>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
          <div
            className={`flex items-center gap-3 ${
              collapsed ? "w-full justify-center" : ""
            }`}
          >
            <div className="rounded-2xl bg-cyan-500 p-3">
              <Dumbbell className="text-black" size={22} />
            </div>

            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  FITAI
                </h1>

                <p className="text-xs text-gray-400">Fitness CRM System</p>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="text-gray-400 transition hover:text-white"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center py-4">
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

        <nav className="space-y-2 px-4 py-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-200 ${
                  isActive
                    ? "bg-cyan-500 font-semibold text-black shadow-lg shadow-cyan-500/20"
                    : "text-gray-300 hover:bg-[#1E293B] hover:text-white"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  size={22}
                  className={`${
                    isActive
                      ? "text-black"
                      : "text-gray-400 group-hover:text-white"
                  }`}
                />

                {!collapsed && <span className="text-sm">{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4">
        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5">
          {!collapsed ? (
            <>
              <h3 className="text-lg font-bold text-white">Upgrade to Pro</h3>

              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Unlock AI automations, advanced analytics & smart workflows.
              </p>

              <button className="mt-5 w-full rounded-2xl bg-white py-3 font-semibold text-black transition hover:scale-[1.02]">
                Upgrade
              </button>
            </>
          ) : (
            <div className="flex justify-center">
              <div className="rounded-2xl bg-white/20 p-3">
                <BarChart3 className="text-white" size={22} />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
