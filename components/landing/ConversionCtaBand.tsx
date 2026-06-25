import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import {
  LANDING_CTA_FOOTNOTE,
  LANDING_HERO_CTA,
  LANDING_PRICING_CTA,
  LANDING_SECONDARY_CTA,
  LANDING_TERTIARY_CTA,
  TRIAL_MESSAGING,
} from "@/components/landing/landing-cta"
import {
  landingContainerClass,
  landingCtaPrimaryClass,
  landingCtaSecondaryClass,
  landingHeadingClass,
  landingSectionClass,
  landingSubheadingClass,
} from "@/components/landing/landing-layout"

type ConversionCtaBandProps = {
  variant?: "default" | "compact"
}

export default function ConversionCtaBand({
  variant = "default",
}: ConversionCtaBandProps) {
  const isCompact = variant === "compact"
  const primaryCta = isCompact ? LANDING_PRICING_CTA : LANDING_HERO_CTA

  return (
    <section className={`${landingSectionClass} border-indigo-500/15 bg-gradient-to-b from-indigo-950/30 via-[#06080f] to-[#06080f]`}>
      <div
        className={`${landingContainerClass} ${isCompact ? "!py-10 sm:!py-14" : ""}`}
      >
        <div className="mx-auto max-w-2xl text-center">
          {!isCompact ? (
            <span className="badge-premium mb-5 inline-flex">
              <Sparkles className="h-3 w-3" />
              7-Day Free Trial
            </span>
          ) : null}

          <h2 className={landingHeadingClass}>
            {isCompact
              ? "Ready to coach smarter?"
              : "Start Your 7-Day Free Trial"}
          </h2>

          <p className={landingSubheadingClass}>{TRIAL_MESSAGING.tagline}</p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <Link href={primaryCta.href} className={landingCtaPrimaryClass}>
              {primaryCta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={LANDING_SECONDARY_CTA.href} className={landingCtaSecondaryClass}>
              {LANDING_SECONDARY_CTA.label}
            </Link>
            <Link href={LANDING_TERTIARY_CTA.href} className={landingCtaSecondaryClass}>
              {LANDING_TERTIARY_CTA.label}
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-500 sm:text-sm">
            {LANDING_CTA_FOOTNOTE}
          </p>
        </div>
      </div>
    </section>
  )
}
