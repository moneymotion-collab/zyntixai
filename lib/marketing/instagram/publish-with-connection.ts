import {
  inferInstagramMediaType,
  validateInstagramMediaUrl,
  type InstagramMediaType,
} from "@/lib/marketing/instagram/validate-media-url"

export type InstagramConnection = {
  access_token: string
  instagram_business_account_id: string
}

export type InstagramPublishInput = {
  caption: string
  mediaUrl?: string | null
  mediaType?: InstagramMediaType | string | null
  imageUrl?: string | null
  videoUrl?: string | null
}

export type InstagramPublishHooks = {
  onContainerCreated?: (containerId: string) => void | Promise<void>
}

type GraphErrorPayload = {
  id?: string
  status?: string
  status_code?: string
  error?: { message: string }
}

const GRAPH_API_VERSION = "v19.0"

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function resolveInstagramMedia(
  input: InstagramPublishInput,
):
  | { ok: true; mediaUrl: string; mediaType: InstagramMediaType }
  | { ok: false; error: string } {
  if (input.mediaUrl?.trim()) {
    const validated = validateInstagramMediaUrl(input.mediaUrl)
    if (!validated.ok) {
      return validated
    }

    return {
      ok: true,
      mediaUrl: validated.url,
      mediaType: inferInstagramMediaType(validated.url, input.mediaType),
    }
  }

  const videoUrl = input.videoUrl?.trim()
  if (videoUrl) {
    const validated = validateInstagramMediaUrl(videoUrl)
    if (!validated.ok) {
      return validated
    }

    return {
      ok: true,
      mediaUrl: validated.url,
      mediaType: inferInstagramMediaType(validated.url, input.mediaType ?? "REEL"),
    }
  }

  const imageUrl = input.imageUrl?.trim()
  if (imageUrl) {
    const validated = validateInstagramMediaUrl(imageUrl)
    if (!validated.ok) {
      return validated
    }

    return {
      ok: true,
      mediaUrl: validated.url,
      mediaType: "IMAGE",
    }
  }

  return {
    ok: false,
    error: "Post needs a public media_url, image_url, or video_url to publish to Instagram.",
  }
}

function buildCreateMediaParams(
  mediaUrl: string,
  mediaType: InstagramMediaType,
  caption: string,
  accessToken: string,
): URLSearchParams {
  const params = new URLSearchParams({
    caption,
    access_token: accessToken,
  })

  if (mediaType === "IMAGE") {
    params.set("image_url", mediaUrl)
    return params
  }

  params.set("media_type", "REELS")
  params.set("video_url", mediaUrl)
  params.set("share_to_feed", "true")
  return params
}

async function waitForMediaContainerReady(
  containerId: string,
  accessToken: string,
  options: { isVideo: boolean },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const delayMs = options.isVideo ? 5000 : 2000
  const maxAttempts = options.isVideo ? 60 : 15

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const statusRes = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${containerId}?fields=status_code,status&access_token=${encodeURIComponent(accessToken)}`,
    )

    const statusPayload = (await statusRes.json()) as GraphErrorPayload

    console.log("[instagram] container status response", {
      containerId,
      attempt: attempt + 1,
      httpStatus: statusRes.status,
      status: statusPayload.status ?? null,
      status_code: statusPayload.status_code ?? null,
      error: statusPayload.error?.message ?? null,
    })

    if (!statusRes.ok) {
      return {
        ok: false,
        error:
          statusPayload.error?.message ??
          "Could not check Instagram media processing status.",
      }
    }

    const statusCode = statusPayload.status_code?.trim().toUpperCase()

    if (statusCode === "FINISHED") {
      return { ok: true }
    }

    if (statusCode === "ERROR") {
      return {
        ok: false,
        error:
          statusPayload.error?.message ??
          "Instagram rejected the media while processing. Use a public MP4 video URL (H.264) or a valid image URL.",
      }
    }

    if (statusCode === "EXPIRED") {
      return {
        ok: false,
        error: "Instagram media container expired before publish. Please try again.",
      }
    }

    if (attempt < maxAttempts - 1) {
      await sleep(delayMs)
    }
  }

  return {
    ok: false,
    error: options.isVideo
      ? "Instagram is still processing the video. Wait a minute and try publishing again."
      : "Instagram is still processing the image. Please try again shortly.",
  }
}

export async function publishInstagramWithConnection(
  connection: InstagramConnection,
  input: InstagramPublishInput,
  hooks?: InstagramPublishHooks,
): Promise<
  | {
      ok: true
      externalPostId: string
      containerId: string
      mediaId: string
    }
  | { ok: false; error: string; containerId?: string }
> {
  const accessToken = connection.access_token.trim()
  const igUserId = connection.instagram_business_account_id.trim()

  if (!accessToken || !igUserId) {
    return {
      ok: false,
      error: "Instagram connection is missing access token or business account id.",
    }
  }

  const resolved = resolveInstagramMedia(input)
  if (!resolved.ok) {
    console.error("[instagram] media validation failed", {
      error: resolved.error,
      mediaUrl: input.mediaUrl ?? input.videoUrl ?? input.imageUrl ?? null,
    })
    return resolved
  }

  const { mediaUrl, mediaType } = resolved
  const isVideo = mediaType !== "IMAGE"

  console.log("[instagram] publishing media", {
    igUserId,
    mediaType,
    media_url: mediaUrl,
  })

  const createParams = buildCreateMediaParams(
    mediaUrl,
    mediaType,
    input.caption,
    accessToken,
  )

  const createRes = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${igUserId}/media`,
    {
      method: "POST",
      body: createParams,
    },
  )

  const createPayload = (await createRes.json()) as GraphErrorPayload

  console.log("[instagram] create container response", {
    httpStatus: createRes.status,
    containerId: createPayload.id ?? null,
    error: createPayload.error?.message ?? null,
    media_url: mediaUrl,
  })

  if (!createRes.ok || !createPayload.id) {
    return {
      ok: false,
      error: createPayload.error?.message ?? "Instagram media creation failed.",
    }
  }

  const containerId = createPayload.id

  if (hooks?.onContainerCreated) {
    await hooks.onContainerCreated(containerId)
  }

  const containerReady = await waitForMediaContainerReady(
    containerId,
    accessToken,
    { isVideo },
  )

  if (!containerReady.ok) {
    return {
      ok: false,
      error: containerReady.error,
      containerId,
    }
  }

  const publishRes = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${igUserId}/media_publish`,
    {
      method: "POST",
      body: new URLSearchParams({
        creation_id: containerId,
        access_token: accessToken,
      }),
    },
  )

  const publishPayload = (await publishRes.json()) as GraphErrorPayload

  console.log("[instagram] publish response", {
    httpStatus: publishRes.status,
    mediaId: publishPayload.id ?? null,
    containerId,
    error: publishPayload.error?.message ?? null,
  })

  if (!publishRes.ok || !publishPayload.id) {
    return {
      ok: false,
      error: publishPayload.error?.message ?? "Instagram publish failed.",
      containerId,
    }
  }

  return {
    ok: true,
    externalPostId: publishPayload.id,
    containerId,
    mediaId: publishPayload.id,
  }
}
