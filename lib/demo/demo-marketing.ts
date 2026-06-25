import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { insertWithSchemaFallback } from "@/lib/demo/insert-with-schema-fallback"
import { loadOrCreateBrandProfile } from "@/lib/marketing/brand-profile"
import { MOCK_CONTENT_IDEAS } from "@/lib/marketing/content-idea-types"

export const DEMO_MARKETING_CONTENT_IDEAS_TABLE_SQL = `
create table if not exists public.content_ideas (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  brand_id       uuid references public.brand_profiles (id) on delete set null,
  title          text not null,
  caption        text not null default '',
  hashtags       text not null default '',
  platform       text not null default '',
  category       text not null default '',
  content_type   text not null default '',
  goal           text not null default '',
  viral_score    integer,
  viral_reason   text not null default '',
  suggested_cta  text not null default '',
  is_demo        boolean not null default false,
  created_at     timestamptz not null default now()
);
`.trim()

export const DEMO_MARKETING_IS_DEMO_MIGRATION_SQL = `
alter table content_ideas add column if not exists is_demo boolean default false;
alter table content_posts add column if not exists is_demo boolean default false;
alter table scheduled_posts add column if not exists is_demo boolean default false;
alter table content_performance add column if not exists is_demo boolean default false;
alter table analytics add column if not exists is_demo boolean default false;
`.trim()

export const DEMO_MARKETING_CONTENT_IDEAS_RLS_SQL = `
drop policy if exists "content_ideas: insert coach admin" on public.content_ideas;
drop policy if exists "content_ideas: insert own" on public.content_ideas;

create policy "content_ideas: insert own"
  on public.content_ideas
  for insert
  to authenticated
  with check (user_id::text = auth.uid()::text);
`.trim()

const PLATFORMS = ["Instagram", "TikTok", "Facebook"] as const
const CATEGORIES = [
  "Transformation",
  "Nutrition",
  "Workout",
  "Member Story",
  "Educational",
  "Motivation",
  "Promotion",
] as const
const CONTENT_TYPES = ["Reel", "Carousel", "Post", "Story"] as const
const GOALS = [
  "Get More Members",
  "Increase Engagement",
  "Promote Personal Training",
  "Build Brand Awareness",
  "Retention",
] as const

const DEMO_DRAFT_SEEDS = [
  {
    title: "5 myths online coaches still believe about fat loss",
    caption:
      "Cut through the noise for your coaching audience — save this for your next client check-in.",
    category: "Educational",
    content_type: "Carousel",
  },
  {
    title: "Gym owner playbook: fill morning classes in 30 days",
    caption:
      "Three local marketing moves that personal trainers and gym owners can run this month.",
    category: "Promotion",
    content_type: "Post",
  },
  {
    title: "Client check-in questions that improve retention",
    caption:
      "Use these prompts in your online coaching calls to spot friction before clients churn.",
    category: "Motivation",
    content_type: "Reel",
  },
  {
    title: "Protein breakfast ideas for busy professionals",
    caption:
      "Quick nutrition wins your members can prep in under 10 minutes before work.",
    category: "Nutrition",
    content_type: "Reel",
  },
  {
    title: "How to film workout reels without a videographer",
    caption:
      "Simple framing and lighting tips for trainers shooting content between sessions.",
    category: "Workout",
    content_type: "Reel",
  },
  {
    title: "What a 12-week online coaching onboarding looks like",
    caption:
      "Show prospects the journey from signup to first transformation milestone.",
    category: "Educational",
    content_type: "Carousel",
  },
  {
    title: "Member spotlight: consistency beat perfection",
    caption:
      "Draft story template for celebrating a client who showed up 3x per week for 90 days.",
    category: "Member Story",
    content_type: "Story",
  },
  {
    title: "Leg day form cues every personal trainer should post",
    caption:
      "Educational reel script covering squat depth, knee tracking, and bracing.",
    category: "Workout",
    content_type: "Reel",
  },
  {
    title: "Macro-friendly meal prep for fat loss clients",
    caption:
      "Carousel outline with grocery list, portions, and swap options for online clients.",
    category: "Nutrition",
    content_type: "Carousel",
  },
  {
    title: "Why your transformation posts need a before/after story arc",
    caption:
      "Framework for ethical client success stories that build trust with new leads.",
    category: "Transformation",
    content_type: "Post",
  },
] as const

