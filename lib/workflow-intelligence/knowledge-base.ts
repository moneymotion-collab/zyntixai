import type { PlatformFeatureId, PlatformFeatureKnowledge } from "@/lib/workflow-intelligence/types"

export const PLATFORM_KNOWLEDGE_BASE: Record<
  PlatformFeatureId,
  PlatformFeatureKnowledge
> = {
  dashboard: {
    id: "dashboard",
    label: "Dashboard",
    route: "/dashboard",
    assetKey: "dashboard",
    purpose:
      "Give coaches a morning command center with KPIs, today's schedule, and clients who need attention.",
    businessValue:
      "Coaches start every day with clarity instead of digging through spreadsheets, emails, and multiple apps.",
    nextLogicalStep: "members",
    keywords: [
      "dashboard",
      "overview",
      "kpi",
      "command center",
      "today",
      "schedule",
      "home",
      "stats",
    ],
    primaryUiElements: [
      "KPI cards (revenue, active clients, sessions)",
      "Today's schedule strip",
      "Clients needing attention widget",
      "Quick-action shortcuts",
    ],
    typicalUserActions: [
      "Scan KPI cards on login",
      "Click a client flagged as needing attention",
      "Navigate to Members or Workouts from sidebar",
    ],
    demoFocusAreas: [
      "Revenue and active client KPI cards",
      "Today's schedule with session times",
      "Attention alerts for clients without plans",
    ],
  },

  members: {
    id: "members",
    label: "Members",
    route: "/members",
    assetKey: "members",
    purpose:
      "Manage every client profile, goal, status, and training history in one CRM built for coaches.",
    businessValue:
      "Retention improves when coaches see goals, plan status, and attention flags before a client churns.",
    nextLogicalStep: "workouts",
    keywords: [
      "members",
      "clients",
      "crm",
      "profiles",
      "roster",
      "client list",
      "retention",
    ],
    primaryUiElements: [
      "Member list with avatars and goal tags",
      "Status badges (needs attention / on track)",
      "Member profile drawer with goals and macros",
      "Filter and search bar",
    ],
    typicalUserActions: [
      "Scroll and filter member list",
      "Open a member profile",
      "Review goals before building a plan",
      "Assign workout or nutrition from profile",
    ],
    demoFocusAreas: [
      "Member cards with goal tags",
      "Needs-attention status badges",
      "Profile open with macro targets visible",
    ],
  },

  workouts: {
    id: "workouts",
    label: "Workouts",
    route: "/workouts",
    assetKey: "workouts",
    purpose:
      "Build structured workout plans with exercise blocks, sets, reps, and rest — then assign in one click.",
    businessValue:
      "Coaches save hours per week on programming and deliver consistent, professional plans at scale.",
    nextLogicalStep: "nutrition",
    keywords: [
      "workout",
      "workouts",
      "training plan",
      "exercise",
      "program",
      "assign workout",
      "workout builder",
      "programming",
    ],
    primaryUiElements: [
      "Create Workout Plan button",
      "Exercise library search",
      "Exercise blocks with sets/reps/rest",
      "Assign to member drawer",
    ],
    typicalUserActions: [
      "Click Create Workout Plan",
      "Drag exercises into blocks",
      "Set sets, reps, and rest timers",
      "Assign plan to a member",
    ],
    demoFocusAreas: [
      "Create Workout Plan CTA",
      "Exercise block editor",
      "Assign-to-member confirmation",
    ],
  },

  nutrition: {
    id: "nutrition",
    label: "Nutrition",
    route: "/nutrition",
    assetKey: "nutrition",
    purpose:
      "Create macro-aligned meal plans from templates without manual spreadsheet math.",
    businessValue:
      "Nutrition coaching becomes scalable — coaches deliver precise plans clients actually follow.",
    nextLogicalStep: "sessions",
    keywords: [
      "nutrition",
      "meal plan",
      "diet",
      "macro",
      "macros",
      "meal template",
      "assign nutrition",
      "calories",
    ],
    primaryUiElements: [
      "Create Nutrition Plan button",
      "Macro rings (protein, carbs, fats)",
      "Meal template library",
      "Daily meal slot grid",
    ],
    typicalUserActions: [
      "Create nutrition plan from template",
      "Adjust macro targets to match member goals",
      "Drag meals into day slots",
      "Assign and notify member",
    ],
    demoFocusAreas: [
      "Macro ring visualization",
      "Meal template cards",
      "Assign nutrition drawer",
    ],
  },

  sessions: {
    id: "sessions",
    label: "Sessions",
    route: "/sessions",
    assetKey: "sessions",
    purpose:
      "Schedule 1:1 and group sessions, send reminders, and prevent double-booking chaos.",
    businessValue:
      "Fewer no-shows and scheduling conflicts mean more billable hours and happier clients.",
    nextLogicalStep: "marketing_ai",
    keywords: [
      "sessions",
      "schedule",
      "booking",
      "calendar",
      "appointments",
      "1:1",
      "group session",
      "reminders",
    ],
    primaryUiElements: [
      "Weekly calendar grid",
      "New session modal",
      "Client selector and time picker",
      "Booking confirmation toast",
    ],
    typicalUserActions: [
      "Drag session onto calendar slot",
      "Select client and session type",
      "Confirm booking and send reminder",
      "Reschedule from calendar drag",
    ],
    demoFocusAreas: [
      "Calendar with time blocks",
      "New session booking flow",
      "Confirmation with client name",
    ],
  },

  marketing_ai: {
    id: "marketing_ai",
    label: "Marketing AI",
    route: "/marketing",
    assetKey: "marketing-ai",
    purpose:
      "Turn coaching expertise into scroll-stopping social posts, video scripts, and growth content with AI.",
    businessValue:
      "Consistent marketing without hiring an agency — coaches stay visible and attract new clients.",
    nextLogicalStep: "content_ideas",
    keywords: [
      "marketing ai",
      "marketing",
      "ai content",
      "social media",
      "growth",
      "generate content",
      "autopilot",
      "recommendations",
    ],
    primaryUiElements: [
      "Marketing AI hub dashboard",
      "Generate content CTA",
      "AI copy preview panel",
      "Strategy and growth autopilot cards",
    ],
    typicalUserActions: [
      "Click generate content",
      "Review AI-generated copy",
      "Save post to content queue",
      "Launch growth autopilot",
    ],
    demoFocusAreas: [
      "Generate content button",
      "AI copy suggestions panel",
      "Growth strategy summary",
    ],
  },

  content_ideas: {
    id: "content_ideas",
    label: "Content Ideas",
    route: "/marketing/content-ideas",
    assetKey: "content-ideas",
    purpose:
      "Browse AI-generated topic ideas tailored to the coach's niche so content never runs dry.",
    businessValue:
      "Eliminates creator's block — coaches always have relevant topics that attract their ideal clients.",
    nextLogicalStep: "calendar",
    keywords: [
      "content ideas",
      "ideas",
      "topics",
      "brainstorm",
      "content pipeline",
      "post ideas",
      "inspiration",
    ],
    primaryUiElements: [
      "Topic idea cards with hooks",
      "Save to calendar button",
      "Niche filter tags",
      "Viral score indicators",
    ],
    typicalUserActions: [
      "Browse AI topic cards",
      "Click save to calendar queue",
      "Filter by content pillar or platform",
      "Open idea to generate full post",
    ],
    demoFocusAreas: [
      "Topic idea card grid",
      "Save to calendar action",
      "Niche-specific hook previews",
    ],
  },

  calendar: {
    id: "calendar",
    label: "Calendar",
    route: "/marketing/calendar",
    assetKey: "calendar",
    purpose:
      "Plan and schedule an entire month of content across platforms from one visual calendar.",
    businessValue:
      "Publishing consistency drives growth — coaches batch-plan once and execute on autopilot.",
    nextLogicalStep: "published",
    keywords: [
      "calendar",
      "schedule post",
      "content calendar",
      "plan content",
      "scheduling",
      "monthly plan",
      "queue",
    ],
    primaryUiElements: [
      "Monthly/weekly content calendar grid",
      "Drag-and-drop post slots",
      "Platform badges per slot",
      "Publish time picker",
    ],
    typicalUserActions: [
      "Drag post onto calendar date",
      "Set publish time and platform",
      "Review weekly content density",
      "Reschedule from calendar drag",
    ],
    demoFocusAreas: [
      "Calendar grid with scheduled posts",
      "Drag-to-schedule interaction",
      "Multi-platform slot badges",
    ],
  },

  published: {
    id: "published",
    label: "Published",
    route: "/marketing/scheduled",
    assetKey: "published",
    purpose:
      "Review live published posts across channels and confirm content went out as planned.",
    businessValue:
      "Proof of execution — coaches see their brand active on social without switching between apps.",
    nextLogicalStep: "analytics",
    keywords: [
      "published",
      "live posts",
      "posted",
      "go live",
      "published content",
      "social posts",
      "delivered",
    ],
    primaryUiElements: [
      "Published posts grid",
      "Platform badges (Instagram, TikTok, etc.)",
      "Live post preview modal",
      "Publish status indicators",
    ],
    typicalUserActions: [
      "Browse published post grid",
      "Click post to preview live version",
      "Filter by platform or date",
      "Share performance snapshot",
    ],
    demoFocusAreas: [
      "Published posts grid with platform icons",
      "Live social preview modal",
      "Recent publish timestamps",
    ],
  },

  analytics: {
    id: "analytics",
    label: "Analytics",
    route: "/marketing/analytics",
    assetKey: "analytics",
    purpose:
      "Measure content performance, client retention, and business growth with actionable metrics.",
    businessValue:
      "Data-driven decisions replace guesswork — coaches double down on what drives sign-ups and revenue.",
    nextLogicalStep: null,
    keywords: [
      "analytics",
      "metrics",
      "performance",
      "roi",
      "engagement",
      "retention",
      "data",
      "insights",
      "reports",
    ],
    primaryUiElements: [
      "Engagement trend charts",
      "Top-performing post cards",
      "Retention funnel visualization",
      "Revenue and growth KPIs",
    ],
    typicalUserActions: [
      "Hover top-performing post",
      "Compare weekly engagement trends",
      "Identify content pillars that convert",
      "Export or share performance snapshot",
    ],
    demoFocusAreas: [
      "Engagement spike on top post",
      "Upward trend line on growth chart",
      "Retention funnel with conversion rates",
    ],
  },
}

