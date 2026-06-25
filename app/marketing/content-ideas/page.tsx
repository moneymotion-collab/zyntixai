"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Sparkles, Zap } from "lucide-react"
import ProtectedShell from "@/app/components/ProtectedShell"
import ContentIdeaCard from "@/components/marketing/ContentIdeaCard"
import {
  CONTENT_IDEA_COUNTS,
  DEFAULT_CONTENT_IDEA_COUNT,
  type ContentIdeaCount,
} from "@/lib/marketing/content-idea-counts"
import {
  CONTENT_CATEGORIES,
  type ContentCategory,
} from "@/lib/marketing/content-categories"
import { type ContentIdeaCard as ContentIdea } from "@/lib/marketing/content-idea-cards"
import {
  CONTENT_GOALS,
  type ContentGoal,
} from "@/lib/marketing/content-goals"
import { isMarketingDemoMode } from "@/lib/marketing/demo-mode"
import { improveContentIdeaDemo } from "@/lib/marketing/improve-content-idea"
import { mockIdeas } from "@/lib/marketing/mock-ideas"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import MarketingGenerationStagePanel from "@/components/marketing/MarketingGenerationStagePanel"
import { useMarketingGenerationStages } from "@/app/hooks/useMarketingGenerationStages"
import { CONTENT_IDEAS_GENERATION_STAGES } from "@/lib/marketing/generation-stages"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import { successToast } from "@/lib/copy/success-toasts"

function CountSelector({
  selectedCount,
  onSelect,
  disabled,
}: {
  selectedCount: ContentIdeaCount
  onSelect: (count: ContentIdeaCount) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CONTENT_IDEA_COUNTS.map((count) => {
        const selected = selectedCount === count

        return (
          <button
            key={count}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(count)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
              selected
                ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {count} ideas
          </button>
        )
      })}
    </div>
  )
}

function CategorySelector({
  selectedCategories,
  onToggle,
  disabled,
}: {
  selectedCategories: ContentCategory[]
  onToggle: (category: ContentCategory) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CONTENT_CATEGORIES.map((category) => {
        const selected = selectedCategories.includes(category)

        return (
          <button
            key={category}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(category)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
              selected
                ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}

function GoalSelector({
  selectedGoals,
  onToggle,
  disabled,
}: {
  selectedGoals: ContentGoal[]
  onToggle: (goal: ContentGoal) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CONTENT_GOALS.map((goal) => {
        const selected = selectedGoals.includes(goal)

        return (
          <button
            key={goal}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(goal)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
              selected
                ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {goal}
          </button>
        )
      })}
    </div>
  )
}

function IdeasSummary({ ideas }: { ideas: ContentIdea[] }) {
  const scored = ideas.filter((idea) => idea.viral_score != null)
  const avgScore =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, idea) => sum + (idea.viral_score ?? 0), 0) /
            scored.length,
        )
      : null
  const highPotential = scored.filter((idea) => (idea.viral_score ?? 0) >= 80).length

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Ideas ready
        </p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{ideas.length}</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Avg viral score
        </p>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          {avgScore ?? "—"}
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          High engagement
        </p>
        <p className="mt-1 text-2xl font-bold text-emerald-700">
          {highPotential}
        </p>
      </div>
    </div>
  )
}

