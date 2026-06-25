import fs from "fs/promises"
import path from "path"
import OpenAI from "openai"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import {
  buildMascotImagePrompt,
  buildThumbnailImagePrompt,
  resolveSceneImagePrompt,
} from "@/lib/marketing/build-scene-image-prompt"
import {
  FITCORE_COACH_MASCOT,
  getMascotDescription,
  getMascotStyle,
} from "@/lib/marketing/brand-mascot"
import { stylesRequiringMascot } from "@/lib/marketing/video-templates/app-showcase-template"
import { applyStyleThumbnailDefaults } from "@/lib/marketing/video-thumbnail-guides"
import { normalizeGeneratorVideoStyle } from "@/lib/marketing/video-styles"

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#050505"/><stop offset="100%" stop-color="#0a1628"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#g)"/><circle cx="540" cy="760" r="180" fill="none" stroke="#00d4ff" stroke-width="4" opacity="0.6"/><text x="540" y="980" fill="#ffffff" font-family="Arial,sans-serif" font-size="42" font-weight="700" text-anchor="middle">FitCore Coach</text></svg>`,
  )

type GenerateSceneImagesInput = {
  supabase: SupabaseClient<Database>
  videoId: string
  userId: string
  isAdmin?: boolean
}

type SceneRow = Database["public"]["Tables"]["video_scenes"]["Row"]

function getMascotFromProject(
  project: Database["public"]["Tables"]["video_projects"]["Row"],
) {
  if (!project.mascot_name && !project.mascot_description && !project.mascot_style) {
    return undefined
  }

  return {
    name: project.mascot_name ?? FITCORE_COACH_MASCOT.name,
    description: project.mascot_description ?? getMascotDescription(),
    style: project.mascot_style ?? getMascotStyle(),
    personality: FITCORE_COACH_MASCOT.personality.join(", "),
  }
}

async function ensureOutputDir(videoId: string) {
  const dir = path.join(process.cwd(), "public", "generated", "videos", videoId)
  await fs.mkdir(dir, { recursive: true })
  return dir
}

