"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Check, Sparkles } from "lucide-react"
import ConversionCtaBand from "@/components/landing/ConversionCtaBand"
import LandingFooter from "@/components/landing/LandingFooter"
import LandingHeader from "@/components/landing/LandingHeader"
import PricingConversionNotes from "@/components/landing/PricingConversionNotes"
import PricingStartTrialButton from "@/components/landing/PricingStartTrialButton"
import {
  LANDING_PRICING_CTA,
  LANDING_SECONDARY_CTA,
  TRIAL_MESSAGING,
} from "@/components/landing/landing-cta"
import {
  landingContainerClass,
  landingCtaPrimaryClass,
  landingCtaSecondaryClass,
  landingHeadingClass,
  landingSubheadingClass,
} from "@/components/landing/landing-layout"
import {
  PUBLIC_PRICING_PLANS,
  type PublicPricingPlan,
} from "@/lib/landing/pricing-display"

function PricingCard({ plan, index }: { plan: PublicPricingPlan; index: number }) {
  const isRecommended = plan.highlighted

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className={`relative flex h-full flex-col ${isRecommended ? "lg:-mt-2 lg:mb-2" : ""}`}
    >
      {isRecommended ? (
        <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-indigo-500/50 via-violet-500/30 to-blue-500/20 blur-sm sm:rounded-3xl" />
      ) : null}

      <div
        className={`relative flex h-full flex-col rounded-2xl border p-6 sm:rounded-3xl sm:p-8 ${
          isRecommended
            ? "border-indigo-400/40 bg-gradient-to-b from-indigo-950/50 via-[#0c1019] to-[#06080f] shadow-[0_24px_80px_rgba(99,102,241,0.2)]"
            : "border-white/10 bg-white/[0.03] backdrop-blur-sm"
        }`}
      >
        {plan.badge ? (
          <span className="badge-premium mb-5 inline-flex w-fit">
            <Sparkles className="h-3 w-3" />
            {plan.badge}
          </span>
        ) : (
          <div className="mb-5 h-7" />
        )}

        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
        <p className="mt-2 min-h-[2.5rem] text-sm leading-relaxed text-slate-400">
          {plan.description}
        </p>

        <div className="mt-6 flex items-end gap-1">
          <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            €{plan.price}
          </span>
          <span className="mb-1.5 text-sm text-slate-500">/month</span>
        </div>

        <ul className="mt-8 flex-1 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  isRecommended
                    ? "bg-indigo-500/20 ring-1 ring-indigo-400/30"
                    : "bg-white/[0.06] ring-1 ring-white/10"
                }`}
              >
                <Check
                  className={`h-3 w-3 ${isRecommended ? "text-indigo-300" : "text-emerald-400"}`}
                  strokeWidth={3}
                />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <PricingStartTrialButton highlighted={isRecommended} />
        </div>

        <p className="mt-3 text-center text-xs text-slate-500">
          {TRIAL_MESSAGING.pricingCardNote}
        </p>
      </div>
    </motion.div>
  )
}

export default function PricingPage() {
  return (
    <div className="relative w-full overflow-x-hidden bg-[#06080f] text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/12 blur-[120px]" />

      <LandingHeader />

      <section className="relative">
        <div className={`${landingContainerClass} pb-10 pt-10 sm:pb-16 sm:pt-16`}>
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="badge-premium mb-6 inline-flex">
              <Sparkles className="h-3 w-3" />
              Pricing
            </span>
            <h1 className={landingHeadingClass}>
              Simple Plans for{" "}
              <span className="text-gradient">Growing Coaches</span>
            </h1>
            <p className={landingSubheadingClass}>{TRIAL_MESSAGING.tagline}</p>
          </motion.div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:mt-16 lg:grid-cols-3 lg:gap-8 lg:items-stretch">
            {PUBLIC_PRICING_PLANS.map((plan, index) => (
              <PricingCard key={plan.id} plan={plan} index={index} />
            ))}
          </div>

          <PricingConversionNotes />

          <motion.div
            className="mx-auto mt-10 flex max-w-md flex-col items-stretch gap-3 sm:mt-12 sm:max-w-none sm:flex-row sm:items-center sm:justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link href={LANDING_PRICING_CTA.href} className={landingCtaPrimaryClass}>
              {LANDING_PRICING_CTA.label}
            </Link>
            <Link href={LANDING_SECONDARY_CTA.href} className={landingCtaSecondaryClass}>
              {LANDING_SECONDARY_CTA.label}
            </Link>
          </motion.div>
        </div>
      </section>

      <ConversionCtaBand variant="compact" />
      <LandingFooter />
    </div>
  )
}