export const PLATFORM_FEATURE_LIST = Object.values(PLATFORM_KNOWLEDGE_BASE)

export function getPlatformFeature(
  id: PlatformFeatureId,
): PlatformFeatureKnowledge {
  return PLATFORM_KNOWLEDGE_BASE[id]
}

export function getPlatformFeatureByLabel(
  label: string,
): PlatformFeatureKnowledge | null {
  const normalized = label.trim().toLowerCase()
  return (
    PLATFORM_FEATURE_LIST.find(
      (feature) => feature.label.toLowerCase() === normalized,
    ) ?? null
  )
}

export function getPlatformFeatureByKeyword(
  text: string,
): PlatformFeatureKnowledge | null {
  const normalized = text.trim().toLowerCase()
  if (!normalized) return null

  let best: PlatformFeatureKnowledge | null = null
  let bestScore = 0

  for (const feature of PLATFORM_FEATURE_LIST) {
    let score = 0
    for (const keyword of feature.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        score += keyword.includes(" ") ? 3 : 1
      }
    }
    if (score > bestScore) {
      bestScore = score
      best = feature
    }
  }

  return bestScore > 0 ? best : null
}

export function buildKnowledgeBaseSummary(): string {
  return PLATFORM_FEATURE_LIST.map(
    (feature) =>
      `${feature.label}: ${feature.purpose} → Value: ${feature.businessValue} → Next: ${feature.nextLogicalStep ? PLATFORM_KNOWLEDGE_BASE[feature.nextLogicalStep].label : "End of workflow"}`,
  ).join("\n")
}

export function buildFeatureKnowledgeBlock(
  featureId: PlatformFeatureId,
): string {
  const feature = PLATFORM_KNOWLEDGE_BASE[featureId]
  const next = feature.nextLogicalStep
    ? PLATFORM_KNOWLEDGE_BASE[feature.nextLogicalStep].label
    : "Analytics review / workflow complete"

  return `Feature: ${feature.label}
Purpose: ${feature.purpose}
Business value: ${feature.businessValue}
Next logical step: ${next}
Key UI elements: ${feature.primaryUiElements.join("; ")}
Typical actions: ${feature.typicalUserActions.join("; ")}
Demo focus areas: ${feature.demoFocusAreas.join("; ")}`
}
