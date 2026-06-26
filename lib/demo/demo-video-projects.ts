import type { SupabaseClient } from "@supabase/supabase-js"
import { demoFilter } from "@/lib/demo/demo-query-helpers"
import type { Database } from "@/lib/database.types"
import { insertWithSchemaFallback } from "@/lib/demo/insert-with-schema-fallback"
import {
  SCENE_CAMERA_MOTIONS,
  SCENE_TRANSITIONS,
} from "@/lib/marketing/video-scene-cinematics"

export const DEMO_VIDEO_IS_DEMO_MIGRATION_SQL = `
alter table video_projects add column if not exists is_demo boolean default false;
alter table video_scenes add column if not exists is_demo boolean default false;
`.trim()

const DEMO_BRAND_NAME = "ZyntixAI Performance Coaching"

type DemoVideoStatus = "draft" | "processing" | "ready" | "published"

type DemoScenePurpose = "Hook" | "Problem" | "Solution" | "Features" | "CTA"

type DemoVideoProjectSeed = {
  title: string
  prompt: string
  platform: string
  status: DemoVideoStatus
  hook: string
  cta: string
  style: string
  music_mood: string
  sceneCount: number
  workflow_type: string
  workflow_summary: string
}

type VideoProjectInsert =
  Database["public"]["Tables"]["video_projects"]["Insert"] & {
    is_demo?: boolean
  }

type VideoSceneInsert = Database["public"]["Tables"]["video_scenes"]["Insert"] & {
  is_demo?: boolean
}

export type GenerateDemoVideoProjectsResult = {
  videoProjectsCreated: number
  videoScenesCreated: number
  error: string | null
}

const SCENE_PURPOSES: DemoScenePurpose[] = [
  "Hook",
  "Problem",
  "Solution",
  "Features",
  "CTA",
]

