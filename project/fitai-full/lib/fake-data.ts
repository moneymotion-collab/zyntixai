export const dashboardStats = [
  {
    id: 1,
    title: "Total Clients",
    value: 148,
    change: "+12%",
    positive: true,
  },
  {
    id: 2,
    title: "Appointments",
    value: 32,
    change: "+8%",
    positive: true,
  },
  {
    id: 3,
    title: "AI Messages",
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

export type Client = {
  id: number
  name: string
  email: string
  goal: string
  plan: string
  status: string
}

export const clients: Client[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    goal: "Weight Loss",
    plan: "Pro",
    status: "Active",
  },
  {
    id: 2,
    name: "Sarah Miller",
    email: "sarah@example.com",
    goal: "Muscle Gain",
    plan: "Elite",
    status: "Active",
  },
  {
    id: 3,
    name: "David Brown",
    email: "david@example.com",
    goal: "Conditioning",
    plan: "Basic",
    status: "Pending",
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma@example.com",
    goal: "Strength",
    plan: "Pro",
    status: "Active",
  },
]

export const appointments = [
  {
    id: 1,
    client: "Mike Johnson",
    type: "Personal Training",
    date: "Today",
    time: "14:00",
    status: "Confirmed",
  },
  {
    id: 2,
    client: "Sarah Miller",
    type: "Check-In Call",
    date: "Today",
    time: "16:30",
    status: "Pending",
  },
  {
    id: 3,
    client: "David Brown",
    type: "Nutrition Coaching",
    date: "Tomorrow",
    time: "11:00",
    status: "Confirmed",
  },
  {
    id: 4,
    client: "Emma Wilson",
    type: "Transformation Review",
    date: "Friday",
    time: "13:00",
    status: "Confirmed",
  },
]

export const aiMessages = [
  {
    id: 1,
    client: "Mike Johnson",
    message: "Hey Mike, don't forget your workout session today.",
    type: "Reminder",
    status: "Sent",
    time: "09:42",
  },
  {
    id: 2,
    client: "Sarah Miller",
    message: "Amazing progress this week! Keep pushing.",
    type: "Motivation",
    status: "Delivered",
    time: "11:15",
  },
  {
    id: 3,
    client: "David Brown",
    message: "Your nutrition plan has been updated.",
    type: "Update",
    status: "Read",
    time: "12:01",
  },
]

export const analyticsData = [
  {
    month: "Jan",
    revenue: 2400,
    clients: 40,
    engagement: 58,
  },
  {
    month: "Feb",
    revenue: 3200,
    clients: 52,
    engagement: 66,
  },
  {
    month: "Mar",
    revenue: 4100,
    clients: 63,
    engagement: 71,
  },
  {
    month: "Apr",
    revenue: 5800,
    clients: 81,
    engagement: 78,
  },
  {
    month: "May",
    revenue: 8420,
    clients: 148,
    engagement: 91,
  },
]

export const recentActivities = [
  {
    id: 1,
    activity: "New client registered",
    user: "Emma Wilson",
    time: "5 min ago",
  },
  {
    id: 2,
    activity: "AI message sent",
    user: "Mike Johnson",
    time: "18 min ago",
  },
  {
    id: 3,
    activity: "Appointment completed",
    user: "Sarah Miller",
    time: "1 hour ago",
  },
  {
    id: 4,
    activity: "Revenue updated",
    user: "System",
    time: "2 hours ago",
  },
]

export const socialPosts = [
  {
    id: 1,
    title: "5 Fat Loss Mistakes",
    platform: "Instagram",
    status: "Scheduled",
    date: "Today",
    time: "18:00",
  },
  {
    id: 2,
    title: "Morning Motivation Reel",
    platform: "TikTok",
    status: "Published",
    date: "Today",
    time: "09:00",
  },
  {
    id: 3,
    title: "Client Transformation",
    platform: "Instagram",
    status: "Draft",
    date: "Tomorrow",
    time: "15:00",
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
    title: "Appointment Reminder",
    description: "You have 3 appointments today.",
  },
  {
    id: 3,
    title: "AI Suggestion Ready",
    description: "Your AI content ideas are generated.",
  },
]
