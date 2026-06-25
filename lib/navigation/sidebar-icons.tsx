import type { LucideIcon } from "lucide-react"
import {
  Apple,
  BarChart3,
  Bot,
  Brain,
  Briefcase,
  Calendar,
  CalendarClock,
  ClipboardList,
  Dumbbell,
  FlaskConical,
  LayoutDashboard,
  Lightbulb,
  Megaphone,
  BookOpen,
  Fish,
  Settings,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Video,
  UtensilsCrossed,
} from "lucide-react"

const SIDEBAR_ICONS: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/coach-workspace": Briefcase,
  "/workouts": Dumbbell,
  "/dashboard/exercises": ClipboardList,
  "/members": Users,
  "/progress": TrendingUp,
  "/nutrition": Apple,
  "/sessions": CalendarClock,
  "/my-workouts": Dumbbell,
  "/my-nutrition": UtensilsCrossed,
  "/settings": Settings,
  "/settings/demo-data": FlaskConical,
  "/admin": Shield,
  "/marketing-ai/coach": Bot,
  "/marketing/content-ideas": Lightbulb,
  "/marketing/instagram-demo-preview": Sparkles,
  "/marketing/campaign-generator": Megaphone,
  "/marketing/hook-library": Fish,
  "/marketing/cta-generator": Megaphone,
  "/marketing/story-structure": BookOpen,
  "/marketing/calendar": Calendar,
  "/marketing/scheduled": Target,
  "/marketing/analytics": BarChart3,
  "/marketing/learning": Brain,
  "/marketing/video-generator": Video,
  "/marketing/settings": Settings,
}

const GROUP_ICONS: Record<string, LucideIcon> = {
  "Marketing AI": Megaphone,
  Settings: Settings,
}

export function getSidebarIcon(href: string): LucideIcon {
  return SIDEBAR_ICONS[href] ?? UserRound
}

export function getSidebarGroupIcon(name: string): LucideIcon {
  return GROUP_ICONS[name] ?? UserRound
}
