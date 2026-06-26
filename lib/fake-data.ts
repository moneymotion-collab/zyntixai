// Mock data for the ZyntixAI gym CRM.
// Replace these exports with live data from Supabase (see lib/supabase/*).

export const dashboardStats = [
  {
    id: 1,
    title: "Total Members",
    value: 148,
    change: "+12%",
    positive: true,
  },
  {
    id: 2,
    title: "Sessions This Week",
    value: 32,
    change: "+8%",
    positive: true,
  },
  {
    id: 3,
    title: "AI Coach Messages",
    value: 1240,
    change: "+21%",
    positive: true,
  },
  {
    id: 4,
    title: "Revenue",
    value: "EUR 8,420",
    change: "+18%",
    positive: true,
  },
]

export type MemberStatus = "Active" | "Pending" | "Paused"

export type Member = {
  id: number
  name: string
  email: string
  goal: string
  plan: string
  status: MemberStatus
  joinedAt: string
}

export const members: Member[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    goal: "Weight Loss",
    plan: "Pro",
    status: "Active",
    joinedAt: "2025-11-12",
  },
  {
    id: 2,
    name: "Sarah Miller",
    email: "sarah@example.com",
    goal: "Muscle Gain",
    plan: "Elite",
    status: "Active",
    joinedAt: "2025-10-03",
  },
  {
    id: 3,
    name: "David Brown",
    email: "david@example.com",
    goal: "Conditioning",
    plan: "Basic",
    status: "Pending",
    joinedAt: "2026-01-22",
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma@example.com",
    goal: "Strength",
    plan: "Pro",
    status: "Active",
    joinedAt: "2025-08-17",
  },
  {
    id: 5,
    name: "Mike Johnson",
    email: "mike@example.com",
    goal: "Hypertrophy",
    plan: "Elite",
    status: "Active",
    joinedAt: "2025-09-09",
  },
  {
    id: 6,
    name: "Lara Khan",
    email: "lara@example.com",
    goal: "Mobility",
    plan: "Basic",
    status: "Paused",
    joinedAt: "2026-02-04",
  },
]

export type SessionStatus = "Confirmed" | "Pending" | "Completed"

export type TrainingSession = {
  id: number
  member: string
  type: string
  date: string
  time: string
  duration: string
  coach: string
  status: SessionStatus
}

export const sessions: TrainingSession[] = [
  {
    id: 1,
    member: "Mike Johnson",
    type: "Personal Training",
    date: "Today",
    time: "14:00",
    duration: "60 min",
    coach: "Alex P.",
    status: "Confirmed",
  },
  {
    id: 2,
    member: "Sarah Miller",
    type: "Check-In Call",
    date: "Today",
    time: "16:30",
    duration: "20 min",
    coach: "Jamie L.",
    status: "Pending",
  },
  {
    id: 3,
    member: "David Brown",
    type: "Nutrition Coaching",
    date: "Tomorrow",
    time: "11:00",
    duration: "45 min",
    coach: "Mara V.",
    status: "Confirmed",
  },
  {
    id: 4,
    member: "Emma Wilson",
    type: "Transformation Review",
    date: "Friday",
    time: "13:00",
    duration: "30 min",
    coach: "Alex P.",
    status: "Confirmed",
  },
  {
    id: 5,
    member: "John Doe",
    type: "Mobility Session",
    date: "Friday",
    time: "18:00",
    duration: "45 min",
    coach: "Mara V.",
    status: "Completed",
  },
]

export type WorkoutLevel = "Beginner" | "Intermediate" | "Advanced"

export type WorkoutPlan = {
  id: number
  name: string
  level: WorkoutLevel
  focus: string
  durationWeeks: number
  daysPerWeek: number
  assignedMembers: number
}

