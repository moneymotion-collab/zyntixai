export type InstagramPublishErrorCode =
  | "token_expired"
  | "token_invalid"
  | "not_connected"
  | "missing_business_account"
  | "invalid_media_url"
  | "instagram_api_error"
  | "unknown"

const TOKEN_EXPIRED_PATTERN =
  /expired|session has expired|error validating access token|190|102/i

const TOKEN_INVALID_PATTERN =
  /invalid oauth|malformed|cannot parse access token|invalid access token/i

const MEDIA_URL_PATTERN =
  /media_url|image_url|video_url|public https|relative|render/i

const BUSINESS_ACCOUNT_PATTERN =
  /business account|instagram_business_account|ig user/i

export function classifyInstagramPublishError(
  message: string,
): InstagramPublishErrorCode {
  const normalized = message.trim()
  if (!normalized) return "unknown"

  if (TOKEN_EXPIRED_PATTERN.test(normalized)) {
    return "token_expired"
  }

  if (TOKEN_INVALID_PATTERN.test(normalized)) {
    return "token_invalid"
  }

  if (MEDIA_URL_PATTERN.test(normalized)) {
    return "invalid_media_url"
  }

  if (BUSINESS_ACCOUNT_PATTERN.test(normalized)) {
    return "missing_business_account"
  }

  if (
    /instagram|graph\.facebook|meta rejected|media creation failed|publish failed/i.test(
      normalized,
    )
  ) {
    return "instagram_api_error"
  }

  return "unknown"
}

export function formatInstagramPublishError(
  code: InstagramPublishErrorCode,
  detail?: string,
): string {
  switch (code) {
    case "token_expired":
      return "Your Instagram access token has expired. Open Settings → Instagram connection and paste a new Meta Page access token."
    case "token_invalid":
      return "Your Instagram access token is invalid. Open Settings → Instagram connection and reconnect with a valid Meta Page access token (starts with EAA…)."
    case "not_connected":
      return "Instagram is not connected for this account. Connect Instagram in Settings before publishing."
    case "missing_business_account":
      return "Instagram connection is missing a business account ID. Add your Instagram Business Account ID in Settings."
    case "invalid_media_url":
      return detail?.trim() ||
        "Post media must be a public HTTPS image or video URL before publishing to Instagram."
    case "instagram_api_error":
      return detail?.trim() ||
        "Instagram rejected the publish request. Check your connection and media, then try again."
    default:
      return detail?.trim() || "Instagram publish failed. Try again or reconnect in Settings."
  }
}

export function normalizeInstagramPublishError(
  message: string,
): { code: InstagramPublishErrorCode; message: string } {
  const code = classifyInstagramPublishError(message)
  return {
    code,
    message: formatInstagramPublishError(code, message),
  }
}
