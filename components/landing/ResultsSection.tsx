"use client"

import { motion } from "framer-motion"
import {
  Dumbbell,
  Megaphone,
  Users,
  Video,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  landingContainerClass,
  landingSectionClass,
} from "@/components/landing/landing-layout"
import DashboardStatCard from "@/components/ui/dashboard-stat-card"

type ResultStat = {
  value: string
  label: string
  detail: string
  icon: LucideIcon
  accent: string
}

const RESULT_STATS: ResultStat[] = [
  {
    value: "25+",
    label: "Demo Clients",
    detail: "Pre-loaded for instant exploration",
    icon: Users,
    accent: "from-indigo-500/25 to-blue-500/10 text-indigo-300",
  },
  {
    value: "100+",
    label: "Workout Templates",
    detail: "Ready-to-assign training plans",
    icon: Dumbbell,
    accent: "from-blue-500/25 to-cyan-500/10 text-blue-300",
  },
  {
    value: "35+",
    label: "Marketing Campaigns",
    detail: "AI-generated content examples",
    icon: Megaphone,
    accent: "from-violet-500/25 to-purple-500/10 text-violet-300",
  },
  {
    value: "10+",
    label: "Video Projects",
    detail: "Sample reels & video scripts",
    icon: Video,
    accent: "from-rose-500/25 to-pink-500/10 text-rose-300",
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
}

export default function ResultsSection() {
  return (
    <section className={landingSectionClass}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/2 h-[350px] w-[500px] -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="absolute right-0 top-1/2 h-[350px] w-[500px] -translate-y-1/2 rounded-full bg-violet-600/8 blur-[100px]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </div>

      <div className={landingContainerClass}>
        <motion.div
          className="mx-auto mb-14 max-w-2xl text-center sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-indigo-400">
            Demo Workspace
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Explore a{" "}
            <span className="text-gradient">Fully Loaded Demo</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Try Demo Workspace for pre-loaded clients, workouts, and marketing
            examples — real product UI, no setup required.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {RESULT_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={cardVariants}
            >
              <DashboardStatCard
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                accent={stat.accent}
                detail={stat.detail}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
