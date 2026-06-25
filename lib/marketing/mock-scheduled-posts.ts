export type MockScheduledPost = {
  id: string
  title: string
  platform: string
  scheduled_date: string
}

export const mockScheduledPosts: MockScheduledPost[] = [
  {
    id: "1",
    title: "5 Reasons You're Not Losing Weight",
    platform: "Instagram",
    scheduled_date: "2026-06-01 18:00",
  },
  {
    id: "2",
    title: "Protein Myths Explained",
    platform: "Facebook",
    scheduled_date: "2026-06-03 12:00",
  },
  {
    id: "3",
    title: "Best Exercises For Beginners",
    platform: "TikTok",
    scheduled_date: "2026-06-04 19:00",
  },
]
