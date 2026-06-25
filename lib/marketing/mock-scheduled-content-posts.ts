import type { MarketingPost } from "@/lib/marketing/get-mock-marketing-data"
import type { ContentPostStatus } from "@/lib/marketing/content-post-status"

function daysFromNow(days: number, hour = 10): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

function daysAgo(days: number, hour = 14): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

function feedback(items: string[]): string {
  return JSON.stringify(items)
}

function demoPost(
  partial: Partial<MarketingPost> & Pick<MarketingPost, "id" | "title">,
): MarketingPost {
  const now = new Date().toISOString()

  return {
    id: partial.id,
    title: partial.title,
    caption: partial.caption ?? "",
    hashtags: partial.hashtags ?? "",
    image_url: partial.image_url ?? null,
    viral_score: partial.viral_score ?? null,
    viral_reason: partial.viral_reason ?? "",
    viral_feedback: partial.viral_feedback ?? "[]",
    viral_status: partial.viral_status ?? "",
    optimized_title: partial.optimized_title ?? null,
    optimized_content: partial.optimized_content ?? null,
    optimized_caption: partial.optimized_caption ?? null,
    optimized_hashtags: partial.optimized_hashtags ?? null,
    optimized_score: partial.optimized_score ?? null,
    original_score: partial.original_score ?? null,
    optimization_reason: partial.optimization_reason ?? null,
    optimization_status: partial.optimization_status ?? null,
    status: partial.status ?? "draft",
    scheduled_at: partial.scheduled_at ?? null,
    published_at: partial.published_at ?? null,
    created_at: partial.created_at ?? now,
    updated_at: partial.updated_at ?? now,
    created_by: partial.created_by ?? "demo-coach",
    user_id: partial.user_id ?? "demo-coach",
    platform: partial.platform ?? "Instagram",
    category: partial.category ?? "",
    goal: partial.goal ?? "",
    brand_id: partial.brand_id ?? null,
    content_plan_id: partial.content_plan_id ?? null,
    content_type: partial.content_type ?? "post",
    plan_day: partial.plan_day ?? null,
    plan_id: partial.plan_id ?? null,
    topic: partial.topic ?? "",
    retry_count: partial.retry_count ?? 0,
    external_post_id: partial.external_post_id ?? null,
    publish_error: partial.publish_error ?? null,
    marketing_video_id: partial.marketing_video_id ?? null,
    video_project_id: partial.video_project_id ?? null,
    video_url: partial.video_url ?? null,
  }
}

