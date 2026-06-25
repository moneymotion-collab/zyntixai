export type ViralScoreResultProps = {
  score: number
  reason?: string
  recommendation?: string
  feedback?: string[]
  hookStrength?: number
  retention?: number
  engagement?: number
  ctaClarity?: number
}

const IMPROVEMENT_CARDS = [
  {
    title: "Improve Hook",
    defaultDescription: "Make the first 3 seconds more direct.",
  },
  {
    title: "Show Outcome",
    defaultDescription: "Mention saved time or more leads.",
  },
  {
    title: "Stronger CTA",
    defaultDescription: "Tell viewers exactly what to do next.",
  },
] as const

function getScoreLabel(score: number) {
  if (score >= 80) return "Viral Ready"
  if (score >= 60) return "Strong"
  if (score >= 40) return "Needs Work"
  return "Weak"
}

function ScoreBar({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">{value}%</span>
      </div>

      <div className="h-3 w-full rounded-full bg-gray-100">
        <div
          className="h-3 rounded-full bg-gray-900 transition-all"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  )
}

export function ViralScoreResult({
  score,
  reason,
  recommendation,
  feedback,
  hookStrength = 88,
  retention = 76,
  engagement = 84,
  ctaClarity = 81,
}: ViralScoreResultProps) {
  const label = getScoreLabel(score)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-1">
        <p className="text-sm font-medium text-gray-500">Viral Score</p>

        <div className="mt-4 flex items-end gap-2">
          <span className="text-6xl font-bold tracking-tight text-gray-950">
            {score}
          </span>
          <span className="mb-2 text-xl font-semibold text-gray-400">
            /100
          </span>
        </div>

        <div className="mt-4 inline-flex rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
          {label}
        </div>

        {reason && (
          <p className="mt-5 text-sm leading-6 text-gray-600">
            {reason}
          </p>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-950">
            Performance Breakdown
          </h3>
          <p className="text-sm text-gray-500">
            AI analysis of what makes this post perform.
          </p>
        </div>

        <div className="space-y-5">
          <ScoreBar label="Hook Strength" value={hookStrength} />
          <ScoreBar label="Retention Potential" value={retention} />
          <ScoreBar label="Engagement Potential" value={engagement} />
          <ScoreBar label="CTA Clarity" value={ctaClarity} />
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-3">
        <h3 className="text-lg font-semibold text-gray-950">
          AI Recommendation
        </h3>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          {recommendation ||
            "Start with a stronger pain-point hook, show the result earlier, and end with a clear action for personal trainers."}
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {IMPROVEMENT_CARDS.map((card, index) => (
            <div key={card.title} className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">
                {card.title}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {feedback?.[index] ?? card.defaultDescription}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
