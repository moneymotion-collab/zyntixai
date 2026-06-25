"use client"

import { BarChart3, Calendar, Target } from "lucide-react"
import type { CampaignSummary } from "@/lib/marketing/campaign-summary"

type CampaignSummaryCardProps = {
  summary: CampaignSummary
}

export default function CampaignSummaryCard({
  summary,
}: CampaignSummaryCardProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-base font-semibold text-gray-900">Campaign Summary</h3>

      <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
        {summary.totalPosts}{" "}
        <span className="text-lg font-semibold text-gray-500">
          Posts Generated
        </span>
      </p>

      {summary.breakdown.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {summary.breakdown.map((entry) => (
            <li
              key={entry.content_type}
              className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5"
            >
              <span className="text-sm font-medium text-gray-900">
                {entry.count} {entry.label}
              </span>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-violet-500"
                  style={{
                    width: `${Math.round((entry.count / summary.totalPosts) * 100)}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
          <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-violet-600">
            <Target className="h-3.5 w-3.5" />
            Primary Goal
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {summary.primaryGoal}
          </p>
        </div>

        <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
          <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-cyan-600">
            <Calendar className="h-3.5 w-3.5" />
            Estimated Weekly Output
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {summary.estimatedWeeklyOutput} Posts
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <BarChart3 className="h-3.5 w-3.5" />
        Content mix based on generated campaign plan
      </div>
    </section>
  )
}
