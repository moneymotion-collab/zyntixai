import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Dumbbell,
  Megaphone,
  Users,
  Video,
} from "lucide-react"

export type FeatureHighlight = {
  id: string
  title: string
  description: string
  href: string
  icon: LucideIcon
  accent: string
  glow: string
}

export const FEATURE_HIGHLIGHTS: FeatureHighlight[] = [
  {
    id: "manage-clients",
    title: "Manage Clients",
    description:
      "Centralize your roster, profiles, assignments, and member status in one coaching hub.",
    href: "/members",
    icon: Users,
    accent: "from-indigo-500/30 to-blue-500/15 text-indigo-200",
    glow: "from-indigo-500/20",
  },
  {
    id: "build-workouts",
    title: "Build Workouts",
    description:
      "Design professional training plans from the exercise library and assign them in seconds.",
    href: "/workouts/new",
    icon: Dumbbell,
    accent: "from-emerald-500/30 to-teal-500/15 text-emerald-200",
    glow: "from-emerald-500/20",
  },
  {
    id: "track-progress",
    title: "Track Progress",
    description:
      "Monitor metrics, check-ins, goals, and trends to know exactly who needs coaching attention.",
    href: "/progress",
    icon: BarChart3,
    accent: "from-cyan-500/30 to-sky-500/15 text-cyan-200",
    glow: "from-cyan-500/20",
  },
  {
    id: "create-content",
    title: "Create Content",
    description:
      "Generate posts, campaigns, and marketing ideas with AI tuned for fitness businesses.",
    href: "/marketing-ai/coach",
    icon: Megaphone,
    accent: "from-violet-500/30 to-purple-500/15 text-violet-200",
    glow: "from-violet-500/20",
  },
  {
    id: "generate-videos",
    title: "Generate Videos",
    description:
      "Turn ideas into scroll-stopping video campaigns with scripts, scenes, and brand visuals.",
    href: "/marketing/video-generator",
    icon: Video,
    accent: "from-rose-500/30 to-pink-500/15 text-rose-200",
    glow: "from-rose-500/20",
  },
]