const DEMO_PUBLISHED_SEEDS = [
  {
    title: "3 gym mistakes killing your members' progress",
    caption:
      "Most beginners skip progressive overload, under-eat protein, and chase random programs. Fix these first.",
    category: "Workout",
    content_type: "Reel",
    views: 12400,
  },
  {
    title: "Your squat form is wrong (fix this first)",
    caption:
      "Bracing, foot pressure, and depth cues every personal trainer should teach on day one.",
    category: "Educational",
    content_type: "Reel",
    views: 9800,
  },
  {
    title: "Member transformation: 18 lbs in 12 weeks",
    caption:
      "Online coaching client stayed consistent with 3 lifts, 8k steps, and structured nutrition check-ins.",
    category: "Transformation",
    content_type: "Carousel",
    views: 7600,
  },
  {
    title: "What I tell every new gym member about protein",
    caption:
      "Aim for 0.7–1g per lb target bodyweight — especially if you're running a fat loss phase.",
    category: "Nutrition",
    content_type: "Reel",
    views: 6900,
  },
  {
    title: "Meal prep basics for busy gym members (save this)",
    caption:
      "Batch cook protein, prep carbs, and pre-portion snacks so weekday nutrition stays on track.",
    category: "Nutrition",
    content_type: "Carousel",
    views: 5400,
  },
  {
    title: "Cardio before weights? Gym myth busted",
    caption:
      "For most members, lift first when fresh — then add conditioning based on their goal.",
    category: "Educational",
    content_type: "Story",
    views: 4100,
  },
  {
    title: "Beginner deadlift checklist for gym newbies",
    caption:
      "Hip hinge, bar path, and lat tension — film from the side and review with your coach.",
    category: "Workout",
    content_type: "Reel",
    views: 3600,
  },
  {
    title: "Why I joined this gym — member testimonial",
    caption:
      "Community, coaching, and accountability turned inconsistent training into a real habit.",
    category: "Member Story",
    content_type: "Reel",
    views: 2800,
  },
  {
    title: "21-day kickstart — limited spots for new members",
    caption:
      "Intro offer for local prospects: assessment, program design, and nutrition starter guide.",
    category: "Promotion",
    content_type: "Post",
    views: 3200,
  },
  {
    title: "Push day finisher for hypertrophy clients",
    caption:
      "Mechanical drop set your online coaching group can try this week — 45 seconds rest max.",
    category: "Workout",
    content_type: "Reel",
    views: 5100,
  },
  {
    title: "How online coaches should run weekly progress reviews",
    caption:
      "Scale weight, steps, sleep, adherence, and photos — keep calls under 20 minutes.",
    category: "Educational",
    content_type: "Carousel",
    views: 4700,
  },
  {
    title: "Client win: first pull-up at 41",
    caption:
      "Six months of band-assisted work, lat focus, and patience — celebrate the process.",
    category: "Transformation",
    content_type: "Reel",
    views: 6200,
  },
  {
    title: "Post-workout snack ideas under 300 calories",
    caption:
      "Greek yogurt bowls, turkey wraps, and protein smoothies your members will actually make.",
    category: "Nutrition",
    content_type: "Reel",
    views: 3900,
  },
  {
    title: "Morning vs evening workouts for gym owners",
    caption:
      "Match class times to member schedules — test both slots and track attendance for 4 weeks.",
    category: "Motivation",
    content_type: "Post",
    views: 2500,
  },
  {
    title: "Refer-a-friend week for personal training clients",
    caption:
      "Give existing members a guest pass and a shared goal challenge to boost referrals.",
    category: "Promotion",
    content_type: "Story",
    views: 3300,
  },
] as const

