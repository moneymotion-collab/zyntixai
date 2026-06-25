"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { getSettingsNavForRole } from "@/lib/settings-nav"
import { useRole } from "@/app/hooks/useRole"

export default function SettingsNav() {
  const pathname = usePathname()
  const { role } = useRole()
  const items = getSettingsNavForRole(role)

  return (
    <nav className="mt-6 flex flex-wrap gap-2">
      {items.map(({ label, href, icon: Icon }) => {
        const isActive =
          href === "/settings"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "border-black bg-black text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