export default function ContentIdeasPage() {
  const demoMode = isMarketingDemoMode()
  const [ideas, setIdeas] = useState<ContentIdea[]>(demoMode ? mockIdeas : [])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedGoals, setSelectedGoals] = useState<ContentGoal[]>([])
  const [selectedCategories, setSelectedCategories] = useState<
    ContentCategory[]
  >([])
  const [ideaCount, setIdeaCount] = useState<ContentIdeaCount>(
    DEFAULT_CONTENT_IDEA_COUNT,
  )
  const [toast, setToast] = useState<ToastPayload | null>(null)
  const [schedulingId, setSchedulingId] = useState<string | null>(null)
  const [improvingId, setImprovingId] = useState<string | null>(null)

  const {
    activeStep: generationStep,
    start: startProgressAnimation,
    stop: stopProgressAnimation,
  } = useMarketingGenerationStages(CONTENT_IDEAS_GENERATION_STAGES.length)

  useEffect(() => {
    if (demoMode) {
      setIdeas(mockIdeas)
    }
  }, [demoMode])

  const showEmptyState = useMemo(
    () => ideas.length === 0 && !loading && !demoMode,
    [ideas.length, loading, demoMode],
  )

  function toggleCategory(category: ContentCategory) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    )
  }

  function toggleGoal(goal: ContentGoal) {
    setSelectedGoals((current) =>
      current.includes(goal)
        ? current.filter((item) => item !== goal)
        : [...current, goal],
    )
  }

  async function generateIdeas() {
    setLoading(true)
    setErrorMessage(null)
    setToast(null)
    startProgressAnimation()

    try {
      if (demoMode) {
        setIdeas(mockIdeas.slice(0, ideaCount))
        setToast(successToast("contentIdeasGenerated"))
        return
      }

      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: ideaCount,
          categories: selectedCategories,
          goals: selectedGoals,
        }),
      })
      const data = (await res.json()) as {
        ideas?: ContentIdea[]
        warning?: string
        error?: { message?: string }
      }

      if (!res.ok || data.error || !data.ideas?.length) {
        setErrorMessage(
          data.error?.message ?? "Could not generate ideas.",
        )
        return
      }

      setIdeas(data.ideas)
      setToast(
        successToast("contentIdeasGenerated", {
          description:
            data.warning ??
            "Ideas saved as drafts. Add them to your calendar when ready.",
        }),
      )
    } catch {
      setErrorMessage("Could not generate ideas.")
    } finally {
      stopProgressAnimation()
      setLoading(false)
    }
  }

  async function improveIdea(idea: ContentIdea) {
    if (improvingId || schedulingId) return

    setImprovingId(idea.id)
    setErrorMessage(null)
    setToast(null)

    if (demoMode) {
      const improved = improveContentIdeaDemo(idea)
      setIdeas((current) =>
        current.map((item) =>
          item.id === idea.id ? { ...item, ...improved } : item,
        ),
      )
      setToast(successToast("postImproved"))
      setImprovingId(null)
      return
    }

    try {
      const res = await fetch("/api/content/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idea.id }),
      })
      const data = (await res.json()) as {
        idea?: ContentIdea
        warning?: string
        error?: { message?: string }
      }

      if (!res.ok || data.error || !data.idea) {
        setErrorMessage(data.error?.message ?? "Could not improve post.")
        return
      }

      setIdeas((current) =>
        current.map((item) =>
          item.id === idea.id ? { ...item, ...data.idea! } : item,
        ),
      )
      setToast(
        successToast("postImproved", {
          description: data.warning ?? "AI suggestions have been applied.",
        }),
      )
    } catch {
      setErrorMessage("Could not improve post.")
    } finally {
      setImprovingId(null)
    }
  }

  async function addToCalendar(idea: ContentIdea) {
    if (idea.scheduledAt || schedulingId || improvingId) return

    setSchedulingId(idea.id)
    setErrorMessage(null)
    setToast(null)

    const scheduledAt = new Date().toISOString()

    if (demoMode) {
      setIdeas((current) =>
        current.map((item) =>
          item.id === idea.id ? { ...item, scheduledAt } : item,
        ),
      )
      setToast(successToast("postAddedToCalendar"))
      setSchedulingId(null)
      return
    }

    try {
      const res = await fetch("/api/content/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: idea.id,
          status: "scheduled",
          scheduled_at: scheduledAt,
        }),
      })
      const payload = (await res.json()) as {
        data?: { scheduled_at: string | null } | null
        error?: { message: string } | null
      }

      if (!res.ok || payload.error) {
        setErrorMessage(
          payload.error?.message ?? "Could not add to calendar.",
        )
        return
      }

      setIdeas((current) =>
        current.map((item) =>
          item.id === idea.id
            ? {
                ...item,
                scheduledAt: payload.data?.scheduled_at ?? scheduledAt,
              }
            : item,
        ),
      )
      setToast(successToast("postAddedToCalendar"))
    } catch {
      setErrorMessage("Could not add to calendar.")
    } finally {
      setSchedulingId(null)
    }
  }

  async function handleOptimizedApplied(
    ideaId: string,
    applied: { title: string; caption: string; hashtags: string },
  ) {
    setIdeas((current) =>
      current.map((item) =>
        item.id === ideaId
          ? {
              ...item,
              title: applied.title,
              caption: applied.caption,
              hashtags: applied.hashtags,
            }
          : item,
      ),
    )
    setToast(successToast("postOptimized"))
  }

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <div className="min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Marketing AI
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Content Ideas
              </h1>
              <p className="mt-2 max-w-2xl text-gray-500">
                Generate scroll-stopping posts with viral scores, engagement
                insights, and ready-to-use CTAs for your gym.
              </p>
            </div>

            {demoMode ? (
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-800">
                <Zap className="h-4 w-4" />
                Demo mode — sample ideas loaded
              </div>
            ) : null}
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <section
            id="content-ideas-form"
            className="h-fit rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Generate ideas</h2>
                <p className="text-sm text-gray-500">
                  Tailor AI output to your brand
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Number of ideas
                </p>
                <CountSelector
                  selectedCount={ideaCount}
                  onSelect={setIdeaCount}
                  disabled={loading}
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Content categories
                </p>
                <CategorySelector
                  selectedCategories={selectedCategories}
                  onToggle={toggleCategory}
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Optional — workout tips, member stories, promotions, and more.
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Marketing goals
                </p>
                <GoalSelector
                  selectedGoals={selectedGoals}
                  onToggle={toggleGoal}
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Optional — select goals to shape your content plan.
                </p>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => void generateIdeas()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Content Ideas
                  </>
                )}
              </button>
            </div>

            {errorMessage ? (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}
          </section>

          <section className="min-w-0">
            {loading ? (
              <MarketingGenerationStagePanel
                stages={CONTENT_IDEAS_GENERATION_STAGES}
                activeStep={generationStep}
                title="Generating content ideas"
                subtitle="Analyzing your goals and categories to craft scroll-stopping posts."
              />
            ) : ideas.length > 0 ? (
              <>
                <div className="mb-5">
                  <IdeasSummary ideas={ideas} />
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  {ideas.map((idea) => (
                    <ContentIdeaCard
                      key={idea.id}
                      idea={idea}
                      scheduling={schedulingId === idea.id}
                      improving={improvingId === idea.id}
                      demoMode={demoMode}
                      onAddToCalendar={(item) => void addToCalendar(item)}
                      onImprove={(item) => void improveIdea(item)}
                      onOptimizedApplied={handleOptimizedApplied}
                      onOptimizationError={setErrorMessage}
                    />
                  ))}
                </div>
              </>
            ) : showEmptyState ? (
              <SaasEmptyState
                preset="contentIdeas"
                variant="light"
                action={
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void generateIdeas()}
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate content ideas
                  </button>
                }
              />
            ) : null}
          </section>
        </div>
      </div>

      {toast ? (
        <Toast
          title={toast.title}
          description={toast.description}
          variant={toast.variant ?? "success"}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </ProtectedShell>
  )
}
