import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { fetchCalendarPosts } from "@/lib/marketing/fetch-calendar-posts"
import { fetchWorkspaceMode } from "@/lib/workspace/workspace-mode"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function GET() {
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

  const workspaceMode = await fetchWorkspaceMode(
    supabase,
    authResult.auth.userId,
  )

  const result = await fetchCalendarPosts({
    supabase,
    userId: authResult.auth.userId,
    isAdmin: authResult.auth.isAdmin,
    workspaceMode,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json(result.posts)
}
