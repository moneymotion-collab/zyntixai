import { FitCoreLogoMark, ZyntixLogoFull } from "@/components/brand/FitCoreLogo"

type BrandedLoadingStateProps = {
  message?: string
  /** `full` shows the lockup; `mark` shows the compact Z icon */
  variant?: "full" | "mark"
}

export default function BrandedLoadingState({
  message = "Loading…",
  variant = "mark",
}: BrandedLoadingStateProps) {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-[#050816] p-6 text-gray-400">
      <div className="flex flex-col items-center text-center">
        {variant === "full" ? (
          <ZyntixLogoFull size="lg" className="mb-6 opacity-90" />
        ) : (
          <FitCoreLogoMark size="lg" className="mb-6" />
        )}
        <div
          className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-violet-500/80 border-t-transparent"
          aria-hidden
        />
        <p className="text-sm font-medium text-slate-400">{message}</p>
      </div>
    </div>
  )
}
