import LearningEnginePageContent from "@/components/marketing/learning/LearningEnginePageContent"
import ProtectedShell from "@/app/components/ProtectedShell"

export default function MarketingLearningPage() {
  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <div className="p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Marketing AI
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Learning Engine
          </h1>
          <p className="mt-2 max-w-2xl text-gray-500">
            Discover what works in your content — winning hooks, CTAs, platforms,
            and posting times — then turn insights into your next actions.
          </p>
        </header>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
          <LearningEnginePageContent />
        </div>
      </div>
    </ProtectedShell>
  )
}