export const DEMO_VIDEO_PROJECT_SEEDS: DemoVideoProjectSeed[] = [
  {
    title: "Personal Trainer Launch",
    prompt:
      "Launch video for a personal trainer offering 1:1 strength coaching, form checks, and accountability for busy professionals.",
    platform: "instagram",
    status: "draft",
    hook: "Stop guessing your workouts.",
    cta: "Book your free intro session today.",
    style: "premium_ad",
    music_mood: "cinematic",
    sceneCount: 5,
    workflow_type: "coach_launch",
    workflow_summary: "Introduce the trainer, pain point, offer, proof, and booking CTA.",
  },
  {
    title: "6 Week Transformation Challenge",
    prompt:
      "Promo reel for a 6-week gym transformation challenge with weekly check-ins, training plan, and nutrition guidance.",
    platform: "tiktok",
    status: "processing",
    hook: "Six weeks can change everything.",
    cta: "Join the challenge — limited spots.",
    style: "problem_solution",
    music_mood: "energetic",
    sceneCount: 6,
    workflow_type: "challenge_promo",
    workflow_summary: "Challenge hook, before state, coaching system, member results, urgency CTA.",
  },
  {
    title: "Fat Loss Coaching Campaign",
    prompt:
      "Marketing video for online fat loss coaching with macro targets, habit tracking, and weekly coach reviews.",
    platform: "instagram",
    status: "ready",
    hook: "Fat loss without starving yourself.",
    cta: "Apply for online coaching.",
    style: "viral_caption",
    music_mood: "motivational",
    sceneCount: 4,
    workflow_type: "fat_loss_offer",
    workflow_summary: "Scroll-stopping hook, diet myth bust, coaching framework, application CTA.",
  },
  {
    title: "Online Coach Promotion",
    prompt:
      "SaaS-style promo showing how online coaches deliver programs, check-ins, and progress tracking remotely.",
    platform: "youtube",
    status: "published",
    hook: "Coach clients anywhere in the world.",
    cta: "Start your free trial.",
    style: "saas_demo",
    music_mood: "uplifting",
    sceneCount: 7,
    workflow_type: "online_coaching",
    workflow_summary: "Remote coaching promise, workflow demo, client dashboard, results, trial CTA.",
  },
  {
    title: "Gym Membership Drive",
    prompt:
      "Local gym membership campaign highlighting community, coaching support, and flexible class times.",
    platform: "facebook",
    status: "draft",
    hook: "Your gym should feel like home.",
    cta: "Claim your intro week pass.",
    style: "premium_ad",
    music_mood: "energetic",
    sceneCount: 5,
    workflow_type: "membership_drive",
    workflow_summary: "Community hook, facility tour, coaching support, social proof, intro offer.",
  },
  {
    title: "Nutrition Coaching Launch",
    prompt:
      "Launch video for nutrition coaching with meal templates, macro coaching, and weekly accountability calls.",
    platform: "instagram",
    status: "processing",
    hook: "Nutrition is 80% of your results.",
    cta: "Book a nutrition strategy call.",
    style: "problem_solution",
    music_mood: "cinematic",
    sceneCount: 6,
    workflow_type: "nutrition_launch",
    workflow_summary: "Nutrition pain point, meal prep solution, coach support, client win, booking CTA.",
  },
  {
    title: "Summer Shred Campaign",
    prompt:
      "Seasonal campaign for a summer shred program combining strength training, steps, and sustainable calorie targets.",
    platform: "tiktok",
    status: "ready",
    hook: "Summer shred starts with a plan.",
    cta: "Reserve your spot before spots fill.",
    style: "viral_caption",
    music_mood: "energetic",
    sceneCount: 8,
    workflow_type: "seasonal_campaign",
    workflow_summary: "Seasonal urgency, training split, nutrition framework, progress tracking, CTA.",
  },
  {
    title: "Client Success Story",
    prompt:
      "Transformation story video featuring a coaching client who lost fat, gained strength, and improved confidence.",
    platform: "instagram",
    status: "published",
    hook: "She didn't need a perfect plan — she needed accountability.",
    cta: "Start your transformation today.",
    style: "premium_ad",
    music_mood: "motivational",
    sceneCount: 4,
    workflow_type: "client_story",
    workflow_summary: "Emotional hook, starting point, coaching journey, results CTA.",
  },
  {
    title: "AI Coaching Promotion",
    prompt:
      "Product video promoting AI-assisted coaching workflows for program design, check-ins, and marketing content.",
    platform: "youtube",
    status: "ready",
    hook: "Let AI handle the busywork so you can coach.",
    cta: "Try ZyntixAI free.",
    style: "app_showcase",
    music_mood: "uplifting",
    sceneCount: 6,
    workflow_type: "ai_coaching",
    workflow_summary: "Coach time problem, AI workflow demo, member management, analytics, trial CTA.",
  },
  {
    title: "ZyntixAI Launch Video",
    prompt:
      "Flagship launch video for ZyntixAI — the all-in-one platform for coaches, gyms, and online trainers.",
    platform: "instagram",
    status: "published",
    hook: "Run your entire coaching business in one platform.",
    cta: "Launch with ZyntixAI today.",
    style: "app_showcase",
    music_mood: "cinematic",
    sceneCount: 7,
    workflow_type: "platform_launch",
    workflow_summary: "Platform promise, dashboard tour, workouts, nutrition, marketing AI, launch CTA.",
  },
]

const DEMO_VIDEO_PROJECT_TITLES = DEMO_VIDEO_PROJECT_SEEDS.map(
  (project) => project.title,
)

const DEMO_VIDEO_PROJECT_PROMPTS = DEMO_VIDEO_PROJECT_SEEDS.map(
  (project) => project.prompt,
)

function renderFieldsForStatus(status: DemoVideoStatus): {
  render_status: string
  final_render_status: string
  video_url: string | null
} {
  switch (status) {
    case "draft":
      return {
        render_status: "draft",
        final_render_status: "draft",
        video_url: null,
      }
    case "processing":
      return {
        render_status: "processing",
        final_render_status: "draft",
        video_url: null,
      }
    case "ready":
      return {
        render_status: "completed",
        final_render_status: "completed",
        video_url: null,
      }
    case "published":
      return {
        render_status: "completed",
        final_render_status: "completed",
        video_url: "https://demo.zyntixai.com/videos/published-preview.mp4",
      }
  }
}