export const workoutPlans: WorkoutPlan[] = [
  {
    id: 1,
    name: "Hypertrophy Foundations",
    level: "Beginner",
    focus: "Muscle Gain",
    durationWeeks: 8,
    daysPerWeek: 4,
    assignedMembers: 26,
  },
  {
    id: 2,
    name: "Cut & Conditioning",
    level: "Intermediate",
    focus: "Fat Loss",
    durationWeeks: 6,
    daysPerWeek: 5,
    assignedMembers: 41,
  },
  {
    id: 3,
    name: "Powerlifting Peaking",
    level: "Advanced",
    focus: "Strength",
    durationWeeks: 12,
    daysPerWeek: 4,
    assignedMembers: 12,
  },
  {
    id: 4,
    name: "Mobility Reset",
    level: "Beginner",
    focus: "Mobility",
    durationWeeks: 4,
    daysPerWeek: 3,
    assignedMembers: 18,
  },
]

export type NutritionPlan = {
  id: number
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  type: string
  assignedMembers: number
}

export const nutritionPlans: NutritionPlan[] = [
  {
    id: 1,
    name: "High-Protein Cut",
    calories: 2100,
    protein: 200,
    carbs: 180,
    fat: 60,
    type: "Fat Loss",
    assignedMembers: 34,
  },
  {
    id: 2,
    name: "Lean Bulk",
    calories: 3000,
    protein: 220,
    carbs: 340,
    fat: 80,
    type: "Muscle Gain",
    assignedMembers: 22,
  },
  {
    id: 3,
    name: "Performance Fuel",
    calories: 2600,
    protein: 180,
    carbs: 320,
    fat: 70,
    type: "Endurance",
    assignedMembers: 17,
  },
  {
    id: 4,
    name: "Maintenance Plate",
    calories: 2400,
    protein: 160,
    carbs: 260,
    fat: 75,
    type: "Recomp",
    assignedMembers: 29,
  },
]

export type ProgressLog = {
  id: number
  member: string
  metric: string
  start: string
  current: string
  delta: string
  positive: boolean
  updatedAt: string
}

export const progressLogs: ProgressLog[] = [
  {
    id: 1,
    member: "John Doe",
    metric: "Body Weight",
    start: "92.4 kg",
    current: "87.1 kg",
    delta: "-5.3 kg",
    positive: true,
    updatedAt: "2 days ago",
  },
  {
    id: 2,
    member: "Sarah Miller",
    metric: "Bench Press 1RM",
    start: "55 kg",
    current: "62.5 kg",
    delta: "+7.5 kg",
    positive: true,
    updatedAt: "Yesterday",
  },
  {
    id: 3,
    member: "Emma Wilson",
    metric: "Back Squat 1RM",
    start: "80 kg",
    current: "95 kg",
    delta: "+15 kg",
    positive: true,
    updatedAt: "Today",
  },
  {
    id: 4,
    member: "David Brown",
    metric: "Resting HR",
    start: "72 bpm",
    current: "64 bpm",
    delta: "-8 bpm",
    positive: true,
    updatedAt: "3 days ago",
  },
  {
    id: 5,
    member: "Mike Johnson",
    metric: "Body Fat %",
    start: "18.5%",
    current: "15.8%",
    delta: "-2.7%",
    positive: true,
    updatedAt: "Today",
  },
]

export const analyticsData = [
  { month: "Jan", revenue: 2400, members: 40, engagement: 58 },
  { month: "Feb", revenue: 3200, members: 52, engagement: 66 },
  { month: "Mar", revenue: 4100, members: 63, engagement: 71 },
  { month: "Apr", revenue: 5800, members: 81, engagement: 78 },
  { month: "May", revenue: 8420, members: 148, engagement: 91 },
]

export const recentActivities = [
  {
    id: 1,
    activity: "New member joined",
    user: "Emma Wilson",
    time: "5 min ago",
  },
  {
    id: 2,
    activity: "AI coach message sent",
    user: "Mike Johnson",
    time: "18 min ago",
  },
  {
    id: 3,
    activity: "Session completed",
    user: "Sarah Miller",
    time: "1 hour ago",
  },
  {
    id: 4,
    activity: "Workout plan updated",
    user: "Coach Alex",
    time: "2 hours ago",
  },
]

export const notifications = [
  {
    id: 1,
    title: "New Lead Added",
    description: "A new lead has entered the funnel.",
  },
  {
    id: 2,
    title: "Session Reminder",
    description: "You have 3 sessions today.",
  },
  {
    id: 3,
    title: "AI Suggestion Ready",
    description: "Your AI content ideas are generated.",
  },
]