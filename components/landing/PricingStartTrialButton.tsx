import Link from "next/link"
import {
  LANDING_PRICING_CTA,
} from "@/components/landing/landing-cta"
import {
  landingCtaPrimaryClass,
  landingCtaSecondaryClass,
} from "@/components/landing/landing-layout"

type PricingStartTrialButtonProps = {
  highlighted?: boolean
  label?: string
  href?: string
}

export default function PricingStartTrialButton({
  highlighted = false,
  label = LANDING_PRICING_CTA.label,
  href = LANDING_PRICING_CTA.href,
}: PricingStartTrialButtonProps) {
  return (
    <Link
      href={href}
      className={`w-full ${highlighted ? landingCtaPrimaryClass : landingCtaSecondaryClass}`}
    >
      {label}
    </Link>
  )
}
