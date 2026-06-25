import { computeLearningConfidenceScore } from "@/lib/marketing/learning/compute-confidence-score"
import type { LearningRunApiResponse } from "@/lib/marketing/learning/fetch-learning-run-client"
import AiLearningProfileCard from "@/components/marketing/learning/AiLearningProfileCard"
import LearningBestPatternsSection from "@/components/marketing/learning/LearningBestPatternsSection"
import LearningConfidenceBadge from "@/components/marketing/learning/LearningConfidenceBadge"
import LearningNextActionsSection from "@/components/marketing/learning/LearningNextActionsSection"
import LearningPatternsChart from "@/components/marketing/learning/LearningPatternsChart"
import LearningProfileCard from "@/components/marketing/learning/LearningProfileCard"
import LearningRecommendationsSection from "@/components/marketing/learning/LearningRecommendationsSection"
import LearningWeakPatternsSection from "@/components/marketing/learning/LearningWeakPatternsSection"
import { CheckCircle2 } from "lucide-react"

export default function LearningEngineDashboard({
  data,
}: {
  data: LearningRunApiResponse
}) {
  const profile = data.learning_profile

  if (!profile) {
    return null
  }

  const confidenceScore = computeLearningConfidenceScore(profile)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        <div className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Learning analysis complete
        </div>
        <p className="mt-1 text-green-700">
          Your profile has been updated with the latest performance patterns.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="flex-1">
          <LearningConfidenceBadge score={confidenceScore} />
        </div>
      </div>

      <AiLearningProfileCard summary={profile.ai_summary} />

      <LearningProfileCard profile={profile} />
      <LearningPatternsChart profile={profile} />
      <LearningBestPatternsSection profile={profile} />
      <LearningWeakPatternsSection profile={profile} />
      <LearningRecommendationsSection recommendations={data.recommendations} />
      <LearningNextActionsSection nextActions={data.next_actions} />
    </div>
  )
}