const DEMO_SCHEDULED_SEEDS = [
  {
    hook: "Stop guessing your macros",
    content:
      "Online coaches: use this 60-second reel script to explain protein targets to new fat loss clients.",
    post_type: "Reel",
  },
  {
    hook: "Gym tour that converts",
    content:
      "Walk prospects through your floor plan, coaching area, and onboarding — post before weekend open house.",
    post_type: "Reel",
  },
  {
    hook: "Transformation Tuesday template",
    content:
      "Before/after carousel with habit stack, training split, and client quote — schedule for Tuesday 7 PM.",
    post_type: "Carousel",
  },
  {
    hook: "Nutrition myth Monday",
    content:
      "Carbs aren't the enemy for fat loss — context, timing, and adherence matter more than elimination.",
    post_type: "Reel",
  },
  {
    hook: "Coach POV: 5 AM session",
    content:
      "Behind-the-scenes story showing setup, warm-up, and member shout-out — builds local trust fast.",
    post_type: "Story",
  },
  {
    hook: "Free form check Friday",
    content:
      "Invite followers to submit squat videos — pick three for a public technique review live.",
    post_type: "Post",
  },
  {
    hook: "Online coaching FAQ",
    content:
      "Answer pricing, check-in frequency, and app setup in a save-worthy carousel for Instagram.",
    post_type: "Carousel",
  },
  {
    hook: "Member meal prep reel",
    content:
      "Film a client prepping lunches — tag local grocery staples and link to your nutrition review offer.",
    post_type: "Reel",
  },
  {
    hook: "Summer shred waitlist",
    content:
      "Open enrollment post for gym owners running a 8-week challenge — cap spots to create urgency.",
    post_type: "Post",
  },
  {
    hook: "Technique tip: Romanian deadlift",
    content:
      "Hip hinge cueing for hamstring growth — schedule for Thursday before leg day traffic peaks.",
    post_type: "Reel",
  },
] as const

const DEMO_PERFORMANCE_DAYS = 30

const DEMO_CONTENT_POST_TITLES = [
  ...DEMO_DRAFT_SEEDS.map((seed) => seed.title),
  ...DEMO_PUBLISHED_SEEDS.map((seed) => seed.title),
]

const DEMO_CONTENT_IDEA_TITLES = MOCK_CONTENT_IDEAS.slice(0, 20).map(
  (idea) => idea.title,
)

const DEMO_SCHEDULED_HOOKS = DEMO_SCHEDULED_SEEDS.map((seed) => seed.hook)

export type GenerateDemoMarketingResult = {
  contentIdeasCreated: number
  contentPostsCreated: number
  scheduledPostsCreated: number
  publishedPostsCreated: number
  analyticsCreated: number
  error: string | null
}

type ContentIdeaInsert = {
  user_id: string
  brand_id: string | null
  title: string
  caption: string
  hashtags: string
  platform: string
  category: string
  content_type: string
  goal: string
  viral_score: number | null
  viral_reason: string
  suggested_cta: string
  is_demo?: boolean
}

type ContentPostInsert =
  Database["public"]["Tables"]["content_posts"]["Insert"] & {
    is_demo?: boolean
  }

type ScheduledPostInsert =
  Database["public"]["Tables"]["scheduled_posts"]["Insert"] & {
    is_demo?: boolean
  }

type PerformanceInsert =
  Database["public"]["Tables"]["content_performance"]["Insert"] & {
    is_demo?: boolean
  }

type AnalyticsInsert = Database["public"]["Tables"]["analytics"]["Insert"] & {
  is_demo?: boolean
}

function asDemoClient(supabase: SupabaseClient<Database>) {
  return supabase as unknown as SupabaseClient<Record<string, unknown>>
}

function isoDaysAgo(days: number, hour = 12): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

function isoDaysAhead(days: number, hour = 18): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

function engagementFromViews(views: number) {
  const likes = Math.max(12, Math.round(views * 0.09))
  const comments = Math.max(3, Math.round(views * 0.012))
  const shares = Math.max(2, Math.round(views * 0.025))
  const saves = Math.max(2, Math.round(views * 0.018))
  return { likes, comments, shares, saves }
}

function stripDemoFlag<T extends { is_demo?: boolean }>(rows: T[]) {
  return rows.map(({ is_demo: _isDemo, ...row }) => row)
}

