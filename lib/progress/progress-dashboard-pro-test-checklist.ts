export type ProgressDashboardProTestChecklistItem = {
  id: string
  label: string
  hint?: string
}

export const PROGRESS_DASHBOARD_PRO_TEST_CHECKLIST: ProgressDashboardProTestChecklistItem[] =
  [
    {
      id: "checkin-form-saves",
      label: "Check-in form saves correctly",
      hint: "Submit a check-in and confirm success message + list update.",
    },
    {
      id: "latest-checkins-display",
      label: "Latest check-ins display correctly",
      hint: "Verify metrics, dates, and member names in the history list.",
    },
    {
      id: "kpi-cards-calculate",
      label: "KPI cards calculate correctly",
      hint: "Compare averages and attention count against raw check-in data.",
    },
    {
      id: "charts-update",
      label: "Charts update with check-in data",
      hint: "Add check-ins and confirm trend lines reflect new dates/values.",
    },
    {
      id: "member-filter",
      label: "Member filter works",
      hint: "Switch members and confirm all sections filter consistently.",
    },
    {
      id: "client-summary-per-member",
      label: "Client summary updates per member",
      hint: "Select a member and verify status + latest metrics.",
    },
    {
      id: "coach-notes-persist",
      label: "Coach notes save after refresh",
      hint: "Save a note, reload the page, and confirm it persists.",
    },
    {
      id: "action-plans-persist",
      label: "Action plans save after refresh",
      hint: "Save an action plan, reload, and confirm it persists.",
    },
    {
      id: "weekly-report-seven-days",
      label: "Weekly report calculates last 7 days",
      hint: "Select a member with recent check-ins and verify 7-day metrics.",
    },
    {
      id: "goals-tracking",
      label: "Goals tracking works",
      hint: "Create a goal and confirm progress syncs from check-ins.",
    },
    {
      id: "alerts-center",
      label: "Alerts center detects risks",
      hint: "Trigger low scores or missing check-ins and verify alerts appear.",
    },
    {
      id: "ai-coach-insights",
      label: "AI Progress Coach shows insights",
      hint: "With enough data, confirm coaching summary blocks populate.",
    },
    {
      id: "pdf-export",
      label: "PDF export works",
      hint: "Export report and open the downloaded ZyntixAI PDF.",
    },
    {
      id: "loading-states",
      label: "Loading states show correctly",
      hint: "Hard refresh and confirm skeleton cards/charts appear.",
    },
    {
      id: "empty-states",
      label: "Empty states show correctly",
      hint: "Use a member with no data and verify empty placeholders.",
    },
    {
      id: "error-states",
      label: "Error states show correctly",
      hint: "Simulate failures (offline/API) and verify error banners + retry.",
    },
    {
      id: "mobile-layout",
      label: "Mobile layout looks good",
      hint: "Resize to mobile width and verify spacing, grids, and buttons.",
    },
  ]

export const PROGRESS_DASHBOARD_PRO_TEST_CHECKLIST_STORAGE_KEY =
  "progress-dashboard-pro-test-checklist-v1"
