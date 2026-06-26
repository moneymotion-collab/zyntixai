"use client"

import { useEffect } from "react"
import { MARKETING_CORE_CHANGED_EVENT } from "@/lib/marketing/notify"

export function useMarketingCoreChanged(
  onChanged: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return

    const handler = () => onChanged()
    window.addEventListener(MARKETING_CORE_CHANGED_EVENT, handler)
    return () => window.removeEventListener(MARKETING_CORE_CHANGED_EVENT, handler)
  }, [enabled, onChanged])
}
