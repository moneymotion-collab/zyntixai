import GrowthAutopilotPanel from "@/components/marketing/GrowthAutopilotPanel"
import MarketingAnalyticsPageContent from "@/components/marketing/content-performance/MarketingAnalyticsPageContent"
import ProtectedShell from "@/app/components/ProtectedShell"

export default function MarketingAnalyticsPage() {
  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <div className="min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
            Marketing AI
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Analytics
          </h1>
          <p className="mt-2 max-w-2xl text-gray-500">
            Track views, engagement, and growth from your content performance
            data — then turn insights into your next winning posts.
          </p>
        </header>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
          <MarketingAnalyticsPageContent />
        </div>

        <div className="mt-6">
          <GrowthAutopilotPanel />
        </div>
      </div>
    </ProtectedShell>
  )
}
