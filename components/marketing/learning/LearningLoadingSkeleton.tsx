function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`.trim()}
    />
  )
}

export default function LearningLoadingSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading learning engine">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-8 w-64" />
        </div>
        <SkeletonBlock className="h-11 w-40 rounded-xl" />
      </div>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SkeletonBlock className="h-6 w-48" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-24" />
          ))}
        </div>
      </article>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <SkeletonBlock className="h-6 w-40" />
          <SkeletonBlock className="mt-6 h-56 w-full" />
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <SkeletonBlock className="h-6 w-40" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-20" />
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <SkeletonBlock className="h-6 w-36" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-24" />
            ))}
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <SkeletonBlock className="h-6 w-36" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-16" />
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}
