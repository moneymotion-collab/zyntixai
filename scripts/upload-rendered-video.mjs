import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { createClient } from "@supabase/supabase-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")
const VIDEO_BUCKET = process.env.VIDEO_RENDER_BUCKET || "videos"

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
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvLocal()

const videoProjectId = process.argv[2]?.trim()
const contentPostId = process.argv[3]?.trim()

if (!videoProjectId) {
  console.error("Usage: node scripts/upload-rendered-video.mjs <videoProjectId> [contentPostId]")
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

function getPublicVideoUrl(storagePath) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${VIDEO_BUCKET}/${storagePath}`
}

async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets()
  if (error) throw new Error(error.message)

  if (buckets?.some((bucket) => bucket.name === VIDEO_BUCKET)) {
    return
  }

  const { error: createError } = await supabase.storage.createBucket(VIDEO_BUCKET, {
    public: true,
  })

  if (createError) {
    throw new Error(`Could not create bucket "${VIDEO_BUCKET}": ${createError.message}`)
  }
}

async function main() {
  const localPath = path.join(rootDir, "public", "renders", `final-${videoProjectId}.mp4`)
  if (!fs.existsSync(localPath)) {
    throw new Error(`Local render not found: ${localPath}`)
  }

  const { data: project, error: projectError } = await supabase
    .from("video_projects")
    .select("*")
    .eq("id", videoProjectId)
    .single()

  if (projectError || !project) {
    throw new Error(projectError?.message ?? "Video project not found")
  }

  await ensureBucket()

  const storagePath = `${project.user_id}/${videoProjectId}/final.mp4`
  const mp4Buffer = fs.readFileSync(localPath)

  const { error: uploadError } = await supabase.storage
    .from(VIDEO_BUCKET)
    .upload(storagePath, mp4Buffer, {
      contentType: "video/mp4",
      upsert: true,
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  const finalUrl = getPublicVideoUrl(storagePath)
  const targetPostId = contentPostId || project.content_post_id

  await supabase
    .from("video_projects")
    .update({
      final_render_status: "ready",
      final_render_url: finalUrl,
      video_url: finalUrl,
      final_render_error: null,
    })
    .eq("id", videoProjectId)

  if (targetPostId) {
    await supabase
      .from("content_posts")
      .update({
        video_url: finalUrl,
        video_project_id: videoProjectId,
        publish_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetPostId)
  }

  console.log(JSON.stringify({
    ok: true,
    videoProjectId,
    contentPostId: targetPostId,
    videoUrl: finalUrl,
  }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
