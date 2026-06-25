import type { InstagramDemoPreviewData } from "@/lib/marketing/instagram-demo-preview-types"

export const INSTAGRAM_SHOWCASE_USERNAME = "fitcore_coach_demo"
export const INSTAGRAM_SHOWCASE_DISPLAY_NAME = "FitCore Coach Demo"
export const INSTAGRAM_SHOWCASE_BIO =
  "Elite online coaching for trainers & transformation clients 💪\nFat loss • Strength • Nutrition • Real results\n⬇️ Free coaching assessment — link in bio"

export const INSTAGRAM_SHOWCASE_PROFILE_STATS = {
  postsCount: 247,
  followersCount: "12.4K",
  followingCount: "612",
} as const

const SHOWCASE_POSTS = [
  {
    id: "showcase-1",
    title: "12 weeks. Same mirror. Different person.",
    caption:
      "Client spotlight: down 18 lbs, +40 lbs on deadlift, and finally consistent with nutrition. No shortcuts — just a plan that fits real life. Swipe for the weekly breakdown 👉",
    hashtags:
      "#transformationtuesday #onlinecoach #fatlossjourney #personaltrainer #beforeandafter",
    category: "Transformation",
    content_type: "Carousel",
    status: "published" as const,
    viral_score: 94,
    viral_reason:
      "Before/after carousel with specific metrics drives saves and shares from aspiring clients.",
    reach: "42.8K",
    engagement: "11.2%",
    saves: "2.4K",
  },
  {
    id: "showcase-2",
    title: "3-minute glute burner (no equipment)",
    caption:
      "Film this between sessions — hip thrust pulses, frog pumps, and a finisher your members will actually do. Save for your next leg day reel 🔥",
    hashtags:
      "#gluteworkout #workoutreel #fitnesstips #homeworkout #legday",
    category: "Workout",
    content_type: "Reel",
    status: "published" as const,
    viral_score: 91,
    viral_reason:
      "Short-form workout with clear cues performs strongly in Reels discovery.",
    reach: "38.6K",
    engagement: "9.8%",
    saves: "1.9K",
  },
  {
    id: "showcase-3",
    title: "Meal prep Sunday in 45 min — save this",
    caption:
      "Batch chicken, roasted veggies, and overnight oats — three containers, one hour, zero excuses. Your clients will thank you for this one.",
    hashtags:
      "#mealprep #nutritiontips #healthyeating #coachlife #macrofriendly",
    category: "Nutrition",
    content_type: "Carousel",
    status: "published" as const,
    viral_score: 87,
    viral_reason:
      "Actionable nutrition carousel with high save intent from busy professionals.",
    reach: "24.1K",
    engagement: "8.4%",
    saves: "1.6K",
  },
  {
    id: "showcase-4",
    title: "Sarah hit her first pull-up at 42 🎉",
    caption:
      "Six months of progressive strength work, zero skipped check-ins. This is why we coach — not just programs, but belief. Drop a 🔥 for Sarah!",
    hashtags:
      "#clientwin #strengthtraining #womensfitness #coachingwins #fitover40",
    category: "Client Win",
    content_type: "Reel",
    status: "published" as const,
    viral_score: 89,
    viral_reason:
      "Authentic client milestone with emotional hook boosts comments and shares.",
    reach: "31.5K",
    engagement: "10.6%",
    saves: "892",
  },
  {
    id: "showcase-5",
    title: "You don't need motivation. You need a system.",
    caption:
      "Stop waiting to feel ready. Build the habit stack: train, track, check in, repeat. Consistency beats intensity every single time.",
    hashtags:
      "#mindset #fitnessmotivation #discipline #coachtips #consistency",
    category: "Motivation",
    content_type: "Carousel",
    status: "published" as const,
    viral_score: 92,
    viral_reason:
      "Contrarian hook with actionable framing — strong share potential in coach feeds.",
    reach: "29.7K",
    engagement: "12.1%",
    saves: "1.3K",
  },
  {
    id: "showcase-6",
    title: "Down 22 lbs — here's the weekly routine",
    caption:
      "3 lifts, 2 cardio sessions, 8k steps, and one nutrition check-in. No fad diets. Swipe for the exact split we used for 12 weeks.",
    hashtags:
      "#weightloss #trainingplan #onlinecoaching #transformation #fitnesscoach",
    category: "Transformation",
    content_type: "Reel",
    status: "published" as const,
    viral_score: 88,
    viral_reason:
      "Specific routine breakdown increases watch time and profile visits.",
    reach: "35.2K",
    engagement: "9.1%",
    saves: "1.7K",
  },
  {
    id: "showcase-7",
    title: "Push day finisher for hypertrophy clients",
    caption:
      "Mechanical drop set: incline press → flat DB → push-ups. 45 sec rest max. Tag a training partner who needs this burn 💥",
    hashtags:
      "#pushday #hypertrophy #chestworkout #gymreels #personaltrainer",
    category: "Workout",
    content_type: "Reel",
    status: "scheduled" as const,
    viral_score: 85,
    viral_reason:
      "Technique-focused finisher appeals to intermediate lifters and trainers.",
    reach: "18.4K",
    engagement: "7.6%",
    saves: "1.1K",
  },
  {
    id: "showcase-8",
    title: "High-protein breakfast under 400 cal",
    caption:
      "Greek yogurt bowl, egg whites, and berries — 38g protein, ready in 8 minutes. Screenshot this for your next client nutrition call.",
    hashtags:
      "#protein #breakfastideas #nutritioncoach #healthylifestyle #macros",
    category: "Nutrition",
    content_type: "Carousel",
    status: "scheduled" as const,
    viral_score: 83,
    viral_reason:
      "Quick macro-friendly recipe format consistently earns saves.",
    reach: "15.9K",
    engagement: "8.9%",
    saves: "1.4K",
  },
  {
    id: "showcase-9",
    title: "Member spotlight: Marcus's 90-day journey",
    caption:
      "From skipping the gym to 4x/week training and meal prep on Sundays. Accountability + structure = results. Ready for your turn?",
    hashtags:
      "#clienttestimonial #gymmotivation #fitnessjourney #memberwin #accountability",
    category: "Client Win",
    content_type: "Carousel",
    status: "published" as const,
    viral_score: 86,
    viral_reason:
      "Relatable member story with clear timeline drives DM inquiries.",
    reach: "22.3K",
    engagement: "9.4%",
    saves: "756",
  },
] as const

export function buildInstagramShowcaseData(
  bioOverride?: string | null,
): InstagramDemoPreviewData {
  return {
    profile: {
      displayName: INSTAGRAM_SHOWCASE_DISPLAY_NAME,
      username: INSTAGRAM_SHOWCASE_USERNAME,
      bio: bioOverride?.trim() || INSTAGRAM_SHOWCASE_BIO,
      postsCount: INSTAGRAM_SHOWCASE_PROFILE_STATS.postsCount,
      followersCount: INSTAGRAM_SHOWCASE_PROFILE_STATS.followersCount,
      followingCount: INSTAGRAM_SHOWCASE_PROFILE_STATS.followingCount,
      isDemoFallback: false,
    },
    posts: SHOWCASE_POSTS.map((post) => ({
      ...post,
      platform: "Instagram",
      image_url: null,
      video_url: null,
      performance: {
        reach: post.reach,
        engagement: post.engagement,
        saves: post.saves,
      },
    })),
  }
}
