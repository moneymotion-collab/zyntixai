"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ClipboardList, Dumbbell, Target, CalendarCheck } from "lucide-react"
import CoachDashboardOverview from "@/components/coach-dashboard/CoachDashboardOverview"
import CoachDashboardSkeleton from "@/components/coach-dashboard/CoachDashboardSkeleton"
import { MemberDashboardSkeleton } from "@/components/ui/page-skeletons"
import DashboardStatCard from "@/components/ui/dashboard-stat-card"
import { DashboardSectionHeader } from "@/components/coach-dashboard/coach-dashboard-ui"
import DashboardWorkspaceSwitcher from "@/components/workspace/DashboardWorkspaceSwitcher"
import DemoCoachProfileSummary from "@/components/workspace/DemoCoachProfileSummary"
import FeatureHighlightCards from "@/components/dashboard/FeatureHighlightCards"
import DemoShowcaseSection from "@/components/dashboard/DemoShowcaseSection"
import LoadDemoBusinessCard from "@/components/dashboard/LoadDemoBusinessCard"
import ProtectedShell from "../components/ProtectedShell"
import MemberTodaysWorkoutSection from "../components/MemberTodaysWorkoutSection"
import { useCoachOverview } from "../hooks/useCoachOverview"
import { useDashboardStats } from "../hooks/useDashboardStats"
import { useRole } from "../hooks/useRole"
import { useWorkspaceMode } from "../hooks/useWorkspaceMode"
import { growthPercent } from "@/lib/coach-dashboard/compute-business-overview"
import { SAAS_PAGE_MAIN } from "@/lib/ui/saas-page-layout"
import { MOBILE_PAGE_ROOT } from "@/lib/ui/mobile-layout"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const { role, loading: roleLoading } = useRole()
  const {
    data: coachOverview,
    loading: coachLoading,
    error: coachError,
    refetch: refetchCoach,
    isCoach,
  } = useCoachOverview()
  const { stats, loading: memberLoading, error, refetch, noMemberProfile } =
    useDashboardStats()
  const { mode: workspaceMode } = useWorkspaceMode(isCoach)

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
      }
    }

    void checkSession()
  }, [router, supabase])

  const isMember = role === "member"
  const pageLoading =
    roleLoading || (isCoach && coachLoading) || (isMember && memberLoading)

  if (pageLoading) {
    return (
      <ProtectedShell>
        <main className={`${SAAS_PAGE_MAIN} ${MOBILE_PAGE_ROOT}`}>
          {isCoach || roleLoading ? (
            <CoachDashboardSkeleton />
          ) : (
            <MemberDashboardSkeleton />
          )}
        </main>
      </ProtectedShell>
    )
  }

  return (
    <ProtectedShell>
      <main className={`${SAAS_PAGE_MAIN} ${MOBILE_PAGE_ROOT}`}>
        {isCoach ? (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] xl:items-stretch">
              <DashboardWorkspaceSwitcher
                currentMode={workspaceMode}
                className="mb-0 h-full"
              />
              {workspaceMode === "demo" ? (
                <LoadDemoBusinessCard onSuccess={() => void refetchCoach()} />
              ) : null}
            </div>
            {coachError ? (
              <ErrorBanner message={coachError} onRetry={() => refetchCoach()} />
            ) : null}
            {coachOverview ? (
              <CoachDashboardOverview
                data={coachOverview}
                onSessionUpdated={() => void refetchCoach()}
                onBusinessSettingsUpdated={() => void refetchCoach()}
                onTaskUpdated={() => void refetchCoach()}
              />
            ) : coachError ? null : (
              <CoachDashboardSkeleton />
            )}
            <div className="mt-12 space-y-12">
              <DemoCoachProfileSummary />
              <FeatureHighlightCards />
              <DemoShowcaseSection />
            </div>
          </>
        ) : (
          <MemberDashboard
            role={role}
            stats={stats}
            error={error}
            refetch={refetch}
            noMemberProfile={noMemberProfile}
            isMember={isMember}
          />
        )}
      </main>
    </ProtectedShell>
  )
}

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="glass-panel mb-6 border-red-400/30 bg-red-500/[0.06] p-5">
      <p className="font-medium text-red-200">Could not load dashboard</p>
      <p className="mt-1 text-sm text-red-300/90">{message}</p>
      <button type="button" onClick={onRetry} className="btn-gradient mt-4">
        Try again
      </button>
    </div>
  )
}

