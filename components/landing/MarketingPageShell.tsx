import LandingFooter from "@/components/landing/LandingFooter"
import LandingHeader from "@/components/landing/LandingHeader"
import {
  landingContainerClass,
  landingHeadingClass,
  landingSubheadingClass,
} from "@/components/landing/landing-layout"

type MarketingPageShellProps = {
  title: string
  description?: string
  badge?: string
  children: React.ReactNode
  narrow?: boolean
}

export default function MarketingPageShell({
  title,
  description,
  badge,
  children,
  narrow = false,
}: MarketingPageShellProps) {
  return (
    <div className="relative w-full overflow-x-hidden bg-[#06080f] text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />

      <LandingHeader />

      <section className="relative border-t border-white/8">
        <div
          className={`${landingContainerClass} pb-14 pt-10 sm:pb-20 sm:pt-14 ${
            narrow ? "max-w-3xl" : "max-w-4xl"
          }`}
        >
          <div className="mb-10 text-center sm:mb-12">
            {badge ? (
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                {badge}
              </p>
            ) : null}
            <h1 className={landingHeadingClass}>{title}</h1>
            {description ? (
              <p className={`${landingSubheadingClass} mt-4`}>{description}</p>
            ) : null}
          </div>
          {children}
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
