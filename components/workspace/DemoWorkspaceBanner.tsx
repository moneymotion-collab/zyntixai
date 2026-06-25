"use client"

import { Sparkles } from "lucide-react"
import { DEMO_WORKSPACE_BANNER_TEXT } from "@/lib/demo/demo-copy"
import { useIsDemoWorkspace } from "@/app/hooks/useIsDemoWorkspace"

const HIDDEN_PREFIXES = ["/workspace", "/onboarding", "/login", "/register"]

function shouldHideBanner(pathname: string): boolean {
  return HIDDEN_PREFIXES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

export default function DemoWorkspaceBanner({
  pathname,
}: {
  pathname: string
}) {
  const { isDemoWorkspace, loading } = useIsDemoWorkspace()

  if (loading || !isDemoWorkspace || shouldHideBanner(pathname)) {
    return null
  }

  return (
    <div
      className="border-b border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-violet-500/10 px-4 py-2.5"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 text-center text-sm font-medium text-cyan-100/95">
        <Sparkles className="h-4 w-4 shrink-0 text-cyan-300/90" aria-hidden />
        <span>{DEMO_WORKSPACE_BANNER_TEXT}</span>
      </div>
    </div>
  )
}