function MemberDashboard({
  role,
  stats,
  error,
  refetch,
  noMemberProfile,
  isMember,
}: {
  role: string | null
  stats: ReturnType<typeof useDashboardStats>["stats"]
  error: string | null
  refetch: () => void
  noMemberProfile: boolean
  isMember: boolean
}) {
  return (
    <div className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/[0.07] via-white/[0.03] to-indigo-500/[0.08] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/90">
          Member Portal
        </p>
        <h1 className="mt-2.5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Your training dashboard
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
          Track assigned workouts, completion momentum, and today&apos;s session.
        </p>
      </header>

      {error ? (
        <ErrorBanner message={error} onRetry={refetch} />
      ) : null}

      {role === "admin" && (
        <div className="glass-panel border-amber-400/30 bg-amber-500/[0.06] p-5">
          <h2 className="text-lg font-bold text-white">Admin Panel</h2>
          <p className="mt-1 text-sm text-slate-300">Full system access.</p>
        </div>
      )}

      {isMember && noMemberProfile ? (
        <div className="glass-panel border-amber-400/30 bg-amber-500/[0.06] p-5">
          <p className="font-semibold text-amber-100">Account not linked yet</p>
          <p className="mt-2 text-sm leading-relaxed text-amber-200/80">
            Your login is not connected to a member profile. Ask your coach to
            add you on the Members page with the same email you use to sign in,
            then refresh this page.
          </p>
        </div>
      ) : null}

      {stats?.kind === "member" ? (
        <section aria-label="Training overview">
          <DashboardSectionHeader
            eyebrow="Performance snapshot"
            title="Your progress"
            description="Assigned workouts, completion momentum, and how you're tracking week over week."
          />
          <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-4">
            <DashboardStatCard
              label="Assigned"
              value={stats.assignedTotal}
              icon={ClipboardList}
              accent="from-indigo-500/25 to-blue-500/10 text-indigo-300"
              detail="Total workout plans"
            />
            <DashboardStatCard
              label="To complete"
              value={stats.assignedPending}
              icon={Target}
              accent="from-amber-500/25 to-orange-500/10 text-amber-300"
              detail="Still in progress"
              trend={
                stats.assignedPending > 0
                  ? { percent: null, label: "in queue" }
                  : { percent: 0, label: "caught up" }
              }
            />
            <DashboardStatCard
              label="Completed"
              value={stats.assignedCompleted}
              icon={CheckCircle2}
              accent="from-emerald-500/25 to-teal-500/10 text-emerald-300"
              highlight
              detail="Finished workouts"
              trend={{
                percent: stats.completedTrendPercent,
                label: "vs last week",
              }}
            />
            <DashboardStatCard
              label="Completion rate"
              value={`${stats.completionRate}%`}
              icon={Dumbbell}
              accent="from-violet-500/25 to-purple-500/10 text-violet-300"
              detail="Overall completion"
              trend={{
                percent: growthPercent(stats.completionRate, 50),
                label: "vs 50% goal",
              }}
            />
          </div>
        </section>
      ) : null}

      {isMember ? (
        <>
          <section aria-label="Weekly check-in" className="glass-panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/90">
                  Wellbeing
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">Weekly check-in</h2>
                <p className="mt-2 max-w-xl text-sm text-slate-400">
                  Log weight, energy, sleep, and reflections so your coach can
                  support you this week.
                </p>
              </div>
              <Link
                href="/my-check-ins"
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
              >
                <CalendarCheck className="h-4 w-4" aria-hidden />
                {noMemberProfile ? "Check-in" : "Open check-in"}
              </Link>
            </div>
          </section>
          <MemberTodaysWorkoutSection />
        </>
      ) : (
        <div className="glass-panel p-8 text-center">
          <p className="text-slate-400">
            Select a role-specific view from the sidebar.
          </p>
          <Link href="/members" className="btn-gradient mt-5 inline-flex">
            Go to Members
          </Link>
        </div>
      )}
    </div>
  )
}
