export type CoachDashboardProTestChecklistItem = {
  id: string
  label: string
  hint?: string
}

export type CoachDashboardProTestChecklistSection = {
  id: string
  title: string
  items: CoachDashboardProTestChecklistItem[]
}

export const COACH_DASHBOARD_PRO_TEST_CHECKLIST: CoachDashboardProTestChecklistSection[] =
  [
    {
      id: "coach-overview",
      title: "Coach Overview",
      items: [
        {
          id: "overview-loads",
          label: "Dashboard loads correctly",
          hint: "Hard refresh /dashboard as coach and confirm full layout renders.",
        },
        {
          id: "overview-welcome",
          label: "Welcome section displays",
          hint: "Verify coach name, date, and command center status badge.",
        },
      ],
    },
    {
      id: "coach-kpi-cards",
      title: "Coach KPI Cards (P3.3E)",
      items: [
        {
          id: "kpi-eight-cards",
          label: "All 8 coaching KPI cards render",
          hint: "Active clients, at risk, check-in rate, workout rate, habits, reminders, sessions/week, goals completed.",
        },
        {
          id: "kpi-values",
          label: "KPI values update from database",
          hint: "Add a check-in, session, or goal and confirm counts refresh.",
        },
        {
          id: "kpi-rates",
          label: "Percentage KPIs display correctly",
          hint: "Check-in, workout completion, and habit adherence show % or — when empty.",
        },
      ],
    },
    {
      id: "daily-coach-overview",
      title: "Daily Coach Overview (P3.3B)",
      items: [
        {
          id: "daily-sessions",
          label: "Sessions today count displays",
          hint: "Matches sessions scheduled for today.",
        },
        {
          id: "daily-reminders",
          label: "Reminders due today display",
          hint: "Open reminders with due_date = today show count and preview list.",
        },
        {
          id: "daily-gaps",
          label: "Missing check-ins, habits, workouts, progress display",
          hint: "Four engagement gap cards use client_checkins, client_habits, workouts, progress_logs.",
        },
        {
          id: "daily-quick-actions",
          label: "Quick actions navigate correctly",
          hint: "Add member, create workout/nutrition, schedule session, open workspace.",
        },
      ],
    },
    {
      id: "at-risk-clients",
      title: "At-Risk Client Center (P3.3C)",
      items: [
        {
          id: "atrisk-detection",
          label: "At-risk clients detected from coaching-core rules",
          hint: "6 rules: check-in, habit, workout, progress, goal pace, high-priority reminder.",
        },
        {
          id: "atrisk-reason-badges",
          label: "Risk reason badges display",
          hint: "Each client shows labeled badges per active risk signal.",
        },
        {
          id: "atrisk-habit-grace",
          label: "New clients not flagged for habits immediately",
          hint: "Members with no habit history and < 7 days on roster should not show missing-habit risk.",
        },
        {
          id: "atrisk-open-client",
          label: "Open client action works",
          hint: "Button navigates to /members/[id].",
        },
        {
          id: "atrisk-empty",
          label: "Empty state works",
          hint: "Shows 'No at-risk clients right now.' when roster is clear.",
        },
      ],
    },
    {
      id: "coach-tasks",
      title: "Coach Tasks (P3.3D)",
      items: [
        {
          id: "tasks-reminders",
          label: "Open reminders appear as tasks",
          hint: "client_reminders with status open show in Coach Tasks.",
        },
        {
          id: "tasks-high-first",
          label: "High priority reminders sort first",
          hint: "High-priority open reminders appear before medium/low tasks.",
        },
        {
          id: "tasks-dedupe",
          label: "No duplicate check-in/progress tasks when reminder exists",
          hint: "If open check_in_missing or progress_update_needed reminder exists, skip duplicate task.",
        },
        {
          id: "tasks-mark-done",
          label: "Mark reminder as done works",
          hint: "Completing a reminder task removes it after refetch.",
        },
        {
          id: "tasks-open-client",
          label: "Open client action works",
          hint: "Each task links to the member profile.",
        },
        {
          id: "tasks-workspace",
          label: "Open Coach Workspace works",
          hint: "Header and per-task workspace links navigate to /coach-workspace.",
        },
      ],
    },
    {
      id: "recent-activity",
      title: "Recent Activity (P3.3D)",
      items: [
        {
          id: "activity-types",
          label: "All activity types appear",
          hint: "Check-ins, workouts, nutrition, progress logs, goals, sessions.",
        },
        {
          id: "activity-goal-labels",
          label: "Goal labels distinguish completed vs updated",
          hint: "Completed goals show 'Goal completed'; others show 'Goal updated'.",
        },
        {
          id: "activity-sort",
          label: "Newest activity appears first",
          hint: "Feed sorted by timestamp descending.",
        },
      ],
    },
    {
      id: "data-sources",
      title: "Data Source Verification (P3.3F)",
      items: [
        {
          id: "source-checkins",
          label: "Uses client_checkins only",
          hint: "No check_ins table queries in coach dashboard modules.",
        },
        {
          id: "source-goals",
          label: "Uses client_goals only",
          hint: "No progress_goals table queries in coach dashboard modules.",
        },
        {
          id: "source-reminders-habits",
          label: "Uses client_reminders and client_habits",
          hint: "Daily overview, tasks, at-risk, and KPIs load from coaching-core tables.",
        },
        {
          id: "source-realtime",
          label: "Realtime refresh works",
          hint: "Change check-in, reminder, or session and confirm dashboard updates.",
        },
      ],
    },
    {
      id: "member-health-scores",
      title: "Member Health Scores",
      items: [
        {
          id: "health-calculate",
          label: "Health scores calculate correctly",
          hint: "Compare scores against latest check-in energy, sleep, motivation.",
        },
        {
          id: "health-risk-status",
          label: "Risk status displays correctly",
          hint: "Verify Strong / Stable / Needs Attention / High Risk badges.",
        },
      ],
    },
    {
      id: "session-overview",
      title: "Session Overview",
      items: [
        {
          id: "session-agenda",
          label: "Today's agenda loads",
          hint: "Today's sessions sorted by time.",
        },
        {
          id: "session-upcoming",
          label: "Upcoming sessions load",
          hint: "Next planned sessions appear in overview card.",
        },
      ],
    },
    {
      id: "revenue-growth",
      title: "Revenue & Growth",
      items: [
        {
          id: "revenue-calc",
          label: "Business revenue section still works",
          hint: "Estimated revenue and growth metrics below coaching KPI strip.",
        },
      ],
    },
    {
      id: "ui-validation",
      title: "UI Validation",
      items: [
        {
          id: "ui-loading",
          label: "Loading states work",
          hint: "Skeleton placeholders appear during initial dashboard load.",
        },
        {
          id: "ui-error",
          label: "Error states work",
          hint: "Simulate fetch failure and verify error banner + retry.",
        },
        {
          id: "ui-mobile",
          label: "Mobile responsive",
          hint: "KPI grids and task cards stack cleanly on phone width.",
        },
      ],
    },
    {
      id: "final-validation",
      title: "Final Validation",
      items: [
        {
          id: "final-console",
          label: "No console errors",
          hint: "Open DevTools console while navigating the dashboard.",
        },
        {
          id: "final-typescript",
          label: "No TypeScript errors",
          hint: "Run npx tsc --noEmit before release.",
        },
        {
          id: "final-navigation",
          label: "No broken navigation",
          hint: "Coach Workspace, Progress, Workouts, Nutrition, Sessions still work.",
        },
      ],
    },
  ]

export const COACH_DASHBOARD_PRO_TEST_CHECKLIST_STORAGE_KEY =
  "coach-dashboard-pro-test-checklist-v2"

export function flattenCoachDashboardProTestChecklist(
  sections: CoachDashboardProTestChecklistSection[] = COACH_DASHBOARD_PRO_TEST_CHECKLIST,
): CoachDashboardProTestChecklistItem[] {
  return sections.flatMap((section) => section.items)
}

export function coachDashboardProTestChecklistTotal(
  sections: CoachDashboardProTestChecklistSection[] = COACH_DASHBOARD_PRO_TEST_CHECKLIST,
): number {
  return flattenCoachDashboardProTestChecklist(sections).length
}
