import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { enterLiveWorkspace } from "@/lib/workspace/workspace-mode"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  await enterLiveWorkspace(supabase, user.id)

  return NextResponse.json({ success: true, mode: "live" })
}