async function saveImageFromUrl(
  dir: string,
  filename: string,
  url: string,
): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download generated image (${response.status}).`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const filePath = path.join(dir, filename)
  await fs.writeFile(filePath, buffer)

  return `/generated/videos/${path.basename(dir)}/${filename}`
}

async function savePlaceholderImage(
  dir: string,
  filename: string,
): Promise<string> {
  const svg = decodeURIComponent(PLACEHOLDER_IMAGE.replace("data:image/svg+xml,", ""))
  const filePath = path.join(dir, filename.replace(".png", ".svg"))
  await fs.writeFile(filePath, svg)
  return `/generated/videos/${path.basename(dir)}/${path.basename(filePath)}`
}

async function generateImage(
  openai: OpenAI,
  prompt: string,
  dir: string,
  filename: string,
): Promise<string> {
  if (isAiMockMode() || !process.env.OPENAI_API_KEY) {
    return savePlaceholderImage(dir, filename)
  }

  const result = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    size: "1024x1792",
    quality: "standard",
    n: 1,
  })

  const url = result.data?.[0]?.url
  if (!url) {
    throw new Error("OpenAI did not return an image URL.")
  }

  return saveImageFromUrl(dir, filename, url)
}

export async function generateVideoSceneImages({
  supabase,
  videoId,
  userId,
  isAdmin = false,
}: GenerateSceneImagesInput) {
  let projectQuery = supabase
    .from("video_projects")
    .select("*")
    .eq("id", videoId)

  if (!isAdmin) {
    projectQuery = projectQuery.eq("user_id", userId)
  }

  const { data: project, error: projectError } = await projectQuery.maybeSingle()

  if (projectError) {
    throw new Error(projectError.message)
  }

  if (!project) {
    throw new Error("Video not found.")
  }

  const { data: scenes, error: scenesError } = await supabase
    .from("video_scenes")
    .select("*")
    .eq("video_id", videoId)
    .order("scene_index", { ascending: true })

  if (scenesError) {
    throw new Error(scenesError.message)
  }

  if (!scenes?.length) {
    throw new Error("No scenes found for this video.")
  }

  const mascot =
    getMascotFromProject(project) ??
    (stylesRequiringMascot().includes(project.style ?? "")
      ? {
          name: FITCORE_COACH_MASCOT.name,
          description: getMascotDescription(),
          style: getMascotStyle(),
          personality: FITCORE_COACH_MASCOT.personality.join(", "),
        }
      : undefined)
  const outputDir = await ensureOutputDir(videoId)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const updatedScenes: SceneRow[] = []

  let mascotImageUrl = project.mascot_image_url

  if (mascot && !mascotImageUrl) {
    mascotImageUrl = await generateImage(
      openai,
      buildMascotImagePrompt(mascot),
      outputDir,
      "mascot.png",
    )

    const { error: mascotUpdateError } = await supabase
      .from("video_projects")
      .update({ mascot_image_url: mascotImageUrl })
      .eq("id", videoId)

    if (mascotUpdateError) {
      throw new Error(mascotUpdateError.message)
    }
  }

  let thumbnailUrl = project.thumbnail_url

  if (!thumbnailUrl) {
    const thumbnail = applyStyleThumbnailDefaults(
      normalizeGeneratorVideoStyle(project.style ?? undefined),
      project.hook ?? project.prompt,
      project.cta ?? "",
      scenes.map((scene) => ({ visual: scene.visual })),
      project.thumbnail_title ?? "",
      project.thumbnail_text ?? "",
      project.thumbnail_visual ?? "",
    )

    thumbnailUrl = await generateImage(
      openai,
      buildThumbnailImagePrompt(
        mascot,
        thumbnail.thumbnail_visual,
        thumbnail.thumbnail_title,
        thumbnail.thumbnail_text,
      ),
      outputDir,
      "thumbnail.png",
    )

    const { error: thumbnailUpdateError } = await supabase
      .from("video_projects")
      .update({
        thumbnail_url: thumbnailUrl,
        thumbnail_title: thumbnail.thumbnail_title,
        thumbnail_text: thumbnail.thumbnail_text,
        thumbnail_visual: thumbnail.thumbnail_visual,
      })
      .eq("id", videoId)

    if (thumbnailUpdateError) {
      throw new Error(thumbnailUpdateError.message)
    }
  }

  for (const scene of scenes) {
    const imageUrl = await generateImage(
      openai,
      resolveSceneImagePrompt(
        {
          image_prompt: scene.image_prompt ?? "",
          visual: scene.visual,
          text: scene.text,
          camera_motion: scene.camera_motion,
        },
        mascot,
        project.style ?? undefined,
      ),
      outputDir,
      `scene-${scene.scene_index}.png`,
    )

    const { data: updatedScene, error: updateError } = await supabase
      .from("video_scenes")
      .update({
        image_url: imageUrl,
        image_status: "ready",
      })
      .eq("id", scene.id)
      .select("*")
      .single()

    if (updateError) {
      throw new Error(updateError.message)
    }

    updatedScenes.push(updatedScene)
  }

  const { data: updatedProject, error: statusError } = await supabase
    .from("video_projects")
    .update({ status: "processing" })
    .eq("id", videoId)
    .select("*")
    .single()

  if (statusError) {
    throw new Error(statusError.message)
  }

  return {
    project: updatedProject,
    scenes: updatedScenes,
    mascotImageUrl,
    thumbnailUrl,
  }
}

type GenerateVideoProjectImagesInput = {
  supabase: SupabaseClient<Database>
  videoProjectId: string
  userId: string
}

export async function generateVideoProjectImages({
  supabase,
  videoProjectId,
  userId,
}: GenerateVideoProjectImagesInput): Promise<{ generated: number }> {
  const { data: project, error: projectError } = await supabase
    .from("video_projects")
    .select("*")
    .eq("id", videoProjectId)
    .eq("user_id", userId)
    .maybeSingle()

  if (projectError) {
    throw new Error(projectError.message)
  }

  if (!project) {
    throw new Error("Video not found.")
  }

  const { data: scenes, error: scenesError } = await supabase
    .from("video_scenes")
    .select("id, scene_index, image_prompt, image_url")
    .eq("video_id", videoProjectId)
    .order("scene_index", { ascending: true })

  if (scenesError) {
    throw new Error(scenesError.message)
  }

  if (!scenes?.length) {
    throw new Error("No scenes found for this video.")
  }

  const scenesToGenerate = scenes.filter(
    (scene) => Boolean(scene.image_prompt?.trim()) && !scene.image_url,
  )

  const outputDir = await ensureOutputDir(videoProjectId)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  let generated = 0

  for (const scene of scenesToGenerate) {
    const { error: generatingError } = await supabase
      .from("video_scenes")
      .update({ image_status: "generating" })
      .eq("id", scene.id)

    if (generatingError) {
      throw new Error(generatingError.message)
    }

    const imageUrl = await generateImage(
      openai,
      scene.image_prompt.trim(),
      outputDir,
      `scene-${scene.scene_index}.png`,
    )

    const { error: updateError } = await supabase
      .from("video_scenes")
      .update({
        image_url: imageUrl,
        image_status: "ready",
      })
      .eq("id", scene.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    generated += 1
  }

  const { error: projectUpdateError } = await supabase
    .from("video_projects")
    .update({ image_generation_status: "ready" })
    .eq("id", videoProjectId)
    .eq("user_id", userId)

  if (projectUpdateError) {
    throw new Error(projectUpdateError.message)
  }

  return { generated }
}