async function fetchDemoContentPostIds(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ ids: string[]; error: string | null }> {
  const flagged = await asDemoClient(supabase)
    .from("content_posts")
    .select("id")
    .eq("created_by", userId)
    .eq("is_demo", true)

  if (!flagged.error) {
    const rows = (flagged.data ?? []) as Array<{ id: string }>
    return { ids: rows.map((row) => row.id), error: null }
  }

  if (!flagged.error.message.includes("is_demo")) {
    return { ids: [], error: flagged.error.message }
  }

  const legacy = await supabase
    .from("content_posts")
    .select("id")
    .eq("created_by", userId)
    .in("title", DEMO_CONTENT_POST_TITLES)

  return {
    ids: legacy.data?.map((row) => row.id) ?? [],
    error: legacy.error?.message ?? null,
  }
}

async function deleteDemoContentPosts(
  supabase: SupabaseClient<Database>,
  userId: string,
  ids: string[],
): Promise<{ error: string | null }> {
  if (ids.length === 0) {
    return { error: null }
  }

  const { error } = await supabase.from("content_posts").delete().in("id", ids)
  return { error: error?.message ?? null }
}

async function deleteDemoScheduledPosts(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ error: string | null }> {
  const flagged = await asDemoClient(supabase)
    .from("scheduled_posts")
    .delete()
    .eq("user_id", userId)
    .eq("is_demo", true)

  if (!flagged.error) {
    return { error: null }
  }

  if (!flagged.error.message.includes("is_demo")) {
    return { error: flagged.error.message }
  }

  const { error } = await supabase
    .from("scheduled_posts")
    .delete()
    .eq("user_id", userId)
    .in("hook", DEMO_SCHEDULED_HOOKS)

  return { error: error?.message ?? null }
}

async function deleteDemoPerformanceRows(
  supabase: SupabaseClient<Database>,
  userId: string,
  demoPostIds: string[],
): Promise<{ error: string | null }> {
  const flagged = await asDemoClient(supabase)
    .from("content_performance")
    .delete()
    .eq("created_by", userId)
    .eq("is_demo", true)

  if (!flagged.error) {
    return { error: null }
  }

  if (!flagged.error.message.includes("is_demo")) {
    return { error: flagged.error.message }
  }

  if (demoPostIds.length > 0) {
    const { error } = await supabase
      .from("content_performance")
      .delete()
      .eq("created_by", userId)
      .in("post_id", demoPostIds)

    return { error: error?.message ?? null }
  }

  return { error: null }
}

async function deleteDemoAnalyticsRows(
  supabase: SupabaseClient<Database>,
  brandId: string | null,
  demoPostIds: string[],
): Promise<{ error: string | null }> {
  if (demoPostIds.length > 0) {
    await supabase.from("analytics").delete().in("post_id", demoPostIds)
  }

  if (!brandId) {
    return { error: null }
  }

  const flagged = await asDemoClient(supabase)
    .from("analytics")
    .delete()
    .eq("brand_id", brandId)
    .eq("is_demo", true)

  if (!flagged.error) {
    return { error: null }
  }

  if (!flagged.error.message.includes("is_demo")) {
    return { error: flagged.error.message }
  }

  return { error: null }
}

async function clearDemoContentIdeas(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ error: string | null }> {
  const client = asDemoClient(supabase)

  const flagged = await client
    .from("content_ideas")
    .delete()
    .eq("is_demo", true)
    .eq("user_id", userId)

  if (!flagged.error) {
    return { error: null }
  }

  if (
    flagged.error.message.includes("content_ideas") ||
    flagged.error.message.includes("schema cache")
  ) {
    return { error: null }
  }

  if (flagged.error.message.includes("is_demo")) {
    const legacy = await client
      .from("content_ideas")
      .delete()
      .eq("user_id", userId)
      .in("title", DEMO_CONTENT_IDEA_TITLES)

    return { error: legacy.error?.message ?? null }
  }

  return { error: flagged.error.message }
}

async function clearDemoMarketingForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
  brandId: string | null,
): Promise<{ error: string | null }> {
  const { ids: demoPostIds, error: idsError } = await fetchDemoContentPostIds(
    supabase,
    userId,
  )

  if (idsError) {
    return { error: idsError }
  }

  const analyticsClear = await deleteDemoAnalyticsRows(
    supabase,
    brandId,
    demoPostIds,
  )
  if (analyticsClear.error) {
    return analyticsClear
  }

  const performanceClear = await deleteDemoPerformanceRows(
    supabase,
    userId,
    demoPostIds,
  )
  if (performanceClear.error) {
    return performanceClear
  }

  const scheduledClear = await deleteDemoScheduledPosts(supabase, userId)
  if (scheduledClear.error) {
    return scheduledClear
  }

  const postsClear = await deleteDemoContentPosts(
    supabase,
    userId,
    demoPostIds,
  )
  if (postsClear.error) {
    return postsClear
  }

  return clearDemoContentIdeas(supabase, userId)
}

