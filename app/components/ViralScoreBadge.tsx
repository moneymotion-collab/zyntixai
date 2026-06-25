import { Flame } from "lucide-react"
import { ViralScoreResult } from "@/components/marketing/ViralScoreResult"
import { mapViralScoreToResultProps } from "@/lib/marketing/map-viral-score-result-props"

export default function ViralScoreBadge({
  score,
  reason,
  viral_feedback,
  title,
  caption,
  className = "",
}: {
  score: number | null | undefined
  reason?: string | null
  viral_feedback?: string | null
  title?: string
  caption?: string
  className?: string
}) {
  if (score == null) {
    return (
      <div
        className={`overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/50 p-6 shadow-sm ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-800">
              Viral Score
            </p>
            <p className="mt-0.5 text-base font-semibold text-amber-950">
              Not scored yet
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-amber-900/80">
          Run a viral score analysis to unlock hook, retention, engagement, and
          CTA insights for this post.
        </p>
      </div>
    )
  }

  const resultProps = mapViralScoreToResultProps({
    score,
    viral_reason: reason,
    viral_feedback,
    title,
    caption,
  })

  return (
    <div className={className}>
      <ViralScoreResult {...resultProps} />
    </div>
  )
}
