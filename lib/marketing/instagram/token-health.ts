import {
  isInstagramAccessTokenFormatValid,
  normalizeInstagramAccessToken,
} from "@/lib/marketing/instagram/access-token"

export type InstagramConnectionStatus =
  | "disconnected"
  | "connected"
  | "token_expiring_soon"
  | "reconnect_required"

export type InstagramTokenHealth = {
  status: InstagramConnectionStatus
  message: string
  expiresAt: string | null
  isValid: boolean
}

const GRAPH_API_VERSION = "v19.0"
const TOKEN_EXPIRING_SOON_MS = 7 * 24 * 60 * 60 * 1000

type GraphErrorPayload = {
  id?: string
  error?: {
    message?: string
    code?: number
    error_subcode?: number
  }
}

type DebugTokenPayload = {
  data?: {
    is_valid?: boolean
    expires_at?: number
    error?: {
      message?: string
      code?: number
    }
  }
  error?: {
    message?: string
  }
}

function readMetaAppCredentials():
  | { appId: string; appSecret: string }
  | null {
  const appId = process.env.META_APP_ID?.trim()
  const appSecret = process.env.META_APP_SECRET?.trim()

  if (!appId || !appSecret) {
    return null
  }

  return { appId, appSecret }
}

async function fetchTokenExpiry(
  accessToken: string,
): Promise<number | null> {
  const credentials = readMetaAppCredentials()
  if (!credentials) {
    return null
  }

  const appAccessToken = `${credentials.appId}|${credentials.appSecret}`
  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(appAccessToken)}`,
  )

  const payload = (await response.json()) as DebugTokenPayload

  if (!response.ok || payload.data?.is_valid === false) {
    return null
  }

  const expiresAt = payload.data?.expires_at
  return typeof expiresAt === "number" && expiresAt > 0 ? expiresAt * 1000 : null
}

async function verifyGraphMe(
  accessToken: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/me?fields=id,name&access_token=${encodeURIComponent(accessToken)}`,
  )

  const payload = (await response.json()) as GraphErrorPayload

  if (!response.ok || payload.error || !payload.id) {
    return {
      ok: false,
      message:
        payload.error?.message ??
        "Meta rejected this access token. Generate a new long-lived Page access token and try again.",
    }
  }

  return { ok: true }
}

async function verifyInstagramBusinessAccount(
  accessToken: string,
  instagramBusinessAccountId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(instagramBusinessAccountId)}?fields=id,username&access_token=${encodeURIComponent(accessToken)}`,
  )

  const payload = (await response.json()) as GraphErrorPayload

  if (!response.ok || payload.error || !payload.id) {
    return {
      ok: false,
      message:
        payload.error?.message ??
        "Could not access the configured Instagram business account with this token.",
    }
  }

  return { ok: true }
}

export async function checkInstagramTokenHealth(
  accessToken: string,
  options?: { instagramBusinessAccountId?: string },
): Promise<InstagramTokenHealth> {
  const normalized = normalizeInstagramAccessToken(accessToken)

  if (!normalized) {
    return {
      status: "disconnected",
      message: "Instagram is not connected.",
      expiresAt: null,
      isValid: false,
    }
  }

  if (!isInstagramAccessTokenFormatValid(normalized)) {
    return {
      status: "reconnect_required",
      message:
        "Stored token format is invalid. Reconnect with a Meta Page access token in Settings.",
      expiresAt: null,
      isValid: false,
    }
  }

  const meCheck = await verifyGraphMe(normalized)
  if (!meCheck.ok) {
    const isExpired =
      /expired|190|session has expired/i.test(meCheck.message) ||
      /error validating access token/i.test(meCheck.message)

    return {
      status: "reconnect_required",
      message: isExpired
        ? "Instagram access token has expired. Reconnect in Settings."
        : meCheck.message,
      expiresAt: null,
      isValid: false,
    }
  }

  const businessAccountId = options?.instagramBusinessAccountId?.trim()
  if (businessAccountId) {
    const businessCheck = await verifyInstagramBusinessAccount(
      normalized,
      businessAccountId,
    )

    if (!businessCheck.ok) {
      return {
        status: "reconnect_required",
        message: businessCheck.message,
        expiresAt: null,
        isValid: false,
      }
    }
  }

  const expiresAtMs = await fetchTokenExpiry(normalized)
  const expiresAt =
    expiresAtMs !== null ? new Date(expiresAtMs).toISOString() : null

  if (expiresAtMs !== null) {
    const msUntilExpiry = expiresAtMs - Date.now()
    if (msUntilExpiry <= 0) {
      return {
        status: "reconnect_required",
        message: "Instagram access token has expired. Reconnect in Settings.",
        expiresAt,
        isValid: false,
      }
    }

    if (msUntilExpiry <= TOKEN_EXPIRING_SOON_MS) {
      return {
        status: "token_expiring_soon",
        message: "Instagram token expires soon. Reconnect in Settings to avoid failed publishes.",
        expiresAt,
        isValid: true,
      }
    }
  }

  return {
    status: "connected",
    message: "Instagram is connected and ready to publish.",
    expiresAt,
    isValid: true,
  }
}

export function formatInstagramConnectionStatusLabel(
  status: InstagramConnectionStatus,
): string {
  switch (status) {
    case "connected":
      return "Connected"
    case "token_expiring_soon":
      return "Token expiring soon"
    case "reconnect_required":
      return "Reconnect required"
    default:
      return "Not connected"
  }
}
