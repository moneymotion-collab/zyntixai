"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AuthGate from "../components/AuthGate"
import Paywall from "../components/Paywall"
import { useSubscriptionAccess } from "../hooks/useSubscriptionAccess"
import { canAccess } from "@/lib/access/canAccess"
import { isCoachApprovalRejected } from "@/lib/app-access"
import { getHomeRouteForRole } from "@/lib/auth/roles"

function TrialEndedContent() {
  const router = useRouter()
  const { profile, loading, role } = useSubscriptionAccess()
  const [repairing, setRepairing] = useState(true)

  useEffect(() => {
    if (loading) return

    if (role === "admin" || canAccess(profile)) {
      router.replace(getHomeRouteForRole(role))
      return
    }

    void (async () => {
      setRepairing(true)

      try {
        const controller = new AbortController()
        const timeoutId = window.setTimeout(() => controller.abort(), 15_000)

        const syncResponse = await fetch("/api/access/sync", {
          method: "POST",
          credentials: "include",
          signal: controller.signal,
        })

        window.clearTimeout(timeoutId)

        if (syncResponse.ok) {
          const contentType = syncResponse.headers.get("content-type") ?? ""
          if (contentType.includes("application/json")) {
            const payload = (await syncResponse.json()) as {
              canAccess?: boolean
              profile?: { role?: string | null }
            }

            if (payload.canAccess) {
              router.replace(getHomeRouteForRole(payload.profile?.role ?? role))
              return
            }
          }
        }
      } catch {
        // Sync failed or timed out — fall through to the paywall / pending screens.
      } finally {
        setRepairing(false)
      }
    })()
  }, [loading, profile, role, router])

  if (loading || repairing) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Checking your access…
      </div>
    )
  }

  if (isCoachApprovalRejected(profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Account not approved</h1>
          <p className="mt-3 text-gray-600">
            Your coach application was not approved. Contact support if you think this
            is a mistake.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg">
        <Paywall />
      </div>
    </div>
  )
}

export default function TrialEndedPage() {
  return (
    <AuthGate>
      <TrialEndedContent />
    </AuthGate>
  )
}
