"use client"

import { useCallback, useState } from "react"
import type { BillingPlan } from "@/lib/stripe-config"

export function useSubscribe(defaultPlan: BillingPlan = "basic") {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const subscribe = useCallback(
    async (plan: BillingPlan = defaultPlan) => {
      setLoading(true)
      setErrorMessage(null)

      try {
        const res = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        })

        const data = (await res.json()) as { url?: string; error?: string }

        if (res.status === 401) {
          window.location.href = `/login?redirect=${encodeURIComponent("/pricing")}`
          return
        }

        if (!res.ok || !data.url) {
          setErrorMessage(data.error ?? "Could not start checkout.")
          setLoading(false)
          return
        }

        window.location.href = data.url
      } catch {
        setErrorMessage("Could not start checkout.")
        setLoading(false)
      }
    },
    [defaultPlan],
  )

  return { subscribe, loading, errorMessage }
}
