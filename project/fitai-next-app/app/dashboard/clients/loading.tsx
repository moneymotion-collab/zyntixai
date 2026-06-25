function SkeletonBar({ className }: { className?: string }) {
  return (
    <span
      className={`block animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 ${className ?? "h-4 w-full"}`}
      aria-hidden="true"
    />
  );
}

export default function ClientsLoading() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Klanten laden">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-3">
          <SkeletonBar className="h-4 w-20" />
          <SkeletonBar className="h-9 w-48" />
          <SkeletonBar className="h-4 w-full max-w-xl" />
          <SkeletonBar className="h-4 w-64" />
        </div>
        <SkeletonBar className="h-11 w-36 shrink-0 rounded-lg" />
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <SkeletonBar className="h-4 w-28" />
            <SkeletonBar className="mt-3 h-8 w-16" />
            <SkeletonBar className="mt-2 h-3 w-40" />
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="space-y-2 border-b border-zinc-200 px-4 py-4 sm:px-6 dark:border-zinc-800">
          <SkeletonBar className="h-5 w-40" />
          <SkeletonBar className="h-4 w-56" />
        </div>
        <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-4 sm:flex-row sm:px-6 dark:border-zinc-800">
          <SkeletonBar className="h-10 flex-1 rounded-lg" />
          <SkeletonBar className="h-10 w-40 rounded-lg" />
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4 sm:px-6">
              <SkeletonBar className="h-9 w-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBar className="h-4 w-32" />
                <SkeletonBar className="h-3 w-48" />
              </div>
              <SkeletonBar className="hidden h-6 w-16 rounded-full md:block" />
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-zinc-200 px-4 py-4 sm:px-6 dark:border-zinc-800">
          <SkeletonBar className="h-4 w-32" />
          <div className="flex gap-2">
            <SkeletonBar className="h-9 w-20 rounded-lg" />
            <SkeletonBar className="h-9 w-9 rounded-lg" />
            <SkeletonBar className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </section>
    </div>
  );
}
