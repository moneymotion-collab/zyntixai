"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { usePlatformAssistant } from "./PlatformAssistantProvider"

function ShortcutHint() {
  const [label, setLabel] = useState("Ctrl+K")

  useEffect(() => {
    setLabel(
      /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? "⌘K" : "Ctrl+K",
    )
  }, [])

  return (
    <kbd className="hidden rounded-lg border border-white/10 bg-black/30 px-2 py-0.5 text-[11px] font-medium text-slate-400 lg:inline">
      {label}
    </kbd>
  )
}

export default function ZyntixAiTopNav() {
  const { open, isAvailable } = usePlatformAssistant()

  if (!isAvailable) return null

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-white/[0.06] bg-[#06080f]/90 backdrop-blur-md">
      <div className="flex items-center justify-end gap-3 px-5 py-3 md:px-8 lg:px-10">
        <button
          type="button"
          onClick={open}
          className="saas-focus-ring group inline-flex min-h-10 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:border-violet-400/25 hover:bg-violet-500/[0.08] hover:text-white sm:px-4"
          aria-label="Open ZyntixAI command bar"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300 transition group-hover:bg-violet-500/25">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span>Ask ZyntixAI</span>
          <ShortcutHint />
        </button>
      </div>
    </header>
  )
}