export async function clearDemoMarketingDataForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ error: string | null }> {
  const { profile: brand, error: brandError } = await loadOrCreateBrandProfile(
    supabase,
    userId,
  )

  if (brandError) {
    return { error: brandError }
  }

  return clearDemoMarketingForCoach(supabase, userId, brand?.id ?? null)
}

function buildContentIdeas(
  userId: string,
  brandId: string | null,
): ContentIdeaInsert[] {
  return MOCK_CONTENT_IDEAS.slice(0, DEMO_CONTENT_IDEA_TITLES.length).map((idea, index) => ({
    user_id: userId,
    brand_id: brandId,
    title: idea.title,
    caption: idea.caption,
    hashtags: idea.hashtags,
    platform: PLATFORMS[index % PLATFORMS.length],
    category: CATEGORIES[index % CATEGORIES.length],
    content_type: CONTENT_TYPES[index % CONTENT_TYPES.length],
    goal: GOALS[index % GOALS.length],
    viral_score: idea.viral_score,
    viral_reason: idea.viral_reason,
    suggested_cta:
      index % 3 === 0
        ? "Save this for your next client check-in"
        : index % 3 === 1
          ? "DM COACH for your free assessment"
          : "Follow for weekly fitness marketing tips",
    is_demo: true,
  }))
}

function buildDraftPosts(
  userId: string,
  brandId: string | null,
): ContentPostInsert[] {
  return DEMO_DRAFT_SEEDS.map((seed, index) => ({
    user_id: userId,
    created_by: userId,
    brand_id: brandId,
    title: seed.title,
    caption: seed.caption,
    hashtags: "#personaltrainer #onlinecoach #gymowner #fitnessmarketing",
    platform: PLATFORMS[index % PLATFORMS.length],
    category: seed.category,
    content_type: seed.content_type,
    goal: GOALS[index % GOALS.length],
    topic: "online coaching",
    status: "draft",
    viral_score: 70 + (index % 20),
    viral_reason: "Strong hook for fitness coaches targeting local and online clients.",
    is_demo: true,
  }))
}

function buildPublishedPosts(
  userId: string,
  brandId: string | null,
): ContentPostInsert[] {
  return DEMO_PUBLISHED_SEEDS.map((seed, index) => ({
    user_id: userId,
    created_by: userId,
    brand_id: brandId,
    title: seed.title,
    caption: seed.caption,
    hashtags: "#fitnesscoach #transformation #nutritiontips #workoutreels",
    platform: PLATFORMS[index % PLATFORMS.length],
    category: seed.category,
    content_type: seed.content_type,
    goal: GOALS[index % GOALS.length],
    topic: seed.category.toLowerCase(),
    status: "published",
    published_at: isoDaysAgo(29 - index * 2, 10 + (index % 8)),
    viral_score: 65 + (index % 28),
    viral_reason: "Published demo post with realistic engagement for marketing analytics.",
    is_demo: true,
  }))
}

function buildScheduledPosts(userId: string): ScheduledPostInsert[] {
  return DEMO_SCHEDULED_SEEDS.map((seed, index) => ({
    user_id: userId,
    platform: PLATFORMS[index % PLATFORMS.length],
    hook: seed.hook,
    content: seed.content,
    post_type: seed.post_type,
    scheduled_date: isoDaysAhead(index + 1, 9 + (index % 6)),
    status: "scheduled",
    publish_status: "scheduled",
    viral_score: 72 + (index % 18),
    is_demo: true,
  }))
}

