const FACEBOOK_TOKEN_PATTERN = /^EAA[A-Za-z0-9]{95,}$/

export function normalizeInstagramAccessToken(value: string): string {
  return value
    .trim()
    .replace(/^bearer\s+/i, "")
    .replace(/\s+/g, "")
}

export function isInstagramAccessTokenFormatValid(token: string): boolean {
  const normalized = normalizeInstagramAccessToken(token)
  return FACEBOOK_TOKEN_PATTERN.test(normalized)
}

type GraphMeResponse = {
  id?: string
  name?: string
  error?: {
    message?: string
    type?: string
    code?: number
  }
}

export async function verifyInstagramAccessToken(
  accessToken: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = normalizeInstagramAccessToken(accessToken)

  if (!isInstagramAccessTokenFormatValid(normalized)) {
    return {
      ok: false,
      error:
        "This does not look like a valid Meta access token. Paste a Page access token from Meta Graph API Explorer (usually starts with EAA…).",
    }
  }

  const response = await fetch(
    `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${encodeURIComponent(normalized)}`,
  )

  const payload = (await response.json()) as GraphMeResponse

  if (!response.ok || payload.error || !payload.id) {
    return {
      ok: false,
      error:
        payload.error?.message ??
        "Meta rejected this access token. Generate a new long-lived Page access token and try again.",
    }
  }

  return { ok: true }
}

export function maskInstagramAccessToken(token: string): string {
  const normalized = normalizeInstagramAccessToken(token)
  if (!normalized) return ""
  if (normalized.length <= 12) return "••••••••"
  return `${normalized.slice(0, 6)}…${normalized.slice(-4)}`
}
