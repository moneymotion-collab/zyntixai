function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`.trim()}
    />
  )
}

function KpiCardSkeleton() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <SkeletonBlock className="h-11 w-11 shrink-0 rounded-xl" />
      </div>
      <SkeletonBlock className="mt-4 h-3 w-24" />
      <SkeletonBlock className="mt-3 h-8 w-32" />
      <SkeletonBlock className="mt-2 h-3 w-40" />
    </article>
  )
}

function PostCardSkeleton() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-36" />
          <SkeletonBlock className="h-3 w-28" />
        </div>
      </div>
      <SkeletonBlock className="mt-5 h-6 w-3/4" />
      <SkeletonBlock className="mt-3 h-8 w-24 rounded-full" />
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-16" />
        ))}
      </div>
    </article>
  )
}

function ChartSkeleton() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <SkeletonBlock className="h-6 w-48" />
      <SkeletonBlock className="mt-2 h-4 w-64" />
      <SkeletonBlock className="mt-6 h-56 w-full rounded-2xl" />
    </article>
  )
}

function SectionSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <SkeletonBlock className="h-6 w-40" />
      <SkeletonBlock className="mt-2 h-4 w-56" />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonBlock key={index} className="h-28" />
        ))}
      </div>
    </article>
  )
}

export default function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading analytics">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <KpiCardSkeleton key={index} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <SectionSkeleton rows={2} />
      <SectionSkeleton rows={3} />
    </div>
  )
}
