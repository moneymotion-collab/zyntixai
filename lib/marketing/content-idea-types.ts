import { clampViralScore, hasRequiredViralScore } from "@/lib/marketing/viral-score"

export type ContentIdeaItem = {
  title: string
  caption: string
  hashtags: string
  viral_score: number | null
  viral_reason: string
}

function normalizeIdeaItem(item: unknown): ContentIdeaItem | null {
  if (typeof item === "string") {
    const title = item.trim()
    return title
      ? { title, caption: "", hashtags: "", viral_score: null, viral_reason: "" }
      : null
  }

  if (typeof item !== "object" || item === null || !("title" in item)) {
    return null
  }

  const record = item as Record<string, unknown>
  const title = typeof record.title === "string" ? record.title.trim() : ""

  if (!title) return null

  const idea: ContentIdeaItem = {
    title,
    caption:
      typeof record.caption === "string" ? record.caption.trim() : "",
    hashtags:
      typeof record.hashtags === "string" ? record.hashtags.trim() : "",
    viral_score: clampViralScore(record.viral_score ?? record.viralScore),
    viral_reason:
      typeof record.viral_reason === "string"
        ? record.viral_reason.trim()
        : typeof record.viralScoreReason === "string"
          ? record.viralScoreReason.trim()
          : typeof record.viral_score_reason === "string"
            ? record.viral_score_reason.trim()
            : "",
  }

  applyViralScoreFromText(idea)
  return idea
}

function applyViralScoreFromText(idea: ContentIdeaItem): void {
  if (hasRequiredViralScore(idea)) return

  const sources = [idea.caption, idea.title, idea.hashtags].filter(Boolean)
  for (const source of sources) {
    const parsed = parseViralScoreBlock(source)
    if (!parsed) continue

    if (idea.viral_score == null) {
      idea.viral_score = parsed.score
    }
    if (!idea.viral_reason.trim()) {
      idea.viral_reason = parsed.reason
    }
    if (hasRequiredViralScore(idea)) return
  }
}

function parseViralScoreBlock(
  text: string,
): { score: number; reason: string } | null {
  const scoreMatch = text.match(
    /🔥\s*VIRAL SCORE:\s*(\d{1,3})/i,
  )
  const reasonMatch = text.match(
    /📈\s*VIRAL REASON:\s*\n?\s*([\s\S]+?)(?:\n\n|\n🔥|$)/i,
  )

  const score = scoreMatch ? clampViralScore(scoreMatch[1]) : null
  const reason = reasonMatch?.[1]?.trim() ?? ""

  if (score == null || !reason) return null
  return { score, reason }
}

export function parseContentIdeasResponse(raw: string): ContentIdeaItem[] {
  const trimmed = raw.trim()
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/)

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as { ideas?: unknown }

      if (Array.isArray(parsed.ideas)) {
        const ideas = parsed.ideas
          .map(normalizeIdeaItem)
          .filter((item): item is ContentIdeaItem => item !== null)
          .filter(hasRequiredViralScore)

        if (ideas.length > 0) return ideas
      }
    } catch {
      // Fall through to text parsing.
    }
  }

  const blocks = trimmed.split(/\n\s*\n/)
  const ideas: ContentIdeaItem[] = []

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    if (lines.length === 0) continue

    const titleLine = lines.find(
      (line) => !/^Idea\s+\d+/i.test(line) && !/^caption:/i.test(line) && !/^hashtags:/i.test(line),
    )

    if (titleLine) {
      const idea: ContentIdeaItem = {
        title: titleLine.replace(/^[-*]\s*/, ""),
        caption: block,
        hashtags: "",
        viral_score: null,
        viral_reason: "",
      }
      applyViralScoreFromText(idea)
      if (hasRequiredViralScore(idea)) {
        ideas.push(idea)
      }
    }
  }

  return ideas
}

