import type { CoachInsight } from "@/lib/coach-dashboard/compute-coach-insights"
import { DEMO_MEMBER_EMAIL_DOMAIN } from "@/lib/demo/demo-members"

export const DEMO_COACH_INSIGHT_MIN = 5
export const DEMO_COACH_INSIGHT_MAX = 10

type DemoCoachInsightOptions = {
  missedWorkoutCount?: number
  busiestDaysLabel?: string
  weightLossWeeklyKg?: number
}

export function memberListHasDemoRoster(
  members: Array<{ email?: string | null; is_demo?: boolean | null }>,
): boolean {
  return members.some(
    (member) =>
      member.is_demo === true ||
      (member.email?.includes(DEMO_MEMBER_EMAIL_DOMAIN) ?? false) ||
      (member.email?.includes("@demo.local") ?? false),
  )
}

export function buildDemoCoachInsights(
  options: DemoCoachInsightOptions = {},
): CoachInsight[] {
  const missedWorkouts = options.missedWorkoutCount ?? 4
  const busiestDays = options.busiestDaysLabel ?? "Tuesday and Thursday"
  const weightLossKg = options.weightLossWeeklyKg ?? 0.7

  return ([
    {
      id: "demo-missed-workouts",
      message: `${missedWorkouts} members have missed workouts this week.`,
      variant: "warning",
    },
    {
      id: "demo-nutrition-adherence",
      message: "Members with nutrition plans show 32% higher adherence.",
      variant: "success",
    },
    {
      id: "demo-weight-loss-avg",
      message: `Weight loss clients are averaging ${weightLossKg}kg loss per week.`,
      variant: "success",
    },
    {
      id: "demo-busiest-days",
      message: `${busiestDays} are your busiest coaching days.`,
      variant: "info",
    },
    {
      id: "demo-checkin-consistency",
      message: "Check-in consistency improved 18% over the last month.",
      variant: "success",
    },
    {
      id: "demo-session-completion",
      message:
        "Session completion rate is 84% this month — above your 3-month average.",
      variant: "info",
    },
    {
      id: "demo-morning-sessions",
      message:
        "Morning sessions (before 10 AM) have the highest completion rate.",
      variant: "info",
    },
    {
      id: "demo-proactive-checkins",
      message:
        "Members with weekly coach check-ins show 2× better workout adherence.",
      variant: "success",
    },
    {
      id: "demo-at-risk-early",
      message:
        "Early intervention on low-motivation check-ins reduces churn risk by 41%.",
      variant: "warning",
    },
    {
      id: "demo-hybrid-coaching",
      message:
        "Hybrid clients (in-person + online) complete 26% more workouts than online-only.",
      variant: "info",
    },
  ] satisfies CoachInsight[]).slice(0, DEMO_COACH_INSIGHT_MAX)
}
