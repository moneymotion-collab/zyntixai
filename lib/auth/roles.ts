import type { UserRole } from "@/lib/types/roles"
import { USER_ROLES } from "@/lib/types/roles"
import { normalizeRole } from "@/lib/auth/normalize-role"

export { normalizeRole }

export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole)
}

export function hasRole(
  role: string | null | undefined,
  allowed: UserRole[],
): boolean {
  const normalized = normalizeRole(role)
  if (!normalized) return false
  return allowed.includes(normalized)
}

export type NavLink = { name: string; href: string }

export type NavGroup = {
  name: string
  children: NavLink[]
}

export type NavItem = NavLink | NavGroup

export function isNavGroup(item: NavItem): item is NavGroup {
  return "children" in item
}

const COACH_NAV: NavItem[] = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Coach Workspace", href: "/coach-workspace" },
  { name: "Workouts", href: "/workouts" },
  { name: "Exercise Library", href: "/dashboard/exercises" },
  { name: "Members", href: "/members" },
  { name: "Progress", href: "/progress" },
  { name: "Nutrition", href: "/nutrition" },
  { name: "Sessions", href: "/sessions" },
  { name: "AI Coach", href: "/ai-coach" },
  { name: "Analytics", href: "/analytics" },
  {
    name: "Marketing AI",
    children: [
      { name: "Marketing Dashboard", href: "/marketing" },
      { name: "Marketing Coach", href: "/marketing-ai/coach" },
      { name: "Content Ideas", href: "/marketing/content-ideas" },
      { name: "Instagram Demo Preview", href: "/marketing/instagram-demo-preview" },
      { name: "Campaign Generator", href: "/marketing/campaign-generator" },
      { name: "Hook Library", href: "/marketing/hook-library" },
      { name: "CTA Generator", href: "/marketing/cta-generator" },
      { name: "Story Structure", href: "/marketing/story-structure" },
      { name: "Calendar", href: "/marketing/calendar" },
      { name: "Published", href: "/marketing/scheduled" },
      { name: "Analytics", href: "/marketing/analytics" },
      { name: "Learning Engine", href: "/marketing/learning" },
      { name: "Video Generator", href: "/marketing/video-generator" },
      { name: "Marketing Settings", href: "/marketing/settings" },
    ],
  },
  {
    name: "Settings",
    children: [
      { name: "General", href: "/settings" },
      { name: "Demo Data", href: "/settings/demo-data" },
    ],
  },
]

export function getNavLinksForRole(role: string | null | undefined): NavLink[] {
  return getNavItemsForRole(role).flatMap((item) =>
    isNavGroup(item) ? item.children : [item],
  )
}

export function getNavItemsForRole(role: string | null | undefined): NavItem[] {
  const normalized = normalizeRole(role)

  if (normalized === "member") {
    return [
      { name: "Dashboard", href: "/dashboard" },
      { name: "My Workouts", href: "/my-workouts" },
      { name: "My Nutrition", href: "/my-nutrition" },
      { name: "My Check-Ins", href: "/my-check-ins" },
      { name: "Progress", href: "/progress" },
      { name: "Settings", href: "/settings" },
    ]
  }

  if (normalized === "coach" || normalized === "admin") {
    return COACH_NAV
  }

  return [{ name: "Dashboard", href: "/dashboard" }]
}

export const ROUTE_ACCESS: Record<string, UserRole[]> = {
  "/dashboard": ["admin", "coach", "member"],
  "/coach-workspace": ["admin", "coach"],
  "/settings": ["admin", "coach", "member"],
  "/settings/demo-data": ["admin", "coach"],
  "/admin": ["admin"],
  "/members": ["admin", "coach"],
  "/workouts": ["admin", "coach"],
  "/dashboard/exercises": ["admin", "coach"],
  "/nutrition": ["admin", "coach"],
  "/sessions": ["admin", "coach"],
  "/analytics": ["admin", "coach"],
  "/ai-coach": ["admin", "coach"],
  "/marketing": ["admin", "coach"],
  "/marketing-ai": ["admin", "coach"],
  "/onboarding": ["admin", "coach"],
  "/my-workouts": ["admin", "member"],
  "/my-nutrition": ["admin", "member"],
  "/my-check-ins": ["admin", "member"],
  "/progress": ["admin", "coach", "member"],
}

export function canAccessRoute(
  pathname: string,
  role: string | null | undefined,
): boolean {
  const normalized = normalizeRole(role)
  if (!normalized) return false

  const matchedEntry = Object.entries(ROUTE_ACCESS).find(([route]) =>
    pathname === route || pathname.startsWith(`${route}/`),
  )

  if (!matchedEntry) return true

  const [, allowed] = matchedEntry
  return allowed.includes(normalized)
}

export function getRoleLabel(role: string | null | undefined): string {
  const normalized = normalizeRole(role)
  if (normalized === "admin") return "Admin"
  if (normalized === "coach") return "Coach"
  if (normalized === "member") return "Member"
  return "User"
}

/** Landing route after login — role-specific home */
export function getHomeRouteForRole(role: string | null | undefined): string {
  const normalized = normalizeRole(role)

  if (normalized === "member") return "/my-workouts"
  if (normalized === "admin") return "/dashboard"
  if (normalized === "coach") return "/dashboard"

  return "/dashboard"
}