export function parseImprovedContentResponse(raw: string): ContentIdeaItem | null {
  const trimmed = raw.trim()
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/)

  if (!jsonMatch) return null

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      ideas?: unknown
      title?: unknown
    }

    if (Array.isArray(parsed.ideas) && parsed.ideas.length > 0) {
      const idea = normalizeIdeaItem(parsed.ideas[0])
      return idea && hasRequiredViralScore(idea) ? idea : null
    }

    if ("title" in parsed) {
      const idea = normalizeIdeaItem(parsed)
      return idea && hasRequiredViralScore(idea) ? idea : null
    }
  } catch {
    // Fall through.
  }

  const ideas = parseContentIdeasResponse(raw)
  return ideas[0] ?? null
}

type ContentIdeaSeed = Pick<ContentIdeaItem, "title" | "caption" | "hashtags">

const MOCK_VIRAL_SCORES: Array<
  Pick<ContentIdeaItem, "viral_score" | "viral_reason">
> = [
  {
    viral_score: 84,
    viral_reason:
      "Universal weight-loss pain point with a list format that drives saves.",
  },
  {
    viral_score: 76,
    viral_reason:
      "Beginner mistakes perform well but need a stronger visual hook to stand out.",
  },
  {
    viral_score: 68,
    viral_reason:
      "Educational nutrition posts are useful but rarely spark shares without a bold claim.",
  },
  {
    viral_score: 91,
    viral_reason:
      "Quick tip format with immediate practical value — ideal for reels and shares.",
  },
  {
    viral_score: 72,
    viral_reason:
      "Motivation content is reliable but crowded; consistency angle helps differentiation.",
  },
  {
    viral_score: 88,
    viral_reason:
      "Short demo routines are highly saveable and algorithm-friendly on TikTok.",
  },
  {
    viral_score: 93,
    viral_reason:
      "Transformation stories trigger emotional engagement and social proof.",
  },
  {
    viral_score: 79,
    viral_reason:
      "Polls drive comments but need a timely hook to reach beyond existing followers.",
  },
  {
    viral_score: 65,
    viral_reason:
      "Gym bag content is relatable yet generic without a unique personal angle.",
  },
  {
    viral_score: 74,
    viral_reason:
      "Carousel explainers get saves from beginners but need strong cover art.",
  },
]

function withMockViralScores(seeds: ContentIdeaSeed[]): ContentIdeaItem[] {
  return seeds.map((seed, index) => {
    const score = MOCK_VIRAL_SCORES[index % MOCK_VIRAL_SCORES.length]

    return {
      ...seed,
      viral_score: score.viral_score,
      viral_reason: score.viral_reason,
    }
  })
}

