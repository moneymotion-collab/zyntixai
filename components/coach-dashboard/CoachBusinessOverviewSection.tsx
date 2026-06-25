"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Apple,
  CalendarClock,
  DollarSign,
  Dumbbell,
  Loader2,
  Settings2,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react"
import CoachBusinessTrendCharts from "@/components/coach-dashboard/CoachBusinessTrendCharts"
import EmptyState from "@/components/ui/empty-state"
import GlassCard from "@/components/ui/glass-card"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { upsertCoachBusinessSettings } from "@/lib/coach-dashboard/coach-business-settings"
import {
  formatBusinessCurrency,
  formatGrowthPercent,
} from "@/lib/coach-dashboard/compute-business-overview"
import type { CoachBusinessOverview } from "@/lib/coach-dashboard/types"
import { createClient } from "@/lib/supabase/client"
import { premiumInputClass } from "@/lib/ui/premium-input"

type CoachBusinessOverviewSectionProps = {
  businessOverview: CoachBusinessOverview
  loading?: boolean
  onSettingsUpdated?: () => void
  showKpiStrip?: boolean
}

function BusinessKpiCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number | string
  icon: typeof Users
  accent: string
}) {
  return (
    <GlassCard className="p-5 sm:p-6" hover>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${accent}`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums text-white sm:text-4xl">
        {value}
      </p>
    </GlassCard>
  )
}

function GrowthBadge({ value, label }: { value: number | null; label: string }) {
  if (value == null) {
    return (
      <div className="glass-panel rounded-2xl px-4 py-3">
        <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 text-lg font-semibold text-slate-400">—</p>
      </div>
    )
  }

  const positive = value >= 0
  const Icon = positive ? TrendingUp : TrendingDown

  return (
    <div className="glass-panel rounded-2xl px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p
        className={`mt-1 inline-flex items-center gap-1.5 text-lg font-semibold ${
          positive ? "text-emerald-300" : "text-amber-300"
        }`}
      >
        <Icon className="h-4 w-4" aria-hidden />
        {formatGrowthPercent(value)}
      </p>
    </div>
  )
}

export default function CoachBusinessOverviewSection({
  businessOverview,
  loading,
  onSettingsUpdated,
  showKpiStrip = false,
}: CoachBusinessOverviewSectionProps) {
  const supabase = createClient()
  const { kpis, revenue, memberGrowthTrend, revenueTrend, settings } =
    businessOverview

  const [revenuePerMemberInput, setRevenuePerMemberInput] = useState(
    String(settings.revenuePerMember),
  )
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [settingsSaved, setSettingsSaved] = useState(false)

  useEffect(() => {
    setRevenuePerMemberInput(String(settings.revenuePerMember))
  }, [settings.revenuePerMember])

  const isEstimated = revenue.source === "estimated"
  const hasMembers = kpis.totalMembers > 0

  async function handleSaveRevenuePerMember() {
    const parsed = Number.parseFloat(revenuePerMemberInput)
    if (!Number.isFinite(parsed) || parsed < 0) {
      setSettingsError("Enter a valid amount.")
      return
    }

    setSavingSettings(true)
    setSettingsError(null)
    setSettingsSaved(false)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setSettingsError("You must be signed in to save settings.")
      setSavingSettings(false)
      return
    }

    const result = await upsertCoachBusinessSettings(supabase, user.id, {
      revenuePerMember: parsed,
    })

    if (result.error) {
      setSettingsError(result.error)
      setSavingSettings(false)
      return
    }

    setSettingsSaved(true)
    setSavingSettings(false)
    onSettingsUpdated?.()
  }

  return (
    <section aria-label="Business overview" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-400">
            Business overview
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Revenue &amp; Client Growth
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Track roster growth, session volume, and projected revenue until
            billing is connected.
          </p>
        </div>
        {isEstimated ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
            <DollarSign className="h-3.5 w-3.5" aria-hidden />
            Projected revenue
          </span>
        ) : null}
      </div>

      {showKpiStrip ? (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <BusinessKpiCard
          label="Total Members"
          value={kpis.totalMembers}
          icon={Users}
          accent="from-indigo-500/20 to-blue-500/10 text-indigo-300"
        />
        <BusinessKpiCard
          label="Active Members"
          value={kpis.activeMembers}
          icon={UserCheck}
          accent="from-emerald-500/20 to-teal-500/10 text-emerald-300"
        />
        <BusinessKpiCard
          label="New Members This Month"
          value={kpis.newMembersThisMonth}
          icon={UserPlus}
          accent="from-violet-500/20 to-purple-500/10 text-violet-300"
        />
        <BusinessKpiCard
          label="Active Workout Plans"
          value={kpis.activeWorkoutPlans}
          icon={Dumbbell}
          accent="from-sky-500/20 to-cyan-500/10 text-sky-300"
        />
        <BusinessKpiCard
          label="Active Nutrition Plans"
          value={kpis.activeNutritionPlans}
          icon={Apple}
          accent="from-lime-500/20 to-green-500/10 text-lime-300"
        />
        <BusinessKpiCard
          label="Sessions This Month"
          value={kpis.sessionsThisMonth}
          icon={CalendarClock}
          accent="from-rose-500/20 to-pink-500/10 text-rose-300"
        />
      </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <GlassCard className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.06] via-white/[0.02] to-teal-500/[0.05] p-6 sm:p-8 xl:col-span-2">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative mb-6">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-400">
              Revenue
            </p>
            <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">
              {isEstimated ? "Projected Revenue" : "Revenue"}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {isEstimated
                ? "Based on active members and your monthly rate until Stripe is connected."
                : "Live revenue from your connected Stripe account."}
            </p>
          </div>

          {!hasMembers ? (
            <EmptyState
              {...SAAS_EMPTY.revenueOverview}
              icon={<Users className="h-6 w-6" />}
              action={
                <Link href="/members" className="btn-gradient">
                  Add Member
                </Link>
              }
            />
          ) : (
            <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="glass-panel rounded-2xl p-5">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Projected monthly revenue
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-white">
                  {formatBusinessCurrency(
                    revenue.estimatedMonthlyRevenue,
                    revenue.currency,
                  )}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {kpis.activeMembers} active ×{" "}
                  {formatBusinessCurrency(revenue.revenuePerMember, revenue.currency)}
                </p>
              </div>
              <div className="glass-panel rounded-2xl p-5">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Projected annual revenue
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-white">
                  {formatBusinessCurrency(
                    revenue.estimatedAnnualRevenue,
                    revenue.currency,
                  )}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Monthly projection × 12 months
                </p>
              </div>
              <GrowthBadge
                label="Revenue growth"
                value={revenue.revenueGrowthPercent}
              />
              <GrowthBadge
                label="Member growth"
                value={revenue.memberGrowthPercent}
              />
            </div>
          )}
        </GlassCard>

        <GlassCard className="relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative mb-5 flex items-start gap-3">
            <Settings2 className="mt-0.5 h-5 w-5 text-violet-400" aria-hidden />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-violet-400">
                Settings
              </p>
              <h3 className="mt-2 text-lg font-bold text-white">Revenue per member</h3>
              <p className="mt-1 text-sm text-slate-400">
                Used for projected revenue until Stripe payments are connected.
              </p>
            </div>
          </div>

          <label className="relative block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Monthly rate ({revenue.currency})
            </span>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                step={1}
                value={revenuePerMemberInput}
                onChange={(event) => {
                  setRevenuePerMemberInput(event.target.value)
                  setSettingsSaved(false)
                }}
                className={premiumInputClass}
                placeholder="150"
              />
              <button
                type="button"
                onClick={() => void handleSaveRevenuePerMember()}
                disabled={savingSettings || loading}
                className="btn-gradient shrink-0 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingSettings ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </label>

          {settingsError ? (
            <p className="mt-3 text-sm text-red-300">{settingsError}</p>
          ) : null}
          {settingsSaved ? (
            <p className="mt-3 text-sm text-emerald-300">Settings saved.</p>
          ) : null}

          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Stripe (coming soon)
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Payment data will replace estimates automatically once Stripe is
              connected. Account slot is reserved in settings.
            </p>
          </div>
        </GlassCard>
      </div>

      <CoachBusinessTrendCharts
        memberGrowthTrend={memberGrowthTrend}
        revenueTrend={revenueTrend}
        currency={revenue.currency}
        loading={loading}
      />
    </section>
  )
}
