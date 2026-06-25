import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, Json } from "@/lib/database.types"
import type { VideoScript } from "@/lib/marketing/video-script-types"
import { createAdminClient } from "@/lib/supabase/admin"

export const GENERATED_VIDEO_STATUS = {
  DRAFT: "draft",
  CREATING: "creating",
  CREATED: "created",
  RENDERING: "rendering",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const

export type GeneratedVideoStatus =
  (typeof GENERATED_VIDEO_STATUS)[keyof typeof GENERATED_VIDEO_STATUS]

export type GeneratedVideoRow =
  Database["public"]["Tables"]["generated_videos"]["Row"]

export type CreateGeneratedVideoDraftInput = {
  userId: string
  title: string
  prompt: string
  videoType: string
  script?: VideoScript | Record<string, unknown> | null
  videoProjectId?: string | null
  renderType?: "preview" | "final"
}

export function formatSupabaseError(
  error: { message: string; code?: string; details?: string; hint?: string },
): string {
  const parts = [error.message]
  if (error.code) parts.push(`code=${error.code}`)
  if (error.details) parts.push(`details=${error.details}`)
  if (error.hint) parts.push(`hint=${error.hint}`)
  return parts.join(" | ")
}

function isSchemaMismatchError(
  error: { message?: string; code?: string } | null | undefined,
): boolean {
  if (!error) return false
  const message = (error.message ?? "").toLowerCase()
  return (
    error.code === "42703" ||
    error.code === "23514" ||
    error.code === "PGRST204" ||
    message.includes("could not find") ||
    message.includes("column") ||
    message.includes("check constraint") ||
    message.includes("generated_video_id")
  )
}

function extractMissingVideoProjectsColumn(
  error: { message?: string } | null | undefined,
): string | null {
  const message = error?.message ?? ""
  const pgrstMatch = message.match(
    /Could not find the '([^']+)' column of 'video_projects'/i,
  )
  if (pgrstMatch?.[1]) return pgrstMatch[1]

  const pgMatch = message.match(
    /column video_projects\.([a-z_0-9]+) does not exist/i,
  )
  return pgMatch?.[1] ?? null
}

function extractMissingGeneratedVideosColumn(
  error: { message?: string } | null | undefined,
): string | null {
  const message = error?.message ?? ""
  const pgrstMatch = message.match(
    /Could not find the '([^']+)' column of 'generated_videos'/i,
  )
  if (pgrstMatch?.[1]) return pgrstMatch[1]

  const pgMatch = message.match(
    /column generated_videos\.([a-z_0-9]+) does not exist/i,
  )
  return pgMatch?.[1] ?? null
}

const SCHEMA_REPAIR_HINT =
  "Run supabase/scripts/repair-generated-videos-schema.sql in the Supabase SQL Editor, then retry."

const VIDEO_PROJECTS_RENDER_REPAIR_HINT =
  "Run supabase/scripts/repair-video-projects-render-schema.sql in the Supabase SQL Editor, then retry."

const RLS_REPAIR_HINT =
  "Run supabase/scripts/repair-generated-videos-rls.sql in the Supabase SQL Editor, then retry."

function isRlsError(
  error: { message?: string; code?: string } | null | undefined,
): boolean {
  if (!error) return false
  const message = (error.message ?? "").toLowerCase()
  return (
    error.code === "42501" ||
    message.includes("row-level security") ||
    message.includes("violates row-level security")
  )
}

