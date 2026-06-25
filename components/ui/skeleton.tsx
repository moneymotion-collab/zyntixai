import type { ReactNode } from "react"

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`skeleton-shimmer ${className}`.trim()} aria-hidden="true" />
}

export function SkeletonLight({ className = "" }: SkeletonProps) {
  return (
    <div className={`skeleton-shimmer-light ${className}`.trim()} aria-hidden="true" />
  )
}

export function GlassCardSkeleton({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`glass-panel space-y-4 p-6 sm:p-8 ${className}`.trim()}>
      {children}
    </div>
  )
}

export function LightCardSkeleton({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`space-y-4 rounded-3xl border border-gray-200/90 bg-white p-6 shadow-sm ${className}`.trim()}
    >
      {children}
    </div>
  )
}

export function ExerciseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="glass-panel space-y-3 p-5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}

export function WorkoutCardSkeleton() {
  return (
    <div className="glass-panel space-y-5 p-6 sm:p-8">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <div className="space-y-4 pt-2">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  )
}
