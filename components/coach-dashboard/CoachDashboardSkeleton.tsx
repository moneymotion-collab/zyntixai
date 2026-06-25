"use client"

import { AtRiskMembersSkeleton } from "@/components/coach-dashboard/AtRiskMembersSection"
import { CoachBusinessKpiSkeleton } from "@/components/coach-dashboard/CoachBusinessKpiOverview"
import { CoachAiActivitySkeleton } from "@/components/coach-dashboard/CoachAiActivityCard"
import { CoachPerformanceSkeleton } from "@/components/coach-dashboard/CoachPerformanceSection"
import { Skeleton } from "@/components/ui/skeleton"

export function CoachStatCardsSkeleton() {
  return <CoachBusinessKpiSkeleton />
}

export function CoachSectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="glass-panel space-y-4 p-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function CoachHeaderSkeleton() {
  return (
    <div className="glass-panel space-y-4 p-6 sm:p-8">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-80 max-w-full" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="flex flex-wrap justify-end gap-3">
        <Skeleton className="h-10 w-44 rounded-2xl" />
        <Skeleton className="h-10 w-52 rounded-2xl" />
        <Skeleton className="h-10 w-40 rounded-2xl" />
      </div>
    </div>
  )
}

export function TodaysFocusSkeleton() {
  return (
    <div className="glass-panel p-6 sm:p-8">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-52 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export function CoachBusinessOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="glass-panel space-y-4 p-6 sm:p-8 xl:col-span-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-48" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        </div>
        <div className="glass-panel space-y-4 p-6 sm:p-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    </div>
  )
}

export function CoachSessionsOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="glass-panel space-y-4 p-6 sm:p-8 xl:col-span-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
        <div className="space-y-3 pt-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="glass-panel space-y-4 p-6 sm:p-8">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-48" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function QuickActionsSkeleton() {
  return (
    <div className="glass-panel space-y-4 p-6 sm:p-8">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-7 w-40" />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export { AtRiskMembersSkeleton }

export default function CoachDashboardSkeleton() {
  return (
    <div className="space-y-10">
      <CoachHeaderSkeleton />
      <CoachBusinessKpiSkeleton />
      <CoachAiActivitySkeleton />
      <TodaysFocusSkeleton />
      <CoachSectionSkeleton rows={6} />
      <AtRiskMembersSkeleton />
      <CoachPerformanceSkeleton />
      <CoachBusinessOverviewSkeleton />
      <QuickActionsSkeleton />
      <div className="flex items-center gap-4 py-2">
        <Skeleton className="h-px flex-1" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-px flex-1" />
      </div>
      <CoachSectionSkeleton rows={4} />
      <CoachSessionsOverviewSkeleton />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <CoachSectionSkeleton rows={3} />
          <CoachSectionSkeleton rows={5} />
          <CoachSectionSkeleton rows={6} />
        </div>
        <div className="space-y-6">
          <CoachSectionSkeleton rows={5} />
          <CoachSectionSkeleton rows={4} />
        </div>
      </div>
    </div>
  )
}
