import { Skeleton, SkeletonLight } from "@/components/ui/skeleton"

type SectionLoadingStateProps = {
  variant?: "light" | "dark"
  rows?: number
  label?: string
  compact?: boolean
}

export default function SectionLoadingState({
  variant = "light",
  rows = 3,
  label = "Loading section",
  compact = false,
}: SectionLoadingStateProps) {
  const Block = variant === "light" ? SkeletonLight : Skeleton
  const rowHeight = compact ? "h-12" : "h-16"

  return (
    <div aria-busy="true" aria-label={label} className="py-1">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Block key={index} className={`${rowHeight} w-full rounded-2xl`} />
        ))}
      </div>
    </div>
  )
}
