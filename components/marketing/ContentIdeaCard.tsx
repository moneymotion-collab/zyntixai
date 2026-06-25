"use client"

import {
  Calendar,
  Check,
  Loader2,
  MousePointerClick,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import ViralScoreBadge from "@/app/components/ViralScoreBadge"
import PostOptimizationFlow from "@/components/marketing/PostOptimizationFlow"
import type { AppliedOptimizedPost } from "@/lib/marketing/marketing-optimize-client"
import type { ContentIdeaCard as ContentIdea } from "@/lib/marketing/content-idea-cards"
import {
  buildIdeaBadges,
  getEngagementPotential,
  inferContentFormat,
  inferSuggestedCta,
} from "@/lib/marketing/content-idea-display"
import { getMarketingPlatformDisplayLabel } from "@/lib/marketing/platform-availability"

export default function ContentIdeaCard({
  idea,
  scheduling,
  improving,
  demoMode = false,
  onAddToCalendar,
  onImprove,
  onOptimizedApplied,
  onOptimizationError,
}: {
  idea: ContentIdea
  scheduling: boolean
  improving: boolean
  demoMode?: boolean
  onAddToCalendar: (idea: ContentIdea) => void
  onImprove: (idea: ContentIdea) => void
  onOptimizedApplied: (ideaId: string, applied: AppliedOptimizedPost) => void
  onOptimizationError?: (message: string) => void
}) {
  const scheduled = Boolean(idea.scheduledAt)
  const busy = scheduling || improving
  const badges = buildIdeaBadges(idea)
  const format = inferContentFormat(idea)
  const suggestedCta = inferSuggestedCta(idea)
  const engagement = getEngagementPotential(idea.viral_score)

  const platformLabel = getMarketingPlatformDisplayLabel(idea.platform)
  const platformAccent =
    platformLabel === "Instagram" || platformLabel === "Instagram Reels"
      ? "from-pink-500 via-purple-500 to-orange-400"
      : platformLabel === "Facebook"
        ? "from-blue-600 to-blue-400"
        : "from-violet-500 to-cyan-500"

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg">
      <div className={`h-1.5 bg-gradient-to-r ${platformAccent}`} />

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={`${idea.id}-${badge.label}`}
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}
            >
              {badge.label}
            </span>
          ))}
        </div>

        <h3 className="mt-4 text-xl font-bold leading-snug tracking-tight text-gray-900">
          {idea.title}
        </h3>

        {idea.caption ? (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
            {idea.caption}
          </p>
        ) : null}

        {idea.hashtags ? (
          <p className="mt-2 text-sm font-medium text-cyan-700">{idea.hashtags}</p>
        ) : null}

        <ViralScoreBadge
          score={idea.viral_score}
          reason={idea.viral_reason}
          title={idea.title}
          caption={idea.caption}
          className="mt-5"
        />

        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            Audience Fit
          </div>
          <p className={`mt-2 text-lg font-bold ${engagement.className}`}>
            {engagement.label}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            {engagement.description}
          </p>
          <p className="mt-3 text-xs text-gray-400">
            Format: <span className="font-medium text-gray-600">{format}</span>
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white">
              <MousePointerClick className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Suggested CTA
              </p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-gray-800">
                {suggestedCta}
              </p>
            </div>
          </div>
        </div>

        {scheduled && idea.scheduledAt ? (
          <p className="mt-4 flex items-center gap-2 text-xs font-medium text-cyan-700">
            <Calendar className="h-3.5 w-3.5" />
            Scheduled for{" "}
            {new Date(idea.scheduledAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        ) : null}

        <div className="mt-5 space-y-4 border-t border-gray-100 pt-5">
          <PostOptimizationFlow
            postId={idea.id}
            sourceTable="content_posts"
            originalTitle={idea.title}
            originalCaption={idea.caption}
            originalHashtags={idea.hashtags}
            platform={idea.platform}
            demoMode={demoMode}
            disabled={busy}
            onApplied={(applied) => onOptimizedApplied(idea.id, applied)}
            onError={onOptimizationError}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={() => onImprove(idea)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {improving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Improving…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-violet-500" />
                Improve with AI
              </>
            )}
          </button>

          <button
            type="button"
            disabled={scheduled || busy}
            onClick={() => onAddToCalendar(idea)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:hover:bg-gray-300"
          >
            {scheduling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding…
              </>
            ) : scheduled ? (
              <>
                <Check className="h-4 w-4" />
                On Calendar
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                Add to Calendar
              </>
            )}
          </button>
          </div>
        </div>
      </div>
    </article>
  )
}
