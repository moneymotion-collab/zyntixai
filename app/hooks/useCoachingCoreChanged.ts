"use client"

import { useEffect } from "react"
import { COACHING_CORE_CHANGED_EVENT } from "@/lib/coaching-core/notify"

export function useCoachingCoreChanged(
  onChanged: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return

    const handler = () => onChanged()
    window.addEventListener(COACHING_CORE_CHANGED_EVENT, handler)
    return () => window.removeEventListener(COACHING_CORE_CHANGED_EVENT, handler)
  }, [enabled, onChanged])
}
