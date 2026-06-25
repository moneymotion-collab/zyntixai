import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import {
  applyContentPostOwnerFilter,
  loadOwnedContentPost,
} from "@/lib/marketing/security/content-post-access"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    )
  }

  const body = await req.json().catch(() => ({}))
  const id = typeof body.id === "string" ? body.id.trim() : ""
  const brandId =
    typeof body.brand_id === "string" ? body.brand_id.trim() : undefined

  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 })
  }

  const loaded = await loadOwnedContentPost(
    supabase,
    id,
    authResult.auth,
    { brandId },
  )

  if (!loaded.ok) {
    return NextResponse.json(
      { error: loaded.error },
      { status: loaded.status },
    )
  }

  const now = new Date().toISOString()
  let updateQuery = supabase
    .from("content_posts")
    .update({
      viral_status: "approved",
      updated_at: now,
    })
    .eq("id", id)

  updateQuery = applyContentPostOwnerFilter(updateQuery, authResult.auth)

  const { data, error } = await updateQuery.select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