function buildAnalyticsRows(
  brandId: string,
  publishedPosts: Array<{ id: string; platform: string | null; title: string }>,
): AnalyticsInsert[] {
  return publishedPosts.map((post, index) => {
    const views = DEMO_PUBLISHED_SEEDS[index]?.views ?? 3000
    const engagement = engagementFromViews(views)

    return {
      brand_id: brandId,
      post_id: post.id,
      platform: post.platform ?? PLATFORMS[index % PLATFORMS.length],
      views,
      likes: engagement.likes,
      comments: engagement.comments,
      shares: engagement.shares,
      saves: engagement.saves,
      created_at: isoDaysAgo(29 - index * 2, 11),
      is_demo: true,
    }
  })
}

function toPerformanceContentType(category: string | null, index: number): string {
  return category ?? CATEGORIES[index % CATEGORIES.length]
}

function buildPerformanceRows(
  userId: string,
  publishedPosts: Array<{ id: string; platform: string | null; title: string; category: string | null }>,
): PerformanceInsert[] {
  const rows: PerformanceInsert[] = []

  for (let day = 0; day < DEMO_PERFORMANCE_DAYS; day += 1) {
    const linkedPost = publishedPosts[day % publishedPosts.length]
    const baseViews = 800 + day * 120 + (day % 5) * 90
    const engagement = engagementFromViews(baseViews)
    const recordedAt = isoDaysAgo(DEMO_PERFORMANCE_DAYS - day - 1, 8)

    rows.push({
      created_by: userId,
      post_id: linkedPost?.id ?? null,
      platform: linkedPost?.platform ?? PLATFORMS[day % PLATFORMS.length],
      content_type: toPerformanceContentType(linkedPost?.category ?? null, day),
      title: linkedPost?.title ?? "Demo post",
      views: baseViews,
      likes: engagement.likes,
      comments: engagement.comments,
      shares: engagement.shares,
      saves: engagement.saves,
      followers_gained: 3 + (day % 7),
      created_at: recordedAt,
      is_demo: true,
    })
  }

  return rows
}

async function insertContentPerformanceRows(
  supabase: SupabaseClient<Database>,
  rows: PerformanceInsert[],
) {
  return insertWithSchemaFallback(supabase, "content_performance", rows)
}

async function insertContentIdeas(
  supabase: SupabaseClient<Database>,
  rows: ContentIdeaInsert[],
): Promise<{ count: number; error: string | null }> {
  const client = asDemoClient(supabase)
  const probe = await client.from("content_ideas").select("id").limit(1)

  if (
    probe.error &&
    (probe.error.message.includes("content_ideas") ||
      probe.error.message.includes("schema cache"))
  ) {
    console.warn(
      "[demo/generate] content_ideas table missing — run DEMO_MARKETING_CONTENT_IDEAS_TABLE_SQL",
    )
    return { count: 0, error: null }
  }

  const result = await insertWithSchemaFallback(
    supabase,
    "content_ideas",
    rows as Array<Record<string, unknown>>,
  )

  if (result.error) {
    if (result.error.message.includes("row-level security")) {
      return {
        count: 0,
        error: `${result.error.message} Run DEMO_MARKETING_CONTENT_IDEAS_RLS_SQL in Supabase, or set SUPABASE_SERVICE_ROLE_KEY for demo generation.`,
      }
    }

    return { count: 0, error: result.error.message }
  }

  return { count: result.data?.length ?? 0, error: null }
}

