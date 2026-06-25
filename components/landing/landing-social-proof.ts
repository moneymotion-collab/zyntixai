import {
  BarChart3,
  BookOpen,
  Calendar,
  LayoutDashboard,
  Megaphone,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  Dumbbell,
  Building2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type AudienceProofCard = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  accent: string
  glow: string
}

export type ProductProofBlock = {
  id: string
  value: string
  label: string
  description: string
  icon: LucideIcon
  accent: string
}

export type BetaTrustPoint = {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

export const AUDIENCE_PROOF_CARDS: readonly AudienceProofCard[] = [
  {
    id: "personal-trainers",
    title: "Built for personal trainers",
    description:
      "Run client programs, sessions, and check-ins without spreadsheets or disconnected apps — built around how PTs actually coach.",
    icon: Dumbbell,
    accent: "from-emerald-500/30 to-teal-500/15 text-emerald-300",
    glow: "from-emerald-500/20",
  },
  {
    id: "online-coaches",
    title: "Designed for online coaches",
    description:
      "Deliver remote workouts, nutrition, and progress tracking from one dashboard — plus AI tools to stay visible and consistent online.",
    icon: Users,
    accent: "from-indigo-500/30 to-blue-500/15 text-indigo-300",
    glow: "from-indigo-500/20",
  },
  {
    id: "scaling-businesses",
    title: "Made for coaching businesses ready to scale",
    description:
      "Standardize workflows across clients and coaches so you can grow without rebuilding your systems every time you add capacity.",
    icon: Building2,
    accent: "from-violet-500/30 to-purple-500/15 text-violet-300",
    glow: "from-violet-500/20",
  },
] as const

export const PRODUCT_PROOF_BLOCKS: readonly ProductProofBlock[] = [
  {
    id: "exercise-library",
    value: "500+",
    label: "Exercise library",
    description: "Templates, custom exercises, and instructions built in.",
    icon: BookOpen,
    accent: "from-blue-500/25 to-cyan-500/10 text-blue-300",
  },
  {
    id: "ai-content",
    value: "AI",
    label: "Content ideas",
    description: "Generate hooks, captions, and campaigns for your niche.",
    icon: Sparkles,
    accent: "from-violet-500/25 to-purple-500/10 text-violet-300",
  },
  {
    id: "instagram",
    value: "IG",
    label: "Instagram publishing",
    description: "Plan, draft, and publish from your marketing workflow.",
    icon: Share2,
    accent: "from-rose-500/25 to-pink-500/10 text-rose-300",
  },
  {
    id: "progress",
    value: "24/7",
    label: "Progress tracking",
    description: "Weight trends, check-ins, photos, habits, and goals.",
    icon: TrendingUp,
    accent: "from-cyan-500/25 to-sky-500/10 text-cyan-300",
  },
  {
    id: "dashboard",
    value: "1",
    label: "Coach dashboard",
    description: "KPIs, at-risk clients, tasks, and daily overview in one view.",
    icon: LayoutDashboard,
    accent: "from-indigo-500/25 to-blue-500/10 text-indigo-300",
  },
  {
    id: "trial",
    value: "7 days",
    label: "Free trial",
    description: "Full platform access — no credit card required to start.",
    icon: Calendar,
    accent: "from-emerald-500/25 to-teal-500/10 text-emerald-300",
  },
] as const

export const BETA_TRUST_POINTS: readonly BetaTrustPoint[] = [
  {
    id: "shape-product",
    title: "Early users help shape the product",
    description:
      "Beta coaches influence what we build next — your workflow feedback goes directly into the roadmap.",
    icon: Megaphone,
  },
  {
    id: "coach-workflows",
    title: "Built with coach workflows in mind",
    description:
      "Every module maps to real coaching tasks: clients, programming, progress, and growth — not generic SaaS features.",
    icon: BarChart3,
  },
  {
    id: "no-card",
    title: "No credit card required for trial",
    description:
      "Start with a 7-day free trial by creating an account. Upgrade only when you choose a paid plan.",
    icon: Sparkles,
  },
] as const
