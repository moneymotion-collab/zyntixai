import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import {
  isInstagramAccessTokenFormatValid,
  normalizeInstagramAccessToken,
} from "@/lib/marketing/instagram/access-token"
import {
  formatInstagramPublishError,
  type InstagramPublishErrorCode,
} from "@/lib/marketing/instagram/publish-errors"
import {
  checkInstagramTokenHealth,
  type InstagramTokenHealth,
} from "@/lib/marketing/instagram/token-health"
import type { InstagramConnection } from "@/lib/marketing/instagram/publish-with-connection"

export type ValidatedInstagramConnection = {
  connection: InstagramConnection
  ownerId: string
  tokenHealth: InstagramTokenHealth
}

type ValidationFailure = {
  ok: false
  code: InstagramPublishErrorCode
  error: string
}

export async function loadInstagramConnectionRow(
  supabase: SupabaseClient<Database>,
  ownerId: string,
) {
  return supabase
    .from("social_connections")
    .select(
      "access_token, instagram_business_account_id, account_username, page_id",
    )
    .eq("user_id", ownerId)
    .eq("provider", "instagram")
    .maybeSingle()
}

export async function validateInstagramConnectionForPublish(
  supabase: SupabaseClient<Database>,
  ownerId: string,
): Promise<
  | { ok: true; value: ValidatedInstagramConnection }
  | ValidationFailure
> {
  if (!ownerId.trim()) {
    return {
      ok: false,
      code: "not_connected",
      error: formatInstagramPublishError("not_connected"),
    }
  }

  const { data: connection, error: connectionError } =
    await loadInstagramConnectionRow(supabase, ownerId)

  if (connectionError) {
    return {
      ok: false,
      code: "instagram_api_error",
      error: connectionError.message,
    }
  }

  if (!connection) {
    return {
      ok: false,
      code: "not_connected",
      error: formatInstagramPublishError("not_connected"),
    }
  }

  if (!connection.access_token?.trim()) {
    return {
      ok: false,
      code: "not_connected",
      error: formatInstagramPublishError("not_connected"),
    }
  }

  if (!connection.instagram_business_account_id?.trim()) {
    return {
      ok: false,
      code: "missing_business_account",
      error: formatInstagramPublishError("missing_business_account"),
    }
  }

  const normalizedToken = normalizeInstagramAccessToken(connection.access_token)

  if (!isInstagramAccessTokenFormatValid(normalizedToken)) {
    return {
      ok: false,
      code: "token_invalid",
      error: formatInstagramPublishError("token_invalid"),
    }
  }

  const tokenHealth = await checkInstagramTokenHealth(normalizedToken, {
    instagramBusinessAccountId: connection.instagram_business_account_id,
  })

  if (
    tokenHealth.status === "reconnect_required" ||
    tokenHealth.status === "disconnected"
  ) {
    const code =
      /expired/i.test(tokenHealth.message) ? "token_expired" : "token_invalid"

    return {
      ok: false,
      code,
      error: tokenHealth.message,
    }
  }

  return {
    ok: true,
    value: {
      ownerId,
      tokenHealth,
      connection: {
        access_token: normalizedToken,
        instagram_business_account_id:
          connection.instagram_business_account_id.trim(),
      },
    },
  }
}
