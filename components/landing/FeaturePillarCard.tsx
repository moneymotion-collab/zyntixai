"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import GlassCard from "@/components/ui/glass-card"
import type { LandingPillar } from "@/components/landing/landing-pillars"

type FeaturePillarCardProps = {
  pillar: LandingPillar
  index: number
  reverse?: boolean
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.55, ease: "easeOut" as const },
  }),
}

export default function FeaturePillarCard({
  pillar,
  index,
  reverse = false,
}: FeaturePillarCardProps) {
  const Icon = pillar.icon

  return (
    <motion.article
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-48px" }}
      variants={cardVariants}
      className="group"
    >
      <GlassCard
        hover
        as="div"
        className="relative overflow-hidden bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-4 sm:p-6 lg:p-8"
      >
        <div
          className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${pillar.glow} to-transparent opacity-50 blur-3xl transition-opacity duration-500 group-hover:opacity-80`}
        />

        <div
          className={`relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10 ${
            reverse ? "lg:flex-row-reverse" : ""
          }`}
        >
          <div className="flex-1 lg:min-w-0">
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] sm:h-12 sm:w-12 ${pillar.accent}`}
              >
                <Icon className={`h-5 w-5 ${pillar.iconAccent}`} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                {pillar.title}
              </p>
            </div>

            <h3 className="text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl lg:text-[1.65rem]">
              {pillar.headline}
            </h3>

            <ul className="mt-5 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:gap-3">
              {pillar.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-center gap-2.5 text-sm text-slate-300"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/25">
                    <Check
                      className="h-3 w-3 text-emerald-400"
                      strokeWidth={3}
                    />
                  </span>
                  <span className="min-w-0 leading-snug">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative w-full shrink-0 lg:w-[min(100%,28rem)] xl:w-[32rem]">
            <div className="absolute -inset-3 rounded-2xl bg-gradient-to-b from-indigo-500/15 via-violet-500/8 to-transparent blur-2xl" />
            <div className="glass-panel relative overflow-hidden rounded-xl border-white/12 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:rounded-2xl">
              <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.03] px-3 py-2 sm:px-4 sm:py-2.5">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500/80 sm:h-2.5 sm:w-2.5" />
                  <span className="h-2 w-2 rounded-full bg-amber-500/80 sm:h-2.5 sm:w-2.5" />
                  <span className="h-2 w-2 rounded-full bg-emerald-500/80 sm:h-2.5 sm:w-2.5" />
                </div>
                <span className="mx-auto truncate text-[10px] text-slate-500 sm:text-[11px]">
                  app.zyntixai.com/{pillar.id}
                </span>
              </div>
              <div className="relative aspect-[16/10] w-full bg-[#0a0e17]">
                <Image
                  src={pillar.imageSrc}
                  alt={pillar.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 32rem"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.article>
  )
}
