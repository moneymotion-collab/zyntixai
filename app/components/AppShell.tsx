"use client"

import { usePathname } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import DemoWorkspaceBanner from "@/components/workspace/DemoWorkspaceBanner"

const PUBLIC_PREFIXES = ["/login", "/register", "/auth", "/onboarding", "/pricing", "/privacy", "/terms", "/about", "/contact"]

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (isPublicPath(pathname)) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex w-full min-w-0 flex-1 flex-col">
        <DemoWorkspaceBanner pathname={pathname} />
        <div className="h-16 shrink-0 lg:hidden" aria-hidden />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