export async function generateDemoMarketingForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<GenerateDemoMarketingResult> {
  const { profile: brand, error: brandError } = await loadOrCreateBrandProfile(
    supabase,
    userId,
  )

  if (brandError) {
    return {
      contentIdeasCreated: 0,
      contentPostsCreated: 0,
      scheduledPostsCreated: 0,
      publishedPostsCreated: 0,
      analyticsCreated: 0,
      error: brandError,
    }
  }

  const brandId = brand?.id ?? null
  const clearResult = await clearDemoMarketingForCoach(
    supabase,
    userId,
    brandId,
  )

  if (clearResult.error) {
    return {
      contentIdeasCreated: 0,
      contentPostsCreated: 0,
      scheduledPostsCreated: 0,
      publishedPostsCreated: 0,
      analyticsCreated: 0,
      error: clearResult.error,
    }
  }

  const ideasResult = await insertContentIdeas(
    supabase,
    buildContentIdeas(userId, brandId),
  )

  if (ideasResult.error) {
    return {
      contentIdeasCreated: 0,
      contentPostsCreated: 0,
      scheduledPostsCreated: 0,
      publishedPostsCreated: 0,
      analyticsCreated: 0,
      error: ideasResult.error,
    }
  }

  const draftRows = buildDraftPosts(userId, brandId)
  const publishedRows = buildPublishedPosts(userId, brandId)

  const draftInsert = await insertWithSchemaFallback(
    supabase,
    "content_posts",
    draftRows,
  )

  if (draftInsert.error) {
    return {
      contentIdeasCreated: ideasResult.count,
      contentPostsCreated: 0,
      scheduledPostsCreated: 0,
      publishedPostsCreated: 0,
      analyticsCreated: 0,
      error: draftInsert.error.message,
    }
  }

  const publishedInsert = await insertWithSchemaFallback(
    supabase,
    "content_posts",
    publishedRows,
  )

  if (publishedInsert.error) {
    return {
      contentIdeasCreated: ideasResult.count,
      contentPostsCreated: draftInsert.data?.length ?? 0,
      scheduledPostsCreated: 0,
      publishedPostsCreated: 0,
      analyticsCreated: 0,
      error: publishedInsert.error.message,
    }
  }

  const scheduledInsert = await insertWithSchemaFallback(
    supabase,
    "scheduled_posts",
    buildScheduledPosts(userId),
  )

  if (scheduledInsert.error) {
    return {
      contentIdeasCreated: ideasResult.count,
      contentPostsCreated:
        (draftInsert.data?.length ?? 0) + (publishedInsert.data?.length ?? 0),
      scheduledPostsCreated: 0,
      publishedPostsCreated: publishedInsert.data?.length ?? 0,
      analyticsCreated: 0,
      error: scheduledInsert.error.message,
    }
  }

  const publishedIds =
    (publishedInsert.data as Array<{ id: string }> | null) ?? []
  const publishedPosts = publishedIds.map((row, index) => ({
    id: row.id,
    platform: publishedRows[index]?.platform ?? null,
    title: publishedRows[index]?.title ?? "",
    category: publishedRows[index]?.category ?? null,
  }))

  let analyticsCreated = 0

  if (brandId && publishedPosts.length > 0) {
    const analyticsInsert = await insertWithSchemaFallback(
      supabase,
      "analytics",
      buildAnalyticsRows(brandId, publishedPosts),
    )

    if (analyticsInsert.error) {
      return {
        contentIdeasCreated: ideasResult.count,
        contentPostsCreated:
          (draftInsert.data?.length ?? 0) + publishedPosts.length,
        scheduledPostsCreated: scheduledInsert.data?.length ?? 0,
        publishedPostsCreated: publishedPosts.length,
        analyticsCreated: 0,
        error: analyticsInsert.error.message,
      }
    }

    analyticsCreated += analyticsInsert.data?.length ?? 0
  }

  const performanceInsert = await insertContentPerformanceRows(
    supabase,
    buildPerformanceRows(userId, publishedPosts),
  )

  if (performanceInsert.error) {
    return {
      contentIdeasCreated: ideasResult.count,
      contentPostsCreated:
        (draftInsert.data?.length ?? 0) + publishedPosts.length,
      scheduledPostsCreated: scheduledInsert.data?.length ?? 0,
      publishedPostsCreated: publishedPosts.length,
      analyticsCreated,
      error: performanceInsert.error.message,
    }
  }

  analyticsCreated += performanceInsert.data?.length ?? 0

  console.log("[demo/generate] marketing ideas created:", ideasResult.count)
  console.log(
    "[demo/generate] marketing posts created:",
    (draftInsert.data?.length ?? 0) + publishedPosts.length,
  )
  console.log(
    "[demo/generate] scheduled posts created:",
    scheduledInsert.data?.length ?? 0,
  )
  console.log("[demo/generate] analytics rows created:", analyticsCreated)

  return {
    contentIdeasCreated: ideasResult.count,
    contentPostsCreated:
      (draftInsert.data?.length ?? 0) + publishedPosts.length,
    scheduledPostsCreated: scheduledInsert.data?.length ?? 0,
    publishedPostsCreated: publishedPosts.length,
    analyticsCreated,
    error: null,
  }
}
