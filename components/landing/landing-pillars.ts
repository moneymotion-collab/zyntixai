import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Sparkles,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type LandingPillar = {
  id: string
  title: string
  headline: string
  bullets: readonly string[]
  imageSrc: string
  imageAlt: string
  icon: LucideIcon
  accent: string
  glow: string
  iconAccent: string
}

export const LANDING_PILLARS: readonly LandingPillar[] = [
  {
    id: "coaching-core",
    title: "Coaching Core",
    headline: "Manage every client in one place",
    bullets: ["Members", "Workouts", "Nutrition", "Sessions", "Notes"],
    imageSrc: "/app-showcase/members.png",
    imageAlt: "FitCore AI members and client management dashboard",
    icon: Users,
    accent: "from-indigo-500/30 to-blue-500/15",
    glow: "from-indigo-500/25",
    iconAccent: "text-indigo-300",
  },
  {
    id: "exercise-library-pro",
    title: "Exercise Library Pro",
    headline: "Build workouts faster with a complete exercise system",
    bullets: [
      "500+ exercises",
      "Custom exercises",
      "Templates",
      "Search & filters",
      "Exercise instructions",
    ],
    imageSrc: "/app-showcase/workouts-create-plan.png",
    imageAlt: "FitCore AI workout builder and exercise library",
    icon: BookOpen,
    accent: "from-blue-500/30 to-cyan-500/15",
    glow: "from-blue-500/25",
    iconAccent: "text-blue-300",
  },
  {
    id: "progress-dashboard-pro",
    title: "Progress Dashboard Pro",
    headline: "Track client progress automatically",
    bullets: [
      "Weight trends",
      "Progress photos",
      "Check-ins",
      "Habits",
      "Goal tracking",
    ],
    imageSrc: "/app-showcase/weight-trend.png",
    imageAlt: "FitCore AI progress tracking and weight trends",
    icon: BarChart3,
    accent: "from-cyan-500/30 to-sky-500/15",
    glow: "from-cyan-500/25",
    iconAccent: "text-cyan-300",
  },
  {
    id: "coach-dashboard-pro",
    title: "Coach Dashboard Pro",
    headline: "Know exactly what needs attention",
    bullets: [
      "KPI cards",
      "Daily overview",
      "At-risk clients",
      "Tasks",
      "Recent activity",
    ],
    imageSrc: "/app-showcase/dashboard.png",
    imageAlt: "FitCore AI coach command center dashboard",
    icon: LayoutDashboard,
    accent: "from-violet-500/30 to-purple-500/15",
    glow: "from-violet-500/25",
    iconAccent: "text-violet-300",
  },
  {
    id: "marketing-ai",
    title: "Marketing AI",
    headline: "Grow your coaching business with AI",
    bullets: [
      "Content ideas",
      "Calendar",
      "Instagram publishing",
      "Analytics",
      "Video generator",
    ],
    imageSrc: "/app-showcase/marketing-ai.png",
    imageAlt: "FitCore AI marketing content calendar and ideas",
    icon: Sparkles,
    accent: "from-rose-500/30 to-pink-500/15",
    glow: "from-rose-500/25",
    iconAccent: "text-rose-300",
  },
] as const
