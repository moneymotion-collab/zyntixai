import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Megaphone,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  Video,
  Dumbbell,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type DemoShowcaseModule = {
  label: string
  icon: LucideIcon
}

export type DemoFeatureHighlight = {
  label: string
  description: string
  icon: LucideIcon
  accent: string
}

/** Modules covered in the product demo walkthrough. */
export const DEMO_SHOWCASE_MODULES: readonly DemoShowcaseModule[] = [
  { label: "Coach Dashboard", icon: LayoutDashboard },
  { label: "Members", icon: Users },
  { label: "Workouts", icon: Dumbbell },
  { label: "Progress", icon: TrendingUp },
  { label: "Marketing AI", icon: Sparkles },
  { label: "Video Generator", icon: Video },
] as const

/** Feature highlights shown beside the demo video. */
export const DEMO_FEATURE_HIGHLIGHTS: readonly DemoFeatureHighlight[] = [
  {
    label: "Client Management",
    description: "Profiles, sessions, notes, and assignments in one hub.",
    icon: Users,
    accent: "from-indigo-500/25 to-blue-500/10 text-indigo-300",
  },
  {
    label: "Exercise Library",
    description: "500+ exercises, templates, filters, and custom movements.",
    icon: BookOpen,
    accent: "from-blue-500/25 to-cyan-500/10 text-blue-300",
  },
  {
    label: "Progress Tracking",
    description: "Weight trends, photos, check-ins, habits, and goals.",
    icon: BarChart3,
    accent: "from-cyan-500/25 to-sky-500/10 text-cyan-300",
  },
  {
    label: "Marketing AI",
    description: "Ideas, campaigns, calendar, and performance insights.",
    icon: Megaphone,
    accent: "from-violet-500/25 to-purple-500/10 text-violet-300",
  },
  {
    label: "Instagram Publishing",
    description: "Draft, schedule, and publish without leaving ZyntixAI.",
    icon: Share2,
    accent: "from-rose-500/25 to-pink-500/10 text-rose-300",
  },
] as const

export const DEMO_VIDEO_HEADLINE = "See ZyntixAI in Action"

export const DEMO_VIDEO_SUBHEADLINE =
  "Manage clients, build workouts, track progress and grow your coaching business from one platform."
