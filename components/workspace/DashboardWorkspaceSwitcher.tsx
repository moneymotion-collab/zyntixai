"use client"

import { Building2, LayoutGrid, Sparkles } from "lucide-react"
import Link from "next/link"
import type { WorkspaceMode } from "@/lib/workspace/workspace-mode"

type DashboardWorkspaceSwitcherProps = {
  currentMode: WorkspaceMode | null
  className?: string
}

export default function DashboardWorkspaceSwitcher({
  currentMode,
  className = "",
}: DashboardWorkspaceSwitcherProps) {
  const isDemo = currentMode === "demo"

  return (
    <div
      className={`glass-panel mb-6 flex flex-col gap-4 border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${className}`.trim()}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br",
            isDemo
              ? "border-cyan-400/30 from-cyan-500/25 to-indigo-500/20 text-cyan-200"
              : "border-indigo-400/25 from-indigo-500/20 to-blue-500/15 text-indigo-200",
          ].join(" ")}
        >
          {isDemo ? (
            <Sparkles className="h-5 w-5" aria-hidden />
          ) : (
            <Building2 className="h-5 w-5" aria-hidden />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Active workspace
          </p>
          <p className="mt-0.5 font-semibold text-white">
            {isDemo ? "Demo Workspace" : "My Workspace"}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {isDemo
              ? "Sample data only — switch anytime."
              : "Your live gym environment."}
          </p>
        </div>
      </div>

      <Link
        href="/workspace"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-400/35 hover:bg-white/[0.1]"
      >
        <LayoutGrid className="h-4 w-4" aria-hidden />
        Switch workspace
      </Link>
    </div>
  )
}