function getServiceRoleWriteClient(): SupabaseClient<Database> | null {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

/** Prefer service role for server-side writes after auth (bypasses RLS misconfiguration). */
function resolveGeneratedVideosWriteClient(
  userClient: SupabaseClient<Database>,
): SupabaseClient<Database> {
  return getServiceRoleWriteClient() ?? userClient
}

async function tryInsertGeneratedVideo(
  supabase: SupabaseClient<Database>,
  payloads: Record<string, unknown>[],
): Promise<GeneratedVideoRow> {
  let lastError: { message: string; code?: string } | null = null
  const writeClient = resolveGeneratedVideosWriteClient(supabase)
  const clients =
    writeClient === supabase
      ? [supabase]
      : [writeClient, supabase]

  for (const client of clients) {
    for (const payload of payloads) {
      const { data, error } = await client
        .from("generated_videos")
        .insert(payload as Database["public"]["Tables"]["generated_videos"]["Insert"])
        .select("*")
        .single()

      if (!error && data?.id) {
        return data
      }

      lastError = error
      console.warn("GENERATED_VIDEOS_INSERT_ATTEMPT_FAILED:", error?.message, payload)

      if (error && !isSchemaMismatchError(error)) {
        if (client === supabase && isRlsError(error) && clients.length > 1) {
          break
        }
        if (client === clients[clients.length - 1]) {
          break
        }
        continue
      }
    }

    if (lastError && !isSchemaMismatchError(lastError) && !isRlsError(lastError)) {
      break
    }
  }

  console.error("GENERATED_VIDEOS_INSERT_ERROR:", lastError)
  const hint = isRlsError(lastError) ? RLS_REPAIR_HINT : SCHEMA_REPAIR_HINT
  throw new Error(
    `${formatSupabaseError(lastError ?? { message: "Insert failed" })} — ${hint}`,
  )
}

function buildGeneratedVideoInsertPayloads(
  input: CreateGeneratedVideoDraftInput,
  userId: string,
  title: string,
  prompt: string,
  videoType: string,
  scriptPayload: Json | null,
): Record<string, unknown>[] {
  const videoProjectId = input.videoProjectId?.trim() || null
  const renderType = input.renderType ?? "preview"

  const withUser = { user_id: userId }
  const withCreateFlow = {
    ...withUser,
    title,
    prompt,
    video_type: videoType,
  }
  const withScript = scriptPayload
    ? { ...withCreateFlow, script: scriptPayload }
    : null

  // PostgREST rejects unknown column keys even when null — try minimal payloads first.
  const payloads: Record<string, unknown>[] = [
    { ...withCreateFlow, status: GENERATED_VIDEO_STATUS.DRAFT },
    { ...withUser, status: GENERATED_VIDEO_STATUS.DRAFT },
    { ...withUser, status: GENERATED_VIDEO_STATUS.PROCESSING },
  ]

  if (withScript) {
    payloads.unshift({
      ...withScript,
      status: GENERATED_VIDEO_STATUS.DRAFT,
    })
  }

  if (videoProjectId) {
    payloads.push(
      {
        ...withCreateFlow,
        video_project_id: videoProjectId,
        status: GENERATED_VIDEO_STATUS.DRAFT,
      },
      {
        ...withCreateFlow,
        video_project_id: videoProjectId,
        render_type: renderType,
        status: GENERATED_VIDEO_STATUS.DRAFT,
      },
    )

    if (withScript) {
      payloads.push({
        ...withScript,
        video_project_id: videoProjectId,
        status: GENERATED_VIDEO_STATUS.CREATED,
      })
    }

    payloads.push(
      {
        user_id: userId,
        video_project_id: videoProjectId,
        render_type: renderType,
        status: GENERATED_VIDEO_STATUS.PROCESSING,
      },
      {
        user_id: userId,
        video_project_id: videoProjectId,
        status: GENERATED_VIDEO_STATUS.PROCESSING,
      },
    )
  }

  return payloads.filter(
    (payload): payload is Record<string, unknown> => payload != null,
  )
}

async function insertMinimalGeneratedVideo(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<GeneratedVideoRow> {
  return tryInsertGeneratedVideo(supabase, [
    { user_id: userId, status: GENERATED_VIDEO_STATUS.DRAFT },
    { user_id: userId, status: GENERATED_VIDEO_STATUS.PROCESSING },
    { user_id: userId, status: GENERATED_VIDEO_STATUS.CREATED },
  ])
}

export async function insertGeneratedVideoDraft(
  supabase: SupabaseClient<Database>,
  input: CreateGeneratedVideoDraftInput,
): Promise<GeneratedVideoRow> {
  const userId = input.userId?.trim()
  if (!userId) {
    throw new Error("user_id is required for generated_videos insert")
  }

  const title = input.title?.trim()
  const prompt = input.prompt?.trim()
  const videoType = input.videoType?.trim()

  if (!title) {
    throw new Error("title is required for generated_videos insert")
  }
  if (!prompt) {
    throw new Error("prompt is required for generated_videos insert")
  }
  if (!videoType) {
    throw new Error("video_type is required for generated_videos insert")
  }

  const scriptPayload: Json | null =
    input.script != null ? (input.script as unknown as Json) : null

  try {
    return await tryInsertGeneratedVideo(
      supabase,
      buildGeneratedVideoInsertPayloads(
        input,
        userId,
        title,
        prompt,
        videoType,
        scriptPayload,
      ),
    )
  } catch (error) {
    if (
      isSchemaMismatchError(
        error instanceof Error ? { message: error.message } : null,
      )
    ) {
      console.warn(
        "GENERATED_VIDEOS_INSERT_FALLBACK_MINIMAL:",
        error instanceof Error ? error.message : error,
      )
      return insertMinimalGeneratedVideo(supabase, userId)
    }

    throw error
  }
}

export async function linkGeneratedVideoToProject(
  supabase: SupabaseClient<Database>,
  videoProjectId: string,
  generatedVideoId: string,
): Promise<void> {
  const writeClient = resolveGeneratedVideosWriteClient(supabase)
  const { error } = await writeClient
    .from("video_projects")
    .update({ generated_video_id: generatedVideoId })
    .eq("id", videoProjectId)

  if (error) {
    console.error("GENERATED_VIDEOS_LINK_PROJECT_ERROR:", error)

    if (isSchemaMismatchError(error)) {
      console.warn(
        "Skipping generated_video_id link — column missing. Run supabase/scripts/add-video-projects-generated-video-id.sql",
      )
      return
    }

    throw new Error(formatSupabaseError(error))
  }
}

export type VideoProjectRenderRow = {
  id: string
  user_id: string
  brand_name: string
  prompt: string
  style: string | null
  generated_video_id?: string | null
}

export async function loadVideoProjectForRender(
  supabase: SupabaseClient<Database>,
  videoProjectId: string,
  userId: string,
): Promise<VideoProjectRenderRow | null> {
  const baseSelect = "id,user_id,brand_name,prompt,style"

  const withLink = await supabase
    .from("video_projects")
    .select(`${baseSelect},generated_video_id`)
    .eq("id", videoProjectId)
    .eq("user_id", userId)
    .maybeSingle()

  if (!withLink.error) {
    return withLink.data as VideoProjectRenderRow | null
  }

  if (!isSchemaMismatchError(withLink.error)) {
    throw new Error(formatSupabaseError(withLink.error))
  }

  console.warn(
    "video_projects.generated_video_id missing on select — run add-video-projects-generated-video-id.sql",
  )

  const fallback = await supabase
    .from("video_projects")
    .select(baseSelect)
    .eq("id", videoProjectId)
    .eq("user_id", userId)
    .maybeSingle()

  if (fallback.error) {
    throw new Error(formatSupabaseError(fallback.error))
  }

  return fallback.data as VideoProjectRenderRow | null
}

export async function patchVideoProjectForRender(
  supabase: SupabaseClient<Database>,
  videoProjectId: string,
  userId: string,
  patch: Database["public"]["Tables"]["video_projects"]["Update"],
  linkGeneratedVideoId?: string | null,
): Promise<void> {
  const writeClient = resolveGeneratedVideosWriteClient(supabase)
  let payload: Record<string, unknown> = {
    ...patch,
    ...(linkGeneratedVideoId != null
      ? { generated_video_id: linkGeneratedVideoId }
      : {}),
  }

  for (let attempt = 0; attempt < 12; attempt++) {
    const cleaned = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    )

    if (Object.keys(cleaned).length === 0) {
      return
    }

    const { error } = await writeClient
      .from("video_projects")
      .update(
        cleaned as Database["public"]["Tables"]["video_projects"]["Update"],
      )
      .eq("id", videoProjectId)
      .eq("user_id", userId)

    if (!error) {
      return
    }

    if (!isSchemaMismatchError(error)) {
      throw new Error(formatSupabaseError(error))
    }

    const missingColumn = extractMissingVideoProjectsColumn(error)
    if (!missingColumn || !(missingColumn in cleaned)) {
      throw new Error(
        `${formatSupabaseError(error)} — ${VIDEO_PROJECTS_RENDER_REPAIR_HINT}`,
      )
    }

    console.warn(
      `Skipping video_projects.${missingColumn} — column missing. ${VIDEO_PROJECTS_RENDER_REPAIR_HINT}`,
    )
    const { [missingColumn]: _omit, ...rest } = cleaned
    payload = rest
  }

  throw new Error(
    `Could not update video_projects after removing unknown columns — ${VIDEO_PROJECTS_RENDER_REPAIR_HINT}`,
  )
}

export type VideoProjectRenderStatusRow = {
  id: string
  status: string
  render_status?: string
  video_url: string | null
  render_error?: string | null
  render_started_at?: string | null
  render_finished_at?: string | null
}

export async function loadVideoProjectRenderStatus(
  supabase: SupabaseClient<Database>,
  videoProjectId: string,
  userId: string,
): Promise<VideoProjectRenderStatusRow | null> {
  let columns = [
    "id",
    "status",
    "render_status",
    "video_url",
    "render_error",
    "render_started_at",
    "render_finished_at",
  ]

  for (let attempt = 0; attempt < columns.length + 1; attempt++) {
    const select = columns.join(",")

    const { data, error } = await supabase
      .from("video_projects")
      .select(select)
      .eq("id", videoProjectId)
      .eq("user_id", userId)
      .maybeSingle()

    if (!error) {
      return data as VideoProjectRenderStatusRow | null
    }

    if (!isSchemaMismatchError(error)) {
      throw new Error(formatSupabaseError(error))
    }

    const missingColumn = extractMissingVideoProjectsColumn(error)
    if (!missingColumn) {
      throw new Error(formatSupabaseError(error))
    }

    console.warn(
      `video_projects.${missingColumn} missing on select — ${VIDEO_PROJECTS_RENDER_REPAIR_HINT}`,
    )
    columns = columns.filter((column) => column !== missingColumn)

    if (columns.length === 0) {
      return null
    }
  }

  return null
}

export async function getLatestGeneratedVideoForProject(
  supabase: SupabaseClient<Database>,
  videoProjectId: string,
  userId: string,
): Promise<GeneratedVideoRow | null> {
  const { data, error } = await supabase
    .from("generated_videos")
    .select("*")
    .eq("video_project_id", videoProjectId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!error) {
    return data
  }

  if (!isSchemaMismatchError(error)) {
    console.error("GENERATED_VIDEOS_SELECT_ERROR:", error)
    throw new Error(formatSupabaseError(error))
  }

  const { data: project, error: projectError } = await supabase
    .from("video_projects")
    .select("generated_video_id")
    .eq("id", videoProjectId)
    .eq("user_id", userId)
    .maybeSingle()

  if (projectError) {
    if (isSchemaMismatchError(projectError)) {
      return null
    }
    console.error("GENERATED_VIDEOS_PROJECT_LOOKUP_ERROR:", projectError)
    throw new Error(formatSupabaseError(projectError))
  }

  const generatedVideoId = project?.generated_video_id?.trim()
  if (!generatedVideoId) {
    return null
  }

  return getGeneratedVideoForUser(supabase, generatedVideoId, userId)
}

export async function updateGeneratedVideo(
  supabase: SupabaseClient<Database>,
  generatedVideoId: string,
  patch: Database["public"]["Tables"]["generated_videos"]["Update"],
): Promise<GeneratedVideoRow> {
  let lastError: { message: string; code?: string } | null = null
  const writeClient = resolveGeneratedVideosWriteClient(supabase)
  const clients =
    writeClient === supabase
      ? [supabase]
      : [writeClient, supabase]

  let payload: Record<string, unknown> = { ...patch }

  for (const client of clients) {
    let attemptPayload = { ...payload }

    for (let attempt = 0; attempt < 12; attempt++) {
      const cleaned = Object.fromEntries(
        Object.entries(attemptPayload).filter(([, value]) => value !== undefined),
      ) as Database["public"]["Tables"]["generated_videos"]["Update"]

      if (Object.keys(cleaned).length === 0) {
        break
      }

      const { data, error } = await client
        .from("generated_videos")
        .update(cleaned)
        .eq("id", generatedVideoId)
        .select("*")
        .single()

      if (!error && data) {
        return data
      }

      lastError = error

      if (error && isSchemaMismatchError(error)) {
        const missingColumn = extractMissingGeneratedVideosColumn(error)
        if (missingColumn && missingColumn in cleaned) {
          console.warn(
            `Skipping generated_videos.${missingColumn} — column missing. ${SCHEMA_REPAIR_HINT}`,
          )
          const rest = { ...cleaned } as Record<string, unknown>
          delete rest[missingColumn]
          attemptPayload = rest
          continue
        }
      }

      if (error && !isSchemaMismatchError(error)) {
        if (client === supabase && isRlsError(error) && clients.length > 1) {
          break
        }
        if (client === clients[clients.length - 1]) {
          break
        }
      } else if (error && isSchemaMismatchError(error)) {
        break
      }
    }

    if (lastError && !isSchemaMismatchError(lastError) && !isRlsError(lastError)) {
      break
    }
  }

  console.error("GENERATED_VIDEOS_UPDATE_ERROR:", lastError)

  const { data: existing, error: readError } = await supabase
    .from("generated_videos")
    .select("*")
    .eq("id", generatedVideoId)
    .maybeSingle()

  if (!readError && existing) {
    console.warn(
      "Returning existing generated_videos row after partial update failure",
    )
    return existing
  }

  throw new Error(
    `${formatSupabaseError(lastError ?? { message: "Update failed" })} — ${
      isRlsError(lastError) ? RLS_REPAIR_HINT : SCHEMA_REPAIR_HINT
    }`,
  )
}

export async function getGeneratedVideoForUser(
  supabase: SupabaseClient<Database>,
  generatedVideoId: string,
  userId: string,
): Promise<GeneratedVideoRow | null> {
  const { data, error } = await supabase
    .from("generated_videos")
    .select("*")
    .eq("id", generatedVideoId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("GENERATED_VIDEOS_SELECT_ERROR:", error)
    throw new Error(formatSupabaseError(error))
  }

  return data
}

export type GeneratedVideoFlowState =
  | "idle"
  | "creating"
  | "created"
  | "rendering"
  | "failed"
  | "completed"

export function deriveGeneratedVideoFlowState(input: {
  flowState?: GeneratedVideoFlowState
  generatedVideo?: Pick<GeneratedVideoRow, "status" | "video_url"> | null
  isCreating?: boolean
  isRendering?: boolean
}): GeneratedVideoFlowState {
  if (input.isCreating) return "creating"
  if (input.isRendering) return "rendering"

  const status = input.generatedVideo?.status?.trim().toLowerCase()
  if (status === GENERATED_VIDEO_STATUS.FAILED) return "failed"
  if (
    status === GENERATED_VIDEO_STATUS.COMPLETED &&
    typeof input.generatedVideo?.video_url === "string" &&
    input.generatedVideo.video_url.trim()
  ) {
    return "completed"
  }
  if (
    status === GENERATED_VIDEO_STATUS.RENDERING ||
    status === GENERATED_VIDEO_STATUS.PROCESSING
  ) {
    return "rendering"
  }
  if (status === GENERATED_VIDEO_STATUS.CREATED) return "created"
  if (status === GENERATED_VIDEO_STATUS.DRAFT) return "created"

  return input.flowState ?? "idle"
}