const MOCK_CONTENT_IDEA_SEEDS: ContentIdeaSeed[] = [
  {
    title: "5 Reasons You're Not Losing Weight",
    caption: "Many people focus on workouts but ignore nutrition.",
    hashtags: "#fitness #weightloss #gym",
  },
  {
    title: "Beginner Workout Mistakes",
    caption: "Avoid these common mistakes when starting in the gym.",
    hashtags: "#fitnessjourney #training",
  },
  {
    title: "Why Protein Matters",
    caption: "Protein supports muscle recovery and growth.",
    hashtags: "#protein #musclebuilding",
  },
  {
    title: "5 Mistakes Beginners Make",
    caption: "Small form fixes can prevent injuries and boost results.",
    hashtags: "#gymtips #beginnerfitness #formcheck",
  },
  {
    title: "How To Stay Consistent",
    caption: "Consistency beats motivation — build habits that last.",
    hashtags: "#fitnessmotivation #habits #gymlife",
  },
  {
    title: "30-Second Warm-Up Routine",
    caption: "Try this quick warm-up before your next leg day.",
    hashtags: "#warmup #legday #mobility",
  },
  {
    title: "Member Transformation Spotlight",
    caption: "Real progress from a member who showed up every week.",
    hashtags: "#transformation #memberwin #fitness",
  },
  {
    title: "Leg Day Or Arm Day?",
    caption: "Vote in stories — we'll share a free tip for the winner.",
    hashtags: "#poll #gymcommunity #training",
  },
  {
    title: "What's In My Gym Bag",
    caption: "Essentials every new member should bring to the gym.",
    hashtags: "#gymbag #fitnessessentials #gymtok",
  },
  {
    title: "Push Pull Legs Explained",
    caption: "Save this carousel if you're building your own program.",
    hashtags: "#ppl #workoutsplit #hypertrophy",
  },
  {
    title: "Ask Me Anything: Nutrition",
    caption: "Drop your questions — we'll answer the best ones on stories.",
    hashtags: "#nutritiontips #ama #fitcoach",
  },
  {
    title: "New Member Welcome Offer",
    caption: "First week includes a coaching check-in. Link in bio.",
    hashtags: "#newmembers #localgym #fitnessoffer",
  },
  {
    title: "Refer A Friend Challenge",
    caption: "Bring a friend and both train free for a week.",
    hashtags: "#referafriend #gymcommunity #fitfam",
  },
  {
    title: "Day In The Life Of A Coach",
    caption: "Behind the scenes of coaching sessions at our gym.",
    hashtags: "#personaltrainer #behindthescenes #coaching",
  },
  {
    title: "Signs You're Ready To Lift Heavier",
    caption: "Progress safely with these four green lights.",
    hashtags: "#strengthtraining #progressiveoverload #lifting",
  },
  {
    title: "Morning Vs Evening Workouts",
    caption: "Which time works best for your schedule and energy?",
    hashtags: "#morningworkout #eveningworkout #fitness",
  },
  {
    title: "Free Trial Week Announcement",
    caption: "New to the gym? Try us free for 7 days — limited spots.",
    hashtags: "#freetrial #localgym #getstarted",
  },
  {
    title: "Post-Workout Protein Snacks",
    caption: "Three easy options you can prep in under 10 minutes.",
    hashtags: "#proteinsnacks #recovery #nutrition",
  },
  {
    title: "How To Read Your Program",
    caption: "Sets, reps, and RPE explained in plain language.",
    hashtags: "#programming #workoutplan #coaching",
  },
  {
    title: "Celebrate A Consistency Milestone",
    caption: "Shout out to members who hit 12 sessions this month.",
    hashtags: "#consistency #memberlove #gymcommunity",
  },
  {
    title: "Personal Training Intro Special",
    caption: "Book a free intro session with one of our coaches.",
    hashtags: "#personaltraining #pt #fitnesscoach",
  },
  {
    title: "Deadlift Form: Right Vs Wrong",
    caption: "Protect your back with these quick setup cues.",
    hashtags: "#deadlift #formcheck #strength",
  },
  {
    title: "Weekly Class Schedule Highlight",
    caption: "Meet the coaches and find the class that fits you.",
    hashtags: "#groupfitness #classschedule #gymclasses",
  },
  {
    title: "Guess The Exercise Quiz",
    caption: "Can you name this movement from a cropped clip?",
    hashtags: "#fitnessquiz #engagement #gymfun",
  },
  {
    title: "Bring A Friend Guest Pass",
    caption: "Train together this week — guest passes on us.",
    hashtags: "#bringafriend #gymbuddy #community",
  },
  {
    title: "Mobility Routine For Desk Workers",
    caption: "Undo sitting stiffness in 60 seconds.",
    hashtags: "#mobility #deskjob #stretching",
  },
  {
    title: "What To Expect On Day One",
    caption: "Nervous about joining? Here's your first-visit walkthrough.",
    hashtags: "#newtogym #gymtips #firstday",
  },
  {
    title: "Vote On The Next Challenge",
    caption: "Help us pick the theme for our 6-week challenge.",
    hashtags: "#fitnesschallenge #communityvote #gym",
  },
  {
    title: "Summer Shred Early Bird Signup",
    caption: "Early bird pricing ends Friday — save your spot now.",
    hashtags: "#summerchallenge #earlybird #fatloss",
  },
  {
    title: "6 AM Class Energy Timelapse",
    caption: "This is what commitment looks like before sunrise.",
    hashtags: "#6amclub #morningmotivation #grouptraining",
  },
]

export const MOCK_CONTENT_IDEAS = withMockViralScores(MOCK_CONTENT_IDEA_SEEDS)
