"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Scale, Target, TrendingDown } from "lucide-react"
import EmptyState from "@/components/ui/empty-state"
import ErrorStateBanner from "@/components/ui/error-state-banner"
import SectionLoadingState from "@/components/ui/section-loading-state"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"
import {
  computeWeightGoalStats,
  formatRemainingKg,
  formatWeightKg,
} from "@/lib/members/weight-goal-progress"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/client"

type Member = Database["public"]["Tables"]["members"]["Row"]

type GoalProgressCardProps = {
  memberId: string
  fallbackWeight?: number | null
  fallbackGoalWeight?: number | null
  refreshKey?: number
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm ring-1 ring-gray-100/80">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${accent ?? "text-black"}`}>
        {value}
      </p>
    </div>
  )
}

export default function GoalProgressCard({
  memberId,
  fallbackWeight,
  fallbackGoalWeight,
  refreshKey = 0,
}: GoalProgressCardProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [weightKg, setWeightKg] = useState<number | null>(null)
  const [goalWeight, setGoalWeight] = useState<number | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadWeights = useCallback(async () => {
    setLoading(true)
    setLoadError(null)

    const { data, error } = await supabase
      .from("members")
      .select("current_weight, target_weight")
      .eq("id", memberId)
      .maybeSingle()

    if (error) {
      reportSupabaseError("[goal-progress] load failed", error, {
        setError: setLoadError,
      })
      setWeightKg(fallbackWeight ?? null)
      setGoalWeight(fallbackGoalWeight ?? null)
      setLoading(false)
      return
    }

    const member = data as Pick<Member, "current_weight" | "target_weight"> | null

    setWeightKg(member?.current_weight ?? fallbackWeight ?? null)
    setGoalWeight(member?.target_weight ?? fallbackGoalWeight ?? null)
    setLoading(false)
  }, [fallbackGoalWeight, fallbackWeight, memberId, supabase])

  useEffect(() => {
    void loadWeights()
  }, [loadWeights, refreshKey])

  const stats = computeWeightGoalStats(weightKg, goalWeight)

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-cyan-50/80 via-white to-white px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
              FitCore AI
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-black">
              Goal Progress
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Weight journey based on the client profile
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-800">
            <Scale className="h-3.5 w-3.5" aria-hidden />
            Weight goal
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {loadError && !loading ? (
          <ErrorStateBanner
            variant="light"
            title="Could not load goal progress"
            message={loadError}
            onRetry={() => void loadWeights()}
            embedded
            className="mb-4"
          />
        ) : null}
        {loading ? (
          <SectionLoadingState label="Loading goal progress" rows={3} compact />
        ) : !stats ? (
          <EmptyState
            {...SAAS_EMPTY.memberWeightGoal}
            variant="light"
            compact
            icon={<Target className="h-7 w-7" />}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatTile label="Current Weight" value={formatWeightKg(stats.currentWeight)} />
              <StatTile
                label="Goal Weight"
                value={formatWeightKg(stats.goalWeight)}
                accent="text-cyan-700"
              />
              <StatTile
                label="Remaining"
                value={formatRemainingKg(stats.remainingWeight, stats.isLossGoal)}
                accent={
                  stats.remainingWeight === 0
                    ? "text-emerald-600"
                    : stats.isLossGoal
                      ? "text-amber-700"
                      : "text-violet-700"
                }
              />
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingDown className="h-4 w-4 text-cyan-600" aria-hidden />
                  <span className="font-medium">Progress toward goal</span>
                </div>
                <span className="text-lg font-bold text-black">
                  {stats.progressPercentage}%
                </span>
              </div>

              <div className="relative h-4 overflow-hidden rounded-full bg-gray-200/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${stats.progressPercentage}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{formatWeightKg(stats.currentWeight)}</span>
                <span>{formatWeightKg(stats.goalWeight)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
