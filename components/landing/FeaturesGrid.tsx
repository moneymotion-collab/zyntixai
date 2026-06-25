"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import FeaturePillarCard from "@/components/landing/FeaturePillarCard"
import {
  LANDING_FEATURES_CTA,
  LANDING_SECONDARY_CTA,
} from "@/components/landing/landing-cta"
import { LANDING_PILLARS } from "@/components/landing/landing-pillars"
import {
  landingContainerClass,
  landingCtaPrimaryClass,
  landingCtaSecondaryClass,
  landingHeadingClass,
  landingSectionClass,
  landingSubheadingClass,
} from "@/components/landing/landing-layout"

export default function FeaturesGrid() {
  return (
    <section id="features" className={landingSectionClass}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/8 blur-[120px]" />
      </div>

      <div className={landingContainerClass}>
        <motion.div
          className="mx-auto mb-10 max-w-2xl text-center sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-indigo-400">
            Features
          </p>
          <h2 className={landingHeadingClass}>
            Five Pillars of{" "}
            <span className="text-gradient">Modern Coaching</span>
          </h2>
          <p className={landingSubheadingClass}>
            From client management to AI-powered growth — every core workflow
            coaches need, built into one platform.
          </p>
        </motion.div>

        <div className="space-y-5 sm:space-y-6 lg:space-y-8">
          {LANDING_PILLARS.map((pillar, index) => (
            <FeaturePillarCard
              key={pillar.id}
              pillar={pillar}
              index={index}
              reverse={index % 2 === 1}
            />
          ))}
        </div>

        <motion.div
          className="mx-auto mt-12 max-w-xl text-center sm:mt-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <p className="text-sm font-medium text-slate-300 sm:text-base">
            Ready to see it in action?
          </p>
          <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link href={LANDING_FEATURES_CTA.href} className={landingCtaPrimaryClass}>
              {LANDING_FEATURES_CTA.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={LANDING_SECONDARY_CTA.href}
              className={landingCtaSecondaryClass}
            >
              {LANDING_SECONDARY_CTA.label}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
