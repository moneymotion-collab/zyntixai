import type { ReactNode } from "react"
import {
  GlassCardSkeleton,
  LightCardSkeleton,
  Skeleton,
  SkeletonLight,
} from "@/components/ui/skeleton"

function PageSkeletonShell({
  label,
  children,
  className = "",
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`space-y-8 ${className}`.trim()}
      aria-busy="true"
      aria-label={label}
    >
      {children}
    </div>
  )
}

export function MemberDashboardSkeleton() {
  return (
    <PageSkeletonShell label="Loading dashboard" className="space-y-10">
      <div className="glass-panel space-y-3 rounded-3xl p-6 sm:p-8">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-72 max-w-full rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <section className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-8 w-48 max-w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="glass-panel space-y-4 bg-gradient-to-br from-white/[0.04] to-transparent p-5 sm:p-6"
            >
              <div className="flex justify-between gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
              <Skeleton className="h-10 w-20 rounded-xl" />
              <div className="flex flex-wrap gap-2 pt-1">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <GlassCardSkeleton>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-4 h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-11 w-36 rounded-xl" />
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
      </GlassCardSkeleton>
    </PageSkeletonShell>
  )
}

export function MembersListSkeleton() {
  return (
    <PageSkeletonShell label="Loading members">
      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        <section key={sectionIndex} className="space-y-4">
          <Skeleton className="h-8 w-56" />

          <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:block">
            <div className="border-b border-white/10 bg-white/[0.03] px-6 py-4">
              <div className="grid grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-4 w-20" />
                ))}
              </div>
            </div>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-5 items-center gap-4 border-b border-white/5 px-6 py-4 last:border-b-0"
              >
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-9 w-28 rounded-xl" />
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:hidden">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-44" />
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-10 w-32 rounded-xl" />
                  <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </PageSkeletonShell>
  )
}

function WorkoutPlanCardSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-7 w-16 rounded-xl" />
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
    </div>
  )
}

export function WorkoutsPageSkeleton() {
  return (
    <PageSkeletonShell label="Loading workouts">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-12 w-72 max-w-full" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-12 w-48 rounded-xl" />
      </div>

      <section className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <WorkoutPlanCardSkeleton key={index} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <WorkoutPlanCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </PageSkeletonShell>
  )
}

export function NutritionPageSkeleton() {
  return (
    <PageSkeletonShell label="Loading nutrition plans">
      <div className="grid gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-8 w-32 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((__, macroIndex) => (
                <Skeleton key={macroIndex} className="h-20 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
        ))}
      </div>
    </PageSkeletonShell>
  )
}

export function SessionsPageSkeleton() {
  return (
    <PageSkeletonShell label="Loading sessions">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <GlassCardSkeleton key={index} className="!space-y-3 !p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
          </GlassCardSkeleton>
        ))}
      </div>
    </PageSkeletonShell>
  )
}

function MarketingIdeaCardSkeleton() {
  return (
    <article className="space-y-4 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <SkeletonLight className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonLight className="h-4 w-28" />
          <SkeletonLight className="h-3 w-20" />
        </div>
        <SkeletonLight className="h-8 w-16 rounded-full" />
      </div>
      <SkeletonLight className="h-6 w-3/4" />
      <SkeletonLight className="h-20 w-full rounded-xl" />
      <div className="flex flex-wrap gap-2">
        <SkeletonLight className="h-7 w-20 rounded-full" />
        <SkeletonLight className="h-7 w-24 rounded-full" />
        <SkeletonLight className="h-7 w-16 rounded-full" />
      </div>
      <div className="flex gap-3 pt-1">
        <SkeletonLight className="h-10 flex-1 rounded-xl" />
        <SkeletonLight className="h-10 w-32 rounded-xl" />
      </div>
    </article>
  )
}

