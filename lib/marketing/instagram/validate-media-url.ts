export type InstagramMediaType = "IMAGE" | "VIDEO" | "REEL"

export function validateInstagramMediaUrl(
  mediaUrl: string | null | undefined,
): { ok: true; url: string } | { ok: false; error: string } {
  const url = mediaUrl?.trim()

  if (!url) {
    return {
      ok: false,
      error: "media_url is required to publish to Instagram.",
    }
  }

  if (!url.startsWith("https://")) {
    if (url.startsWith("/") || url.startsWith("file:")) {
      return {
        ok: false,
        error:
          "media_url must be a public HTTPS URL. Local or relative paths (e.g. /renders/…) cannot be published to Instagram.",
      }
    }

    return {
      ok: false,
      error: "media_url must be a public HTTPS URL (https://…).",
    }
  }

  let parsed: URL

  try {
    parsed = new URL(url)
  } catch {
    return {
      ok: false,
      error: "media_url is not a valid URL.",
    }
  }

  const hostname = parsed.hostname.toLowerCase()

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".localhost")
  ) {
    return {
      ok: false,
      error:
        "media_url cannot use localhost. Upload media to public storage (e.g. Supabase Storage) and use the HTTPS URL.",
    }
  }

  return { ok: true, url }
}

export function inferInstagramMediaType(
  mediaUrl: string,
  explicitType?: string | null,
): InstagramMediaType {
  const normalized = explicitType?.trim().toUpperCase()

  if (normalized === "IMAGE" || normalized === "VIDEO" || normalized === "REEL") {
    return normalized
  }

  const path = mediaUrl.split("?")[0]?.toLowerCase() ?? ""

  if (/\.(mp4|mov|m4v|webm)$/.test(path)) {
    return "REEL"
  }

  return "IMAGE"
}
