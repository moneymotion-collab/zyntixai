import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")
const VOICEOVER_BUCKET = "voiceovers"

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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvLocal()

const videoProjectId = process.argv[2]?.trim()

if (!videoProjectId) {
  console.error("Usage: node scripts/repair-voiceover.mjs <videoProjectId>")
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

async function ensureBucket(bucketName) {
  const { data: buckets, error } = await supabase.storage.listBuckets()
  if (error) throw new Error(error.message)

  const existing = buckets?.find((bucket) => bucket.name === bucketName)
  if (existing) {
    if (!existing.public) {
      const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
        public: true,
      })
      if (updateError) throw new Error(updateError.message)
    }
    return
  }

  const { error: createError } = await supabase.storage.createBucket(bucketName, {
    public: true,
  })
  if (createError) throw new Error(createError.message)
}

function resolveSceneLine(scene) {
  return (
    scene.narration?.trim() ||
    scene.professional_purpose?.trim() ||
    scene.text?.trim() ||
    scene.overlay_text?.trim() ||
    ""
  )
}

function buildScriptFromScenes(scenes, project) {
  const parts = []

  const intro = project.hook?.trim() || project.workflow_summary?.trim()
  if (intro) {
    parts.push(intro.replace(/!+/g, "."))
  } else if (project.brand_name?.trim()) {
    parts.push(`${project.brand_name.trim()} helps you run your coaching business in one place.`)
  }

  for (const scene of scenes) {
    const line = resolveSceneLine(scene)
    if (line) parts.push(line.replace(/!+/g, "."))
  }

  if (project.cta?.trim()) {
    parts.push(project.cta.trim().replace(/!+/g, "."))
  }

  return parts.join(" ").replace(/\s{2,}/g, " ").trim()
}

async function main() {
  await ensureBucket(VOICEOVER_BUCKET)

  const { data: project, error } = await supabase
    .from("video_projects")
    .select(
      "id, user_id, voiceover_script, voiceover_url, hook, cta, brand_name, workflow_summary",
    )
    .eq("id", videoProjectId)
    .single()

  if (error || !project) {
    throw new Error(error?.message ?? "Video project not found")
  }

  let script = project.voiceover_script?.trim()

  if (!script) {
    const { data: scenes, error: scenesError } = await supabase
      .from("video_scenes")
      .select(
        "scene_index, text, narration, overlay_text, professional_purpose, workflow_step",
      )
      .eq("video_id", videoProjectId)
      .order("scene_index", { ascending: true })

    if (scenesError) {
      throw new Error(scenesError.message)
    }

    script = buildScriptFromScenes(scenes ?? [], project)

    if (!script) {
      throw new Error("No scene text available to build a voiceover script.")
    }

    console.log(`Built voiceover script from ${scenes?.length ?? 0} scenes (${script.split(/\s+/).length} words).`)
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required to regenerate voiceover audio.")
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: "onyx",
    input: script,
  })

  const audio = Buffer.from(await response.arrayBuffer())
  const storagePath = `${project.user_id}/${videoProjectId}.mp3`

  const { error: uploadError } = await supabase.storage
    .from(VOICEOVER_BUCKET)
    .upload(storagePath, audio, {
      contentType: "audio/mpeg",
      upsert: true,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const voiceoverUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${VOICEOVER_BUCKET}/${storagePath}`

  await supabase
    .from("video_projects")
    .update({
      voiceover_status: "ready",
      voiceover_url: voiceoverUrl,
      voiceover_script: script,
    })
    .eq("id", videoProjectId)

  console.log(JSON.stringify({ ok: true, voiceoverUrl }, null, 2))
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
