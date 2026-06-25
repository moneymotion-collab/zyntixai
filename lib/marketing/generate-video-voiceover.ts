import OpenAI from "openai"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { isAiMockMode } from "@/lib/ai-coach/mock-mode"
import { loadOrCreateBrandProfile } from "@/lib/marketing/brand-profile"
import { buildVoiceoverScript } from "@/lib/marketing/build-voiceover-script"
import { generateSubtitlesFromVoiceover } from "@/lib/subtitles"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  ensureMarketingVoiceoverBucket,
  MARKETING_VOICEOVER_BUCKET,
} from "@/lib/supabase/ensure-storage-bucket"

const VOICEOVER_BUCKET = MARKETING_VOICEOVER_BUCKET

type GenerateVideoVoiceoverInput = {
  supabase: SupabaseClient<Database>
  videoProjectId: string
  userId: string
}

type OpenAiTtsVoice =
  | "alloy"
  | "ash"
  | "coral"
  | "echo"
  | "fable"
  | "nova"
  | "onyx"
  | "sage"
  | "shimmer"

export function parseVideoProjectId(body: unknown): string {
  if (!body || typeof body !== "object") return ""

  const record = body as { videoProjectId?: unknown; videoId?: unknown }

  if (typeof record.videoProjectId === "string" && record.videoProjectId.trim()) {
    return record.videoProjectId.trim()
  }

  if (typeof record.videoId === "string" && record.videoId.trim()) {
    return record.videoId.trim()
  }

  return ""
}

export function resolveTtsVoice(mascotVoiceTone?: string | null): OpenAiTtsVoice {
  const tone = mascotVoiceTone?.toLowerCase() ?? ""

  if (tone.includes("warm") || tone.includes("friendly") || tone.includes("approachable")) {
    return "nova"
  }

  if (tone.includes("energetic") || tone.includes("upbeat") || tone.includes("motivational")) {
    return "shimmer"
  }

  if (tone.includes("calm") || tone.includes("soothing")) {
    return "sage"
  }

  return "onyx"
}

function createSilentMp3Buffer(): Buffer {
  // Minimal valid MPEG frame (silence) for local/mock runs.
  return Buffer.from([
    0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00,
  ])
}

async function synthesizeVoiceoverMp3(
  script: string,
  voice: OpenAiTtsVoice,
): Promise<Buffer> {
  if (isAiMockMode() || !process.env.OPENAI_API_KEY) {
    return createSilentMp3Buffer()
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice,
    input: script,
  })

  return Buffer.from(await response.arrayBuffer())
}

function buildVoiceoverStoragePath(userId: string, videoProjectId: string): string {
  return `${userId}/${videoProjectId}.mp3`
}

function getPublicVoiceoverUrl(storagePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.")
  }

  return `${supabaseUrl}/storage/v1/object/public/${VOICEOVER_BUCKET}/${storagePath}`
}

async function uploadVoiceoverMp3(
  userId: string,
  videoProjectId: string,
  audio: Buffer,
): Promise<string> {
  const storagePath = buildVoiceoverStoragePath(userId, videoProjectId)
  const admin = createAdminClient()

  await ensureMarketingVoiceoverBucket(admin)

  const { error } = await admin.storage.from(VOICEOVER_BUCKET).upload(storagePath, audio, {
    contentType: "audio/mpeg",
    upsert: true,
  })

  if (error) {
    throw new Error(`Failed to upload voiceover: ${error.message}`)
  }

  const { data } = admin.storage.from(VOICEOVER_BUCKET).getPublicUrl(storagePath)

  return data.publicUrl || getPublicVoiceoverUrl(storagePath)
}

export async function generateVideoVoiceover({
  supabase,
  videoProjectId,
  userId,
}: GenerateVideoVoiceoverInput): Promise<{
  voiceoverUrl: string
  voiceoverScript: string
  subtitles: ReturnType<typeof generateSubtitlesFromVoiceover>
}> {
  const { data: project, error: projectError } = await supabase
    .from("video_projects")
    .select("id, brand_name, hook, cta, workflow_summary")
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
    .select(
      "scene_index, text, narration, overlay_text, professional_purpose, workflow_step, duration",
    )
    .eq("video_id", videoProjectId)
    .order("scene_index", { ascending: true })

  if (scenesError) {
    throw new Error(scenesError.message)
  }

  if (!scenes?.length) {
    throw new Error("No scenes found for this video.")
  }

  const voiceoverScript = await buildVoiceoverScript(scenes, {
    brandName: project.brand_name,
    workflowSummary: project.workflow_summary,
    hook: project.hook,
    cta: project.cta,
  })

  if (!voiceoverScript.trim()) {
    throw new Error("No narration or scene text available for voiceover.")
  }

  const { error: generatingError } = await supabase
    .from("video_projects")
    .update({ voiceover_status: "generating" })
    .eq("id", videoProjectId)
    .eq("user_id", userId)

  if (generatingError) {
    throw new Error(generatingError.message)
  }

  try {
    const { profile: brandProfile } = await loadOrCreateBrandProfile(supabase, userId)
    const voice = resolveTtsVoice(brandProfile?.mascot_voice_tone)
    const audio = await synthesizeVoiceoverMp3(voiceoverScript, voice)
    const voiceoverUrl = await uploadVoiceoverMp3(userId, videoProjectId, audio)
    const subtitles = generateSubtitlesFromVoiceover(voiceoverScript, {
      sceneDurations: (scenes ?? [])
        .map((scene) => scene.duration)
        .filter((value): value is number => typeof value === "number" && value > 0),
      bookendSeconds: 4,
    })

    const { error: readyError } = await supabase
      .from("video_projects")
      .update({
        voiceover_status: "ready",
        voiceover_url: voiceoverUrl,
        voiceover_script: voiceoverScript,
      })
      .eq("id", videoProjectId)
      .eq("user_id", userId)

    if (readyError) {
      throw new Error(readyError.message)
    }

    return { voiceoverUrl, voiceoverScript, subtitles }
  } catch (error) {
    await supabase
      .from("video_projects")
      .update({ voiceover_status: "failed" })
      .eq("id", videoProjectId)
      .eq("user_id", userId)

    throw error
  }
}
