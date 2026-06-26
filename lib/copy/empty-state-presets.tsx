import Link from "next/link"
import type { ReactNode } from "react"
import {
  Activity,
  AlertCircle,
  Apple,
  BarChart3,
  Brain,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  HeartPulse,
  Lightbulb,
  LineChart,
  Megaphone,
  MessageSquare,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Video,
} from "lucide-react"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"

export type SaasEmptyPreset = keyof typeof SAAS_EMPTY

type EmptyStateActionConfig = {
  label: string
  href?: string
  hash?: string
}

export const EMPTY_STATE_ICONS: Partial<Record<SaasEmptyPreset, ReactNode>> = {
  members: <Users className="h-7 w-7" />,
  membersActive: <Users className="h-7 w-7" />,
  membersNeedsAttention: <CheckCircle2 className="h-7 w-7" />,
  memberProgress: <TrendingUp className="h-7 w-7" />,
  workouts: <Dumbbell className="h-7 w-7" />,
  workoutExercises: <Dumbbell className="h-7 w-7" />,
  workoutAssignMember: <ClipboardList className="h-7 w-7" />,
  workoutMembersRequired: <Users className="h-7 w-7" />,
  workoutTemplates: <ClipboardList className="h-7 w-7" />,
  workoutExercisesSelected: <Dumbbell className="h-7 w-7" />,
  workoutCompletions: <Activity className="h-7 w-7" />,
  sessions: <CalendarClock className="h-7 w-7" />,
  sessionsToday: <Calendar className="h-7 w-7" />,
  sessionsUpcoming: <CalendarClock className="h-7 w-7" />,
  nutrition: <Apple className="h-7 w-7" />,
  nutritionAssigned: <Apple className="h-7 w-7" />,
  progress: <LineChart className="h-7 w-7" />,
  progressMetric: <LineChart className="h-7 w-7" />,
  goals: <Target className="h-7 w-7" />,
  alerts: <AlertCircle className="h-7 w-7" />,
  campaigns: <Megaphone className="h-7 w-7" />,
  contentIdeas: <Lightbulb className="h-7 w-7" />,
  calendarPosts: <Calendar className="h-7 w-7" />,
  analytics: <BarChart3 className="h-7 w-7" />,
  analyticsChart: <BarChart3 className="h-7 w-7" />,
  coachPerformance: <Activity className="h-7 w-7" />,
  coachPerformanceInsights: <Brain className="h-7 w-7" />,
  marketingPosts: <Megaphone className="h-7 w-7" />,
  marketingCampaigns: <Megaphone className="h-7 w-7" />,
  marketingLearning: <Brain className="h-7 w-7" />,
  marketingAnalytics: <BarChart3 className="h-7 w-7" />,
  marketingRecommendations: <Sparkles className="h-7 w-7" />,
  coachInsights: <Brain className="h-7 w-7" />,
  recentActivity: <Activity className="h-7 w-7" />,
  checkIns: <HeartPulse className="h-7 w-7" />,
  memberHealth: <HeartPulse className="h-7 w-7" />,
  atRisk: <CheckCircle2 className="h-7 w-7" />,
  coachTasks: <CheckCircle2 className="h-7 w-7" />,
  exercises: <Dumbbell className="h-7 w-7" />,
  exerciseSearch: <Search className="h-7 w-7" />,
  exercisePreview: <Dumbbell className="h-7 w-7" />,
  todayWorkout: <Dumbbell className="h-7 w-7" />,
  aiCoach: <MessageSquare className="h-7 w-7" />,
  aiCoachThread: <MessageSquare className="h-7 w-7" />,
  memberProfile: <UserRound className="h-7 w-7" />,
  memberWorkouts: <Dumbbell className="h-7 w-7" />,
  scheduledPosts: <Calendar className="h-7 w-7" />,
  marketingPipeline: <Calendar className="h-7 w-7" />,
  revenueData: <BarChart3 className="h-7 w-7" />,
  memberHistory: <Users className="h-7 w-7" />,
  progressAllClear: <CheckCircle2 className="h-7 w-7" />,
  memberSearch: <Search className="h-7 w-7" />,
  weeklyReport: <LineChart className="h-7 w-7" />,
  strengthPr: <Dumbbell className="h-7 w-7" />,
  videoGenerator: <Video className="h-7 w-7" />,
  coachNotes: <MessageSquare className="h-7 w-7" />,
}

export const EMPTY_STATE_ACTIONS: Partial<Record<SaasEmptyPreset, EmptyStateActionConfig>> = {
  members: { label: "Add your first client", href: "/members#add-member" },
  membersActive: { label: "Add your first client", href: "/members#add-member" },
  workouts: { label: "Create workout plan", href: "/workouts/new" },
  workoutMembersRequired: { label: "Add your first client", href: "/members#add-member" },
  workoutAssignMember: { label: "Assign a workout", href: "/workouts" },
  nutrition: { label: "Create nutrition plan", href: "/nutrition#nutrition-form" },
  sessions: { label: "Schedule session", href: "/sessions?new=1" },
  contentIdeas: { label: "Generate content ideas", href: "/marketing/content-ideas" },
  marketingCampaigns: { label: "Generate campaign", href: "/marketing/campaign-generator" },
  calendarPosts: { label: "Open content ideas", href: "/marketing/content-ideas" },
  marketingPipeline: { label: "Generate content ideas", href: "/marketing/content-ideas" },
  videoGenerator: { label: "Start generating", href: "/marketing/video-generator" },
  exercises: { label: "Browse exercise library", href: "/dashboard/exercises" },
  memberProgress: { label: "Log progress", href: "/progress" },
  progress: { label: "Log progress entry", href: "/progress" },
  goals: { label: "Create a goal", href: "/progress" },
  checkIns: { label: "Log check-in", href: "/my-check-ins" },
  aiCoach: { label: "Start conversation", href: "/ai-coach" },
  memberWorkouts: { label: "Assign workout", href: "/workouts" },
  coachNotes: { label: "Add coach note", href: "/members" },
}

function actionClassName(variant: "dark" | "light") {
  return variant === "dark"
    ? "btn-gradient"
    : "btn-primary-solid"
}

export function renderEmptyStateAction(
  preset: SaasEmptyPreset,
  variant: "dark" | "light" = "dark",
) {
  const config = EMPTY_STATE_ACTIONS[preset]
  if (!config) return null

  const className = actionClassName(variant)

  if (config.href) {
    return (
      <Link href={config.href} className={className}>
        {config.label}
      </Link>
    )
  }

  if (config.hash) {
    return (
      <a href={config.hash} className={className}>
        {config.label}
      </a>
    )
  }

  return null
}
