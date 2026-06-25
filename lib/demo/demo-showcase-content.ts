import type { LucideIcon } from "lucide-react"
import { Megaphone, Target, TrendingUp, Video } from "lucide-react"

export type DemoShowcaseCampaign = {
  id: string
  title: string
  description: string
  platform: string
  status: string
  href: string
  icon: LucideIcon
  accent: string
}

export type DemoShowcaseMarketingExample = {
  id: string
  title: string
  format: string
  category: string
  metric: string
  href: string
}

export const DEMO_SHOWCASE_VIDEO = {
  title: "FitCore AI Platform Tour",
  duration: "30 sec",
  description:
    "Full walkthrough — members, workouts, nutrition, progress, marketing AI, and analytics.",
  href: "/marketing/video-generator",
} as const

export const DEMO_SHOWCASE_CAMPAIGNS: DemoShowcaseCampaign[] = [
  {
    id: "summer-strong",
    title: "Summer Strong Challenge",
    description: "8-week transformation funnel with lead magnet, email nurture, and signup CTA.",
    platform: "Multi-channel",
    status: "Live demo",
    href: "/marketing/campaign-generator",
    icon: Target,
    accent: "from-violet-500/30 to-indigo-500/15 text-violet-200",
  },
  {
    id: "morning-classes",
    title: "Fill Morning Classes",
    description: "Local gym campaign targeting professionals with trial session offers.",
    platform: "Instagram + Email",
    status: "Scheduled",
    href: "/marketing/campaign-generator",
    icon: TrendingUp,
    accent: "from-cyan-500/30 to-sky-500/15 text-cyan-200",
  },
  {
    id: "platform-showcase",
    title: "Platform Showcase Reel",
    description: "30-second SaaS product video highlighting every FitCore AI module.",
    platform: "Instagram Reels",
    status: "Generated",
    href: "/marketing/video-generator",
    icon: Video,
    accent: "from-rose-500/30 to-pink-500/15 text-rose-200",
  },
]

export const DEMO_SHOWCASE_MARKETING: DemoShowcaseMarketingExample[] = [
  {
    id: "gym-mistakes",
    title: "3 gym mistakes killing your members' progress",
    format: "Reel",
    category: "Workout",
    metric: "12.4K views",
    href: "/marketing/instagram-demo-preview",
  },
  {
    id: "transformation",
    title: "Member transformation: 18 lbs in 12 weeks",
    format: "Carousel",
    category: "Transformation",
    metric: "7.6K views",
    href: "/marketing/instagram-demo-preview",
  },
  {
    id: "protein-tips",
    title: "What I tell every new gym member about protein",
    format: "Reel",
    category: "Nutrition",
    metric: "6.9K views",
    href: "/marketing/content-ideas",
  },
]

export const DEMO_SHOWCASE_MARKETING_ICON = Megaphone
