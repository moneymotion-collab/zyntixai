import { Database, Settings, type LucideIcon } from "lucide-react"
import { hasRole } from "@/lib/auth/roles"

export type SettingsNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    label: "General",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Demo Data",
    href: "/settings/demo-data",
    icon: Database,
  },
]

export function getSettingsNavForRole(
  role: string | null | undefined,
): SettingsNavItem[] {
  const isCoachOrAdmin = hasRole(role, ["admin", "coach"])

  return SETTINGS_NAV.filter(
    (item) => item.href !== "/settings/demo-data" || isCoachOrAdmin,
  )
}
