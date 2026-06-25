import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { createClient } from "@supabase/supabase-js"
import { spawn } from "node:child_process"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")

function loadEnvLocal() {
  const envPath = path.join(rootDir, ".env.local")
  if (!fs.existsSync(envPath)) return

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const eq = trimmed.indexOf("=")
    if (eq === -1) continue

    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

loadEnvLocal()

const contentPostId = process.argv[2]?.trim()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase env vars.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

function resolveVideoUrl(project) {
  return (
    project.final_render_url?.trim() ||
    project.video_url?.trim() ||
    null
  )
}

async function renderFinalVideo(videoProjectId) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.join(rootDir, "scripts/render-final-video-by-id.mjs"), videoProjectId],
      {
        cwd: rootDir,
        env: process.env,
        stdio: ["ignore", "pipe", "pipe"],
      },
    )

    let stdout = ""
    let stderr = ""

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk)
    })
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk)
    })

    child.on("error", reject)
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || stdout || `Render failed with code ${code}`))
        return
      }

      const jsonStart = stdout.lastIndexOf("{")
      const jsonEnd = stdout.lastIndexOf("}")
      const maybeJson =
        jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart
          ? stdout.slice(jsonStart, jsonEnd + 1)
          : null

      if (!maybeJson) {
        reject(new Error(stderr || stdout || "Render did not return JSON"))
        return
      }

      resolve(JSON.parse(maybeJson))
    })
  })
}

async function findTargetPost() {
  if (contentPostId) {
    const { data, error } = await supabase
      .from("content_posts")
      .select("*")
      .eq("id", contentPostId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) throw new Error(`Post not found: ${contentPostId}`)
    return data
  }

  const { data, error } = await supabase
    .from("content_posts")
    .select("*")
    .in("status", ["scheduled", "draft", "failed"])
    .ilike("platform", "%instagram%")
    .order("updated_at", { ascending: false })
    .limit(5)

  if (error) throw new Error(error.message)

  const candidate =
    data?.find(
      (post) =>
        !post.video_url?.trim() &&
        !post.image_url?.trim() &&
        post.video_project_id,
    ) ?? data?.[0]

  if (!candidate) {
    throw new Error("No Instagram video post found to repair.")
  }

  return candidate
}

async function main() {
  const post = await findTargetPost()
  console.log("Repairing post:", post.id, "-", post.title)

  let videoProjectId = post.video_project_id?.trim()

  if (!videoProjectId) {
    const { data: linkedProject } = await supabase
      .from("video_projects")
      .select("id")
      .eq("content_post_id", post.id)
      .maybeSingle()

    videoProjectId = linkedProject?.id?.trim() ?? ""
  }

  if (!videoProjectId) {
    throw new Error("Post is not linked to a video project.")
  }

  let { data: project, error: projectError } = await supabase
    .from("video_projects")
    .select("*")
    .eq("id", videoProjectId)
    .single()

  if (projectError || !project) {
    throw new Error(projectError?.message ?? "Video project not found.")
  }

  let videoUrl = resolveVideoUrl(project)

  if (!videoUrl) {
    console.log("No rendered video yet. Starting final render for", videoProjectId)
    const renderResult = await renderFinalVideo(videoProjectId)

    if (!renderResult.ok || !renderResult.videoUrl) {
      throw new Error(renderResult.error ?? "Final render failed.")
    }

    videoUrl = renderResult.videoUrl
    console.log("Render complete:", videoUrl)
  } else {
    console.log("Using existing video URL:", videoUrl)
  }

  const { data: updatedPost, error: updateError } = await supabase
    .from("content_posts")
    .update({
      video_url: videoUrl,
      video_project_id: videoProjectId,
      publish_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", post.id)
    .select("*")
    .single()

  if (updateError || !updatedPost) {
    throw new Error(updateError?.message ?? "Failed to update content post.")
  }

  await supabase
    .from("video_projects")
    .update({
      content_post_id: post.id,
      final_render_url: videoUrl,
      video_url: videoUrl,
      final_render_status: "ready",
      final_render_error: null,
    })
    .eq("id", videoProjectId)

  console.log(JSON.stringify({
    ok: true,
    contentPostId: updatedPost.id,
    videoProjectId,
    videoUrl: updatedPost.video_url,
    status: updatedPost.status,
    message: "Post is ready for Instagram publish.",
  }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
