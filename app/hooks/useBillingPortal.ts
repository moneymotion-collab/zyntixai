"use client"

import { useCallback, useState } from "react"

export function useBillingPortal() {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const openPortal = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        credentials: "include",
      })

      const data = (await res.json()) as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        setErrorMessage(data.error ?? "Could not open billing portal.")
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setErrorMessage("Could not open billing portal.")
      setLoading(false)
    }
  }, [])

  return { openPortal, loading, errorMessage }
}
