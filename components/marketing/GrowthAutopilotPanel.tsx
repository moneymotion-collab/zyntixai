"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import type { AutopilotStrategy } from "@/lib/marketing/autopilot-types"
import { runGrowthAutopilot } from "@/lib/marketing/run-growth-autopilot"

export default function GrowthAutopilotPanel() {
  const [brandId, setBrandId] = useState<string | null>(null)
  const [loadingBrand, setLoadingBrand] = useState(true)
  const [running, setRunning] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [autopilot, setAutopilot] = useState<AutopilotStrategy | null>(null)

  const loadBrand = useCallback(async () => {
    setLoadingBrand(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/marketing/brand", { credentials: "include" })
      const data = (await res.json()) as {
        error?: string
        profile?: { id: string | null }
      }

      if (!res.ok) {
        setErrorMessage(data.error ?? "Could not load brand profile.")
        setBrandId(null)
        return
      }

      setBrandId(data.profile?.id ?? null)
    } catch {
      setErrorMessage("Could not load brand profile.")
      setBrandId(null)
    } finally {
      setLoadingBrand(false)
    }
  }, [])

  useEffect(() => {
    void loadBrand()
  }, [loadBrand])

  const runAutopilot = async () => {
    if (!brandId) return

    setRunning(true)
    setErrorMessage(null)
    setAutopilot(null)

    try {
      const data = await runGrowthAutopilot(brandId)

      if (data.error || !data.autopilot) {
        setErrorMessage(data.error ?? "Autopilot failed.")
        return
      }

      setAutopilot(data.autopilot)
    } catch {
      setErrorMessage("Autopilot request failed.")
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-4">
        <button
          type="button"
          onClick={runAutopilot}
          disabled={loadingBrand || running || !brandId}
          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running…
            </>
          ) : (
            <>🚀 Run AI Growth Autopilot</>
          )}
        </button>
      </div>

      {loadingBrand ? (
        <p className="text-sm text-gray-500">Loading brand…</p>
      ) : !brandId ? (
        <p className="text-sm text-gray-500">
          Set up your brand profile first to run autopilot.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {autopilot ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Insights
            </p>
            <p className="mt-2 text-sm text-gray-700">{autopilot.insights.summary}</p>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-gray-500">Best content</dt>
                <dd className="font-medium text-gray-900">
                  {autopilot.insights.best_content_type || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Worst content</dt>
                <dd className="font-medium text-gray-900">
                  {autopilot.insights.worst_content_type || "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Best posting time</dt>
                <dd className="font-medium text-gray-900">
                  {autopilot.insights.best_posting_time || "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Next strategy
            </p>
            <p className="mt-2 font-medium text-gray-900">
              {autopilot.next_strategy.focus}
            </p>
            {autopilot.next_strategy.content_changes.length > 0 ? (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700">Content changes</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-gray-600">
                  {autopilot.next_strategy.content_changes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {autopilot.next_strategy.posting_adjustments.length > 0 ? (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700">Posting adjustments</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-gray-600">
                  {autopilot.next_strategy.posting_adjustments.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {autopilot.next_strategy.new_ideas.length > 0 ? (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700">New ideas</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-gray-600">
                  {autopilot.next_strategy.new_ideas.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