function scenePurpose(index: number): DemoScenePurpose {
  return SCENE_PURPOSES[index % SCENE_PURPOSES.length]
}

function buildSceneText(
  project: DemoVideoProjectSeed,
  purpose: DemoScenePurpose,
  index: number,
): string {
  switch (purpose) {
    case "Hook":
      return project.hook
    case "Problem":
      return `Most ${project.workflow_type.replace(/_/g, " ")} campaigns fail because coaches lack a clear system for leads, onboarding, and retention.`
    case "Solution":
      return `${project.title} gives you a proven framework — programming, accountability, and marketing assets in one workflow.`
    case "Features":
      return index % 2 === 0
        ? "Show training plans, nutrition targets, progress tracking, and session scheduling in one premium coach dashboard."
        : "Highlight member check-ins, transformation updates, and automated reminders that keep clients engaged week after week."
    case "CTA":
      return project.cta
  }
}

function buildSceneVisual(
  project: DemoVideoProjectSeed,
  purpose: DemoScenePurpose,
): string {
  const visuals: Record<DemoScenePurpose, string> = {
    Hook: `Bold kinetic headline over ${project.platform} vertical frame with coach in premium gym lighting`,
    Problem: "Split-screen of overwhelmed coach vs scattered spreadsheets, notes, and DMs",
    Solution: `ZyntixAI dashboard presenting ${project.title} workflow with electric blue UI accents`,
    Features: "Animated SaaS product demo with cursor highlights on member progress and program builder",
    CTA: "Full-screen CTA card with brand logo, offer text, and tap-to-book button animation",
  }

  return visuals[purpose]
}

function buildSceneImagePrompt(
  project: DemoVideoProjectSeed,
  purpose: DemoScenePurpose,
  visual: string,
): string {
  return `Professional fitness marketing video frame for ${project.title}. Purpose: ${purpose}. ${visual}. Vertical 9:16, premium SaaS aesthetic, cinematic lighting, no watermark.`
}

function buildScenesForProject(
  project: DemoVideoProjectSeed,
  videoId: string,
): VideoSceneInsert[] {
  return Array.from({ length: project.sceneCount }, (_, index) => {
    const purpose = scenePurpose(index)
    const text = buildSceneText(project, purpose, index)
    const visual = buildSceneVisual(project, purpose)

    return {
      video_id: videoId,
      scene_index: index + 1,
      text,
      duration: purpose === "Hook" ? 3 : purpose === "CTA" ? 3 : 2,
      visual,
      image_prompt: buildSceneImagePrompt(project, purpose, visual),
      camera_motion: SCENE_CAMERA_MOTIONS[index % SCENE_CAMERA_MOTIONS.length],
      transition: SCENE_TRANSITIONS[index % SCENE_TRANSITIONS.length],
      style: project.style,
      workflow_type: project.workflow_type,
      workflow_step: purpose.toLowerCase(),
      professional_purpose: purpose,
      overlay_text: text,
      narration: text,
      image_status: project.status === "draft" ? "pending" : "ready",
      audio_status: project.status === "published" ? "ready" : "pending",
      is_demo: true,
    }
  })
}

function buildProjectRow(
  project: DemoVideoProjectSeed,
  userId: string,
): VideoProjectInsert {
  const renderFields = renderFieldsForStatus(project.status)

  return {
    user_id: userId,
    brand_name: DEMO_BRAND_NAME,
    prompt: project.prompt,
    platform: project.platform,
    status: project.status,
    hook: project.hook,
    cta: project.cta,
    style: project.style,
    music_mood: project.music_mood,
    workflow_type: project.workflow_type,
    workflow_summary: project.workflow_summary,
    thumbnail_title: project.title,
    thumbnail_text: project.hook,
    thumbnail_visual: `${project.title} — premium fitness marketing video`,
    caption: `${project.hook} ${project.cta}`,
    hashtags: ["#fitnesscoach", "#onlinecoach", "#gymowner", "#zyntixai"],
    voiceover_status: project.status === "draft" ? "pending" : "ready",
    image_generation_status:
      project.status === "draft" ? "pending" : "completed",
    ...renderFields,
    is_demo: true,
  }
}

export async function clearDemoVideoProjectsForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ error: string | null }> {
  const flagged = await demoFilter(supabase, "video_projects")
    .eq("user_id", userId)
    .eq("is_demo", true)
    .select("id")

  if (!flagged.error) {
    const ids =
      ((flagged.data as Array<{ id: string }> | null) ?? []).map(
        (row) => row.id,
      )
    if (ids.length > 0) {
      await supabase.from("video_projects").delete().in("id", ids)
    }
    return { error: null }
  }

  if (!flagged.error.message.includes("is_demo")) {
    return { error: flagged.error.message }
  }

  const legacy = await supabase
    .from("video_projects")
    .select("id")
    .eq("user_id", userId)
    .in("thumbnail_title", DEMO_VIDEO_PROJECT_TITLES)

  if (!legacy.error) {
    const ids = legacy.data?.map((row) => row.id) ?? []
    if (ids.length > 0) {
      await supabase.from("video_projects").delete().in("id", ids)
    }
    return { error: null }
  }

  if (!legacy.error.message.includes("thumbnail_title")) {
    return { error: legacy.error.message }
  }

  const promptMatch = await supabase
    .from("video_projects")
    .select("id")
    .eq("user_id", userId)
    .in("prompt", DEMO_VIDEO_PROJECT_PROMPTS)

  const ids = promptMatch.data?.map((row) => row.id) ?? []
  if (ids.length > 0) {
    await supabase.from("video_projects").delete().in("id", ids)
  }

  return { error: promptMatch.error?.message ?? null }
}

async function insertProjects(
  supabase: SupabaseClient<Database>,
  rows: VideoProjectInsert[],
) {
  return insertWithSchemaFallback(
    supabase,
    "video_projects",
    rows as Array<Record<string, unknown>>,
  )
}

async function insertScenes(
  supabase: SupabaseClient<Database>,
  rows: VideoSceneInsert[],
) {
  if (rows.length === 0) {
    return { data: [], error: null }
  }

  return insertWithSchemaFallback(
    supabase,
    "video_scenes",
    rows as Array<Record<string, unknown>>,
  )
}

export async function generateDemoVideoProjectsForCoach(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<GenerateDemoVideoProjectsResult> {
  const clearResult = await clearDemoVideoProjectsForCoach(supabase, userId)

  if (clearResult.error) {
    return {
      videoProjectsCreated: 0,
      videoScenesCreated: 0,
      error: clearResult.error,
    }
  }

  const projectRows = DEMO_VIDEO_PROJECT_SEEDS.map((seed) =>
    buildProjectRow(seed, userId),
  )

  const projectInsert = await insertProjects(supabase, projectRows)

  if (projectInsert.error) {
    return {
      videoProjectsCreated: 0,
      videoScenesCreated: 0,
      error: projectInsert.error.message,
    }
  }

  const insertedProjects = projectInsert.data ?? []
  const sceneRows: VideoSceneInsert[] = []

  insertedProjects.forEach((project, index) => {
    const seed = DEMO_VIDEO_PROJECT_SEEDS[index]
    if (!seed) return
    sceneRows.push(...buildScenesForProject(seed, String(project.id ?? "")))
  })

  const sceneInsert = await insertScenes(supabase, sceneRows)

  if (sceneInsert.error) {
    return {
      videoProjectsCreated: insertedProjects.length,
      videoScenesCreated: 0,
      error: sceneInsert.error.message,
    }
  }

  const videoProjectsCreated = insertedProjects.length
  const videoScenesCreated = sceneInsert.data?.length ?? 0

  console.log("[demo/generate] video projects created:", videoProjectsCreated)
  console.log("[demo/generate] video scenes created:", videoScenesCreated)

  return {
    videoProjectsCreated,
    videoScenesCreated,
    error: null,
  }
}
