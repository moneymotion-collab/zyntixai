"use client"

import { useId, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ChevronDown, HelpCircle } from "lucide-react"
import {
  LANDING_HERO_CTA,
  LANDING_SECONDARY_CTA,
  LANDING_CTA_FOOTNOTE,
} from "@/components/landing/landing-cta"
import { LANDING_FAQ_ITEMS } from "@/components/landing/landing-faq"
import {
  landingContainerClass,
  landingCtaPrimaryClass,
  landingCtaSecondaryClass,
  landingHeadingClass,
  landingSectionClass,
  landingSubheadingClass,
} from "@/components/landing/landing-layout"

function FaqAccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  itemId,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  itemId: string
}) {
  const panelId = `${itemId}-panel`
  const buttonId = `${itemId}-button`

  return (
    <div className="border-b border-white/8 last:border-b-0">
      <button
        id={buttonId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex min-h-12 w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-indigo-100 sm:py-5"
      >
        <span className="text-sm font-semibold leading-snug text-white sm:text-base">
          {question}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition-transform duration-200 ${
            isOpen ? "rotate-180 bg-white/[0.08]" : ""
          }`}
        >
          <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-4 text-sm leading-relaxed text-slate-400 sm:pb-5 sm:text-[0.9375rem]">
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LandingFaqSection() {
  const baseId = useId()
  const [openId, setOpenId] = useState<string | null>(LANDING_FAQ_ITEMS[0]?.id ?? null)

  return (
    <section id="faq" className={landingSectionClass}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/15 to-transparent" />
      </div>

      <div className={`${landingContainerClass} max-w-3xl`}>
        <motion.div
          className="mx-auto mb-8 max-w-2xl text-center sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="badge-premium mb-6 inline-flex">
            <HelpCircle className="h-3 w-3" />
            FAQ
          </span>
          <h2 className={landingHeadingClass}>
            Questions?{" "}
            <span className="text-gradient">We&apos;ve Got Answers</span>
          </h2>
          <p className={landingSubheadingClass}>
            Everything you need to know before starting your free trial.
          </p>
        </motion.div>

        <motion.div
          className="glass-panel rounded-2xl border-white/12 px-4 sm:px-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: 0.05, ease: "easeOut" }}
        >
          {LANDING_FAQ_ITEMS.map((item) => (
            <FaqAccordionItem
              key={item.id}
              itemId={`${baseId}-${item.id}`}
              question={item.question}
              answer={item.answer}
              isOpen={openId === item.id}
              onToggle={() =>
                setOpenId((current) => (current === item.id ? null : item.id))
              }
            />
          ))}
        </motion.div>

        <motion.div
          className="mx-auto mt-10 max-w-xl text-center sm:mt-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <p className="text-sm font-medium text-slate-300 sm:text-base">
            Still deciding? Start free — explore the full platform on your own terms.
          </p>
          <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link href={LANDING_HERO_CTA.href} className={landingCtaPrimaryClass}>
              {LANDING_HERO_CTA.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={LANDING_SECONDARY_CTA.href}
              className={landingCtaSecondaryClass}
            >
              {LANDING_SECONDARY_CTA.label}
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500 sm:text-sm">
            {LANDING_CTA_FOOTNOTE}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
