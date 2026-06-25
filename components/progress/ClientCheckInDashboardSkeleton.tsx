"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { PROGRESS_PRO_CARD } from "@/components/progress/progress-pro-ui"

function InsightSkeletonCard() {
  return (
    <div className={`${PROGRESS_PRO_CARD} p-6`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-9 w-24" />
    </div>
  )
}

function ChartBlockSkeleton() {
  return (
    <div className={`${PROGRESS_PRO_CARD} p-6`}>
      <Skeleton className="h-5 w-36" />
      <Skeleton className="mt-2 h-4 w-52" />
      <div className="mt-6 flex h-[220px] flex-col justify-end gap-3 rounded-2xl bg-[#0b1224] p-4 sm:h-[260px]">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="skeleton-shimmer h-3 rounded-md"
            style={{
              width: `${45 + (index % 3) * 12}%`,
              marginLeft: `${index * 8}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function PanelSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className={`${PROGRESS_PRO_CARD} p-6 sm:p-8`}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-7 w-48" />
      <Skeleton className="mt-2 h-4 w-full max-w-md" />
      <div className={`mt-6 space-y-3 ${tall ? "min-h-[140px]" : ""}`}>
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        {!tall ? <Skeleton className="h-12 w-full rounded-2xl" /> : null}
      </div>
    </div>
  )
}

export default function ClientCheckInDashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <InsightSkeletonCard key={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartBlockSkeleton />
        <ChartBlockSkeleton />
        <ChartBlockSkeleton />
        <ChartBlockSkeleton />
      </div>

      <PanelSkeleton tall />
      <PanelSkeleton />
      <PanelSkeleton />
      <PanelSkeleton tall />

      <div className={`${PROGRESS_PRO_CARD} p-6`}>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
