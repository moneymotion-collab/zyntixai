import { DEMO_MEMBER_COUNT } from "@/lib/demo/demo-copy"

export const DEMO_COACH_PROFILE_NAME = "ZyntixAI Performance Coaching"

export type DemoCoachProfileStat = {
  label: string
  value: number
  detail: string
}

export const DEMO_COACH_PROFILE_STATS: DemoCoachProfileStat[] = [
  {
    label: "Members",
    value: DEMO_MEMBER_COUNT,
    detail: "Active demo roster",
  },
  {
    label: "Workout Plans",
    value: 10,
    detail: "Structured training programs",
  },
  {
    label: "Nutrition Plans",
    value: 5,
    detail: "Macro-based meal plans",
  },
  {
    label: "Sessions",
    value: 20,
    detail: "Scheduled coaching sessions",
  },
  {
    label: "Marketing Posts",
    value: 35,
    detail: "Published & scheduled content",
  },
  {
    label: "Video Campaigns",
    value: 10,
    detail: "AI-generated video projects",
  },
]