const DEMO_SCHEDULED_POSTS: MarketingPost[] = [
  demoPost({
    id: "demo-pt-draft-1",
    title: "Why Your Clients Plateau After 6 Weeks",
    caption:
      "Most personal training clients hit a wall around week six — not because the program failed, but because habits slip. Here are the three coaching conversations that restart progress.",
    hashtags: "#personaltrainer #fitcoach #clientresults #gymowner",
    platform: "Instagram",
    category: "Educational",
    content_type: "carousel",
    status: "draft",
    viral_status: "",
    viral_score: 82,
    viral_reason:
      "Coach-to-coach insight with a specific timeframe hook — strong save potential.",
    viral_feedback: feedback([
      "Specific week marker creates curiosity",
      "Speaks directly to gym owners and PTs",
      "Add a client case study in the caption",
    ]),
  }),
  demoPost({
    id: "demo-pt-draft-2",
    title: "POV: First Day at Your Gym",
    caption:
      "New member walks in nervous. Your front desk greets them by name, the coach demos one exercise, and they leave with a win. That's how you beat big-box churn.",
    hashtags: "#gymowner #memberexperience #fitnessbusiness #localgym",
    platform: "TikTok",
    category: "Member Story",
    content_type: "video",
    video_project_id: "demo-video-pt-1",
    status: "draft",
    viral_status: "optimize",
    viral_score: 71,
    viral_reason:
      "POV format performs on TikTok but needs a sharper on-screen hook in the first second.",
    viral_feedback: feedback([
      "Relatable new-member moment",
      "Strengthen the opening text overlay",
      "End with a clear gym tour CTA",
    ]),
  }),
  demoPost({
    id: "demo-pt-approved-1",
    title: "Small Group Training: Worth It for Your Gym?",
    caption:
      "SGT fills the gap between 1-on-1 and classes — higher margin, better retention, and coaches can run 6 clients at once. Here's the pricing model we use.",
    hashtags: "#gymbusiness #smallgrouptraining #fitnessentrepreneur",
    platform: "Instagram",
    category: "Educational",
    content_type: "reel",
    status: "draft",
    viral_status: "approved",
    viral_score: 89,
    viral_reason:
      "Business-focused angle for gym owners with actionable pricing talk — high comment potential.",
    viral_feedback: feedback([
      "Clear value for gym owners",
      "Strong authority positioning",
      "Ready to schedule",
    ]),
  }),
  demoPost({
    id: "demo-pt-approved-2",
    title: "Client Win: Down 12 lbs, Still Eating Carbs",
    caption:
      "Mark didn't cut carbs — we fixed protein, steps, and sleep. Twelve weeks later he's down 12 lbs and pressing heavier than ever. Real coaches sell sustainable results.",
    hashtags: "#transformationtuesday #personaltraining #sustainablefatloss",
    platform: "Instagram",
    category: "Transformation",
    content_type: "reel",
    status: "draft",
    viral_status: "approve",
    viral_score: 94,
    viral_reason:
      "Transformation plus contrarian nutrition angle — proven engagement driver for fitness brands.",
    viral_feedback: feedback([
      "Strong social proof",
      "Emotional before/after potential",
      "Approved for scheduling",
    ]),
  }),
  demoPost({
    id: "demo-pt-scheduled-1",
    title: "21-Day Reset Challenge Starts Monday",
    caption:
      "Open to members and locals: daily workouts, habit tracker, and coach check-ins. Spots are capped at 30 so everyone gets attention. Link in bio to claim your spot.",
    hashtags: "#gymchallenge #fitnesschallenge #localgym #januaryreset",
    platform: "Instagram",
    category: "Promotion",
    content_type: "carousel",
    image_url:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50e?w=800&h=1000&fit=crop",
    status: "scheduled",
    viral_status: "approved",
    scheduled_at: daysFromNow(2, 7),
    viral_score: 86,
    viral_reason:
      "Urgency plus capped spots — strong lead-gen format for gym launches.",
  }),
  demoPost({
    id: "demo-pt-scheduled-2",
    title: "Form Check: Romanian Deadlift",
    caption:
      "Three cues we teach every new member: hinge don't squat, bar stays close, feel the hamstrings load. Save this before leg day.",
    hashtags: "#deadlift #formcheck #strengthtraining #gymtips",
    platform: "TikTok",
    category: "Workout",
    content_type: "video",
    video_project_id: "demo-video-pt-2",
    status: "scheduled",
    viral_status: "approved",
    scheduled_at: daysFromNow(4, 18),
    viral_score: 88,
    viral_reason:
      "Tutorial content with high save rate — ideal for TikTok discovery.",
  }),
  demoPost({
    id: "demo-pt-scheduled-3",
    title: "Saturday Open Gym + Free Body Scan",
    caption:
      "Bring a friend this Saturday. Free InBody scan, 20-minute coach consult, and a trial class. Perfect for prospects on the fence.",
    hashtags: "#freegymday #bodycomposition #fitnessstudio",
    platform: "Facebook",
    category: "Promotion",
    content_type: "post",
    status: "scheduled",
    viral_status: "approved",
    scheduled_at: daysFromNow(6, 11),
    viral_score: 77,
    viral_reason:
      "Local event promo with clear incentive — strong for Facebook community groups.",
  }),
  demoPost({
    id: "demo-pt-published-1",
    title: "What Our 5 AM Crew Actually Eats",
    caption:
      "No fad diets — eggs, oats, Greek yogurt, and meal-prepped lunches. We asked five early birds what fuels their morning sessions.",
    hashtags: "#mealprep #earlymorningworkout #nutritioncoach",
    platform: "Instagram",
    category: "Nutrition",
    content_type: "carousel",
    image_url:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=1000&fit=crop",
    status: "published",
    viral_status: "approved",
    scheduled_at: daysAgo(2, 6),
    published_at: daysAgo(2, 6),
    viral_score: 85,
    viral_reason:
      "Behind-the-scenes nutrition content builds trust with serious members.",
    external_post_id: "demo-ig-pt-001",
  }),
  demoPost({
    id: "demo-pt-published-2",
    title: "Stop Programming Cardio Before Weights",
    caption:
      "If your members are lifting for strength, tired cardio first kills performance. Here's the warm-up structure our coaches use instead.",
    hashtags: "#strengthcoach #programming #gymeducation",
    platform: "Instagram",
    category: "Educational",
    content_type: "reel",
    status: "published",
    viral_status: "approved",
    scheduled_at: daysAgo(5, 12),
    published_at: daysAgo(5, 12),
    viral_score: 91,
    viral_reason:
      "Contrarian coaching take — drives shares among trainers and educated lifters.",
    external_post_id: "demo-ig-pt-002",
  }),
  demoPost({
    id: "demo-pt-published-3",
    title: "Member Spotlight: Lisa's First Pull-Up",
    caption:
      "Eight months ago Lisa couldn't hang from the bar. Today she hit her first strict pull-up. Progress isn't linear — but consistent coaching gets people there.",
    hashtags: "#memberwin #pullup #womenwholift #gymmotivation",
    platform: "TikTok",
    category: "Member Story",
    content_type: "video",
    video_project_id: "demo-video-pt-3",
    status: "published",
    viral_status: "approved",
    scheduled_at: daysAgo(9, 17),
    published_at: daysAgo(9, 17),
    viral_score: 92,
    viral_reason:
      "Milestone celebration content — high emotional resonance for gym brands.",
    external_post_id: "demo-tt-pt-001",
  }),
  demoPost({
    id: "demo-pt-failed-1",
    title: "New Year Membership Offer — 50% Off First Month",
    caption:
      "Kick off January with personal training included. Limited to the first 20 sign-ups — DM us or tap the link in bio.",
    hashtags: "#newyear #gymdeal #personaltraining",
    platform: "Instagram",
    category: "Promotion",
    content_type: "reel",
    image_url:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=1000&fit=crop",
    status: "failed",
    viral_status: "approved",
    scheduled_at: daysAgo(1, 9),
    viral_score: 78,
    viral_reason: "Seasonal promo with clear offer — strong conversion potential.",
    publish_error:
      "media_url must be a public HTTPS URL (https://…). Upload media to public storage and use the HTTPS URL.",
    retry_count: 1,
  }),
]

export function buildMockScheduledPosts(): MarketingPost[] {
  return DEMO_SCHEDULED_POSTS.map((post) => ({
    ...post,
    updated_at: new Date().toISOString(),
  }))
}

export function filterScheduledPosts(
  posts: MarketingPost[],
  statusFilter: ContentPostStatus | "all",
): MarketingPost[] {
  if (statusFilter === "all") return posts
  return posts.filter((post) => post.status === statusFilter)
}

/** Always returns demo posts — never empty for any status tab. */
export function getDemoScheduledPosts(
  statusFilter: ContentPostStatus | "all" = "all",
): MarketingPost[] {
  return filterScheduledPosts(buildMockScheduledPosts(), statusFilter)
}

export function resolveScheduledPostsForDisplay(
  posts: MarketingPost[],
  statusFilter: ContentPostStatus | "all",
  useDemoContent: boolean,
): MarketingPost[] {
  const filtered = filterScheduledPosts(posts, statusFilter)
  if (!useDemoContent || filtered.length > 0) return filtered
  return getDemoScheduledPosts(statusFilter)
}

export const mockScheduledContentPosts = buildMockScheduledPosts()
