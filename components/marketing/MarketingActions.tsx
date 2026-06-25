import Link from "next/link"
import {
  BarChart3,
  Brain,
  Calendar,
  Clapperboard,
  BookOpen,
  Camera,
  Fish,
  Megaphone,
  Sparkles,
  Target,
  Wand2,
  type LucideIcon,
} from "lucide-react"

type QuickAction = {
  label: string
  href: string
  icon: LucideIcon
  description: string
  accent: string
}

const actions: QuickAction[] = [
  {
    label: "Instagram Demo",
    href: "/marketing/instagram-demo-preview",
    icon: Camera,
    description: "Screenshot-ready mock Instagram profile preview",
    accent: "from-pink-500 to-purple-600",
  },
  {
    label: "Generate posts",
    href: "/marketing/content-ideas",
    icon: Sparkles,
    description: "Create AI content ideas for your brand",
    accent: "from-blue-500 to-cyan-500",
  },
  {
    label: "Campaign Generator",
    href: "/marketing/campaign-generator",
    icon: Megaphone,
    description: "Build multi-week marketing campaigns with AI",
    accent: "from-indigo-500 to-violet-500",
  },
  {
    label: "Hook Library",
    href: "/marketing/hook-library",
    icon: Fish,
    description: "Generate 10 scroll-stopping hooks per campaign",
    accent: "from-rose-500 to-orange-500",
  },
  {
    label: "CTA Generator",
    href: "/marketing/cta-generator",
    icon: Megaphone,
    description: "Generate 5 conversion-ready CTA variations",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    label: "Story Structure",
    href: "/marketing/story-structure",
    icon: BookOpen,
    description: "7-scene narrative arc from hook to CTA",
    accent: "from-indigo-500 to-violet-500",
  },
  {
    label: "Schedule",
    href: "/marketing/calendar",
    icon: Calendar,
    description: "Plan and queue posts on your calendar",
    accent: "from-amber-500 to-orange-500",
  },
  {
    label: "Optimize",
    href: "/marketing/scheduled",
    icon: Wand2,
    description: "Score and optimize posts before publishing",
    accent: "from-violet-500 to-purple-500",
  },
  {
    label: "Video Script",
    href: "/marketing/video-script-generator",
    icon: Clapperboard,
    description: "Generate hook, scenes, voiceover, captions & CTA",
    accent: "from-slate-700 to-gray-900",
  },
  {
    label: "Analytics",
    href: "/marketing/analytics",
    icon: BarChart3,
    description: "Track views, engagement, and growth",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    label: "Learning Engine",
    href: "/marketing/learning",
    icon: Brain,
    description: "Learn from your best hooks, CTAs, and posting patterns",
    accent: "from-indigo-500 to-violet-500",
  },
  {
    label: "AI Strategist",
    href: "/marketing/strategy",
    icon: Target,
    description: "Refine your content strategy with AI",
    accent: "from-rose-500 to-pink-500",
  },
]

export default function MarketingActions() {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">Quick actions</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Jump into your most-used workflows
        </p>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50/80 p-4 transition hover:border-gray-300 hover:bg-white hover:shadow-sm"
            >
              <div
                className={`pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${action.accent} opacity-0 blur-xl transition group-hover:opacity-20`}
              />
              <div className="relative flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${action.accent} text-white shadow-sm`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-medium text-gray-900">{action.label}</span>
                  <p className="mt-1 text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
