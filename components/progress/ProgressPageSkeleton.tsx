"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ProgressKpiSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl border border-white/10 bg-white/5 p-6"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-9 w-20" />
        </div>
      ))}
    </div>
  )
}

export function ProgressChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <div className="mt-6 flex items-end gap-2 rounded-2xl bg-[#0b1224] p-4" style={{ height }}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="skeleton-shimmer flex-1 rounded-t-md"
            style={{ height: `${35 + (index % 4) * 15}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function ProgressTableSkeleton() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function ProgressSectionSkeleton() {
  return (
    <div className="mb-8 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-52" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-36 rounded-3xl" />
        <Skeleton className="h-36 rounded-3xl" />
      </div>
    </div>
  )
}

export default function ProgressDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <ProgressKpiSkeleton />
      <ProgressSectionSkeleton />
      <ProgressSectionSkeleton />
      <ProgressChartSkeleton />
      <ProgressTableSkeleton />
    </div>
  )
}

export function ProgressDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex items-start gap-5">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
      <ProgressKpiSkeleton />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ProgressChartSkeleton height={220} />
        <ProgressChartSkeleton height={220} />
      </div>
      <ProgressSectionSkeleton />
      <ProgressTableSkeleton />
    </div>
  )
}
