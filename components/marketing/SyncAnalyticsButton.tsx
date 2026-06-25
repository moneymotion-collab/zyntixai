"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { syncAnalytics } from "@/lib/marketing/sync-analytics-client"

export default function SyncAnalyticsButton() {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setError(null)
    setMessage(null)

    try {
      const result = await syncAnalytics()
      const count = result.updated ?? 0

      if (result.mode === "skipped") {
        setMessage(result.message ?? "Real analytics are not connected yet.")
        return
      }

      const modeLabel = result.mode === "mock" ? " (demo mock data)" : ""
      setMessage(
        count === 1
          ? `Analytics synced for 1 post${modeLabel}.`
          : `Analytics synced for ${count} posts${modeLabel}.`,
      )
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed.")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void handleSync()}
        disabled={syncing}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {syncing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Syncing…
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Sync Analytics
          </>
        )}
      </button>
      {message ? (
        <p
          className={`rounded-2xl border px-4 py-3 text-sm ${
            message.includes("not connected")
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}
