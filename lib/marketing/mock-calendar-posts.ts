import type { CalendarPost } from "@/lib/marketing/calendar-types"

const PLATFORMS = ["Instagram", "Instagram", "Instagram", "TikTok", "Facebook"] as const

const HOOKS: Record<string, string[]> = {
  Reel: [
    "3 mistakes killing your squat",
    "What 30 days of consistency looks like",
    "Coach reacts to bad deadlift form",
    "Morning routine for busy parents",
    "Stop doing cardio like this",
    "The protein number nobody talks about",
    "Gym anxiety? Start here",
    "One exercise for stronger glutes",
  ],
  Transformation: [
    "12-week member transformation",
    "From desk job to deadlift PR",
    "She lost 8kg without cutting carbs",
  ],
  Educational: [
    "Why rest days build muscle",
    "Protein timing myth busted",
    "How progressive overload works",
    "Sleep and recovery explained",
  ],
  Nutrition: [
    "High-protein breakfast in 5 min",
    "Meal prep for busy coaches",
    "Pre-workout vs post-workout fuel",
    "Hydration targets for lifters",
  ],
  Workout: [
    "Full-body starter circuit",
    "Push day for beginners",
    "Core finisher in 8 minutes",
    "Mobility routine before lifting",
  ],
  Carousel: [
    "5 meal prep mistakes",
    "Beginner gym etiquette guide",
    "Macro cheat sheet for fat loss",
    "Home vs gym workout split",
    "Signs you need a deload week",
    "How to pick the right program",
    "Recovery checklist for lifters",
    "Gym bag essentials",
  ],
  Story: [
    "Behind the scenes: 6am class",
    "Member shoutout Saturday",
    "New coach intro",
    "This week's challenge",
    "Quick tip: hydration",
    "Poll: legs or arms day?",
    "Flash promo ends tonight",
    "Weekend hours update",
  ],
  Testimonial: [
    "Why Sarah joined ZyntixAI",
    "Best decision I ever made",
  ],
}

const STATUSES = ["draft", "approved", "scheduled", "published"] as const

function atHour(date: Date, hour: number): string {
  const next = new Date(date)
  next.setHours(hour, 0, 0, 0)
  return next.toISOString()
}

function buildPost(
  id: string,
  postType: string,
  hook: string,
  day: Date,
  hour: number,
  statusIndex: number,
): CalendarPost {
  const platform = PLATFORMS[Number(id) % PLATFORMS.length]

  return {
    id,
    platform,
    hook,
    content: `${hook}. Tailored for ${platform} with AI-optimized timing and CTA.`,
    status: STATUSES[statusIndex % STATUSES.length],
    post_type: postType,
    scheduled_date: atHour(day, hour),
  }
}

export function buildMockCalendarPosts(reference = new Date()): CalendarPost[] {
  const year = reference.getFullYear()
  const month = reference.getMonth()
  const posts: CalendarPost[] = []
  let id = 1

  const formats: Array<{ type: string; hooks: string[] }> = [
    { type: "Reel", hooks: HOOKS.Reel },
    { type: "Transformation", hooks: HOOKS.Transformation },
    { type: "Carousel", hooks: HOOKS.Carousel },
    { type: "Story", hooks: HOOKS.Story },
    { type: "Testimonial", hooks: HOOKS.Testimonial },
    { type: "Educational", hooks: HOOKS.Educational },
    { type: "Nutrition", hooks: HOOKS.Nutrition },
    { type: "Workout", hooks: HOOKS.Workout },
  ]

  const daySlots = Array.from({ length: 30 }, (_, index) => index + 1)

  for (const format of formats) {
    for (const hook of format.hooks) {
      const dayNumber = daySlots[(id - 1) % daySlots.length]
      const day = new Date(year, month, dayNumber)
      const hour = 9 + ((id * 2) % 10)

      posts.push(
        buildPost(String(id), format.type, hook, day, hour, id - 1),
      )
      id += 1
    }
  }

  return posts
}

export const mockCalendarPosts = buildMockCalendarPosts()
