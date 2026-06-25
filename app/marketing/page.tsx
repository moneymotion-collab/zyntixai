import Link from "next/link"
import MarketingActions from "@/components/marketing/MarketingActions"
import MarketingDashboardInsights from "@/components/marketing/MarketingDashboardInsights"
import MarketingRecentPosts from "@/components/marketing/MarketingRecentPosts"
import MarketingScheduledPosts from "@/components/marketing/MarketingScheduledPosts"
import MarketingStatCards from "@/components/marketing/MarketingStatCards"
import ProtectedShell from "@/app/components/ProtectedShell"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { fetchAnalyticsRows } from "@/lib/marketing/fetch-analytics-rows"
import { generatePerformanceInsights } from "@/lib/marketing/generate-performance-insights"
import {
  getMockMarketingData,
  mockIdeasToMarketingPosts,
} from "@/lib/marketing/get-mock-marketing-data"
import {
  computeMarketingDashboardStats,
  getRecentPosts,
  getScheduledPosts,
  getTopContentTypes,
  getTopHooks,
} from "@/lib/marketing/marketing-dashboard-stats"
import { mockAnalyticsRows } from "@/lib/marketing/mock-analytics"
import type { PerformanceInsights } from "@/lib/marketing/performance-insights-types"
import { filterDemoRowsForWorkspace } from "@/lib/demo/workspace-data-filter"
import { fetchWorkspaceMode } from "@/lib/workspace/workspace-mode"
import { createClient } from "@/lib/supabase/server"

const QUICK_LINKS = [
  { name: "Brand", href: "/dashboard/marketing/brand" },
  { name: "Video generator", href: "/marketing/video-generator" },
  { name: "Script generator", href: "/marketing/video-script-generator" },
] as const

const emptyInsights: PerformanceInsights = {
  best_content_type: "",
  worst_content_type: "",
  best_time: "",
  summary: "",
  recommendations: [],
  best_hooks: [],
  content_type_lift_pct: null,
}

async function loadInsights(
  rows: Awaited<ReturnType<typeof fetchAnalyticsRows>>["data"],
): Promise<PerformanceInsights> {
  const analyticsRows = rows ?? []

  const generated = await generatePerformanceInsights(analyticsRows)
  return generated.ok
    ? generated.result.insights
    : (generated.fallback?.insights ?? emptyInsights)
}

async function MarketingDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const workspaceMode =
    user != null ? await fetchWorkspaceMode(supabase, user.id) : ("live" as const)
  const isDemoWorkspace = workspaceMode === "demo"

  if (isDemoWorkspace) {
    const posts = mockIdeasToMarketingPosts(getMockMarketingData().ideas)
    const analyticsRows = mockAnalyticsRows
    const insights = await loadInsights(analyticsRows)
    const stats = computeMarketingDashboardStats(posts, analyticsRows)

    return (
      <div className="space-y-6">
        <MarketingStatCards stats={stats} />
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <MarketingDashboardInsights
              hooks={getTopHooks(posts, insights)}
              contentTypes={getTopContentTypes(posts, analyticsRows, insights)}
              insights={insights}
            />
            <MarketingRecentPosts posts={getRecentPosts(posts)} />
          </div>
          <div className="space-y-6">
            <MarketingActions />
            <MarketingScheduledPosts posts={getScheduledPosts(posts)} />
          </div>
        </div>
      </div>
    )
  }

  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return (
      <p className="text-sm text-gray-500">Could not load marketing dashboard.</p>
    )
  }

  let postsQuery = supabase
    .from("content_posts")
    .select("*")
    .order("updated_at", { ascending: false })

  if (!authResult.auth.isAdmin) {
    postsQuery = postsQuery.eq("created_by", authResult.auth.userId)
  }

  const [{ data: posts, error: postsError }, { data: analyticsRows, error: analyticsError }] =
    await Promise.all([
      postsQuery,
      fetchAnalyticsRows(supabase, {
        userId: authResult.auth.userId,
        isAdmin: authResult.auth.isAdmin,
      }),
    ])

  if (postsError || analyticsError) {
    return (
      <p className="text-sm text-red-600">
        {postsError?.message ?? analyticsError?.message ?? "Could not load dashboard."}
      </p>
    )
  }

  const postList = filterDemoRowsForWorkspace(posts ?? [], workspaceMode)
  const analyticsList = filterDemoRowsForWorkspace(analyticsRows ?? [], workspaceMode)
  const insights = await loadInsights(analyticsList)
  const stats = computeMarketingDashboardStats(postList, analyticsList)

  return (
    <div className="space-y-6">
      <MarketingStatCards stats={stats} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <MarketingDashboardInsights
            hooks={getTopHooks(postList, insights)}
            contentTypes={getTopContentTypes(postList, analyticsList, insights)}
            insights={insights}
          />
          <MarketingRecentPosts posts={getRecentPosts(postList)} />
        </div>
        <div className="space-y-6">
          <MarketingActions />
          <MarketingScheduledPosts posts={getScheduledPosts(postList)} />
        </div>
      </div>
    </div>
  )
}

export default function MarketingPage() {
  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-4 sm:p-6 lg:p-8">
        <div className="mb-8 overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="relative">
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-400/20 to-violet-500/20 blur-3xl" />
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-600">
              Marketing AI
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Content dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-gray-500">
              Track generated content, publishing performance, and AI-driven
              insights — all from one place.
            </p>
          </div>
        </div>

        <MarketingDashboard />

        <div className="mt-8 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-700">More tools</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-black hover:bg-gray-50"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </ProtectedShell>
  )
}