export function MarketingContentIdeasSkeleton({
  showSidebar = true,
}: {
  showSidebar?: boolean
}) {
  return (
    <PageSkeletonShell label="Loading marketing content">
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        {showSidebar ? (
          <LightCardSkeleton>
            <div className="flex items-center gap-3">
              <SkeletonLight className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <SkeletonLight className="h-4 w-32" />
                <SkeletonLight className="h-3 w-40" />
              </div>
            </div>
            <SkeletonLight className="h-24 w-full rounded-xl" />
            <SkeletonLight className="h-32 w-full rounded-xl" />
            <SkeletonLight className="h-32 w-full rounded-xl" />
            <SkeletonLight className="h-11 w-full rounded-xl" />
          </LightCardSkeleton>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <MarketingIdeaCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </PageSkeletonShell>
  )
}

export function VideoGeneratorSkeleton({ generating = false }: { generating?: boolean }) {
  return (
    <PageSkeletonShell label={generating ? "Generating video" : "Loading video generator"}>
      {!generating ? (
        <>
          <div className="space-y-3">
            <SkeletonLight className="h-9 w-72" />
            <SkeletonLight className="h-4 w-full max-w-2xl" />
          </div>
          <LightCardSkeleton>
            <div className="grid gap-4 sm:grid-cols-2">
              <SkeletonLight className="h-11 w-full rounded-lg" />
              <SkeletonLight className="h-11 w-full rounded-lg" />
            </div>
            <SkeletonLight className="h-36 w-full rounded-lg" />
            <SkeletonLight className="h-11 w-56 rounded-lg" />
          </LightCardSkeleton>
        </>
      ) : null}

      <LightCardSkeleton>
        <SkeletonLight className="h-5 w-40" />
        <div className="grid gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonLight key={index} className="h-10 rounded-lg" />
          ))}
        </div>
      </LightCardSkeleton>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <LightCardSkeleton key={index}>
            <SkeletonLight className="h-5 w-32" />
            <SkeletonLight className="h-48 w-full rounded-xl" />
            <SkeletonLight className="h-16 w-full rounded-xl" />
            <div className="flex gap-3">
              <SkeletonLight className="h-10 w-36 rounded-lg" />
              <SkeletonLight className="h-10 w-32 rounded-lg" />
            </div>
          </LightCardSkeleton>
        ))}
      </div>
    </PageSkeletonShell>
  )
}

export function MemberDetailSkeleton() {
  return (
    <PageSkeletonShell label="Loading member profile" className="space-y-8">
      <div className="space-y-3">
        <SkeletonLight className="h-4 w-28" />
        <SkeletonLight className="h-10 w-64 max-w-full rounded-xl" />
        <SkeletonLight className="h-4 w-48" />
        <SkeletonLight className="h-4 w-36" />
      </div>

      {Array.from({ length: 6 }).map((_, index) => (
        <LightCardSkeleton key={index}>
          <SkeletonLight className="h-4 w-32" />
          <SkeletonLight className="h-7 w-48" />
          <SkeletonLight className="h-20 w-full rounded-2xl" />
          <SkeletonLight className="h-20 w-full rounded-2xl" />
        </LightCardSkeleton>
      ))}
    </PageSkeletonShell>
  )
}

export function WorkoutDetailSkeleton() {
  return (
    <PageSkeletonShell label="Loading workout plan" className="space-y-6">
      <div className="space-y-3">
        <SkeletonLight className="h-4 w-28" />
        <SkeletonLight className="h-9 w-72 max-w-full rounded-xl" />
        <SkeletonLight className="h-4 w-48" />
        <SkeletonLight className="h-10 w-40 rounded-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <LightCardSkeleton>
          <SkeletonLight className="h-6 w-40" />
          <SkeletonLight className="h-24 w-full rounded-2xl" />
          <SkeletonLight className="h-24 w-full rounded-2xl" />
        </LightCardSkeleton>
        <LightCardSkeleton>
          <SkeletonLight className="h-6 w-32" />
          <SkeletonLight className="h-40 w-full rounded-2xl" />
        </LightCardSkeleton>
      </div>
    </PageSkeletonShell>
  )
}
