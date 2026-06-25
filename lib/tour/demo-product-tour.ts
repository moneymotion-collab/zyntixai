import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Dumbbell,
  LayoutDashboard,
  Megaphone,
  Users,
  UtensilsCrossed,
  Video,
} from "lucide-react"

export const DEMO_PRODUCT_TOUR_STORAGE_KEY = "fitcore-demo-product-tour"

export type DemoProductTourState = {
  step: number
  completed: boolean
  skipped: boolean
}

export type DemoProductTourStep = {
  step: number
  id: string
  title: string
  description: string
  href: string
  target: string
  icon: LucideIcon
}

export const DEMO_PRODUCT_TOUR_STEPS: DemoProductTourStep[] = [
  {
    step: 1,
    id: "dashboard-overview",
    title: "Dashboard Overview",
    description:
      "Your command center for KPIs, member health scores, at-risk alerts, and today’s coaching priorities — all in one executive view.",
    href: "/dashboard",
    target: '[data-tour="dashboard-overview"]',
    icon: LayoutDashboard,
  },
  {
    step: 2,
    id: "members-management",
    title: "Members Management",
    description:
      "Manage your roster, view member profiles, track workout assignments, and keep every client account linked and up to date.",
    href: "/members",
    target: '[data-tour="members-management"]',
    icon: Users,
  },
  {
    step: 3,
    id: "workout-builder",
    title: "Workout Builder",
    description:
      "Build professional workout plans from the exercise library — set sets, reps, rest, and goals, then assign to members in seconds.",
    href: "/workouts/new",
    target: '[data-tour="workout-builder"]',
    icon: Dumbbell,
  },
  {
    step: 4,
    id: "nutrition-planning",
    title: "Nutrition Planning",
    description:
      "Create macro-based nutrition plans, assign them to members, and manage dietary goals alongside training programs.",
    href: "/nutrition",
    target: '[data-tour="nutrition-planning"]',
    icon: UtensilsCrossed,
  },
  {
    step: 5,
    id: "progress-tracking",
    title: "Progress Tracking",
    description:
      "Track weight, strength PRs, check-ins, and trends. Spot who needs attention and celebrate milestones with your clients.",
    href: "/progress",
    target: '[data-tour="progress-tracking"]',
    icon: BarChart3,
  },
  {
    step: 6,
    id: "marketing-ai",
    title: "Marketing AI",
    description:
      "Your AI marketing strategist — get content ideas, campaign advice, and growth tactics tailored to your coaching business.",
    href: "/marketing-ai/coach",
    target: '[data-tour="marketing-ai"]',
    icon: Megaphone,
  },
  {
    step: 7,
    id: "video-generator",
    title: "Video Generator",
    description:
      "Turn ideas into scroll-stopping social videos — AI writes scripts, scenes, visuals, captions, and hashtags for your brand.",
    href: "/marketing/video-generator",
    target: '[data-tour="video-generator"]',
    icon: Video,
  },
]

export const DEMO_PRODUCT_TOUR_TOTAL = DEMO_PRODUCT_TOUR_STEPS.length

export function readDemoProductTourState(): DemoProductTourState | null {
  if (typeof window === "undefined") return null

  const raw = localStorage.getItem(DEMO_PRODUCT_TOUR_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as DemoProductTourState
    if (
      typeof parsed.step === "number" &&
      typeof parsed.completed === "boolean" &&
      typeof parsed.skipped === "boolean"
    ) {
      return parsed
    }
  } catch {
    return null
  }

  return null
}

export function writeDemoProductTourState(state: DemoProductTourState): void {
  if (typeof window === "undefined") return
  localStorage.setItem(DEMO_PRODUCT_TOUR_STORAGE_KEY, JSON.stringify(state))
}

export function pathMatchesTourStep(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getTourStepByIndex(step: number): DemoProductTourStep | null {
  return DEMO_PRODUCT_TOUR_STEPS.find((item) => item.step === step) ?? null
}
