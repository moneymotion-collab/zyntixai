"use client"

import { Calendar, Hash, Megaphone, Sparkles } from "lucide-react"
import CampaignSummaryCard from "@/components/marketing/CampaignSummaryCard"
import {
  formatCampaignContentTypeLabel,
  type CampaignContentItem,
} from "@/lib/marketing/campaign-content-types"
import { buildCampaignSummary } from "@/lib/marketing/campaign-summary"

type CampaignResultViewProps = {
  items: CampaignContentItem[]
  campaignName: string
  durationDays: number
  platform: string
  campaignGoal: string
}

function ContentTypeBadge({ type }: { type: string }) {
  return (
    <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
      {formatCampaignContentTypeLabel(type)}
    </span>
  )
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
      {category}
    </span>
  )
}

export default function CampaignResultView({
  items,
  campaignName,
  durationDays,
  platform,
  campaignGoal,
}: CampaignResultViewProps) {
  const contentTypes = new Set(
    items.map((item) => formatCampaignContentTypeLabel(item.content_type)),
  )
  const categories = new Set(items.map((item) => item.category))
  const summary = buildCampaignSummary(items, durationDays, campaignGoal)

  return (
    <div className="space-y-5">
      <CampaignSummaryCard summary={summary} />

      <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-cyan-50 p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-violet-600" />
          <h3 className="font-semibold text-gray-900">{campaignName}</h3>
        </div>
        <p className="text-sm leading-relaxed text-gray-700">
          {durationDays}-day content plan on {platform} focused on{" "}
          {campaignGoal.toLowerCase()}. {items.length} posts ready to schedule.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
            <Calendar className="h-3.5 w-3.5" />
            {items.length} days
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {contentTypes.size} content types
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
            {categories.size} categories
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.day}
            className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                Day {item.day}
              </span>
              <div className="flex flex-wrap justify-end gap-1">
                <ContentTypeBadge type={item.content_type} />
                <CategoryBadge category={item.category} />
              </div>
            </div>

            <h4 className="mb-2 text-sm font-semibold leading-snug text-gray-900">
              {item.hook}
            </h4>

            <p className="mb-3 flex-1 text-sm leading-relaxed text-gray-600">
              {item.caption}
            </p>

            <div className="space-y-2 border-t border-gray-100 pt-3">
              <p className="flex items-start gap-1.5 text-xs text-gray-500">
                <Hash className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {item.hashtags}
              </p>
              <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-800">
                CTA: {item.cta}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
