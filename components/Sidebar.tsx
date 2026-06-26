"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { ChevronDown, LogOut, Menu, X } from "lucide-react"
import {
  getNavItemsForRole,
  getRoleLabel,
  isNavGroup,
  type NavItem,
} from "@/lib/auth/roles"
import { getSidebarGroupIcon, getSidebarIcon } from "@/lib/navigation/sidebar-icons"
import { useAuth } from "@/app/providers/AuthProvider"
import { signOut } from "@/lib/auth/sign-out"
import { useRole } from "@/app/hooks/useRole"
import FitCoreLogo from "@/components/brand/FitCoreLogo"
import { MOBILE_NAV_LINK, MOBILE_SAFE_TOP, MOBILE_TAP_TARGET } from "@/lib/ui/mobile-layout"

const PUBLIC_EXACT_PATHS = ["/"]
const PUBLIC_PREFIXES = ["/login", "/register", "/auth", "/onboarding", "/pricing", "/privacy", "/terms", "/about", "/contact", "/workspace"]

function isPublicPath(pathname: string) {
  if (PUBLIC_EXACT_PATHS.includes(pathname)) {
    return true
  }

  return PUBLIC_PREFIXES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

function isItemActive(pathname: string, item: NavItem): boolean {
  if (isNavGroup(item)) {
    return item.children.some(
      (child) =>
        pathname === child.href || pathname.startsWith(`${child.href}/`),
    )
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function navLinkClass(active: boolean, nested = false) {
  return [
    MOBILE_NAV_LINK,
    "saas-focus-ring group relative transition-all duration-200 ease-out",
    nested ? "py-2 text-sm" : "py-2.5 text-[15px]",
    active
      ? "bg-gradient-to-r from-white/[0.14] via-white/[0.08] to-white/[0.03] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.18)] ring-1 ring-white/10"
      : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100",
  ].join(" ")
}

function navIconClass(active: boolean) {
  return [
    "h-4 w-4 shrink-0 transition-colors duration-200",
    active
      ? "text-cyan-400"
      : "text-slate-500 group-hover:text-cyan-300/90",
  ].join(" ")
}

function SidebarNavLink({
  href,
  label,
  active,
  nested = false,
  onNavigate,
}: {
  href: string
  label: string
  active: boolean
  nested?: boolean
  onNavigate?: () => void
}) {
  const Icon = getSidebarIcon(href)

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={navLinkClass(active, nested)}
      aria-current={active ? "page" : undefined}
    >
      {active ? (
        <span
          className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-gradient-to-b from-cyan-400 to-indigo-400"
          aria-hidden
        />
      ) : null}
      <Icon className={navIconClass(active)} aria-hidden />
      <span className="min-w-0 truncate">{label}</span>
    </Link>
  )
}

function SidebarContent({
  pathname,
  role,
  email,
  onNavigate,
  onLogout,
}: {
  pathname: string
  role: string | null
  email: string
  onNavigate?: () => void
  onLogout: () => void
}) {
  const items = useMemo(() => getNavItemsForRole(role), [role])
  const activeExpanded = useMemo(
    () =>
      items
        .filter(isNavGroup)
        .filter((group) => isItemActive(pathname, group))
        .map((group) => group.name),
    [items, pathname],
  )

  const [manualExpanded, setManualExpanded] = useState<string[]>([])
  const [manualCollapsed, setManualCollapsed] = useState<string[]>([])

  const expandedGroups = useMemo(() => {
    const open = new Set([...activeExpanded, ...manualExpanded])
    for (const name of manualCollapsed) {
      open.delete(name)
    }
    return [...open]
  }, [activeExpanded, manualExpanded, manualCollapsed])

  const isLinkActive = (href: string) =>
    href === "/settings"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`)

  const toggleGroup = (name: string) => {
    const isOpen = expandedGroups.includes(name)
    if (isOpen) {
      setManualCollapsed((current) =>
        current.includes(name) ? current : [...current, name],
      )
      setManualExpanded((current) => current.filter((group) => group !== name))
    } else {
      setManualCollapsed((current) => current.filter((group) => group !== name))
      setManualExpanded((current) =>
        current.includes(name) ? current : [...current, name],
      )
    }
  }

  return (
    <>
      <div>
        <div className="mb-8 border-b border-white/[0.06] pb-6">
          <FitCoreLogo
            size="md"
            variant="full"
            href="/dashboard"
          />
        </div>

        <nav className="space-y-1" aria-label="Main navigation">
          {items.map((item) =>
            isNavGroup(item) ? (
              <div key={item.name} className="space-y-1">
                {(() => {
                  const groupActive = isItemActive(pathname, item)
                  const GroupIcon = getSidebarGroupIcon(item.name)
                  const isOpen = expandedGroups.includes(item.name)

                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.name)}
                        className={[
                          MOBILE_NAV_LINK,
                          "saas-focus-ring group w-full justify-between py-2.5 text-left text-[15px] font-medium transition-all duration-200 ease-out",
                          groupActive
                            ? "bg-white/[0.05] text-white ring-1 ring-white/10"
                            : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100",
                        ].join(" ")}
                        aria-expanded={isOpen}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <GroupIcon
                            className={navIconClass(groupActive)}
                            aria-hidden
                          />
                          <span className="truncate">{item.name}</span>
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 group-hover:text-slate-300 ${
                            isOpen ? "rotate-0" : "-rotate-90"
                          }`}
                          aria-hidden
                        />
                      </button>

                      <div
                        className={`grid transition-all duration-200 ease-out ${
                          isOpen
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="ml-3 space-y-0.5 border-l border-white/[0.08] py-1 pl-3">
                            {item.children.map((child) => (
                              <SidebarNavLink
                                key={child.href}
                                href={child.href}
                                label={child.name}
                                active={isLinkActive(child.href)}
                                nested
                                onNavigate={onNavigate}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            ) : (
              <SidebarNavLink
                key={item.href}
                href={item.href}
                label={item.name}
                active={isLinkActive(item.href)}
                onNavigate={onNavigate}
              />
            ),
          )}

          {role === "admin" ? (
            <SidebarNavLink
              href="/admin"
              label="Admin"
              active={isLinkActive("/admin")}
              onNavigate={onNavigate}
            />
          ) : null}
        </nav>
      </div>

      <div className="border-t border-white/[0.06] pt-5">
        <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
          <p className="truncate text-sm font-semibold text-white">{email}</p>
          <p className="mt-0.5 text-xs text-slate-500">{getRoleLabel(role)}</p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition-all duration-200 hover:border-red-500/35 hover:bg-red-500/15 hover:text-red-200"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </button>
      </div>
    </>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const { role } = useRole()
  const { user, setRole, setUser } = useAuth()
  const [mobileMenu, setMobileMenu] = useState(false)
  const email = user?.email ?? ""

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close drawer on navigation
    setMobileMenu(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileMenu) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenu(false)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [mobileMenu])

  const logout = async () => {
    setMobileMenu(false)
    setRole(null)
    setUser(null)
    await signOut()
  }

  const closeMobile = () => setMobileMenu(false)

  if (isPublicPath(pathname)) {
    return null
  }

  return (
    <>
      <div className={`flex w-full items-center justify-between border-b border-white/[0.06] bg-[#050816] px-4 py-3 text-white md:hidden ${MOBILE_SAFE_TOP}`}>
        <FitCoreLogo size="sm" variant="mark" href="/dashboard" />

        <button
          type="button"
          onClick={() => setMobileMenu(!mobileMenu)}
          className={`${MOBILE_TAP_TARGET} rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors duration-200 hover:bg-white/[0.08] hover:text-white`}
          aria-label={mobileMenu ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenu}
        >
          {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenu ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 md:hidden"
            onClick={closeMobile}
            aria-label="Close menu"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col justify-between overflow-y-auto overscroll-contain border-r border-white/[0.06] bg-[#050816] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] text-white shadow-[20px_0_60px_rgba(0,0,0,0.35)] md:hidden">
            <SidebarContent
              pathname={pathname}
              role={role}
              email={email}
              onNavigate={closeMobile}
              onLogout={logout}
            />
          </aside>
        </>
      ) : null}

      <aside className="hidden shrink-0 flex-col justify-between border-r border-white/[0.06] bg-[#050816] p-5 text-white md:flex md:w-64 lg:w-72 lg:p-6">
        <SidebarContent
          pathname={pathname}
          role={role}
          email={email}
          onLogout={logout}
        />
      </aside>
    </>
  )
}
