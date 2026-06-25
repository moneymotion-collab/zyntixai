export type SaasEmptyCopy = {
  eyebrow?: string
  title: string
  description: string
}

export const SAAS_EMPTY = {
  members: {
    eyebrow: "Members",
    title: "No members yet",
    description: "Add your first client to start coaching.",
  },
  membersNeedsAttention: {
    eyebrow: "All caught up",
    title: "Every member has a plan",
    description:
      "Members missing a workout or nutrition plan will appear here for quick follow-up.",
  },
  membersActive: {
    eyebrow: "Members",
    title: "No members yet",
    description: "Add your first client to start coaching.",
  },
  memberProgress: {
    eyebrow: "Track results",
    title: "Log your first progress entry",
    description:
      "Record weight, measurements, or custom metrics to unlock trends and coaching insights.",
  },
  memberProgressPhotos: {
    eyebrow: "Transformation",
    title: "No progress photos yet",
    description:
      "Upload front, side, or full-body photos to build a visual timeline and compare before and after.",
  },
  memberCoachNotes: {
    eyebrow: "Coaching log",
    title: "No coach notes yet",
    description:
      "Capture session summaries, injury updates, mindset notes, and admin reminders for this member.",
  },
  memberCoachNotesFiltered: {
    eyebrow: "No matches",
    title: "No notes in this category",
    description: "Try another filter or add a new note for this topic.",
  },
  memberReminders: {
    eyebrow: "Stay proactive",
    title: "No reminders yet",
    description:
      "Automatic alerts appear when check-ins, habits, progress, or workouts slip — or add manual follow-ups anytime.",
  },
  memberTimeline: {
    eyebrow: "Activity feed",
    title: "No activity yet",
    description:
      "Workouts, check-ins, goals, photos, and other coaching events will appear here as they happen.",
  },
  memberTimelineFiltered: {
    eyebrow: "No matches",
    title: "No activity in this category",
    description: "Try another filter to explore this member's timeline.",
  },
  memberHabits: {
    eyebrow: "Daily habits",
    title: "No habit logs yet",
    description:
      "Log nutrition, sleep, movement, or mindset habits to track consistency over time.",
  },
  workouts: {
    eyebrow: "Workout library",
    title: "Create your first workout plan",
    description: "Start assigning programs to guide your clients through training.",
  },
  workoutExercises: {
    eyebrow: "Build the session",
    title: "Add your first exercise",
    description:
      "Search the exercise library and build a complete plan your members can follow.",
  },
  workoutAssignMember: {
    eyebrow: "Assign training",
    title: "Assign a workout plan",
    description:
      "Pick a plan below and connect it to this member to start tracking completions.",
  },
  workoutMembersRequired: {
    eyebrow: "Members first",
    title: "Create your first member",
    description:
      "Add members on the Members page before assigning workout plans.",
  },
  sessions: {
    eyebrow: "Fill your calendar",
    title: "Schedule your first session",
    description:
      "Book 1-on-1s, check-ins, and coaching calls to keep clients accountable.",
  },
  nutrition: {
    eyebrow: "Nutrition plans",
    title: "Build your first nutrition plan",
    description: "Guide your clients with macros and personalized meal guidance.",
  },
  nutritionAssigned: {
    eyebrow: "Waiting on coach",
    title: "No nutrition plan yet",
    description:
      "Your coach can assign a personalized nutrition plan from the Nutrition page.",
  },
  progress: {
    eyebrow: "Measure momentum",
    title: "Log your first progress entry",
    description:
      "Track weight, body metrics, or custom KPIs to unlock charts and AI coaching insights.",
  },
  progressMetric: {
    eyebrow: "Try another view",
    title: "No entries for this metric",
    description:
      "Switch metrics or log a new entry to visualize progress over time.",
  },
  goals: {
    eyebrow: "Set direction",
    title: "Create your first goal",
    description:
      "Define milestones with target dates so you and your members stay aligned.",
  },
  alerts: {
    eyebrow: "All clear",
    title: "No alerts right now",
    description:
      "Missed workouts, stalled progress, and nutrition gaps will surface here when attention is needed.",
  },
  campaigns: {
    eyebrow: "Grow your brand",
    title: "Generate your first campaign",
    description:
      "Launch AI-assisted content that attracts leads and showcases your coaching.",
  },
  contentIdeas: {
    eyebrow: "Marketing AI",
    title: "Generate your first content idea",
    description: "Start growing your audience with AI-powered posts and campaigns.",
  },
  calendarPosts: {
    eyebrow: "Plan ahead",
    title: "Schedule your first post",
    description:
      "Add content to the calendar to build a consistent publishing rhythm.",
  },
  analytics: {
    eyebrow: "Insights loading",
    title: "Publish to unlock analytics",
    description:
      "Once you post and track performance, growth trends and top content will appear here.",
  },
  analyticsChart: {
    eyebrow: "Trend insights",
    title: "Not enough check-in data",
    description:
      "Add at least 2 client check-ins to unlock trend insights.",
  },
  coachPerformance: {
    eyebrow: "Performance metrics",
    title: "Not enough roster data",
    description:
      "Add members, assign workouts, and log check-ins to unlock coach performance KPIs.",
  },
  coachPerformanceInsights: {
    eyebrow: "Rule-based insights",
    title: "Not enough data for insights",
    description:
      "Performance insights appear once enough KPI data is available across your roster.",
  },
  performanceKpiEmpty: {
    eyebrow: "KPI",
    title: "Not enough data",
    description: "Log more client activity to calculate this KPI.",
  },
  progressTrends: {
    eyebrow: "Trend insights",
    title: "Not enough check-in data",
    description:
      "Add at least 2 client check-ins to unlock trend insights.",
  },
  marketingPosts: {
    eyebrow: "Start publishing",
    title: "Create your first post",
    description:
      "Generate, schedule, or publish content to build your coaching brand online.",
  },
  marketingCampaigns: {
    eyebrow: "Campaign studio",
    title: "Generate your first campaign",
    description:
      "Build a multi-post campaign with AI — save it and refine before publishing.",
  },
  marketingLearning: {
    eyebrow: "Learning engine",
    title: "Publish to unlock learning insights",
    description:
      "Track post performance across platforms to discover what resonates with your audience.",
  },
  marketingAnalytics: {
    eyebrow: "Performance data",
    title: "Add your first performance metrics",
    description:
      "Publish content or sync analytics to see what's working across platforms.",
  },
  coachInsights: {
    eyebrow: "AI insights",
    title: "Insights unlock as you grow",
    description:
      "Add members, log check-ins, and complete sessions to generate coaching intelligence.",
  },
  recentActivity: {
    eyebrow: "Activity feed",
    title: "No activity yet",
    description:
      "Workout completions, check-ins, and session bookings will appear here as your roster gets active.",
  },
  checkIns: {
    eyebrow: "Wellness tracking",
    title: "No check-ins yet",
    description:
      "Log client wellness scores to unlock health scores, alerts, and trend insights.",
  },
  memberHealth: {
    eyebrow: "Health scores",
    title: "Not enough check-in data",
    description:
      "Add at least 2 client check-ins to unlock member health scores and risk badges.",
  },
  atRisk: {
    eyebrow: "Strong roster",
    title: "No at-risk members",
    description:
      "All active clients look stable based on recent activity.",
  },
  coachTasks: {
    eyebrow: "All caught up",
    title: "No urgent tasks",
    description:
      "You are up to date. New AI tasks will appear when clients need attention.",
  },
  exercises: {
    eyebrow: "Exercise library",
    title: "Add your first exercise",
    description:
      "Browse the library or create custom movements for your workout plans.",
  },
  todayWorkout: {
    eyebrow: "Today's training",
    title: "No workout assigned today",
    description:
      "Your coach will assign a session — check back soon or browse My Workouts.",
  },
  aiCoach: {
    eyebrow: "AI Coach",
    title: "Start your first conversation",
    description:
      "Ask about programming, nutrition, member retention, or marketing strategy.",
  },
  aiCoachThread: {
    eyebrow: "New thread",
    title: "Send your first message",
    description:
      "Ask a question to get personalized coaching guidance instantly.",
  },
  memberProfile: {
    eyebrow: "Account setup",
    title: "Link your member profile",
    description:
      "Ask your coach to add you with the same email you use to sign in.",
  },
  memberWorkouts: {
    eyebrow: "Training queue",
    title: "No workouts assigned yet",
    description:
      "When your coach assigns a plan, it will appear here automatically.",
  },
  workoutCompletions: {
    eyebrow: "Completion history",
    title: "No completions logged yet",
    description:
      "Completed workouts will appear here once members finish their sessions.",
  },
  scheduledPosts: {
    eyebrow: "Publishing queue",
    title: "Schedule your first post",
    description:
      "Plan content ahead of time to keep a consistent posting rhythm.",
  },
  marketingRecommendations: {
    eyebrow: "AI recommendations",
    title: "Generate your first recommendation",
    description:
      "Run the generator to get tailored content and growth suggestions.",
  },
  revenueData: {
    eyebrow: "Revenue trend",
    title: "No revenue data yet",
    description:
      "Add active clients or connect billing to estimate monthly revenue.",
  },
  revenueOverview: {
    eyebrow: "Business metrics",
    title: "No revenue data yet",
    description:
      "Add active clients or connect billing to estimate monthly revenue.",
  },
  memberHistory: {
    eyebrow: "Roster growth",
    title: "No member growth yet",
    description:
      "Add your first client to start tracking roster growth over time.",
  },
  sessionsToday: {
    eyebrow: "Today's agenda",
    title: "No sessions today",
    description:
      "Book a coaching call or check-in to fill today's agenda and keep clients accountable.",
  },
  memberWeightGoal: {
    eyebrow: "Weight tracking",
    title: "Set a weight goal for this client",
    description:
      "Add current weight and target weight in the profile to unlock progress tracking and trend charts.",
  },
  nutritionAssignments: {
    eyebrow: "Member assignment",
    title: "No nutrition plans assigned yet",
    description:
      "Select a member and plan above to deliver macro targets and personalized meal guidance.",
  },
  progressRoster: {
    eyebrow: "Your roster",
    title: "Add clients to track progress",
    description:
      "Progress logs, trends, adherence, and coaching insights appear once members are on your roster.",
  },
  progressAdherence: {
    eyebrow: "Adherence",
    title: "Build your adherence baseline",
    description:
      "Assign workouts or nutrition plans, log habits, and record check-ins to populate adherence metrics.",
  },
  progressAtRiskRoster: {
    eyebrow: "Coach signals",
    title: "Add clients to surface insights",
    description:
      "At-risk detection and coaching signals activate once members are on your roster.",
  },
  progressCheckInTrend: {
    eyebrow: "Trend insights",
    title: "Log more check-ins for trends",
    description:
      "Record at least two check-ins with this metric to reveal the trend line.",
  },
  workoutMemberPlans: {
    eyebrow: "Training",
    title: "No workout assigned yet",
    description:
      "Pick a plan from your library below to start tracking this member's training.",
  },
  workoutPlanMovements: {
    eyebrow: "Build the plan",
    title: "No exercises in this plan yet",
    description:
      "Open the plan editor to add movements from your exercise library.",
  },
  memberPhotoCaption: {
    eyebrow: "Photo notes",
    title: "No caption yet",
    description: "Add notes when uploading to compare transformation photos over time.",
  },
  marketingStory: {
    eyebrow: "Story studio",
    title: "Generate your first story arc",
    description:
      "Fill in your brief to create a 7-scene narrative for video scripts or social content.",
  },
  marketingCta: {
    eyebrow: "CTA generator",
    title: "Generate your first call-to-action",
    description:
      "Enter campaign details to create CTA variations for video outros, ads, and landing pages.",
  },
  workspaceSelectMember: {
    eyebrow: "Quick profile",
    title: "Select a member",
    description:
      "Search your roster and choose a client to view their profile, plans, and quick actions.",
  },
  workspaceTasksFiltered: {
    eyebrow: "Task queue",
    title: "No tasks in this view",
    description: "Switch filters or complete open follow-ups to keep your daily workflow clear.",
  },
  sessionsUpcoming: {
    eyebrow: "Looking ahead",
    title: "No upcoming sessions",
    description:
      "Book your next coaching call or check-in to keep clients on track.",
  },
  progressAllClear: {
    eyebrow: "Looking good",
    title: "No members need attention",
    description:
      "Your roster looks healthy. Keep monitoring check-ins and progress alerts.",
  },
  memberSearch: {
    eyebrow: "Search",
    title: "No matching members",
    description: "Try another name or create a new member to get started.",
  },
  workoutTemplates: {
    eyebrow: "Templates",
    title: "Save your first workout template",
    description:
      "Build a plan and save it as a template to reuse with future clients.",
  },
  workoutExercisesSelected: {
    eyebrow: "Build the session",
    title: "Add your first exercise",
    description:
      "Open the picker to search the library and add exercises to your plan.",
  },
  weeklyReport: {
    eyebrow: "Weekly report",
    title: "Log progress to unlock reports",
    description:
      "Check-ins and progress logs will generate weekly summaries for your roster.",
  },
  strengthPr: {
    eyebrow: "Personal records",
    title: "Log your first strength entry",
    description:
      "Record bench, squat, or custom lifts to track personal records over time.",
  },
  marketingPipeline: {
    eyebrow: "Content pipeline",
    title: "Create your first post",
    description:
      "Generate content from Content Ideas to start your publishing workflow.",
  },
  videoGenerator: {
    eyebrow: "Video studio",
    title: "Create your first AI video campaign",
    description:
      "Describe your goal and let AI build script, scenes, and visuals for you.",
  },
  exerciseSearch: {
    eyebrow: "Exercise library",
    title: "No exercises match your search",
    description: "Try another keyword or adjust filters to find movements.",
  },
  exercisePreview: {
    eyebrow: "Preview",
    title: "Select an exercise",
    description:
      "Pick from the library to preview sets, instructions, and coaching notes.",
  },
  coachNotes: {
    eyebrow: "Coach notes",
    title: "No coach notes yet",
    description:
      "Session notes and observations will appear in member progress reports.",
  },
} as const satisfies Record<string, SaasEmptyCopy>
