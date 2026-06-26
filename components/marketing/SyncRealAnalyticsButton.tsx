"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import {
  syncAnalytics,
  type SyncAnalyticsResponse,
} from "@/lib/marketing/sync-analytics-client"
import { notifyMarketingCoreChanged } from "@/lib/marketing/notify"

function formatMode(mode: SyncAnalyticsResponse["mode"]) {
  if (mode === "mock") return "Demo mock data"
  if (mode === "skipped") return "Not connected"
  if (mode === "real") return "Real"
  return "Unknown"
}

export default function SyncRealAnalyticsButton({
  onSynced,
}: {
  onSynced?: () => void
}) {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<SyncAnalyticsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setError(null)
    setResult(null)

    try {
      const response = await syncAnalytics()
      setResult(response)

      if (response.success && response.mode !== "skipped") {
        onSynced?.()
        notifyMarketingCoreChanged()
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed.")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
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

      {result ? (
        <div
          className={`w-full max-w-sm rounded-2xl border px-4 py-3 text-sm sm:w-auto ${
            result.mode === "skipped"
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : result.success
                ? "border-green-200 bg-green-50 text-green-900"
                : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <p className="font-medium">
            {result.message ??
              (result.mode === "skipped"
                ? "Real analytics are not connected yet."
                : "Sync result")}
          </p>
          {result.mode !== "skipped" ? (
            <dl className="mt-2 space-y-1">
              <div className="flex justify-between gap-4">
                <dt className="text-green-800/80">Updated posts</dt>
                <dd className="font-medium">{result.updated ?? 0}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-green-800/80">Skipped posts</dt>
                <dd className="font-medium">{result.skipped ?? 0}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-green-800/80">Mode</dt>
                <dd className="font-medium">{formatMode(result.mode)}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="max-w-sm rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}
