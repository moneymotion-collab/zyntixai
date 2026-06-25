"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import type { InstagramConnectionStatus } from "@/lib/marketing/instagram/token-health"
import {
  fitcoreCardClass,
  fitcoreMutedClass,
} from "@/lib/ui/fitcore-form"

type InstagramConnectionStatusResponse = {
  status?: InstagramConnectionStatus
  statusLabel?: string
  statusMessage?: string
  lastSuccessfulPublishAt?: string | null
  tokenExpiresAt?: string | null
  error?: string
}

function statusTone(status: InstagramConnectionStatus | undefined) {
  switch (status) {
    case "connected":
      return "border-emerald-200 bg-emerald-50 text-emerald-800"
    case "token_expiring_soon":
      return "border-amber-200 bg-amber-50 text-amber-900"
    case "reconnect_required":
      return "border-red-200 bg-red-50 text-red-800"
    default:
      return "border-slate-200 bg-slate-50 text-slate-700"
  }
}

function formatTimestamp(value: string | null | undefined) {
  if (!value?.trim()) return "Never"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown"
  return date.toLocaleString()
}

export default function InstagramConnectionStatusCard() {
  const [loading, setLoading] = useState(true)
  const [payload, setPayload] = useState<InstagramConnectionStatusResponse | null>(
    null,
  )

  const loadStatus = useCallback(async () => {
    setLoading(true)

    try {
      const res = await fetch("/api/instagram/connection", {
        credentials: "include",
      })
      const data = (await res.json()) as InstagramConnectionStatusResponse

      if (!res.ok) {
        setPayload({
          status: "disconnected",
          statusLabel: "Not connected",
          statusMessage: data.error ?? "Could not load Instagram connection.",
        })
        return
      }

      setPayload(data)
    } catch {
      setPayload({
        status: "disconnected",
        statusLabel: "Not connected",
        statusMessage: "Could not load Instagram connection.",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  const status = payload?.status ?? "disconnected"

  return (
    <div className={`${fitcoreCardClass} mt-8 max-w-2xl p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Instagram publishing
          </h2>
          <p className={`mt-1 text-sm ${fitcoreMutedClass}`}>
            Connection health for scheduled and manual publishes.
          </p>
        </div>
        <Link
          href="/settings"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Manage connection
        </Link>
      </div>

      {loading ? (
        <div className={`mt-6 flex items-center py-4 ${fitcoreMutedClass}`}>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Checking Instagram connection…
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${statusTone(status)}`}
          >
            <p className="font-semibold">{payload?.statusLabel ?? "Not connected"}</p>
            <p className="mt-1">{payload?.statusMessage}</p>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
              <dt className={fitcoreMutedClass}>Last successful publish</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {formatTimestamp(payload?.lastSuccessfulPublishAt)}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
              <dt className={fitcoreMutedClass}>Token expiry</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {payload?.tokenExpiresAt
                  ? formatTimestamp(payload.tokenExpiresAt)
                  : "Not available"}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}
