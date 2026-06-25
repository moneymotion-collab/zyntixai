/** Unified public landing conversion CTAs and trial copy (trial-first GTM). */
export const TRIAL_MESSAGING = {
  tagline: "Start your 7-day free trial. No credit card required.",
  footnote: "7-day free trial · Cancel anytime · No credit card required",
  pricingCardNote: "Cancel anytime · No credit card to start",
  pricingPageNote:
    "All plans include a 7-day free trial. Create your account to start — upgrade from your dashboard when you're ready.",
} as const

export const LANDING_HERO_CTA = {
  label: "Start 7-Day Free Trial",
  href: "/register",
} as const

export const LANDING_FEATURES_CTA = {
  label: "Start 7-Day Free Trial",
  href: "/register",
} as const

export const LANDING_PRICING_CTA = {
  label: "Start Free Trial",
  href: "/register",
} as const

export const LANDING_FOOTER_CTA = {
  label: "Start Free Trial",
  href: "/register",
} as const

export const LANDING_HEADER_CTA = {
  label: "Start Free Trial",
  href: "/register",
} as const

/** @deprecated Prefer section-specific CTA constants above. */
export const LANDING_PRIMARY_CTA = LANDING_HERO_CTA

export const LANDING_SECONDARY_CTA = {
  label: "Try Demo Workspace",
  href: "/register?demo=1",
} as const

export const LANDING_TERTIARY_CTA = {
  label: "Watch Demo",
  href: "/#demo-video",
} as const

export const LANDING_CTA_FOOTNOTE = TRIAL_MESSAGING.footnote
