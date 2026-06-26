"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import GlassCard from "@/components/ui/glass-card"
import {
  AUDIENCE_PROOF_CARDS,
  BETA_TRUST_POINTS,
  PRODUCT_PROOF_BLOCKS,
} from "@/components/landing/landing-social-proof"
import {
  landingContainerClass,
  landingHeadingClass,
  landingSectionClass,
  landingSubheadingClass,
} from "@/components/landing/landing-layout"

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
}

export default function SocialProofSection() {
  return (
    <section className={landingSectionClass}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/8 blur-[120px]" />
      </div>

      <div className={landingContainerClass}>
        <motion.div
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="badge-premium mb-6 inline-flex">
            <Sparkles className="h-3 w-3" />
            Beta Access
          </span>
          <h2 className={landingHeadingClass}>
            Built for Coaches Who{" "}
            <span className="text-gradient">Want One Platform</span>
          </h2>
          <p className={landingSubheadingClass}>
            ZyntixAI is in active beta. No fabricated reviews — just honest
            product proof and a platform designed around real coaching workflows.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {AUDIENCE_PROOF_CARDS.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.id}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={cardVariants}
                className="group"
              >
                <GlassCard
                  hover
                  as="article"
                  className="relative flex h-full flex-col overflow-hidden bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-5 sm:p-6"
                >
                  <div
                    className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${card.glow} to-transparent opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
                  />
                  <div
                    className={`relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${card.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="relative text-base font-bold text-white sm:text-lg">
                    {card.title}
                  </h3>
                  <p className="relative mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                    {card.description}
                  </p>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          className="mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            What&apos;s included
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCT_PROOF_BLOCKS.map((block, index) => {
              const Icon = block.icon
              return (
                <motion.div
                  key={block.id}
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={cardVariants}
                >
                  <div className="flex h-full items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm sm:p-5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-white/10 ${block.accent}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-bold tabular-nums text-white">
                        {block.value}
                      </p>
                      <p className="text-sm font-semibold text-slate-200">
                        {block.label}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                        {block.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          className="mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
        >
          <GlassCard className="overflow-hidden border-indigo-400/20 bg-gradient-to-br from-indigo-950/40 via-[#0c1019] to-[#06080f] p-5 sm:p-8">
            <div className="mb-6 text-center sm:mb-8">
              <span className="badge-premium mb-4 inline-flex">
                <Sparkles className="h-3 w-3" />
                Beta Program
              </span>
              <h3 className="text-xl font-bold text-white sm:text-2xl">
                Join Early. Help Us Build the Future of Coaching Software.
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
              {BETA_TRUST_POINTS.map((point) => {
                const Icon = point.icon
                return (
                  <div
                    key={point.id}
                    className="rounded-xl border border-white/8 bg-white/[0.03] p-4 sm:p-5"
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 ring-1 ring-indigo-400/20">
                      <Icon className="h-4 w-4 text-indigo-300" />
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {point.title}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400 sm:text-sm">
                      {point.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}
