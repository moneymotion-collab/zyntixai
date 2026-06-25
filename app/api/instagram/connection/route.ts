import { NextResponse } from "next/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"
import {
  isInstagramAccessTokenFormatValid,
  maskInstagramAccessToken,
  normalizeInstagramAccessToken,
  verifyInstagramAccessToken,
} from "@/lib/marketing/instagram/access-token"
import { isInstagramPlatform } from "@/lib/marketing/platform-utils"
import {
  checkInstagramTokenHealth,
  formatInstagramConnectionStatusLabel,
} from "@/lib/marketing/instagram/token-health"
import { createClient } from "@/lib/supabase/server"

type ConnectionPayload = {
  instagramBusinessAccountId?: string
  accessToken?: string
  accountUsername?: string
  pageId?: string
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

async function loadLastSuccessfulInstagramPublish(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data } = await supabase
    .from("content_posts")
    .select("published_at, platform")
    .or(`created_by.eq.${userId},user_id.eq.${userId}`)
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(20)

  const instagramPost = (data ?? []).find((row) =>
    isInstagramPlatform(row.platform ?? ""),
  )

  return instagramPost?.published_at ?? null
}

export async function GET() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("social_connections")
    .select(
      "provider, access_token, instagram_business_account_id, account_username, page_id",
    )
    .eq("user_id", user.id)
    .eq("provider", "instagram")
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const lastSuccessfulPublishAt = await loadLastSuccessfulInstagramPublish(
    supabase,
    user.id,
  )

  if (!data) {
    return NextResponse.json({
      connection: null,
      status: "disconnected",
      statusLabel: formatInstagramConnectionStatusLabel("disconnected"),
      statusMessage: "Instagram is not connected.",
      lastSuccessfulPublishAt,
      tokenExpiresAt: null,
    })
  }

  const storedToken = data.access_token ?? ""
  const tokenLooksValid = isInstagramAccessTokenFormatValid(storedToken)
  const tokenHealth = storedToken.trim()
    ? await checkInstagramTokenHealth(storedToken, {
        instagramBusinessAccountId: data.instagram_business_account_id ?? "",
      })
    : {
        status: "disconnected" as const,
        message: "Instagram is not connected.",
        expiresAt: null,
        isValid: false,
      }

  const connection = {
    instagramBusinessAccountId: data.instagram_business_account_id ?? "",
    accessToken: tokenLooksValid ? storedToken : "",
    accessTokenMasked: maskInstagramAccessToken(storedToken),
    tokenValid: tokenHealth.isValid,
    accountUsername: data.account_username ?? "",
    pageId: data.page_id ?? "",
  }

  return NextResponse.json({
    connection,
    status: tokenHealth.status,
    statusLabel: formatInstagramConnectionStatusLabel(tokenHealth.status),
    statusMessage: tokenHealth.message,
    lastSuccessfulPublishAt,
    tokenExpiresAt: tokenHealth.expiresAt,
  })
}

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const body = (await req.json()) as ConnectionPayload

  const instagramBusinessAccountId = clean(body.instagramBusinessAccountId)
  const accessToken = normalizeInstagramAccessToken(clean(body.accessToken))
  const accountUsername = clean(body.accountUsername)
  const pageId = clean(body.pageId)

  if (!instagramBusinessAccountId) {
    return NextResponse.json(
      { error: "Instagram Business Account ID is required." },
      { status: 400 },
    )
  }

  if (!accessToken) {
    return NextResponse.json(
      { error: "A Meta Page access token is required." },
      { status: 400 },
    )
  }

  const tokenCheck = await verifyInstagramAccessToken(accessToken)
  if (!tokenCheck.ok) {
    return NextResponse.json({ error: tokenCheck.error }, { status: 400 })
  }

  const businessCheck = await checkInstagramTokenHealth(accessToken, {
    instagramBusinessAccountId,
  })

  if (businessCheck.status === "reconnect_required") {
    return NextResponse.json({ error: businessCheck.message }, { status: 400 })
  }

  const connectionPayload = {
    access_token: accessToken,
    instagram_business_account_id: instagramBusinessAccountId,
    account_username: accountUsername,
    page_id: pageId,
  }

  const { data: existing, error: loadError } = await supabase
    .from("social_connections")
    .select("id")
    .eq("user_id", user.id)
    .eq("provider", "instagram")
    .maybeSingle()

  if (loadError) {
    return NextResponse.json({ error: loadError.message }, { status: 500 })
  }

  const { error } = existing
    ? await supabase
        .from("social_connections")
        .update(connectionPayload)
        .eq("id", existing.id)
    : await supabase.from("social_connections").insert({
        user_id: user.id,
        provider: "instagram",
        ...connectionPayload,
      })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
