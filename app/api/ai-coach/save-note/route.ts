import { NextResponse } from "next/server"
import { assertMemberAccess, getAiCoachAuth } from "@/lib/ai-coach/access"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(request: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  let body: { memberId?: string; content?: string; messageId?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 })
  }

  const memberId = body.memberId
  const content = body.content?.trim()

  if (!memberId || !content) {
    return NextResponse.json(
      { error: "memberId and content are required." },
      { status: 400 },
    )
  }

  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    )
  }

  const memberAccess = await assertMemberAccess(supabase, authResult.auth, memberId)
  if (!memberAccess.ok) {
    return NextResponse.json({ error: memberAccess.error }, { status: memberAccess.status })
  }

  const { data: note, error } = await supabase
    .from("coach_notes")
    .insert({
      member_id: memberId,
      coach_id: authResult.auth.userId,
      content,
      source_message_id: body.messageId ?? null,
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, noteId: note.id })
}
